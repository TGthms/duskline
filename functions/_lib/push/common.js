// Shared validation and capabilities for the optional background-alert service.
export const RETENTION_MS = 90 * 86400000;
export const MAX_PLACES = 5;
export const DEFAULTS = {
  severity: 'severe',
  categories: ['all'],
  updates: true,
  quiet: { enabled: false, start: '22:00', end: '07:00', timeZone: 'UTC', overrideExtreme: true },
};
export class HttpError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}
export async function hash(value) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))),
    (x) => x.toString(16).padStart(2, '0'),
  ).join('');
}
export function decode(value, length) {
  if (typeof value !== 'string' || !/^[\w-]+={0,2}$/.test(value))
    throw new HttpError(400, 'invalid_keys');
  let bytes;
  try {
    bytes = Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
      c.charCodeAt(0),
    );
  } catch {
    throw new HttpError(400, 'invalid_keys');
  }
  if (bytes.length !== length) throw new HttpError(400, 'invalid_keys');
  return bytes;
}
export function validEndpoint(endpoint) {
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    throw new HttpError(400, 'invalid_endpoint');
  }
  const host = url.hostname;
  const allowed =
    host === 'fcm.googleapis.com' ||
    host === 'updates.push.services.mozilla.com' ||
    host === 'updates-autopush.stage.mozaws.net' ||
    host === 'web.push.apple.com' ||
    host.endsWith('.push.apple.com') ||
    host === 'wns.windows.com' ||
    host.endsWith('.notify.windows.com');
  if (
    !allowed ||
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.hash ||
    endpoint.length > 2048 ||
    url.pathname === '/'
  )
    throw new HttpError(400, 'invalid_endpoint');
  return endpoint;
}
export async function validateSubscription(body) {
  validEndpoint(body.endpoint);
  const pub = decode(body.keys?.p256dh, 65);
  decode(body.keys?.auth, 16);
  if (pub[0] !== 4) throw new HttpError(400, 'invalid_keys');
  try {
    await crypto.subtle.importKey('raw', pub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  } catch {
    throw new HttpError(400, 'invalid_keys');
  }
  return { endpoint: body.endpoint, keys: { p256dh: body.keys.p256dh, auth: body.keys.auth } };
}
export function capability(body) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(body?.capability || '')) throw new HttpError(401, 'unauthorized');
  return body.capability;
}
export function places(value) {
  if (!Array.isArray(value) || !value.length || value.length > MAX_PLACES)
    throw new HttpError(400, 'invalid_places');
  const seen = new Set();
  return value.map((p) => {
    if (p?.country_code !== 'US') throw new HttpError(422, 'unsupported_place');
    if (
      !Number.isFinite(p.lat) ||
      !Number.isFinite(p.lon) ||
      Math.abs(p.lat) > 90 ||
      Math.abs(p.lon) > 180
    )
      throw new HttpError(400, 'invalid_places');
    try {
      new Intl.DateTimeFormat('en', { timeZone: p.tz });
    } catch {
      throw new HttpError(400, 'invalid_places');
    }
    const lat = Math.round(p.lat * 100) / 100,
      lon = Math.round(p.lon * 100) / 100,
      key = lat + ',' + lon;
    if (seen.has(key)) throw new HttpError(400, 'invalid_places');
    seen.add(key);
    return {
      lat,
      lon,
      name: String(p.name || '').slice(0, 120),
      tz: p.tz || 'UTC',
      country_code: 'US',
    };
  });
}
export function preferences(value = {}) {
  const v = { ...DEFAULTS, ...value, quiet: { ...DEFAULTS.quiet, ...value.quiet } };
  if (
    !['moderate', 'severe', 'extreme'].includes(v.severity) ||
    typeof v.updates !== 'boolean' ||
    !Array.isArray(v.categories) ||
    !v.categories.length ||
    v.categories.length > 6 ||
    v.categories.some(
      (c) => !['all', 'storm', 'flood', 'winter', 'heat', 'wind', 'other'].includes(c),
    ) ||
    typeof v.quiet.enabled !== 'boolean' ||
    typeof v.quiet.timeZone !== 'string' ||
    !v.quiet.timeZone ||
    typeof v.quiet.overrideExtreme !== 'boolean' ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.quiet.start) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.quiet.end)
  )
    throw new HttpError(400, 'invalid_preferences');
  try {
    new Intl.DateTimeFormat('en', { timeZone: v.quiet.timeZone });
  } catch {
    throw new HttpError(400, 'invalid_preferences');
  }
  return {
    severity: v.severity,
    categories: [...new Set(v.categories)],
    updates: v.updates,
    quiet: v.quiet,
  };
}
export function configured(env) {
  return !!(env.PUSH_DB && env.PUSH_SENDER);
}
export function senderConfigured(env) {
  return !!(
    env.PUSH_DB &&
    env.VAPID_PUBLIC_KEY &&
    env.VAPID_PRIVATE_KEY &&
    /^(mailto:|https:\/\/)/.test(env.VAPID_SUBJECT || '')
  );
}
export async function readBody(request) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) throw new HttpError(403, 'wrong_origin');
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site')
    throw new HttpError(403, 'wrong_origin');
  if (!(request.headers.get('Content-Type') || '').startsWith('application/json'))
    throw new HttpError(415, 'invalid_json');
  const reader = request.body?.getReader();
  let size = 0,
    text = '';
  const decoder = new TextDecoder();
  if (!reader) throw new HttpError(400, 'invalid_json');
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16384) {
      await reader.cancel();
      throw new HttpError(413, 'body_too_large');
    }
    text += decoder.decode(value, { stream: true });
  }
  try {
    const result = JSON.parse(text + decoder.decode());
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw 0;
    return result;
  } catch {
    throw new HttpError(400, 'invalid_json');
  }
}
export function json(value, status = 200) {
  return Response.json(value, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}
export function route(handler) {
  return async (context) => {
    try {
      if (!configured(context.env)) throw new HttpError(503, 'not_configured');
      return await handler(context);
    } catch (e) {
      if (!(e instanceof HttpError)) console.error('push_api_failure', { code: 'internal_error' });
      return json(
        { error: e instanceof HttpError ? e.code : 'internal_error' },
        e instanceof HttpError ? e.status : 500,
      );
    }
  };
}
