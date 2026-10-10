import { senderConfigured, HttpError } from './common.js';
import { authorize, claim, finish } from './store.js';
import { sendPush } from './transport.js';
export async function sendTest(env, body, sender = sendPush) {
  try {
    if (!senderConfigured(env)) throw new HttpError(503, 'not_configured');
    const row = await authorize(env.PUSH_DB, body);
    if (row.expires_at <= Date.now()) throw new HttpError(404, 'not_registered');
    const key = 'test:' + Math.floor(Date.now() / 60000),
      lease = await claim(env.PUSH_DB, row.id, key, 'test');
    if (!lease) throw new HttpError(429, 'rate_limited');
    try {
      const status = await sender(
        { endpoint: row.endpoint, keys: JSON.parse(row.keys_json) },
        {
          title: 'duskline',
          body:
            typeof body.message === 'string'
              ? body.message.slice(0, 240)
              : 'Notifications are connected on this device.',
          tag: 'duskline-test',
          data: { url: './', test: true },
        },
        env,
      );
      const accepted = status >= 200 && status < 300;
      await finish(
        env.PUSH_DB,
        row.id,
        key,
        accepted ? 'accepted' : 'failed',
        accepted ? '' : 'push_' + status,
        lease.attempts,
      );
      if (status === 404 || status === 410) {
        await env.PUSH_DB.prepare('DELETE FROM push_subscriptions WHERE id=?').bind(row.id).run();
        throw new HttpError(410, 'subscription_expired');
      }
      if (!accepted) throw new HttpError(502, 'delivery_failed');
      return { accepted: true };
    } catch (e) {
      if (!(e instanceof HttpError))
        await finish(env.PUSH_DB, row.id, key, 'failed', 'transport_error', lease.attempts);
      throw e;
    }
  } catch (e) {
    return {
      error: e instanceof HttpError ? e.code : 'delivery_failed',
      status: e instanceof HttpError ? e.status : 502,
    };
  }
}
