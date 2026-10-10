const { test } = require('node:test'),
  assert = require('node:assert/strict');
const encode = (b) => Buffer.from(b).toString('base64url');
async function keys() {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ]);
  const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  return {
    pair,
    env: {
      VAPID_PUBLIC_KEY: encode(await crypto.subtle.exportKey('raw', pair.publicKey)),
      VAPID_PRIVATE_KEY: jwk.d,
      VAPID_SUBJECT: 'mailto:test@example.com',
    },
  };
}
test('push transport emits a verifiable ES256 VAPID token and independently decryptable RFC8291 body', async () => {
  const { sendPush } = await import('../functions/_lib/push/transport.js'),
    { pair, env } = await keys();
  const user = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
      'deriveBits',
    ]),
    pub = new Uint8Array(await crypto.subtle.exportKey('raw', user.publicKey)),
    auth = crypto.getRandomValues(new Uint8Array(16)),
    data = { title: 'Boston', body: 'Take shelter', data: { url: './?lat=42' } };
  let init;
  const status = await sendPush(
    {
      endpoint: 'https://web.push.apple.com/Q/test',
      keys: { p256dh: encode(pub), auth: encode(auth) },
    },
    data,
    env,
    {
      ttl: 120,
      urgency: 'high',
      fetcher: async (url, options) => {
        init = options;
        return new Response(null, { status: 201 });
      },
    },
  );
  assert.equal(status, 201);
  assert.equal(init.headers['content-encoding'], 'aes128gcm');
  assert.equal(init.headers.ttl, '120');
  assert.equal(init.redirect, 'manual');
  const jwt = init.headers.authorization.match(/t=([^,]+)/)[1].split('.');
  assert.equal(
    await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      pair.publicKey,
      Buffer.from(jwt[2], 'base64url'),
      Buffer.from(jwt[0] + '.' + jwt[1]),
    ),
    true,
  );
  assert.equal(JSON.parse(Buffer.from(jwt[1], 'base64url')).aud, 'https://web.push.apple.com');
  const bytes = new Uint8Array(init.body),
    salt = bytes.slice(0, 16),
    server = bytes.slice(21, 21 + bytes[20]),
    cipher = bytes.slice(21 + bytes[20]);
  const serverKey = await crypto.subtle.importKey(
      'raw',
      server,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      [],
    ),
    secret = await crypto.subtle.deriveBits(
      { name: 'ECDH', public: serverKey },
      user.privateKey,
      256,
    );
  async function hkdf(value, salt, info, length) {
    const key = await crypto.subtle.importKey('raw', value, 'HKDF', false, ['deriveBits']);
    return crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, length * 8);
  }
  const prefix = Buffer.from('WebPush: info\0'),
    info = Buffer.concat([prefix, pub, server]),
    ikm = await hkdf(secret, auth, info, 32),
    cek = await hkdf(ikm, salt, Buffer.from('Content-Encoding: aes128gcm\0'), 16),
    nonce = await hkdf(ikm, salt, Buffer.from('Content-Encoding: nonce\0'), 12),
    aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['decrypt']);
  const plain = new Uint8Array(
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, aes, cipher),
  );
  let end = plain.length - 1;
  while (plain[end] === 0) end--;
  assert.equal(plain[end], 2);
  assert.deepEqual(JSON.parse(new TextDecoder().decode(plain.slice(0, end))), data);
  cipher[0] ^= 1;
  await assert.rejects(crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, aes, cipher));
});
test('test delivery uses the server pipeline, reports acceptance honestly and removes expired subscriptions', async () => {
  const { database } = require('./helpers/push-db'),
    { save } = await import('../functions/_lib/push/store.js'),
    { preferences } = await import('../functions/_lib/push/common.js'),
    { sendTest } = await import('../functions/_lib/push/test-send.js'),
    { env } = await keys();
  env.PUSH_DB = database();
  const body = { endpoint: 'https://web.push.apple.com/Q/test', capability: 'A'.repeat(43) };
  await save(
    env.PUSH_DB,
    body,
    { endpoint: body.endpoint, keys: {} },
    [{ name: 'Boston', lat: 42, lon: -71, country_code: 'US', tz: 'UTC' }],
    preferences(),
  );
  assert.deepEqual(await sendTest(env, body, async () => 201), { accepted: true });
  assert.equal((await sendTest(env, body, async () => 201)).status, 429);
  assert.equal(
    (await sendTest(env, { ...body, capability: 'B'.repeat(43) }, async () => 201)).status,
    404,
  );
  env.PUSH_DB.sqlite.prepare('DELETE FROM push_deliveries').run();
  assert.equal((await sendTest(env, body, async () => 410)).status, 410);
  assert.equal(env.PUSH_DB.sqlite.prepare('SELECT count(*) n FROM push_subscriptions').get().n, 0);
});
