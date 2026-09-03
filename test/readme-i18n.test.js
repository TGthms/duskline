'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const i18nDir = path.join(root, 'docs/i18n');

function localeCodes() {
  const ctx = { window: {}, console };
  ctx.global = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/data/duskline-locales.js'), 'utf8'), ctx);
  return ctx.window.DUSKLINE_LANG_CODES;
}

test('root README and docs/i18n cover every picker language', () => {
  const codes = localeCodes();
  const rootReadme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  const index = fs.readFileSync(path.join(i18nDir, 'README.md'), 'utf8');
  assert.match(rootReadme, /docs\/i18n\/README\.md/);
  for (const code of codes) {
    if (code === 'en') {
      assert.match(index, /\[`README\.md`\]\(\.\.\/\.\.\/README\.md\)/);
      continue;
    }
    const file = path.join(i18nDir, 'README.' + code + '.md');
    assert.ok(fs.existsSync(file), 'missing docs/i18n/README.' + code + '.md');
    const body = fs.readFileSync(file, 'utf8');
    assert.match(rootReadme, new RegExp('docs/i18n/README\\.' + code.replace('.', '\\.') + '\\.md'));
    assert.match(index, new RegExp('README\\.' + code.replace('.', '\\.') + '\\.md'));
    assert.match(body, /\]\(\.\.\/\.\.\/README\.md\)/);
    assert.match(body, /\]\(\.\.\/\.\.\/privacy\.html\)/);
    assert.match(body, /\]\(\.\.\/\.\.\/terms\.html\)/);
    assert.match(body, /# Duskline/);
    if (code === 'ar' || code === 'he') {
      assert.match(body, /dir="rtl"/);
    }
  }
});
