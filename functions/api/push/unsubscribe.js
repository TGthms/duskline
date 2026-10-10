import { readBody, route, json } from '../../_lib/push/common.js';
import { identify, rateLimit } from '../../_lib/push/store.js';
export const onRequestPost = route(async ({ request, env }) => {
  const body = await readBody(request);
  await rateLimit(env.PUSH_DB, request, 'unsubscribe');
  const { id, token } = await identify(body);
  await env.PUSH_DB.prepare('DELETE FROM push_subscriptions WHERE id=? AND token_hash=?')
    .bind(id, token)
    .run();
  return json({ ok: true });
});
