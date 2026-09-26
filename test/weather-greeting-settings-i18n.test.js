'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const KEYS = [
  'weather.greetingLocationTitle',
  'weather.greetingLocationHelp',
  'weather.greetingLocationEmpty'
];

function loadI18n() {
  const ctx = { window: {}, console };
  ctx.global = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/data/duskline-locales.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/data/weather-greeting-settings-i18n.js'), 'utf8'), ctx);
  return ctx.window;
}

test('greeting location picker copy is localized in every picker language', () => {
  const win = loadI18n();
  assert.equal(win.DUSKLINE_LANG_CODES.length, 30);
  const english = win.I18N.en;
  for (const code of win.DUSKLINE_LANG_CODES) {
    const dict = win.I18N[code];
    assert.ok(dict, 'missing locale ' + code);
    for (const key of KEYS) {
      const text = dict[key];
      assert.equal(typeof text, 'string', code + ' ' + key);
      const minLength = /Settings|Title$/.test(key) ? 2 : 12;
      assert.ok(text.trim().length > minLength, 'empty or too short: ' + code + ' ' + key);
      assert.notEqual(text, key, 'raw translation key: ' + code + ' ' + key);
      if (code !== 'en') assert.notEqual(text, english[key], 'English fallback: ' + code + ' ' + key);
    }
  }
});

test('search and action feedback is localized in every picker language', () => {
  const win = loadI18n();
  const keys = ['weather.notice.added', 'weather.notice.removed',
    'weather.notice.searching', 'weather.notice.copyManually'];
  for (const code of win.DUSKLINE_LANG_CODES) {
    for (const key of keys) {
      const text = win.I18N[code] && win.I18N[code][key];
      assert.equal(typeof text, 'string', code + ' ' + key);
      assert.ok(text.trim().length >= 4, code + ' ' + key);
      if (code !== 'en') assert.notEqual(text, win.I18N.en[key], code + ' English fallback: ' + key);
    }
  }
});
