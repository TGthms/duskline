'use strict';
/* Duskline push unsubscription endpoint.
   POST /api/push/unsubscribe
   Body: { endpoint } — removes the subscription and its index entry. */
const KV_KEY_PREFIX = 'push:sub:';
const KV_INDEX_KEY = 'push:index';

function hashEndpoint(endpoint) {
  let h1 = 0x811c9dc5, h2 = 0x811c9dc5;
  for (let i = 0; i < endpoint.length; i++) {
    const c = endpoint.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ (c + 1), 0x01000193);
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}

export async function onRequestPost({ request, env }) {
  const kv = env.PUSH_KV;
  if (!kv) return Response.json({ error: 'Push storage not configured' }, { status: 500 });
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { endpoint } = body || {};
  if (!endpoint || typeof endpoint !== 'string')
    return Response.json({ error: 'Invalid endpoint' }, { status: 400 });
  const id = hashEndpoint(endpoint);
  await kv.delete(KV_KEY_PREFIX + id);
  try {
    const index = JSON.parse(await kv.get(KV_INDEX_KEY) || '[]');
    const next = index.filter(x => x !== id);
    if (next.length !== index.length) await kv.put(KV_INDEX_KEY, JSON.stringify(next));
  } catch {}
  return Response.json({ ok: true });
}
