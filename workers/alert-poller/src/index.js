import { WorkerEntrypoint } from 'cloudflare:workers';
import { poll } from './poll.js';
import { sendTest } from '../../../functions/_lib/push/test-send.js';
import { checkVapid } from '../../../functions/_lib/push/transport.js';
import { senderConfigured } from '../../../functions/_lib/push/common.js';
export class PushService extends WorkerEntrypoint {
  async getConfig() {
    if (!senderConfigured(this.env)) return { available: false, publicKey: null };
    try {
      await checkVapid(this.env);
      return { available: true, publicKey: this.env.VAPID_PUBLIC_KEY };
    } catch {
      console.error('push_vapid_configuration_invalid');
      return { available: false, publicKey: null };
    }
  }
  async sendTest(body) {
    return sendTest(this.env, body);
  }
  async scheduled() {
    this.ctx.waitUntil(poll(this.env));
  }
}
// The default entrypoint is supported by Pages' service-binding controls.
export default PushService;
