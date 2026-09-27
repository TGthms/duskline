'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const moduleUrl = pathToFileURL(path.join(__dirname, '..', 'functions', 'api', 'international-alerts.js')).href;
const handlerPromise = import(moduleUrl);

function polygonAlert(overrides) {
  const now = Date.now();
  const polygon = {
    type: 'Polygon',
    coordinates: [[
      [139.60, 35.60], [139.90, 35.60], [139.90, 35.80], [139.60, 35.80], [139.60, 35.60]
    ]]
  };
  return Object.assign({
    id: '501',
    sent: new Date(now - 5 * 60 * 1000).toISOString(),
    url: 'https://alerts.example.gov/cap/501.xml',
    identifier: 'tokyo-warning-501',
    sender: 'alerts@example.gov',
    source: 'Japan Meteorological Agency',
    scope: 'Public',
    status: 'ACTUAL',
    msgType: 'ALERT',
    references: '',
    country: { iso3: 'JPN', name: 'Japan' },
    feed: { official: true, enableRebroadcast: true, authorName: 'Alert Desk' },
    admin1s: [{ name: 'Tokyo' }],
    infos: [{
      language: 'ja', event: '強風警報', senderName: 'Japan Meteorological Agency',
      headline: '東京に強風警報', description: '強い風に注意してください。',
      instruction: '安全な場所にいてください。', web: 'https://alerts.example.gov/tokyo',
      category: 'MET', categoryDisplay: 'Meteorological', responseType: 'SHELTER',
      urgency: 'EXPECTED', severity: 'SEVERE', certainty: 'LIKELY',
      effective: new Date(now - 60 * 1000).toISOString(), onset: null,
      expires: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      areas: [{ areaDesc: 'Tokyo', polygons: [{ value: '', valuePolygon: polygon }], circles: [], geocodes: [] }]
    }, {
      language: 'en', event: 'Wind Warning', category: 'MET', severity: 'SEVERE',
      urgency: 'EXPECTED', certainty: 'LIKELY', expires: new Date(now + 3 * 60 * 60 * 1000).toISOString(), areas: []
    }]
  }, overrides || {});
}

function createContext(url, options) {
  const calls = [];
  const upstream = async (_url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ query: body.query, variables: body.variables });
    if (options && options.fetch) return options.fetch(_url, init);
    if (body.query.includes('countries(pagination')) {
      return Response.json({ data: { public: { countries: { count: 1, items: [{ id: '101', iso3: 'JPN', name: 'Japan' }] } } } });
    }
    if (body.query.includes('country(pk:')) {
      return Response.json({ data: { public: { country: { admin1s: [{ id: '301', name: 'Tokyo' }] } } } });
    }
    if (body.query.includes('feeds(pagination')) {
      const feeds = options && options.noFeed ? [] : [{ official: true, enableRebroadcast: true, status: 'ACTIVE', country: { iso3: 'JPN' } }];
      return Response.json({ data: { public: { feeds: { count: feeds.length, items: feeds } } } });
    }
    if (body.query.includes('alerts(filters')) {
      const alerts = options && options.alerts ? options.alerts : [polygonAlert()];
      return Response.json({ data: { public: { alerts: { count: alerts.length, items: alerts } } } });
    }
    throw new Error('Unexpected GraphQL query');
  };
  return {
    calls: calls,
    value: {
      request: new Request(url),
      env: { CAP_FETCH: upstream },
      waitUntil: function (promise) { promise.catch(() => {}); }
    }
  };
}

test('international CAP endpoint resolves a country, selects the requested language, and preserves official alert details', async () => {
  const { onRequest } = await handlerPromise;
  const ctx = createContext('https://duskline.test/api/international-alerts?cc=JP&country=Japan&lang=ja');
  const response = await onRequest(ctx.value);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.availability, 'available');
  assert.equal(payload.provider, 'IFRC Alert Hub');
  assert.equal(payload.alerts.length, 1);
  assert.equal(payload.alerts[0].event, '強風警報');
  assert.equal(payload.alerts[0].category, 'MET');
  assert.equal(payload.alerts[0].severity, 'SEVERE');
  assert.equal(payload.alerts[0].senderName, 'Japan Meteorological Agency');
  assert.equal(payload.alerts[0].areas[0].polygons[0].valuePolygon.type, 'Polygon');
  assert.equal(ctx.calls.length, 3);
});

