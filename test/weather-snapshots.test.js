'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../src/js/features/weather/snapshots.js'), 'utf8');

function factory() {
  const window = { DusklineWeather: { active: true, factories: {} } };
  vm.runInNewContext(source, { window });
  return window.DusklineWeather.factories.snapshots;
}

test('saved forecasts survive reload without persisting alerts and expire after a week', () => {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, value)
  };
  const cityKey = c => `${c.lat},${c.lon}`;
  const sameCity = (a, b) => !!(a && b && cityKey(a) === cityKey(b));
  const create = factory();
  const now = 1_800_000_000_000;
  const deps = { storage, cityKey, sameCity, now: () => now };
  const city = { name: 'Boston', lat: 42.36, lon: -71.06 };
  const store = create(deps);
  store.save({ city, weather: { current: { temperature_2m: 18 } }, alerts: [{ event: 'Old alert' }], fetchedAt: now }, { visited: true });
  const restored = create(deps).find(city);
  assert.equal(restored.stored, true);
  assert.equal(restored.weather.current.temperature_2m, 18);
  assert.equal(restored.alerts, undefined);
  assert.equal(restored.visited, true);
  assert.equal(create({ ...deps, now: () => now + 8 * 86400000 }).find(city), null);
  store.forget(city);
  assert.equal(create(deps).find(city), null);
});

test('full storage drops older forecasts and keeps the newest one', () => {
  const values = new Map();
  let maxLength = Infinity;
  const storage = {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => {
      if (value.length > maxLength) throw new Error('QuotaExceededError');
      values.set(key, value);
    }
  };
  const cityKey = c => String(c.lat);
  const sameCity = (a, b) => !!(a && b && a.lat === b.lat);
  const store = factory()({ storage, cityKey, sameCity, now: () => 1000 });
  const one = { city: { name: 'A', lat: 1 }, weather: { current: { temperature_2m: 10 } }, fetchedAt: 1000 };
  const two = { city: { name: 'B', lat: 2 }, weather: { current: { temperature_2m: 11 } }, fetchedAt: 1000 };
  store.save(one);
  maxLength = values.values().next().value.length + 10;
  store.save(two);
  assert.equal(store.all.length, 1);
  assert.equal(store.find(two.city).weather.current.temperature_2m, 11);
  assert.equal(store.find(one.city), null);
});
