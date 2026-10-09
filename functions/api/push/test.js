import {readBody,route,json,HttpError} from '../../_lib/push/common.js';
import {authorize,rateLimit} from '../../_lib/push/store.js';
export const onRequestPost=route(async ({request,env})=>{
  const body=await readBody(request);await rateLimit(env.PUSH_DB,request,'test',5,3600000);
  await authorize(env.PUSH_DB,body);
  const result=await env.PUSH_SENDER.sendTest(body);
  if(result.error)throw new HttpError(result.status,result.error);
  return json(result);
});