test('international CAP endpoint removes superseded, expired, non-public, and non-rebroadcastable alerts', async () => {
  const { onRequest } = await handlerPromise;
  const old = polygonAlert({
    id: 'old', identifier: 'old-id', sent: '2026-09-26T00:00:00Z', msgType: 'ALERT', references: ''
  });
  const update = polygonAlert({
    id: 'update', identifier: 'update-id', sent: new Date().toISOString(), msgType: 'UPDATE',
    references: 'alerts@example.gov,old-id,2026-09-26T00:00:00Z'
  });
  const expired = polygonAlert({
    id: 'expired', identifier: 'expired-id', infos: [{
      language: 'en', event: 'Expired warning', severity: 'EXTREME', expires: '2020-01-01T00:00:00Z', areas: []
    }]
  });
  const privateAlert = polygonAlert({ id: 'private', identifier: 'private-id', scope: 'Restricted' });
  const unapproved = polygonAlert({ id: 'unapproved', identifier: 'unapproved-id', feed: { official: false, enableRebroadcast: false } });
  const ctx = createContext('https://duskline.test/api/international-alerts?cc=JP&country=Japan&lang=en', {
    alerts: [old, update, expired, privateAlert, unapproved]
  });
  const response = await onRequest(ctx.value);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload.alerts.map((alert) => alert.capIdentifier), ['update-id']);
});

test('international CAP endpoint keeps official non-weather public-safety hazards', async () => {
  const { onRequest } = await handlerPromise;
  const publicHealth = polygonAlert({
    id: 'health', identifier: 'water-safety-1',
    infos: [{
      language: 'en', event: 'Drinking Water Notice', category: 'HEALTH',
      categoryDisplay: 'Health', severity: 'MODERATE', urgency: 'EXPECTED', certainty: 'OBSERVED',
      description: 'Follow the local authority’s drinking water guidance.',
      expires: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      areas: [{ areaDesc: 'Tokyo', polygons: [], circles: [] }]
    }]
  });
  const ctx = createContext('https://duskline.test/api/international-alerts?cc=JP&country=Japan&lang=en', {
    alerts: [publicHealth]
  });
  const response = await onRequest(ctx.value);
  const payload = await response.json();

  assert.equal(payload.alerts.length, 1);
  assert.equal(payload.alerts[0].category, 'HEALTH');
  assert.equal(payload.alerts[0].event, 'Drinking Water Notice');
});

test('international CAP endpoint scopes a capped country feed to the requested first-level region', async () => {
  const { onRequest } = await handlerPromise;
  const ctx = createContext('https://duskline.test/api/international-alerts?cc=JP&country=Japan&admin1=Tokyo%20Metropolis&lang=en');
  const response = await onRequest(ctx.value);
  const payload = await response.json();
  const scopedQuery = ctx.calls.find((call) => call.query.includes('alerts(filters'));

  assert.equal(response.status, 200);
  assert.equal(payload.scoped, true);
  assert.equal(scopedQuery.variables.filter.country.pk, '101');
  assert.equal(scopedQuery.variables.filter.admin1, '301');
  assert.equal(payload.alerts.length, 1);
});

test('an unmatched region safely falls back to the bounded country result', async () => {
  const { onRequest } = await handlerPromise;
  const ctx = createContext('https://duskline.test/api/international-alerts?cc=JP&country=Japan&admin1=No%20such%20region&lang=en');
  const response = await onRequest(ctx.value);
  const payload = await response.json();
  const alertQuery = ctx.calls.find((call) => call.query.includes('alerts(filters'));

  assert.equal(payload.scoped, false);
  assert.equal(alertQuery.variables.filter.admin1, undefined);
  assert.equal(payload.alerts.length, 1);
});

