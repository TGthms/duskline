'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function createDataModule() {
  const window = {
    DusklineWeather: { active: true, factories: {} },
    setTimeout,
    clearTimeout,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
  };
  const context = { window, fetch };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/features/weather/data.js'), 'utf8'), context);
  return window.DusklineWeather.factories.data({ cache: new Map() });
}

test('Open-Meteo enrichment fills missing NWS current temperature and condition without overriding valid NWS values', async () => {
  const data = createDataModule();
  const city = { name: 'Boston', lat: 42.36, lon: -71.06 };
  const nwsPack = data.normalizeNws(
    city,
    { properties: { timeZone: 'America/New_York' } },
    { properties: { periods: [] } },
    { properties: { periods: [] } }
  );
  assert.equal(nwsPack.weather.current.temperature_2m, null);
  assert.equal(nwsPack.weather.current.weather_code, null);

  const openMeteo = {
    weather: { current: { temperature_2m: 22, weather_code: 61, relative_humidity_2m: 55 }, daily: {}, hourly: {} },
    air: null
  };
  const enriched = await data.enrichWithOpenMeteo(nwsPack, undefined, openMeteo);
  assert.equal(enriched.weather.current.temperature_2m, 22);
  assert.equal(enriched.weather.current.weather_code, 61);
  assert.equal(enriched.weather.current.relative_humidity_2m, 55);

  const validNwsPack = data.normalizeNws(
    city,
    { properties: { timeZone: 'America/New_York' } },
    { properties: { periods: [{ startTime: new Date().toISOString(), isDaytime: true, temperature: 68, temperatureUnit: 'F', shortForecast: 'Sunny' }] } },
    { properties: { periods: [{ startTime: new Date().toISOString(), endTime: new Date(Date.now() + 3600000).toISOString(), isDaytime: true, temperature: 68, temperatureUnit: 'F', shortForecast: 'Sunny' }] } }
  );
  const preserved = await data.enrichWithOpenMeteo(validNwsPack, undefined, openMeteo);
  assert.ok(Math.abs(preserved.weather.current.temperature_2m - 20) < 0.01);
  assert.equal(preserved.weather.current.weather_code, 0);
});
