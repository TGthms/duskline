import {readBody,route,json,validateSubscription,places,preferences} from '../../_lib/push/common.js';
import {rateLimit,save} from '../../_lib/push/store.js';
export const onRequestPost=route(async ({request,env})=>{
  const body=await readBody(request);await rateLimit(env.PUSH_DB,request,'subscribe');
  const sub=await validateSubscription(body),locations=places(body.locations),prefs=preferences(body.preferences);
  const id=await save(env.PUSH_DB,body,sub,locations,prefs);
  // The old KV index is never read or modified. Clear this migrated record only.
  if(env.PUSH_KV){let h1=0x811c9dc5,h2=0x811c9dc5;
    for(let i=0;i<sub.endpoint.length;i++){const c=sub.endpoint.charCodeAt(i);h1=Math.imul(h1^c,0x01000193);h2=Math.imul(h2^(c+1),0x01000193);}
    const oldId=(h1>>>0).toString(36)+(h2>>>0).toString(36);
    try{const old=await env.PUSH_KV.get('push:sub:'+oldId,'json');
      if(old?.keys?.auth===sub.keys.auth&&old?.keys?.p256dh===sub.keys.p256dh){await env.PUSH_KV.delete('push:sub:'+oldId);await env.PUSH_KV.delete('push:sent:'+oldId);}}
    catch{console.warn('push_legacy_cleanup_failed');}}
  return json({ok:true,id,expiresAt:Date.now()+90*86400000});
});
