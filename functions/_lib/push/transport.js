import {buildPushPayload} from '@block65/webcrypto-web-push';
import {validEndpoint} from './common.js';
export async function sendPush(subscription,data,env,{ttl=60,urgency='normal',fetcher=fetch}={}) {
  validEndpoint(subscription.endpoint);
  const init=await buildPushPayload({data,options:{ttl:Math.max(1,Math.min(3600,ttl)),urgency}},subscription,
    {subject:env.VAPID_SUBJECT,publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY});
  const response=await fetcher(subscription.endpoint,{...init,redirect:'error',signal:AbortSignal.timeout(10000)});
  await response.body?.cancel();
  return response.status;
}
