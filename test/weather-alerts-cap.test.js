'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createAlertsModule() {
  const window = {
    DusklineWeather: { active: true, factories: {} },
    setTimeout,
    clearTimeout,
    fetch,
    location: { href: 'https://duskline.test/' }
  };
  const context = { window, URL, URLSearchParams, AbortController, document: undefined };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/features/weather/alerts.js'), 'utf8'), context);
  return window.DusklineWeather.factories.alerts({});
}

test('CAP GeoJSON polygons match the city point and do not widen precise shapes to the admin area', () => {
  const alerts = createAlertsModule();
  const warning = {
    areas: [{ polygons: [{ valuePolygon: {
      type: 'Polygon',
      coordinates: [[[139.60, 35.60], [139.90, 35.60], [139.90, 35.80], [139.60, 35.80], [139.60, 35.60]]]
    } }], circles: [] }],
    admin1s: ['Tokyo']
  };
  assert.equal(alerts.capAlertMatchesCity(warning, { name: 'Tokyo', lat: 35.68, lon: 139.69 }), true);
  assert.equal(alerts.capAlertMatchesCity(warning, { name: 'Osaka', admin1: 'Tokyo', lat: 34.69, lon: 135.50 }), false);
  assert.equal(alerts.capAlertMatchesCity(Object.assign({}, warning, { ends: '2020-01-01T00:00:00Z' }), {
    name: 'Tokyo', lat: 35.68, lon: 139.69
  }), false);
});

test('CAP polygon holes exclude locations, and multipolygons include either outer shape', () => {
  const alerts = createAlertsModule();
  const withHole = {
    areas: [{ polygons: [{ valuePolygon: {
      type: 'Polygon',
      coordinates: [
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
        [[4, 4], [6, 4], [6, 6], [4, 6], [4, 4]]
      ]
    } }], circles: [] }]
  };
  assert.equal(alerts.capAlertMatchesCity(withHole, { lat: 2, lon: 2 }), true);
  assert.equal(alerts.capAlertMatchesCity(withHole, { lat: 5, lon: 5 }), false);

  const multi = {
    areas: [{ polygons: [{ valuePolygon: {
      type: 'MultiPolygon',
      coordinates: [
        [[[20, 20], [21, 20], [21, 21], [20, 21], [20, 20]]],
        [[[30, 30], [31, 30], [31, 31], [30, 31], [30, 30]]]
      ]
    } }], circles: [] }]
  };
  assert.equal(alerts.capAlertMatchesCity(multi, { lat: 30.5, lon: 30.5 }), true);
  assert.equal(alerts.capAlertMatchesCity(multi, { lat: 5, lon: 5 }), false);
});

test('CAP polygons that cross the international date line match on either side', () => {
  const alerts = createAlertsModule();
  const dateline = {
    areas: [{ polygons: [{ valuePolygon: {
      type: 'Polygon',
      coordinates: [[[-179.8, -17.2], [179.8, -17.2], [179.8, -16.8], [-179.8, -16.8], [-179.8, -17.2]]]
    } }], circles: [] }]
  };
  assert.equal(alerts.capAlertMatchesCity(dateline, { lat: -17, lon: 179.95 }), true);
  assert.equal(alerts.capAlertMatchesCity(dateline, { lat: -17, lon: -179.95 }), true);
  assert.equal(alerts.capAlertMatchesCity(dateline, { lat: -17, lon: 0 }), false);
});

test('CAP circles and admin-area descriptions provide narrow fallbacks when polygons are absent', () => {
  const alerts = createAlertsModule();
  const circle = { areas: [{ circles: [{ value: '35.68,139.69 20' }], polygons: [] }] };
  assert.equal(alerts.capAlertMatchesCity(circle, { lat: 35.70, lon: 139.70 }), true);
  assert.equal(alerts.capAlertMatchesCity(circle, { lat: 34.69, lon: 135.50 }), false);

  const areaOnly = {
    areas: [{ areaDesc: 'Tokyo Prefecture', circles: [], polygons: [] }],
    admin1s: ['Tokyo']
  };
  assert.equal(alerts.capAlertMatchesCity(areaOnly, { lat: 35.68, lon: 139.69, admin1: 'Tokyo Metropolis' }), true);
  assert.equal(alerts.capAlertMatchesCity(areaOnly, { lat: 34.69, lon: 135.50, admin1: 'Osaka' }), false);
});

test('partial CAP result warns users to check the local official source', () => {
  const alerts = createAlertsModule();
  const html = alerts.alertsBlockHtml({
    alertsPartial: true,
    alerts: [{
      id: 'partial:0', providerName: 'IFRC Alert Hub', event: 'Public warning', severity: 'Moderate',
      sent: new Date().toISOString(), ends: new Date(Date.now() + 3600000).toISOString()
    }]
  });
  assert.match(html, /This source returned many alerts/);
  const incomplete = alerts.alertsBlockHtml({ alertsError: true, alertsUnavailableReason: 'partial' });
  assert.match(incomplete, /This source returned many alerts/);
  const expired = alerts.alertsBlockHtml([{ event: 'Expired alert', severity: 'Extreme', ends: '2020-01-01T00:00:00Z' }]);
  assert.equal(expired, '');
});
