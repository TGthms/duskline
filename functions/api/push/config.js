import { configured, json } from '../../_lib/push/common.js';
export async function onRequestGet({ env }) {
  let config = { available: false, publicKey: null };
  if (configured(env))
    try {
      config = await env.PUSH_SENDER.getConfig();
    } catch {
      console.warn('push_configuration_unavailable');
    }
  return json({ ...config, countries: ['US'], maxPlaces: 5, pollMinutes: 1, retentionDays: 90 });
}
