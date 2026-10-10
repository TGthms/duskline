import { buildPushPayload, vapidHeaders } from '@block65/webcrypto-web-push';
import { validEndpoint, decode } from './common.js';
let configurationKey, configurationCheck;
export async function checkVapid(env) {
  const identity = env.VAPID_PUBLIC_KEY + env.VAPID_PRIVATE_KEY + env.VAPID_SUBJECT;
  if (identity !== configurationKey) {
    configurationKey = identity;
    configurationCheck = (async () => {
      const bytes = decode(env.VAPID_PUBLIC_KEY, 65);
      decode(env.VAPID_PRIVATE_KEY, 32);
      const pub = await crypto.subtle.importKey(
        'raw',
        bytes,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['verify'],
      );
      const { headers } = await vapidHeaders(
        { endpoint: 'https://web.push.apple.com/Q/health' },
        {
          subject: env.VAPID_SUBJECT,
          publicKey: env.VAPID_PUBLIC_KEY,
          privateKey: env.VAPID_PRIVATE_KEY,
        },
      );
      const parts = headers.authorization.match(/t=([^,]+)/)[1].split('.');
      const signature = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), (c) =>
        c.charCodeAt(0),
      );
      if (
        !(await crypto.subtle.verify(
          { name: 'ECDSA', hash: 'SHA-256' },
          pub,
          signature,
          new TextEncoder().encode(parts[0] + '.' + parts[1]),
        ))
      )
        throw Error('vapid_key_mismatch');
    })();
  }
  return configurationCheck;
}
export async function sendPush(
  subscription,
  data,
  env,
  { ttl = 60, urgency = 'normal', fetcher = fetch } = {},
) {
  validEndpoint(subscription.endpoint);
  const init = await buildPushPayload(
    { data, options: { ttl: Math.max(1, Math.min(3600, ttl)), urgency } },
    subscription,
    {
      subject: env.VAPID_SUBJECT,
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY,
    },
  );
  const response = await fetcher(subscription.endpoint, {
    ...init,
    // Workers supports manual/follow, but rejects the browser's "error" mode.
    // Never forward endpoint credentials or ciphertext to a redirect target.
    redirect: 'manual',
    signal: AbortSignal.timeout(10000),
  });
  await response.body?.cancel();
  return response.status;
}
