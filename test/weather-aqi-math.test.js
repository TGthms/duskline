'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/features/weather/aqi-math.js'), 'utf8'), context);
const aqi = context.window.DusklineAqiMath;

test('US AQI bands retain their published boundaries, including values above 300', () => {
  assert.equal(aqi.band(50, 'us'), 'Good');
  assert.equal(aqi.band(51, 'us'), 'Moderate');
  assert.equal(aqi.band(100, 'us'), 'Moderate');
  assert.equal(aqi.band(101, 'us'), 'UnhealthySG');
  assert.equal(aqi.band(301, 'us'), 'Hazardous');
  assert.equal(aqi.band(650, 'us'), 'Hazardous');
  assert.equal(aqi.percent(250, 'us'), 50);
  assert.equal(aqi.percent(700, 'us'), 100);
});

test('European AQI uses the separate six-band scale and caps its visual marker at 100', () => {
  assert.equal(aqi.band(20, 'eu'), 'Good');
  assert.equal(aqi.band(21, 'eu'), 'Fair');
  assert.equal(aqi.band(41, 'eu'), 'Moderate');
  assert.equal(aqi.band(61, 'eu'), 'Poor');
  assert.equal(aqi.band(81, 'eu'), 'VeryPoor');
  assert.equal(aqi.band(101, 'eu'), 'ExtremelyPoor');
  assert.equal(aqi.band(220, 'eu'), 'ExtremelyPoor');
  assert.equal(aqi.percent(50, 'eu'), 50);
  assert.equal(aqi.percent(150, 'eu'), 100);
});

test('AQI helpers reject unavailable and invalid readings and default to the US scale', () => {
  assert.equal(aqi.scale('unknown'), 'us');
  assert.equal(aqi.band(null, 'us'), '');
  assert.equal(aqi.band(-1, 'eu'), '');
  assert.equal(aqi.band('not-a-number', 'eu'), '');
  assert.equal(aqi.percent(null, 'us'), 0);
  assert.equal(aqi.maxValue('eu'), 100);
  assert.equal(aqi.maxValue('us'), 500);
});
