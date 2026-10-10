import { hash, capability, HttpError, RETENTION_MS } from './common.js';
export async function identify(body) {
  return { id: await hash(body.endpoint || ''), token: await hash(capability(body)) };
}
export async function authorize(db, body) {
  const { id, token } = await identify(body);
  const row = await db
    .prepare('SELECT * FROM push_subscriptions WHERE id=? AND token_hash=?')
    .bind(id, token)
    .first();
  if (!row) throw new HttpError(404, 'not_registered');
  return row;
}
export async function rateLimit(db, request, scope, limit = 30, windowMs = 60000) {
  const now = Date.now(),
    bucket = Math.floor(now / windowMs);
  const key = await hash(
    scope + ':' + bucket + ':' + (request.headers.get('CF-Connecting-IP') || 'local'),
  );
  const row = await db
    .prepare(
      `INSERT INTO push_limits(key,count,expires_at) VALUES (?,1,?)
    ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count`,
    )
    .bind(key, now + windowMs * 2)
    .first();
  if (row.count > limit) throw new HttpError(429, 'rate_limited');
}
export async function save(db, body, subscription, locations, prefs) {
  const { id, token } = await identify(body),
    now = Date.now();
  const row = await db
    .prepare(
      `INSERT INTO push_subscriptions
    (id,endpoint,token_hash,keys_json,locations_json,preferences_json,created_at,renewed_at,expires_at)
    VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET keys_json=excluded.keys_json,token_hash=excluded.token_hash,
    locations_json=excluded.locations_json,preferences_json=excluded.preferences_json,
    renewed_at=excluded.renewed_at,expires_at=excluded.expires_at
    WHERE push_subscriptions.token_hash=excluded.token_hash
      OR (push_subscriptions.token_hash='legacy' AND push_subscriptions.keys_json=excluded.keys_json) RETURNING id`,
    )
    .bind(
      id,
      subscription.endpoint,
      token,
      JSON.stringify(subscription.keys),
      JSON.stringify(locations),
      JSON.stringify(prefs),
      now,
      now,
      now + RETENTION_MS,
    )
    .first();
  if (!row) throw new HttpError(409, 'ownership_conflict');
  return id;
}
export async function activity(db, id) {
  return (
    await db
      .prepare(
        `SELECT kind,label,status,created_at,accepted_at,error_code FROM push_deliveries
    WHERE subscription_id=? ORDER BY created_at DESC LIMIT 8`,
      )
      .bind(id)
      .all()
  ).results;
}
export async function claim(db, id, key, kind, now = Date.now(), label = '') {
  return db
    .prepare(
      `INSERT INTO push_deliveries(subscription_id,delivery_key,kind,status,created_at,lease_until,attempts,next_attempt_at,label)
    VALUES (?,?,?,'sending',?,?,1,0,?) ON CONFLICT(subscription_id,delivery_key) DO UPDATE SET
    status='sending',lease_until=excluded.lease_until,attempts=attempts+1
    WHERE push_deliveries.status!='accepted' AND push_deliveries.lease_until<=?
      AND push_deliveries.next_attempt_at<=? AND push_deliveries.attempts<5 RETURNING attempts`,
    )
    .bind(id, key, kind, now, now + 60000, label.slice(0, 240), now, now)
    .first();
}
export async function finish(db, id, key, status, code = '', attempt = 1) {
  const now = Date.now();
  await db
    .prepare(
      `UPDATE push_deliveries SET status=?,accepted_at=?,error_code=?,lease_until=0,next_attempt_at=?
    WHERE subscription_id=? AND delivery_key=?`,
    )
    .bind(
      status,
      status === 'accepted' ? now : null,
      code,
      status === 'accepted' ? 0 : now + Math.min(3600000, 60000 * 2 ** attempt),
      id,
      key,
    )
    .run();
}
