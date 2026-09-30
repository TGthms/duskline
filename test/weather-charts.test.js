'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function loadCharts() {
  const window = { DusklineWeather: { active: true, factories: {} } };
  const context = { window, Date, Intl, Math, Number, JSON, Array, Object, Map, Set };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/features/weather/charts.js'), 'utf8'), context);
  return window.DusklineWeather.factories.charts({
    t: (_key, fallback) => fallback,
    escapeHtml: value => String(value == null ? '' : value).replace(/[&<>"']/g, ''),
    lang: () => 'en',
    localeTag: () => 'en-US',
    fmtTemp: value => Math.round(Number(value)) + '°',
    fmtWind: value => String(value),
    fmtPress: value => String(value),
    fmtPrecip: value => String(value),
    formatClock: value => String(value).slice(11, 16),
    formatChartAxisHour: value => String(value).slice(11, 16),
    useF: () => false,
    motionLevel: () => 'full'
  });
}

test('future-day temperature chart starts at the day range and local noon, not the current hour', () => {
  const charts = loadCharts();
  const date = '2099-05-03';
  const times = Array.from({ length: 24 }, (_, hour) => date + 'T' + String(hour).padStart(2, '0') + ':00');
  const hourly = {
    time: times,
    temperature_2m: times.map((_, hour) => 10 + Math.round(12 * Math.sin(hour / 24 * Math.PI))),
    apparent_temperature: times.map((_, hour) => 8 + Math.round(12 * Math.sin(hour / 24 * Math.PI))),
    weather_code: times.map((_, hour) => hour < 12 ? 2 : 61)
  };
  const chart = charts.buildTempChart(hourly, 'temperature_2m', value => Math.round(value) + '°', 'UTC', date, {
    initialMode: 'range',
    initialReadout: '10° – 22°',
    initialSub: 'Daily range'
  });
  assert.match(chart, /data-initial-mode="range"/);
  assert.match(chart, /data-initial-readout="10° – 22°"/);
  assert.match(chart, /data-initial-sub="Daily range"/);
  assert.match(chart, /data-now-idx="12"/);
  assert.match(chart, /class="wx-chart-guide" data-guide style="display:none"/);
  assert.match(chart, /class="wx-chart-dot" data-dot style="display:none"/);
  const pointData = chart.match(/data-pts='([^']+)'/);
  assert.ok(pointData);
  assert.equal(JSON.parse(pointData[1])[12].code, 61);
});
