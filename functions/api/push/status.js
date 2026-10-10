import { readBody, route, json } from '../../_lib/push/common.js';
import { authorize, rateLimit, activity } from '../../_lib/push/store.js';
export const onRequestPost = route(async ({ request, env }) => {
  const body = await readBody(request);
  await rateLimit(env.PUSH_DB, request, 'status', 60);
  const row = await authorize(env.PUSH_DB, body);
  return json({
    registered: row.expires_at > Date.now(),
    expiresAt: row.expires_at,
    renewedAt: row.renewed_at,
    locations: JSON.parse(row.locations_json),
    preferences: JSON.parse(row.preferences_json),
    lastCheckedAt: row.last_checked_at,
    lastError: row.last_error,
    activity: await activity(env.PUSH_DB, row.id),
  });
});
