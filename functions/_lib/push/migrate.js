import { hash, places, preferences, validateSubscription, RETENTION_MS } from './common.js';
// One bounded KV scan per run until complete. Existing subscriptions keep
// working without an app visit; their browser can claim them using its keys.
export async function migrateLegacy(env, now = Date.now()) {
  if (!env.PUSH_KV) return;
  const db = env.PUSH_DB;
  const progress = await db
    .prepare("SELECT cursor FROM push_scheduler WHERE name='legacy'")
    .first();
  if (progress?.cursor === 'done') return;
  const page = await env.PUSH_KV.list({
    prefix: 'push:sub:',
    limit: 5,
    ...(progress?.cursor ? { cursor: progress.cursor } : {}),
  });
  for (const key of page.keys) {
    try {
      const old = await env.PUSH_KV.get(key.name, 'json');
      if (!old || old.location?.country_code !== 'US') continue;
      const sub = await validateSubscription(old),
        locations = places([{ ...old.location, tz: old.location.tz || 'UTC' }]);
      const id = await hash(sub.endpoint),
        created = old.created_at || now;
      await db
        .prepare(
          `INSERT OR IGNORE INTO push_subscriptions
        (id,endpoint,token_hash,keys_json,locations_json,preferences_json,created_at,renewed_at,expires_at)
        VALUES (?,?,'legacy',?,?,?,?,?,?)`,
        )
        .bind(
          id,
          sub.endpoint,
          JSON.stringify(sub.keys),
          JSON.stringify(locations),
          JSON.stringify(preferences()),
          created,
          now,
          now + RETENTION_MS,
        )
        .run();
    } catch {
      console.warn('push_legacy_record_invalid');
    }
  }
  await db
    .prepare(
      "INSERT INTO push_scheduler(name,cursor) VALUES ('legacy',?) ON CONFLICT(name) DO UPDATE SET cursor=excluded.cursor",
    )
    .bind(page.list_complete ? 'done' : page.cursor)
    .run();
}
