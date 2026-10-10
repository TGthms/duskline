import {
  readBody,
  route,
  json,
  validateSubscription,
  places,
  preferences,
} from '../../_lib/push/common.js';
import { rateLimit, save } from '../../_lib/push/store.js';
export const onRequestPost = route(async ({ request, env }) => {
  const body = await readBody(request);
  await rateLimit(env.PUSH_DB, request, 'subscribe');
  const sub = await validateSubscription(body),
    locations = places(body.locations),
    prefs = preferences(body.preferences);
  const id = await save(env.PUSH_DB, body, sub, locations, prefs);
  return json({ ok: true, id, expiresAt: Date.now() + 90 * 86400000 });
});
