'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const BANDS = ['Good', 'Moderate', 'UnhealthySG', 'Unhealthy', 'VeryUnhealthy', 'Hazardous'];
const EU_BANDS = ['Fair', 'Poor', 'VeryPoor', 'ExtremelyPoor'];

function loadI18n() {
  const ctx = { window: {}, console };
  ctx.global = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/data/duskline-locales.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/data/weather-aqi-i18n.js'), 'utf8'), ctx);
  return ctx.window;
}

test('all six U.S. AQI bands have full, localized health descriptions', () => {
  const win = loadI18n();
  assert.equal(win.DUSKLINE_LANG_CODES.length, 30);
  for (const locale of win.DUSKLINE_LANG_CODES) {
    for (const band of BANDS) {
      const key = 'weather.aqiDesc' + band;
      const description = win.I18N[locale] && win.I18N[locale][key];
      assert.equal(typeof description, 'string', locale + ' ' + key);
      const minLength = ['ja', 'ko', 'zh', 'zh-TW'].includes(locale) ? 12 : 35;
      assert.ok(description.trim().length > minLength, 'incomplete description: ' + locale + ' ' + key);
      assert.notEqual(description, key, 'raw translation key: ' + locale + ' ' + key);
      if (locale !== 'en') assert.notEqual(description, win.I18N.en[key], 'English fallback: ' + locale + ' ' + key);
      const greeting = win.I18N[locale]['weather.aqiGreeting' + band];
      assert.equal(typeof greeting, 'string', locale + ' greeting ' + band);
      assert.ok(greeting.trim().length > 4);
    }
    if (locale !== 'en') {
      for (const key of ['weather.mySkyEmpty', 'weather.chooseMySkyPlace', 'weather.changeMySkyPlace']) {
        assert.doesNotMatch(win.I18N[locale][key], /My Sky/, 'feature name should be localized: ' + locale + ' ' + key);
      }
    }
  }
});

test('European AQI labels are localized for every picker language', () => {
  const win = loadI18n();
  for (const locale of win.DUSKLINE_LANG_CODES) {
    for (const band of EU_BANDS) {
      const key = 'weather.aqiEur' + band;
      const label = win.I18N[locale] && win.I18N[locale][key];
      assert.equal(typeof label, 'string', locale + ' ' + key);
      assert.ok(label.trim().length > 1, 'empty European AQI label: ' + locale + ' ' + key);
      assert.notEqual(label, key, 'raw translation key: ' + locale + ' ' + key);
      if (locale !== 'en') assert.notEqual(label, win.I18N.en[key], 'English fallback: ' + locale + ' ' + key);
    }
  }
});
