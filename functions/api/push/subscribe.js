'use strict';
/* Duskline push subscription endpoint.
   POST /api/push/subscribe
   Body: { endpoint, keys: { p256dh, auth }, location: { name, lat, lon, country_code } }
   Stores the subscription in KV keyed by endpoint hash. One subscription can
   cover one location; re-subscribing the same endpoint updates it. */
const KV_KEY_PREFIX = 'push:sub:';
const KV_INDEX_KEY = 'push:index';

function hashEndpoint(endpoint) {
  let h1 = 0x811c9dc5, h2 = 0x811c9dc5;
  for (let i = 0; i < endpoint.length; i++) {
    const c = endpoint.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ (c + 1), 0x01000193);
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}

export async function onRequestPost({ request, env }) {
  const kv = env.PUSH_KV;
  if (!kv) return Response.json({ error: 'Push storage not configured' }, { status: 500 });
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { endpoint, keys, location } = body || {};
  if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('https://'))
    return Response.json({ error: 'Invalid endpoint' }, { status: 400 });
  if (!keys || typeof keys.p256dh !== 'string' || typeof keys.auth !== 'string')
    return Response.json({ error: 'Invalid keys' }, { status: 400 });
  if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number')
    return Response.json({ error: 'Invalid location' }, { status: 400 });

  const id = hashEndpoint(endpoint);
  const record = {
    endpoint,
    keys: { p256dh: keys.p256dh, auth: keys.auth },
    location: {
      name: String(location.name || '').slice(0, 120),
      lat: Math.max(-90, Math.min(90, location.lat)),
      lon: ((location.lon + 180) % 360 + 360) % 360 - 180,
      country_code: String(location.country_code || '').slice(0, 4).toUpperCase(),
    },
    created_at: Date.now(),
  };
  await kv.put(KV_KEY_PREFIX + id, JSON.stringify(record));
  let index = [];
  try { index = JSON.parse(await kv.get(KV_INDEX_KEY) || '[]'); } catch {}
  if (!index.includes(id)) {
    index.push(id);
    await kv.put(KV_INDEX_KEY, JSON.stringify(index));
  }
  return Response.json({ ok: true, id });
}
