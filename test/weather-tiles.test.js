'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');

const api = import('../functions/api/map-tiles/[[path]].js');
const endpoint = 'https://duskline.test/api/map-tiles/v1/';
const now = Date.parse('2026-11-19T07:15:00Z');
const run = '2026111900';
const assetPrefix = 'https://github.com/TGthms/duskline/releases/download/map-tiles-v1-' + run;
const archive = Buffer.from(
  'UE1UaWxlcwN/AAAAAAAAABkAAAAAAAAAmAAAAAAAAAAWAAAAAAAAAK4AAAAAAAAAAAAAAAAAAACuAAAAAAAAACYAAAAAAAAAAQAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAQIBBAAAAC62lAAXW8oA0klrAOmkNQAAAAAAAAAAAB+LCAAAAAAAAv9jZGBUYwQAKAdZTgUAAAAfiwgAAAAAAAL/q64FAEO/pqMCAAAAUklGRh4AAABXRUJQVlA4TBEAAAAvAUAAAAdQso40uf+BiOh/AAA=',
  'base64'
);

test('weather tile gateway serves and caches a single decoded WebP tile', async () => {
  const { serveMapTile } = await api;
  const cache = new Map();
  const calls = [];
  const pending = [];
  const asset = assetPrefix + '/2026111907-temperature.pmtiles';
  const cdn = 'https://release-assets.githubusercontent.com/test-archive';
  const init = {
    now,
    cache: {
      match: async url => cache.get(url)?.clone(),
      put: async (url, response) => cache.set(url, response)
    },
    waitUntil: promise => pending.push(promise),
    fetcher: async (url, options) => {
      assert.ok(url === asset || url === cdn);
      assert.equal(options.redirect, 'manual');
      const [, start, end] = /^bytes=(\d+)-(\d+)$/.exec(options.headers.Range);
      calls.push(url);
      if (url === asset) return new Response(null, { status:302, headers:{ location:cdn } });
      const slice = archive.subarray(Number(start), Number(end) + 1);
      return new Response(slice, { status:206, headers:{
        'Content-Range': `bytes ${start}-${Number(start) + slice.length - 1}/${archive.length}`,
        'Content-Length': String(slice.length),
        ETag: '"fixture"'
      } });
    }
  };
  const request = new Request(endpoint + run + '/2026111907/temperature/0/0/0.webp');
  const response = await serveMapTile(request, init);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/webp');
  assert.match(response.headers.get('cache-control'), /immutable/);
  const tile = Buffer.from(await response.arrayBuffer());
  assert.deepEqual(tile, archive.subarray(-38));
  assert.equal(calls.length, 4);
  await Promise.all(pending);
  assert.equal((await serveMapTile(request, init)).status, 200);
  assert.equal(calls.length, 4);
});

test('weather tiles reject invalid coordinates and discover a previous complete run', async () => {
  const { serveMapTile } = await api;
  const frames = Array.from({ length:24 }, (_, index) => {
    const stamp = Date.parse('2026-11-19T00:00:00Z') + (index + 1)*3600000;
    return new Date(stamp).toISOString().slice(0,13).replace(/[-T]/g,'');
  });
  const calls = [];
  const options = { now, fetcher: async url => {
    calls.push(url);
    return url === assetPrefix + '/manifest.json'
      ? Response.json({ version:1, run, frames, tileSize:256, maxZoom:4 })
      : new Response(null, { status:404 });
  } };
  const bad = ['/2026111900/temperature/0/0/0.webp', '/2026111907/temperature/2/4/0.webp',
    '/2026111907/temperature/2/03/0.webp', '/2026111907/precipitation/0/0/0.webp?x=1',
    '/2026111907/wind-direction/0/0/0.webp', '/2026111907/wind/0/0/0.pbf'];
  for (const path of bad) assert.equal((await serveMapTile(new Request(endpoint + run + path), options)).status, 404);
  assert.equal(calls.length, 0);
  const result = await serveMapTile(new Request(endpoint + 'manifest.json'), options);
  assert.equal(result.status, 200);
  assert.equal((await result.json()).run, run);
  assert.equal(calls.length, 2);
});
