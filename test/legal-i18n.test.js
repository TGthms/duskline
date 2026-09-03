'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const packsDir = path.join(root, 'src/js/data/legal/packs');

function localeCodes() {
  const ctx = { window: {}, console };
  ctx.global = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/data/duskline-locales.js'), 'utf8'), ctx);
  return ctx.window.DUSKLINE_LANG_CODES;
}

test('legal packs exist for every picker language and share English keys', () => {
  const codes = localeCodes();
  const en = JSON.parse(fs.readFileSync(path.join(packsDir, 'en.json'), 'utf8'));
  const keys = Object.keys(en);
  assert.ok(keys.length > 20);
  assert.equal(fs.readdirSync(packsDir).filter((n) => n.endsWith('.json')).length, codes.length);
  for (const code of codes) {
    const file = path.join(packsDir, code + '.json');
    assert.ok(fs.existsSync(file), 'missing pack ' + code);
    const row = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const key of keys) {
      assert.equal(typeof row[key], 'string', code + ' ' + key);
      assert.ok(row[key].trim().length > 0, 'empty ' + code + ' ' + key);
    }
    assert.deepEqual(Object.keys(row).sort(), keys.slice().sort());
  }
});
