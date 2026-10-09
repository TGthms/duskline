'use strict';
/* Duskline alert poller — Cloudflare Worker with cron trigger.
   Every run: enumerates push subscriptions from KV, checks NWS active alerts
   for each subscribed US location, and sends a Web Push for new severe/extreme
   alerts not already notified. Dedup state lives in KV.

   Required bindings/secrets:
     PUSH_KV            KV namespace (same as Pages Functions use)
     VAPID_PUBLIC_KEY   base64url P-256 public key
     VAPID_PRIVATE_KEY  base64url P-256 private key
     VAPID_SUBJECT      e.g. mailto:you@example.com */

const KV_KEY_PREFIX = 'push:sub:';
const KV_INDEX_KEY = 'push:index';
const KV_SENT_PREFIX = 'push:sent:';
const NWS_ALERTS = 'https://api.weather.gov/alerts/active';
const SEVERE = new Set(['extreme', 'severe']);

function b64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64url(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function vapidAuthHeader(audience, subject, pubKeyB64, privKeyB64) {
  const header = b64url(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
  const claims = b64url(new TextEncoder().encode(JSON.stringify({ aud: audience, exp, sub: subject })));
  const raw = unb64url(privKeyB64);
  const der = new Uint8Array(36 + raw.length);
  der.set([0x30, 0x34 + raw.length, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, 0x04, 0x22 + raw.length, 0x04, raw.length], 0);
  der.set(raw, 36);
  const key = await crypto.subtle.importKey('pkcs8', der.buffer,
    { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key,
    new TextEncoder().encode(header + '.' + claims)));
  const rLen = sig[3], r = sig.slice(4, 4 + rLen), sOff = 4 + rLen + 2, s = sig.slice(sOff, sOff + sig[sOff - 2]);
  const rawSig = new Uint8Array(64);
  rawSig.set(r.slice(-32), 32 - Math.min(32, r.length));
  rawSig.set(s.slice(-32), 64 - Math.min(32, s.length));
  return 'vapid t=' + header + '.' + claims + '.' + b64url(rawSig) + ', k=' + pubKeyB64;
}

async function encryptPayload(plaintext, p256dhB64, authB64) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const serverKeys = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const serverPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverKeys.publicKey));
  const clientPub = await crypto.subtle.importKey('raw', unb64url(p256dhB64),
    { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: clientPub }, serverKeys.privateKey, 256));
  const authSecret = unb64url(authB64);
  const te = new TextEncoder();
  async function hkdf(saltB, ikm, info, len) {
    const hmacKey = await crypto.subtle.importKey('raw', saltB, 'HMAC', false, ['sign']);
    const prk = await crypto.subtle.importKey('raw',
      await crypto.subtle.sign('HMAC', hmacKey, ikm), 'HMAC', false, ['sign']);
    let out = new Uint8Array(0), t = new Uint8Array(0), n = 0;
    while (out.length < len) {
      n++;
      const data = new Uint8Array(t.length + info.length + 1);
      data.set(t, 0); data.set(info, t.length); data[data.length - 1] = n;
      t = new Uint8Array(await crypto.subtle.sign('HMAC', prk, data));
      const cat = new Uint8Array(out.length + t.length);
      cat.set(out, 0); cat.set(t, out.length); out = cat;
    }
    return out.slice(0, len);
  }
  const p = te.encode('WebPush: info\0'), c = unb64url(p256dhB64), s = serverPubRaw;
  const ikmInfo = new Uint8Array(p.length + 2 + c.length + 2 + s.length);
  ikmInfo.set(p, 0); ikmInfo[p.length] = 0; ikmInfo[p.length + 1] = c.length;
  ikmInfo.set(c, p.length + 2);
  const o = p.length + 2 + c.length;
  ikmInfo[o] = 0; ikmInfo[o + 1] = s.length; ikmInfo.set(s, o + 2);
  const prk = await hkdf(authSecret, ecdhSecret, ikmInfo, 32);
  const cek = await hkdf(salt, prk, te.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, prk, te.encode('Content-Encoding: nonce\0'), 12);
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const pt = te.encode(plaintext);
  const padded = new Uint8Array(pt.length + 1);
  padded.set(pt, 0); padded[pt.length] = 0x02;
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded));
  const header = new Uint8Array(16 + 4 + 1 + serverPubRaw.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096);
  header[20] = serverPubRaw.length;
  header.set(serverPubRaw, 21);
  const body = new Uint8Array(header.length + ct.length);
  body.set(header, 0); body.set(ct, header.length);
  return body;
}

async function sendPush(sub, payloadObj, env) {
  const url = new URL(sub.endpoint);
  const auth = await vapidAuthHeader(url.origin, env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  const body = await encryptPayload(JSON.stringify(payloadObj), sub.keys.p256dh, sub.keys.auth);
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
    },
    body,
  });
  return res.status;
}

async function fetchNwsAlerts(lat, lon) {
  const url = NWS_ALERTS + '?point=' + lat.toFixed(4) + ',' + lon.toFixed(4) + '&status=actual&message_type=alert';
  const res = await fetch(url, { headers: { 'Accept': 'application/geo+json', 'User-Agent': 'duskline-push/1.0' } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.features || []).map(f => ({
    id: f.id || (f.properties && f.properties.id),
    event: f.properties && f.properties.event,
    severity: String((f.properties && f.properties.severity) || '').toLowerCase(),
    headline: f.properties && f.properties.headline,
    description: f.properties && f.properties.description,
  })).filter(a => a.id && SEVERE.has(a.severity));
}

export default {
  async scheduled(event, env, ctx) {
    const kv = env.PUSH_KV;
    if (!kv || !env.VAPID_PRIVATE_KEY) return;
    let index = [];
    try { index = JSON.parse(await kv.get(KV_INDEX_KEY) || '[]'); } catch {}
    for (const id of index) {
      try {
        const raw = await kv.get(KV_KEY_PREFIX + id);
        if (!raw) continue;
        const sub = JSON.parse(raw);
        const loc = sub.location || {};
        if (typeof loc.lat !== 'number') continue;
        if (loc.country_code && loc.country_code !== 'US') continue;
        const alerts = await fetchNwsAlerts(loc.lat, loc.lon);
        let sent = [];
        try { sent = JSON.parse(await kv.get(KV_SENT_PREFIX + id) || '[]'); } catch {}
        const sentSet = new Set(sent);
        for (const alert of alerts) {
          if (sentSet.has(alert.id)) continue;
          const status = await sendPush(sub, {
            title: alert.event || 'Severe weather alert',
            body: String(alert.headline || alert.description || '').slice(0, 180),
            tag: 'duskline-alert-' + alert.id,
            data: { url: './', location: loc.name },
          }, env);
          if (status === 410 || status === 404) {
            await kv.delete(KV_KEY_PREFIX + id);
            const idx = JSON.parse(await kv.get(KV_INDEX_KEY) || '[]');
            await kv.put(KV_INDEX_KEY, JSON.stringify(idx.filter(x => x !== id)));
            break;
          }
          if (status < 300) sentSet.add(alert.id);
        }
        await kv.put(KV_SENT_PREFIX + id, JSON.stringify([...sentSet].slice(-50)));
      } catch (e) {}
    }
  },
};
