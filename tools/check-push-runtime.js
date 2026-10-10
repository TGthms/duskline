'use strict';
/* Exercise the built Pages routes, named Worker RPC entrypoint and real D1
   runtime together. Disposable keys and an in-memory database; no pushes. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { Miniflare, convertV4MiniflareOptions } = require('miniflare');
(async () => {
  const root = path.resolve(__dirname, '..'),
    out = fs.mkdtempSync(path.join(os.tmpdir(), 'duskline-push-runtime-'));
  let mf;
  try {
    const cli = path.join(root, 'node_modules/wrangler/bin/wrangler.js'),
      env = {
        ...process.env,
        WRANGLER_LOG_PATH: path.join(out, 'wrangler.log'),
        WRANGLER_SEND_METRICS: 'false',
      };
    execFileSync(
      process.execPath,
      [
        cli,
        'deploy',
        '--dry-run',
        '--config',
        'workers/alert-poller/wrangler.toml',
        '--outdir',
        path.join(out, 'worker'),
      ],
      { cwd: root, env, stdio: 'pipe' },
    );
    execFileSync(
      process.execPath,
      [cli, 'pages', 'functions', 'build', '--outdir', path.join(out, 'pages')],
      { cwd: root, env, stdio: 'pipe' },
    );
    const signing = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
      'sign',
      'verify',
    ]);
    const privateKey = await crypto.subtle.exportKey('jwk', signing.privateKey);
    const publicKey = Buffer.from(await crypto.subtle.exportKey('raw', signing.publicKey)).toString(
        'base64url',
      ),
      database = crypto.randomUUID();
    mf = new Miniflare(
      (convertV4MiniflareOptions || ((value) => value))({
        workers: [
          {
            name: 'pages',
            modules: true,
            compatibilityDate: '2026-10-01',
            modulesRoot: path.join(out, 'pages'),
            scriptPath: path.join(out, 'pages/index.js'),
            d1Databases: { PUSH_DB: database },
            serviceBindings: { PUSH_SENDER: { name: 'sender', entrypoint: 'PushService' } },
          },
          {
            name: 'sender',
            modules: true,
            compatibilityDate: '2026-10-01',
            modulesRoot: path.join(out, 'worker'),
            scriptPath: path.join(out, 'worker/index.js'),
            d1Databases: { PUSH_DB: database },
            bindings: {
              VAPID_PUBLIC_KEY: publicKey,
              VAPID_PRIVATE_KEY: privateKey.d,
              VAPID_SUBJECT: 'mailto:runtime-test@example.com',
            },
          },
        ],
      }),
    );
    const db = await mf.getD1Database('PUSH_DB', 'pages');
    const migrations = path.join(root, 'workers/alert-poller/migrations');
    for (const file of fs
      .readdirSync(migrations)
      .filter((f) => f.endsWith('.sql'))
      .sort()) {
      const schema = fs.readFileSync(path.join(migrations, file), 'utf8');
      for (const statement of schema
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean))
        await db.prepare(statement).run();
    }
    const response = await mf.dispatchFetch('https://app.test/api/push/config');
    assert.equal(response.status, 200);
    const config = await response.json();
    assert.equal(config.available, true);
    assert.equal(config.publicKey, publicKey);
    const user = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
      'deriveBits',
    ]);
    const body = {
      endpoint: 'https://web.push.apple.com/Q/runtime-test',
      capability: 'A'.repeat(43),
      keys: {
        p256dh: Buffer.from(await crypto.subtle.exportKey('raw', user.publicKey)).toString(
          'base64url',
        ),
        auth: Buffer.alloc(16, 1).toString('base64url'),
      },
      locations: [
        { name: 'Boston', lat: 42.36, lon: -71.06, country_code: 'US', tz: 'America/New_York' },
      ],
    };
    async function call(route, data) {
      return mf.dispatchFetch('https://app.test/api/push/' + route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://app.test' },
        body: JSON.stringify(data),
      });
    }
    assert.equal((await call('subscribe', body)).status, 200);
    const status = await call('status', body);
    assert.equal(status.status, 200);
    assert.equal((await status.json()).registered, true);
    assert.equal((await call('status', { ...body, capability: 'B'.repeat(43) })).status, 404);
    assert.equal((await call('unsubscribe', body)).status, 200);
    assert.equal((await call('status', body)).status, 404);
    assert.equal((await db.prepare('SELECT count(*) n FROM push_subscriptions').first()).n, 0);
    console.log('Push runtime passed: Pages + named Worker RPC + D1 + ownership + deletion.');
  } finally {
    if (mf) await mf.dispose();
    fs.rmSync(out, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
