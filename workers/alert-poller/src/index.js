import {WorkerEntrypoint} from 'cloudflare:workers';
import {poll} from './poll.js';
import {sendTest} from '../../../functions/_lib/push/test-send.js';
export class PushService extends WorkerEntrypoint {
  async sendTest(body) { return sendTest(this.env,body); }
}
export default {async scheduled(event,env,ctx){ctx.waitUntil(poll(env));}};
