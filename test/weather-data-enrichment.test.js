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
    weather: {
      current: { temperature_2m: 22, weather_code: 61, relative_humidity_2m: 55, wind_gusts_10m: 21 },
      daily: { time: ['2026-09-26'], wind_gusts_10m_max: [29] },
      hourly: {
        time: Array.from({ length: 12 }, (_, i) => '2026-09-26T' + String(i).padStart(2, '0') + ':00'),
        wind_gusts_10m: Array(12).fill(21)
      }
    },
    air: null
  };
  const enriched = await data.enrichWithOpenMeteo(nwsPack, undefined, openMeteo);
  assert.equal(enriched.weather.current.temperature_2m, 22);
  assert.equal(enriched.weather.current.weather_code, 61);
  assert.equal(enriched.weather.current.relative_humidity_2m, 55);
  assert.equal(enriched.weather.current.wind_gusts_10m, 21);
  assert.equal(enriched.weather.hourly.wind_gusts_10m.length, 12);
  assert.equal(enriched.weather.daily.wind_gusts_10m_max[0], 29);

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
test('daily provider precedence fills gaps without inventing a wider temperature envelope',async()=>{
  const data=createDataModule();
  const pack={city:{name:'Boston'},weather:{current:{},daily:{time:['2026-10-06'],temperature_2m_max:[22],temperature_2m_min:[12]},hourly:{}}};
  const om={weather:{current:{},daily:{time:['2026-10-06','2026-10-07'],temperature_2m_max:[25,23],temperature_2m_min:[9,10]},hourly:{}}};
  const result=await data.enrichWithOpenMeteo(pack,null,om);
  assert.deepEqual(Array.from(result.weather.daily.temperature_2m_max),[22,23]);
  assert.deepEqual(Array.from(result.weather.daily.temperature_2m_min),[12,10]);
});
