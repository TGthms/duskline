'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const ABOUT_KEYS = [
  'weather.about.humidity',
  'weather.about.uv',
  'weather.about.aqi',
  'weather.about.wind',
  'weather.about.pressure',
  'weather.about.vis',
  'weather.about.precip',
  'weather.about.sun',
  'weather.about.feels',
  'weather.about.conditions'
];

function loadI18n() {
  const ctx = { window: {}, console };
  ctx.global = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/data/duskline-locales.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/data/weather-about-i18n.js'), 'utf8'), ctx);
  return ctx.window;
}

test('every picker language has a real About blurb for every sheet', () => {
  const win = loadI18n();
  const codes = win.DUSKLINE_LANG_CODES;
  assert.equal(codes.length, 30);
  for (const code of codes) {
    const dict = win.I18N[code];
    assert.ok(dict, 'missing pack ' + code);
    for (const key of ABOUT_KEYS) {
      const text = dict[key];
      assert.equal(typeof text, 'string', code + ' ' + key);
      assert.ok(text.trim().length > 40, 'too short ' + code + ' ' + key);
      assert.ok(!text.startsWith('weather.about.'), 'raw key ' + code + ' ' + key);
      assert.notEqual(text.toLowerCase().trim(), 'about.');
    }
  }
});

test('French and Traditional Chinese About copy are not English clones', () => {
  const win = loadI18n();
  const en = win.I18N.en['weather.about.sun'];
  const fr = win.I18N.fr['weather.about.sun'];
  const tw = win.I18N['zh-TW']['weather.about.humidity'];
  assert.notEqual(fr, en);
  assert.match(fr, /crépuscule|lueurs|soleil/i);
  assert.notEqual(tw, win.I18N.en['weather.about.humidity']);
  assert.match(tw, /相對濕度/);
});
