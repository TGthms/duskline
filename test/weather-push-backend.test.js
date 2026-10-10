const { test } = require('node:test');
const assert = require('node:assert/strict');
const { database } = require('./helpers/push-db');
const common = import('../functions/_lib/push/common.js'),
  store = import('../functions/_lib/push/store.js'),
  alerts = import('../functions/_lib/push/alerts.js');
const location = {
  name: 'Boston',
  lat: 42.36,
  lon: -71.06,
  tz: 'America/New_York',
  country_code: 'US',
};
const token = 'A'.repeat(43),
  endpoint = 'https://web.push.apple.com/Q/test';
async function setup() {
  const db = database(),
    p = await common,
    s = await store;
  await s.save(
    db,
    { endpoint, capability: token },
    { endpoint, keys: { p256dh: 'x', auth: 'y' } },
    [location],
    p.preferences(),
  );
  return {
    db,
    p,
    s,
    env: {
      PUSH_DB: db,
      VAPID_PUBLIC_KEY: 'x',
      VAPID_PRIVATE_KEY: 'x',
      VAPID_SUBJECT: 'mailto:test@example.com',
      PUSH_SENDER: {},
    },
  };
}
function warning(id = '1', overrides = {}) {
  return {
    id,
    properties: {
      status: 'Actual',
      messageType: 'Alert',
      event: 'Tornado Warning',
      severity: 'Severe',
      urgency: 'Immediate',
      headline: 'Take shelter',
      sent: new Date(Date.now() - 60000).toISOString(),
      expires: new Date(Date.now() + 3600000).toISOString(),
      ...overrides,
    },
  };
}
test('subscription capabilities isolate concurrent installations and protect updates/deletion', async () => {
  const { db, p, s } = await setup();
  await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      s.save(
        db,
        { endpoint: endpoint + i, capability: token },
        { endpoint: endpoint + i, keys: {} },
        [location],
        p.preferences(),
      ),
    ),
  );
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM push_subscriptions').get().n, 11);
  await assert.rejects(
    s.save(
      db,
      { endpoint, capability: 'B'.repeat(43) },
      { endpoint, keys: {} },
      [location],
      p.preferences(),
    ),
    { code: 'ownership_conflict' },
  );
  await assert.rejects(s.authorize(db, { endpoint, capability: 'B'.repeat(43) }), {
    code: 'not_registered',
  });
});
test('atomic delivery claims admit one sender, preserve successes and back off failures', async () => {
  const { db, s } = await setup(),
    row = await s.authorize(db, { endpoint, capability: token });
  const claims = await Promise.all([
    s.claim(db, row.id, 'a', 'alert'),
    s.claim(db, row.id, 'a', 'alert'),
  ]);
  assert.equal(claims.filter(Boolean).length, 1);
  await s.finish(db, row.id, 'a', 'accepted');
  assert.equal(await s.claim(db, row.id, 'a', 'alert'), null);
  await s.claim(db, row.id, 'b', 'alert');
  await s.finish(db, row.id, 'b', 'failed', 'transport', 1);
  assert.equal(await s.claim(db, row.id, 'b', 'alert'), null);
  assert.ok(await s.claim(db, row.id, 'b', 'alert', Date.now() + 180000));
});
test('registration strictly validates provider endpoints, key bytes and geographic coverage', async () => {
  const p = await common;
  for (const url of [
    'https://evil.example/push',
    'http://web.push.apple.com/x',
    'https://web.push.apple.com.evil.test/x',
    'https://user:pass@fcm.googleapis.com/x',
    'https://fcm.googleapis.com:444/x',
  ])
    assert.throws(() => p.validEndpoint(url));
  for (const v of [NaN, Infinity, 91]) assert.throws(() => p.places([{ ...location, lat: v }]));
  assert.throws(() => p.places([{ ...location, country_code: 'FR' }]), {
    code: 'unsupported_place',
  });
  assert.throws(() => p.decode('invalid', 65));
  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveBits',
  ]);
  const pub = Buffer.from(await crypto.subtle.exportKey('raw', pair.publicKey)).toString(
    'base64url',
  );
  assert.equal(
    (
      await p.validateSubscription({
        endpoint,
        keys: { p256dh: pub, auth: Buffer.alloc(16).toString('base64url') },
      })
    ).endpoint,
    endpoint,
  );
});
test('request boundary rejects cross-origin JSON and oversized streaming bodies', async () => {
  const p = await common;
  await assert.rejects(
    p.readBody(
      new Request('https://app.test/api', {
        method: 'POST',
        headers: { Origin: 'https://other.test', 'Content-Type': 'application/json' },
        body: '{}',
      }),
    ),
    { code: 'wrong_origin' },
  );
  await assert.rejects(
    p.readBody(
      new Request('https://app.test/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ large: 'x'.repeat(17000) }),
      }),
    ),
    { code: 'body_too_large' },
  );
});
test('rate limits are atomic and remain bounded across simultaneous requests', async () => {
  const { db, s } = await setup(),
    r = new Request('https://app.test/api');
  const results = await Promise.allSettled(
    Array.from({ length: 5 }, () => s.rateLimit(db, r, 'test', 2)),
  );
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 2);
});
test('quiet hours handle midnight, timezone and extreme override', async () => {
  const a = await alerts,
    p = await common;
  const prefs = p.preferences({
    quiet: { enabled: true, timeZone: 'America/New_York', start: '22:00', end: '07:00' },
  });
  const now = Date.parse('2026-01-03T04:00:00Z');
  assert.equal(a.quietNow(prefs.quiet, now), true);
  assert.equal(a.eligible({ event: 'Tornado Warning', severity: 'severe' }, prefs, now), false);
  assert.equal(a.eligible({ event: 'Tornado Warning', severity: 'extreme' }, prefs, now), true);
  prefs.quiet.overrideExtreme = false;
  assert.equal(a.eligible({ event: 'Tornado Warning', severity: 'extreme' }, prefs, now), false);
  assert.throws(() => p.preferences({ quiet: { start: '25:00' } }));
  assert.throws(() => p.preferences({ quiet: { timeZone: 'invalid' } }));
});
test('active updates qualify; expired, cancelled, test and future alerts do not', async () => {
  const a = await alerts;
  assert.ok(a.normalizeAlert(warning('1', { messageType: 'Update' })));
  for (const p of [
    { messageType: 'Cancel' },
    { status: 'Test' },
    { expires: new Date(0).toISOString() },
    { expires: null },
    { effective: new Date(Date.now() + 60000).toISOString() },
  ])
    assert.equal(a.normalizeAlert(warning('1', p)), null);
});
test('delivery identity ignores cosmetic expiry changes, honors updates and VTEC incident identity', async () => {
  const a = await alerts,
    p = await common;
  const vtec = '/O.NEW.KBOX.TO.W.0001.261009T0100Z-261009T0200Z/';
  const first = a.normalizeAlert(warning('1', { parameters: { VTEC: [vtec] } })),
    updated = a.normalizeAlert(
      warning('2', {
        messageType: 'Update',
        headline: 'Move to shelter immediately',
        parameters: { VTEC: [vtec.replace('.NEW.', '.CON.')] },
      }),
    );
  const pref = p.preferences();
  assert.notEqual(
    await a.deliveryKey(first, location, pref),
    await a.deliveryKey(updated, location, pref),
  );
  pref.updates = false;
  assert.equal(
    await a.deliveryKey(first, location, pref),
    await a.deliveryKey(updated, location, pref),
  );
  assert.equal(
    new URL(a.payload(first, location, 'k').data.url, 'https://app.test').searchParams.get('name'),
    'Boston',
  );
});
test('poll shares provider requests by city and does not rewrite quiet ledgers', async () => {
  const { db, p, s, env } = await setup();
  await s.save(
    db,
    { endpoint: endpoint + '2', capability: token },
    { endpoint: endpoint + '2', keys: {} },
    [location],
    p.preferences(),
  );
  const { poll } = await import('../workers/alert-poller/src/poll.js');
  let calls = 0;
  const fetcher = async (u) => {
    calls++;
    assert.match(String(u), /message_type=alert%2Cupdate/);
    return Response.json({ features: [] });
  };
  assert.equal((await poll(env, { fetcher })).checked, 2);
  assert.equal(calls, 1);
  const stamp = db.sqlite
    .prepare('SELECT last_checked_at FROM push_subscriptions LIMIT 1')
    .get().last_checked_at;
  await poll(env, { fetcher });
  assert.equal(
    db.sqlite.prepare('SELECT last_checked_at FROM push_subscriptions LIMIT 1').get()
      .last_checked_at,
    stamp,
  );
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM push_deliveries').get().n, 0);
});
test('partial push failure preserves prior delivery and exposes provider failures', async () => {
  const { db, env } = await setup(),
    { poll } = await import('../workers/alert-poller/src/poll.js');
  let deliveries = 0;
  const opts = {
    fetcher: async () =>
      Response.json({ features: [warning('1'), warning('2', { headline: 'Second warning' })] }),
    sender: async () => {
      if (++deliveries === 2) throw Error('network');
      return 201;
    },
  };
  assert.equal((await poll(env, opts)).failures, 1);
  assert.equal(
    db.sqlite.prepare("SELECT count(*) n FROM push_deliveries WHERE status='accepted'").get().n,
    1,
  );
  await poll(env, opts);
  assert.equal(deliveries, 2);
  assert.equal(
    (await poll(env, { fetcher: async () => new Response('', { status: 503 }) })).failures,
    1,
  );
  assert.equal(
    db.sqlite.prepare('SELECT last_error FROM push_subscriptions').get().last_error,
    'nws_503',
  );
});
test('expired endpoints delete their owned records and delivery activity', async () => {
  const { db, env } = await setup(),
    { poll } = await import('../workers/alert-poller/src/poll.js');
  await poll(env, {
    fetcher: async () => Response.json({ features: [warning()] }),
    sender: async () => 410,
  });
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM push_subscriptions').get().n, 0);
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM push_deliveries').get().n, 0);
});
test('scheduler lease prevents overlapping polls; expired subscriptions and activity are cleaned', async () => {
  const { db, env } = await setup(),
    { poll } = await import('../workers/alert-poller/src/poll.js');
  db.sqlite.prepare("INSERT INTO push_scheduler VALUES ('poll','',?)").run(Date.now() + 60000);
  assert.equal((await poll(env)).busy, true);
  db.sqlite.prepare('UPDATE push_scheduler SET lease_until=0').run();
  db.sqlite.prepare('UPDATE push_subscriptions SET expires_at=0').run();
  await poll(env, { fetcher: async () => Response.json({ features: [] }) });
  assert.equal(db.sqlite.prepare('SELECT count(*) n FROM push_subscriptions').get().n, 0);
});
test('legacy migration scans once, keeps subscribers and supports capability adoption', async () => {
  const { db, p, s, env } = await setup();
  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
      'deriveBits',
    ]),
    keys = {
      p256dh: Buffer.from(await crypto.subtle.exportKey('raw', pair.publicKey)).toString(
        'base64url',
      ),
      auth: Buffer.alloc(16).toString('base64url'),
    };
  let lists = 0;
  env.PUSH_KV = {
    list: async () => {
      lists++;
      return { keys: [{ name: 'push:sub:old' }], list_complete: true };
    },
    get: async () => ({ endpoint: endpoint + 'old', keys, location }),
  };
  const { migrateLegacy } = await import('../functions/_lib/push/migrate.js');
  await migrateLegacy(env);
  await migrateLegacy(env);
  assert.equal(lists, 1);
  const e = endpoint + 'old';
  await s.save(
    db,
    { endpoint: e, capability: token },
    { endpoint: e, keys },
    [location],
    p.preferences(),
  );
  assert.ok(await s.authorize(db, { endpoint: e, capability: token }));
});
test('alert bursts stay below the D1 Free query limit and preserve a rotating cursor', async () => {
  const { db, p, s, env } = await setup();
  for (let i = 0; i < 55; i++)
    await s.save(
      db,
      { endpoint: endpoint + i, capability: token },
      { endpoint: endpoint + i, keys: {} },
      [location],
      p.preferences(),
    );
  const before = db.queryCount;
  const { poll } = await import('../workers/alert-poller/src/poll.js');
  let sends = 0;
  await poll(env, {
    fetcher: async () =>
      Response.json({
        features: Array.from({ length: 20 }, (_, i) =>
          warning(String(i), { headline: 'Warning ' + i }),
        ),
      }),
    sender: async () => {
      sends++;
      return 201;
    },
  });
  const queries = db.queryCount - before;
  assert.ok(queries <= 50, 'queries: ' + queries);
  assert.ok(sends <= 5);
  assert.ok(db.sqlite.prepare("SELECT cursor FROM push_scheduler WHERE name='poll'").get().cursor);
});
test('VAPID health detects a mismatched keypair instead of advertising an active service', async () => {
  const { checkVapid } = await import('../functions/_lib/push/transport.js');
  const a = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
      'sign',
      'verify',
    ]),
    b = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
      'sign',
      'verify',
    ]);
  const jwk = await crypto.subtle.exportKey('jwk', a.privateKey),
    publicKey = Buffer.from(await crypto.subtle.exportKey('raw', a.publicKey)).toString(
      'base64url',
    );
  const env = {
    VAPID_PUBLIC_KEY: publicKey,
    VAPID_PRIVATE_KEY: jwk.d,
    VAPID_SUBJECT: 'mailto:test@example.com',
  };
  await checkVapid(env);
  env.VAPID_PUBLIC_KEY = Buffer.from(await crypto.subtle.exportKey('raw', b.publicKey)).toString(
    'base64url',
  );
  await assert.rejects(checkVapid(env));
});
test('an idle service uses no scheduler or ledger writes', async () => {
  const { database } = require('./helpers/push-db'),
    db = database(),
    { poll } = await import('../workers/alert-poller/src/poll.js');
  const env = {
    PUSH_DB: db,
    VAPID_PUBLIC_KEY: 'x',
    VAPID_PRIVATE_KEY: 'x',
    VAPID_SUBJECT: 'mailto:test@example.com',
  };
  const before = db.sqlite.prepare('SELECT total_changes() n').get().n;
  assert.deepEqual(await poll(env), { checked: 0, failures: 0 });
  assert.equal(db.sqlite.prepare('SELECT total_changes() n').get().n, before);
  assert.equal(db.queryCount, 1);
});
test('critical warnings lead the bounded notification batch',async()=>{const {fetchAlerts}=await alerts;const results=await fetchAlerts(location,async()=>Response.json({features:[warning('moderate',{severity:'Moderate'}),warning('severe'),warning('extreme',{severity:'Extreme'})]}));assert.deepEqual(results.map(a=>a.id),['extreme','severe','moderate']);});
