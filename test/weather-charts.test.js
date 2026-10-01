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
  const area = chart.match(/<path d="([^"]+)" fill="url\(/);
  assert.ok(area, 'temperature chart area must exist');
  const closing = area[1].match(/L([\d.]+),([\d.]+) Z$/);
  assert.equal(Number(closing[1]),JSON.parse(pointData[1])[0].x, 'future-day area closes at the first plotted hour, not noon');
});

test('compact daily preview starts tomorrow, caps at five and preserves partial forecasts', () => {
  const charts = loadCharts();
  const now = new Date();
  const today = new Intl.DateTimeFormat('en-CA',{timeZone:'UTC',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const times = Array.from({length:10},(_,i)=>new Date(Date.parse(today+'T12:00:00Z')+i*86400000).toISOString().slice(0,10));
  const daily = {time:times,temperature_2m_max:times.map(()=>25),temperature_2m_min:times.map(()=>15),weather_code:times.map(()=>2)};
  const html = charts.dailyBarsHtml(daily,{timeZone:'UTC',skipToday:true,limit:5});
  const dates = [...html.matchAll(/data-day-date="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(dates,times.slice(1,6));
  const partial = {...daily,time:times.slice(0,3)};
  assert.equal(charts.dailySliceCount(partial,{timeZone:'UTC',skipToday:true,limit:5}),2);
  assert.equal(charts.dailySliceCount(daily,{timeZone:'UTC'}),10);
  const future = {...daily,time:times.slice(1)};
  assert.ok(charts.dailyBarsHtml(future,{timeZone:'UTC',skipToday:true,limit:5}).includes('data-day-date="'+times[1]+'"'));
});
