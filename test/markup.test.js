'use strict';
/**
 * Guards the invariants the security and delivery work depends on:
 *
 *  - no page may ship an inline <script>, because `_headers` serves a CSP with a bare
 *    `script-src 'self'` and no hashes. Adding an inline script silently breaks the app.
 *  - every provider host the app fetches from must be reachable under connect-src, or the
 *    request fails only in production where the policy is enforced.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const PAGES = ['index.html', 'privacy.html', 'terms.html'];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

test('no page ships an inline script', () => {
  for (const page of PAGES) {
    const html = read(page);
    // <script> with no attributes is inline; <script src=...> and <script type="..."> are not
    const inline = html.match(/<script>/g) || [];
    assert.equal(inline.length, 0, `${page} contains an inline <script> — add it to a file or add a CSP hash`);
    assert.match(html, /src\/js\/boot\.js/, `${page} must load the shared boot script`);
  }
  // the pre-paint bootstrap must stay ahead of the stylesheet so data-theme is set first
  for (const page of PAGES) {
    const html = read(page);
    const boot = html.indexOf('src/js/boot.js');
    const css = html.indexOf('src/css/styles.css');
    assert.ok(boot > -1 && css > -1 && boot < css, `${page}: boot.js must precede the stylesheet`);
  }
  assert.match(read('index.html'), /src\/js\/sw-register\.js/, 'index.html must register the service worker from a file');
});

test('_headers declares the policy the app is written against', () => {
  const headers = read('_headers');
  assert.match(headers, /Content-Security-Policy:/);
  assert.match(headers, /script-src 'self'/);
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /object-src 'none'/);
  assert.match(headers, /base-uri 'none'/);
  assert.match(headers, /X-Content-Type-Options: nosniff/);
  assert.match(headers, /Referrer-Policy: strict-origin-when-cross-origin/);
  assert.match(headers, /Permissions-Policy: geolocation=\(self\)/);
  assert.match(headers, /Strict-Transport-Security: max-age=31536000/);
});

test('every host the app fetches from is allowed by connect-src', () => {
  const policy = read('_headers').match(/Content-Security-Policy:\s*([^\n]+)/)[1];
  const connectSrc = (policy.match(/connect-src ([^;]+)/) || [])[1] || '';

  // The files that issue network requests. Deriving the hosts from source means a new
  // provider fails this test until the policy is updated with it.
  const netFiles = [
    'src/js/features/weather/data.js',
    'src/js/features/weather/app.js'
  ];
  const hosts = new Set();
  for (const rel of netFiles) {
    for (const m of read(rel).matchAll(/https:\/\/([a-z0-9.-]+)/gi)) hosts.add(m[1].toLowerCase());
  }
  assert.ok(hosts.size >= 5, `expected to find several provider hosts, found ${[...hosts].join(', ')}`);

  const skipped = [];
  for (const host of hosts) {
    if (host.startsWith('fonts.')) { skipped.push(host); continue; }
    assert.ok(connectSrc.includes(host), `connect-src is missing ${host} — the request would be blocked in production`);
  }
  assert.deepEqual(skipped.sort(), ['fonts.googleapis.com', 'fonts.gstatic.com'].filter((h) => hosts.has(h)).sort());
});

test('the service worker precaches only what the app needs offline', () => {
  const sw = read('sw.js');
  const shell = sw.match(/const SHELL = \[([\s\S]*?)\];/)[1];
  // Social preview images are for crawlers, not offline use; 100 KB of precache for nothing.
  assert.ok(!/duskline-og\.jpg/.test(shell), 'the OG share image must not be precached');
  assert.match(shell, /duskline-icon\.jpg/, 'the in-page logo is needed offline');
  assert.match(shell, /src\/js\/boot\.js/, 'boot.js must be available offline or first paint breaks');
  assert.match(sw, /const CACHE = 'duskline-shell-v\d+';/);
});

test('the theme axis follows the OS, with no leftover appearance/style preference', () => {
  const RESOLVERS = ['src/js/core/runtime.js', 'src/js/boot.js'];

  // The Appearance × Style pair came from the multi-tool site this app was extracted from.
  // Reading either key again would resurrect the `elegant` / `default` themes, which have no
  // UI and no other way to be selected — the two themes a user can actually see are `minimal`
  // and `glass`, and both must stay resolvable.
  for (const rel of RESOLVERS) {
    const src = read(rel);
    assert.ok(!/duskline-appearance|duskline-style/.test(src),
      `${rel} still reads the removed appearance/style preference`);
    assert.ok(!/['"]elegant['"]/.test(src), `${rel} still names the unreachable \`elegant\` theme in code`);
    assert.ok(!/['"]default['"]/.test(src), `${rel} still names the unreachable \`default\` theme in code`);
    assert.match(src, /['"]minimal['"]/, `${rel} must resolve to the light theme`);
    assert.match(src, /['"]glass['"]/, `${rel} must resolve to the dark theme`);
  }

  // A quoted 'elegant' anywhere means some path can still select a theme with no UI.
  const jsFiles = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.js')) jsFiles.push(p);
    }
  })(path.join(root, 'src', 'js'));
  // Guard the walk itself: a broken traversal would make the check above vacuous.
  for (const expected of ['core/runtime.js', 'boot.js', 'features/weather/sky.js']) {
    assert.ok(jsFiles.some((f) => f.endsWith(expected)), `the scan missed src/js/${expected}`);
  }
  for (const file of jsFiles) {
    assert.ok(!/['"]elegant['"]/.test(fs.readFileSync(file, 'utf8')),
      `${path.relative(root, file)} names the unreachable \`elegant\` theme`);
  }
});

test('both themes the resolver can emit are defined in the CSS', () => {
  const tokens = read('src/css/tokens.css');
  for (const theme of ['minimal', 'glass']) {
    assert.ok(tokens.includes(`[data-theme="${theme}"]`),
      `tokens.css does not define the \`${theme}\` theme the resolver emits`);
  }
});
