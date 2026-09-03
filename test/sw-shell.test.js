'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

test('service worker SHELL paths exist on disk', () => {
  const src = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const m = src.match(/const SHELL = \[([\s\S]*?)\];/);
  assert.ok(m, 'SHELL array missing');
  const urls = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  assert.ok(urls.includes('./privacy.html'));
  assert.ok(urls.includes('./terms.html'));
  assert.ok(urls.includes('./src/js/data/legal/packs/en.json'));
  for (const url of urls) {
    const rel = url.replace(/^\.\//, '');
    if (rel === '' || rel === './') {
      assert.ok(fs.existsSync(path.join(root, 'index.html')));
      continue;
    }
    assert.ok(fs.existsSync(path.join(root, rel)), 'missing SHELL file ' + url);
  }
});