test('region-scoped CAP responses page beyond the country-level cap', async () => {
  const { onRequest } = await handlerPromise;
  const offsets = [];
  const ctx = createContext('https://duskline.test/api/international-alerts?cc=JP&country=Japan&admin1=Tokyo&lang=en', {
    fetch: async (_url, init) => {
      const body = JSON.parse(init.body);
      if (body.query.includes('countries(pagination')) {
        return Response.json({ data: { public: { countries: { count: 1, items: [{ id: '101', iso3: 'JPN', name: 'Japan' }] } } } });
      }
      if (body.query.includes('feeds(pagination')) {
        return Response.json({ data: { public: { feeds: { count: 1, items: [{ official: true, enableRebroadcast: true, status: 'ACTIVE', country: { iso3: 'JPN' } }] } } } });
      }
      if (body.query.includes('country(pk:')) {
        return Response.json({ data: { public: { country: { admin1s: [{ id: '301', name: 'Tokyo' }] } } } });
      }
      if (body.query.includes('alerts(filters')) {
        const offset = body.variables.page.offset;
        offsets.push(offset);
        const count = 250;
        const pageItems = Array.from({ length: Math.min(100, count - offset) }, (_, index) => {
          const number = offset + index;
          const item = polygonAlert({
            id: String(number), identifier: 'tokyo-alert-' + number,
            sent: new Date(Date.now() - number * 1000).toISOString()
          });
          item.infos = item.infos.map((info) => Object.assign({}, info, {
            event: 'Tokyo warning ' + number,
            headline: 'Tokyo warning bulletin ' + number
          }));
          return item;
        });
        return Response.json({ data: { public: { alerts: { count, items: pageItems } } } });
      }
      throw new Error('Unexpected GraphQL query');
    }
  });
  const response = await onRequest(ctx.value);
  const payload = await response.json();

  assert.equal(payload.scoped, true);
  assert.equal(payload.truncated, false);
  assert.equal(payload.alerts.length, 250);
  assert.deepEqual(offsets, [0, 100, 200]);
});

test('international CAP endpoint reports unsupported coverage instead of an all-clear', async () => {
  const { onRequest } = await handlerPromise;
  const ctx = createContext('https://duskline.test/api/international-alerts?cc=JP&country=Japan&lang=en', { noFeed: true });
  const response = await onRequest(ctx.value);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.availability, 'unsupported');
  assert.deepEqual(payload.alerts, []);
});

test('country name fallback supports older saved places and country code cannot select a different country', async () => {
  const { onRequest } = await handlerPromise;
  const legacy = createContext('https://duskline.test/api/international-alerts?country=Japan&lang=en');
  const legacyResponse = await onRequest(legacy.value);
  const legacyPayload = await legacyResponse.json();
  assert.equal(legacyPayload.country, 'Japan');
  assert.equal(legacyPayload.availability, 'available');

  const mismatch = createContext('https://duskline.test/api/international-alerts?cc=JP&country=United%20States&lang=en');
  const mismatchResponse = await onRequest(mismatch.value);
  const mismatchPayload = await mismatchResponse.json();
  assert.equal(mismatchPayload.country, 'Japan');
});

test('international CAP endpoint validates requests and fails closed on an upstream error', async () => {
  const { onRequest } = await handlerPromise;
  const invalid = await onRequest(createContext('https://duskline.test/api/international-alerts?cc=USA&country=United%20States&lang=en').value);
  assert.equal(invalid.status, 400);

  const failed = createContext('https://duskline.test/api/international-alerts?cc=JP&country=Japan&lang=en', {
    fetch: async () => new Response('unavailable', { status: 503 })
  });
  const response = await onRequest(failed.value);
  const payload = await response.json();
  assert.equal(response.status, 502);
  assert.equal(payload.error, 'upstream_unavailable');
});
