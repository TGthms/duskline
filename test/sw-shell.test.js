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
  assert.ok(urls.includes('./src/js/data/weather-aqi-i18n.js'));
  assert.ok(urls.includes('./src/js/data/weather-copy-i18n.js'));
  assert.ok(urls.includes('./src/js/data/weather-greeting-pools-i18n.js'));
  assert.ok(urls.includes('./src/js/data/weather-greeting-settings-i18n.js'));
  for (const url of urls) {
    const rel = url.replace(/^\.\//, '');
    if (rel === '' || rel === './') {
      assert.ok(fs.existsSync(path.join(root, 'index.html')));
      continue;
    }
    assert.ok(fs.existsSync(path.join(root, rel)), 'missing SHELL file ' + url);
  }
});

test('page scripts and imported stylesheets are included in the offline shell', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const src = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const contributorNotes = fs.readFileSync(path.join(root, 'src/js/features/weather/README.md'), 'utf8');
  const m = src.match(/const SHELL = \[([\s\S]*?)\];/);
  assert.ok(m, 'SHELL array missing');
  const shell = new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1].replace(/^\.\//, '')));
  const assertCached = (asset, source) => {
    const clean = asset.split(/[?#]/)[0].replace(/^\.\//, '').replace(/^\//, '');
    assert.ok(shell.has(clean), `${source} references ${clean}, missing from service worker SHELL`);
  };
  const styleFiles = [];

  const weatherScripts = [];
  for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const source = match[1];
    if (!/^(?:https?:)?\/\//i.test(source)) {
      assertCached(source, 'index.html script');
      if (source.startsWith('src/js/features/weather/')) weatherScripts.push(path.basename(source));
    }
  }
  const documentedWeatherScripts = [...contributorNotes.matchAll(/^\| `([^`]+\.js)` \|/gm)]
    .map((match) => match[1]);
  assert.deepEqual(weatherScripts, documentedWeatherScripts,
    'weather script order in index.html must match the contributor module table');
  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const source = match[1];
    if (!/^(?:https?:)?\/\//i.test(source)) assertCached(source, 'index.html image');
  }
  for (const match of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    if (!/^(?:https?:)?\/\//i.test(href) && !href.startsWith('#')) assertCached(href, 'index.html link');
  }
  for (const match of html.matchAll(/<link\b(?=[^>]*\brel=["'][^"']*stylesheet[^"']*["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    if (/^(?:https?:)?\/\//i.test(href)) continue;
    assertCached(href, 'index.html stylesheet');
    styleFiles.push(path.join(root, href.replace(/^\.\//, '')));
  }

  const visited = new Set();
  while (styleFiles.length) {
    const file = styleFiles.pop();
    if (visited.has(file)) continue;
    visited.add(file);
    const css = fs.readFileSync(file, 'utf8');
    for (const match of css.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']\s*\)?\s*;/gi)) {
      const href = match[1];
      if (/^(?:https?:)?\/\//i.test(href)) continue;
      const imported = path.resolve(path.dirname(file), href);
      const relative = path.relative(root, imported).split(path.sep).join('/');
      assertCached(relative, path.relative(root, file));
      styleFiles.push(imported);
    }
  }
});
