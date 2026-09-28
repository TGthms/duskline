'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function loadMapFactory() {
  const window = {
    DusklineWeather: { active: true, factories: {} },
    addEventListener() {}
  };
  const document = { getElementById() { return null; } };
  const context = { window, document, URLSearchParams, fetch, AbortController, Map, Math, Date, Intl, setTimeout, clearTimeout };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/features/weather/map.js'), 'utf8'), context);
  return window.DusklineWeather.factories.map({});
}

test('weather map samples a regular Mercator grid within visible bounds', () => {
  const map = loadMapFactory();
  const bounds = { getWest: () => -20, getEast: () => 30, getNorth: () => 55, getSouth: () => -35 };
  const grid = map.helpers.gridGeometry(bounds);
  assert.equal(grid.points.length, 36);
  assert.equal(JSON.stringify(grid.coordinates), JSON.stringify([[-20, 55], [30, 55], [30, -35], [-20, -35]]));
  assert.equal(grid.points[0].x, 0);
  assert.equal(grid.points[0].y, 0);
  assert.equal(grid.points[35].x, 1);
  assert.equal(grid.points[35].y, 1);
  assert.ok(grid.points.every((point) => Math.abs(point.latitude) <= 85));
  assert.ok(grid.points.every((point) => point.longitude >= -180 && point.longitude <= 180));
});

test('weather map normalizes grid sample longitudes across the date line', () => {
  const map = loadMapFactory();
  const grid = map.helpers.gridGeometry({ getWest: () => 170, getEast: () => -170, getNorth: () => 20, getSouth: () => -20 });
  assert.equal(grid.east, 190);
  assert.equal(grid.points[0].longitude, 170);
  assert.equal(grid.points[5].longitude, -170);
  assert.ok(grid.points.every((point) => Math.abs(point.longitude) >= 170));
});

test('weather map layers use distinct weather palettes and keep zero rain transparent', () => {
  const map = loadMapFactory();
  const noRain = Array.from(map.helpers.palette('precipitation', 0));
  const heavyRain = Array.from(map.helpers.palette('precipitation', 100));
  const cold = Array.from(map.helpers.palette('temperature', -15));
  const hot = Array.from(map.helpers.palette('temperature', 38));
  assert.equal(noRain[3], 0);
  assert.ok(heavyRain[3] > 0);
  assert.notDeepEqual(cold, hot);
  assert.deepEqual(Array.from(map.helpers.palette('wind', 0)), [0, 0, 0, 0]);
});

test('Lucide glyphs and complete third-party license notices are local', () => {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const lucideLicense = fs.readFileSync(path.join(root, 'assets/icons/LUCIDE-LICENSE.txt'), 'utf8');
  const mapLicense = fs.readFileSync(path.join(root, 'assets/vendor/maplibre-gl/LICENSE.txt'), 'utf8');
  const licensesPage = fs.readFileSync(path.join(root, 'licenses.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'src/js/features/weather/app.js'), 'utf8');
  assert.match(index, /symbol id="lucide-cloud-sun"/);
  assert.match(index, /symbol id="lucide-alert-circle"/);
  assert.match(app, /const href = '#lucide-' \+ glyph/);
  assert.doesNotMatch(index, /assets\/icons\/lucide-sprite\.svg#/);
  assert.match(lucideLicense, /ISC License/);
  assert.match(lucideLicense, /The MIT License \(MIT\)/);
  assert.match(mapLicense, /Copyright \(c\) 2023, MapLibre contributors/);
  assert.match(licensesPage, /LUCIDE-LICENSE\.txt/);
  assert.match(licensesPage, /vendor\/maplibre-gl\/LICENSE\.txt/);
});
