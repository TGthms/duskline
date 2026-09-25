'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const PERIODS = ['morning', 'afternoon', 'evening', 'night'];
const CONDITIONS = ['clear', 'mostlyClear', 'partlyCloudy', 'overcast', 'fog', 'drizzle', 'rain', 'snow', 'thunderstorms'];

function loadI18n() {
  const ctx = { window: {}, console };
  vm.createContext(ctx);
  for (const file of [
    'src/js/data/duskline-locales.js',
    'src/js/data/i18n.js',
    'src/js/data/weather-copy-i18n.js',
    'src/js/data/weather-greeting-pools-i18n.js'
  ]) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx);
  }
  return ctx.window;
}

test('every picker language has complete, localized greeting and context pools', () => {
  const win = loadI18n();
  assert.equal(win.DUSKLINE_LANG_CODES.length, 30);
  const english = win.I18N.en;
  const contexts = [
    'weather.context.humidity.low', 'weather.context.humidity.high',
    'weather.context.wind.strong', 'weather.context.sun.daylight',
    'weather.context.conditions.range', 'weather.context.tomorrow.outlook'
  ];

  for (const locale of win.DUSKLINE_LANG_CODES) {
    const dict = win.I18N[locale];
    assert.ok(dict, 'missing locale ' + locale);
    for (const key of ['weather.mode.horizon', 'weather.mode.mySky', 'weather.greeting.mySkyPrompt', 'weather.greeting.mySkyChecking', 'weather.greeting.mySkyForecast']) {
      assert.equal(typeof dict[key], 'string', locale + ' ' + key);
      assert.ok(dict[key].trim().length > (key.startsWith('weather.mode.') ? 0 : 3), 'empty greeting copy: ' + locale + ' ' + key);
      assert.notEqual(dict[key], key, 'raw greeting key: ' + locale + ' ' + key);
      if (locale !== 'en' && key !== 'weather.mode.horizon') {
        assert.notEqual(dict[key], english[key], 'English fallback: ' + locale + ' ' + key);
      }
    }
    for (const period of PERIODS) {
      const key = 'weather.greeting.' + period;
      assert.ok(dict[key] && dict[key].trim(), 'missing ' + locale + ' ' + key);
    }
    for (const condition of CONDITIONS) {
      const key = 'weather.greeting.condition.' + condition;
      assert.ok(dict[key] && dict[key].trim(), 'missing ' + locale + ' ' + key);
    }
    for (const key of contexts) {
      assert.ok(dict[key] && dict[key].trim(), 'missing ' + locale + ' ' + key);
      if (locale !== 'en') assert.notEqual(dict[key], english[key], 'English fallback: ' + locale + ' ' + key);
    }
    for (const placeholder of ['{condition}', '{high}', '{low}']) {
      assert.ok(dict['weather.context.tomorrow.outlook'].includes(placeholder), 'missing ' + locale + ' tomorrow placeholder ' + placeholder);
    }
    const pool = Array.from({ length: 15 }, (_, i) => dict['weather.greeting.horizon' + i]);
    assert.ok(pool.every(value => typeof value === 'string' && value.trim()), 'incomplete Horizon pool: ' + locale);
    assert.equal(new Set(pool).size, 15, 'duplicate Horizon greetings: ' + locale);
    assert.equal(typeof dict['weather.greeting.insightSeparator'], 'string', 'missing separator: ' + locale);
    if (locale === 'ja' || locale === 'zh' || locale === 'zh-TW') {
      assert.equal(dict['weather.greeting.insightSeparator'], '', 'CJK copy should not insert a Western space: ' + locale);
    }
  }
});

test('the Korean, Hebrew, Romanian, Hindi, and Thai forecast templates avoid known grammar artifacts', () => {
  const dict = loadI18n().I18N;
  assert.doesNotMatch(dict.ko['weather.greeting.mySkyForecast'], /은\(는\)/);
  assert.doesNotMatch(dict.he['weather.greeting.mySkyForecast'], /ב\{place\}/);
  assert.match(dict.ro['weather.greeting.mySkyForecast'], /\{place\}:/);
  assert.match(dict.ro['weather.greeting.condition.partlyCloudy'], /cer parțial înnorat/);
  assert.match(dict.hi['weather.greeting.condition.partlyCloudy'], /बादल छाए हैं/);
  assert.doesNotMatch(dict.th['weather.greeting.mySkyForecast'], /ที่\{place\}/);
});
