import { PMTiles, ResolvedValueCache } from '../../_lib/vendor/pmtiles/reader.js';

const HOUR = 3600000;
const TILE_ZOOM = 4;
const RELEASE = 'https://github.com/TGthms/duskline/releases/download/map-tiles-v1-';
const RELEASE_CDN = new Set(['release-assets.githubusercontent.com', 'objects.githubusercontent.com']);
const archiveDirectories = new ResolvedValueCache(96);

function hourKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 13).replace(/[-T]/g, '');
}

function timestamp(key) {
  if (!/^\d{10}$/.test(key)) return NaN;
  const date = Date.parse(key.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)$/, '$1-$2-$3T$4:00:00Z'));
  return Number.isFinite(date) && hourKey(date) === key ? date : NaN;
}

async function fetchRelease(url, headers, fetcher) {
  const signal = AbortSignal.timeout(5000);
  const response = await fetcher(url, { headers, redirect: 'manual', signal });
  if (response.status !== 302 && response.status !== 307) return response;
  await response.body?.cancel();
  const redirect = new URL(response.headers.get('location'), url);
  if (redirect.protocol !== 'https:' || !RELEASE_CDN.has(redirect.hostname)) {
    throw new Error('Unexpected release asset redirect');
  }
  return fetcher(redirect.href, { headers, redirect: 'manual', signal });
}

function unavailable(status) {
  return new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });
}

async function findManifest(now, fetcher) {
  const current = Math.floor(now / (6 * HOUR)) * 6 * HOUR;
  const oldest = now - 16 * HOUR;
  const currentHour = hourKey(now);
  for (let run = current; run >= oldest; run -= 6 * HOUR) {
    const key = hourKey(run);
    try {
      const response = await fetchRelease(RELEASE + key + '/manifest.json', {}, fetcher);
      if (!response.ok) { await response.body?.cancel(); continue; }
      const manifest = await response.json();
      if (manifest.version !== 1 || manifest.run !== key || manifest.tileSize !== 256
          || manifest.maxZoom !== TILE_ZOOM || !Array.isArray(manifest.frames)
          || manifest.frames.length !== 24
          || manifest.frames.some((frame, index) => frame !== hourKey(run + (index + 1) * HOUR))
          || !manifest.frames.includes(currentHour)) continue;
      return Response.json(manifest, { headers: { 'Cache-Control': 'public, max-age=240' } });
    } catch (error) { /* A previous complete run may still cover this hour. */ }
  }
  return unavailable(503);
}

class ReleaseArchive {
  constructor(url, fetcher) {
    this.url = url;
    this.fetcher = fetcher;
  }
  getKey() { return this.url; }
  async getBytes(offset, length) {
    if (length > 512 * 1024) throw new Error('Oversized tile archive range');
    const response = await fetchRelease(this.url, { Range: 'bytes=' + offset + '-' + (offset + length - 1) }, this.fetcher);
    const range = response.headers.get('content-range');
    const size = Number(response.headers.get('content-length'));
    if (response.status !== 206 || !range?.startsWith('bytes ' + offset + '-')
        || !Number.isSafeInteger(size) || size < 1 || size > length) {
      await response.body?.cancel();
      throw new Error('Release asset did not return the expected range');
    }
    return { data: await response.arrayBuffer(), etag: response.headers.get('etag') || undefined };
  }
}

export async function serveMapTile(request, { fetcher = fetch, now = Date.now(), cache, waitUntil = () => {} } = {}) {
  if (request.method !== 'GET') return unavailable(405);
  const url = new URL(request.url);
  if (url.search) return unavailable(404);
  const asset = url.pathname.slice('/api/map-tiles/v1/'.length);
  if (!url.pathname.startsWith('/api/map-tiles/v1/')) return unavailable(404);
  const match = /^(\d{10})\/(\d{10})\/(temperature|precipitation)\/([0-4])\/(\d{1,2})\/(\d{1,2})\.webp$/.exec(asset);
  if (!match && asset !== 'manifest.json') return unavailable(404);

  let response;
  if (match) {
    const [, run, frame, layer, zoom, column, row] = match;
    const runTime = timestamp(run), frameTime = timestamp(frame);
    const z = Number(zoom), x = Number(column), y = Number(row);
    if (!Number.isFinite(runTime) || !Number.isFinite(frameTime) || runTime % (6 * HOUR)
        || runTime > now || now - runTime > 36 * HOUR || frameTime <= runTime
        || frameTime - runTime > 24 * HOUR || x >= (1 << z) || y >= (1 << z)
        || String(x) !== column || String(y) !== row) return unavailable(404);
    const hit = await cache?.match(url.href);
    if (hit) return hit;
    try {
      const archive = new PMTiles(new ReleaseArchive(RELEASE + run + '/' + frame + '-' + layer + '.pmtiles', fetcher), archiveDirectories);
      const tile = await archive.getZxy(z, x, y);
      if (!tile || new DataView(tile.data).getUint32(8) !== 0x57454250) return unavailable(502);
      response = new Response(tile.data, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=86400, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      return unavailable(503);
    }
  } else {
    const hit = await cache?.match(url.href);
    if (hit) return hit;
    response = await findManifest(now, fetcher);
  }
  if (cache && response.ok) waitUntil(cache.put(url.href, response.clone()).catch(() => {}));
  return response;
}

export function onRequest(context) {
  return serveMapTile(context.request, {
    cache: caches.default,
    waitUntil: promise => context.waitUntil(promise),
  });
}
