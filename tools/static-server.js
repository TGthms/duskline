'use strict';
/**
 * Local static server for Duskline.
 *
 * Serves the repository root and applies the same `_headers` file Cloudflare Pages uses in
 * production. That keeps `npm run serve` faithful to the deployed site — in particular the
 * Content-Security-Policy — so a policy that would break the app fails locally and in CI
 * instead of only after a deploy.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const port = Number(process.argv[2] || 4173);
const HEADERS_FILE = path.join(root, '_headers');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2'
};

/**
 * Minimal reader for the Cloudflare Pages `_headers` format:
 *   /path
 *     Header-Name: value
 * Blank lines and # comments are ignored.
 */
function readHeaderRules() {
  let src = '';
  try { src = fs.readFileSync(HEADERS_FILE, 'utf8'); } catch (e) { return []; }
  const rules = [];
  let current = null;
  for (const raw of src.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (/^\s/.test(raw)) {
      const m = raw.trim().match(/^([A-Za-z0-9-]+):\s*(.*)$/);
      if (m && current) current.headers.push([m[1], m[2]]);
    } else {
      current = { pattern: raw.trim(), headers: [] };
      rules.push(current);
    }
  }
  return rules;
}

function headersFor(urlPath) {
  const out = {};
  for (const rule of readHeaderRules()) {
    const pat = rule.pattern;
    const matches = pat === '/*'
      || pat === urlPath
      || (pat.endsWith('/*') && urlPath.startsWith(pat.slice(0, -1)));
    if (!matches) continue;
    for (const [name, value] of rule.headers) out[name] = value;
  }
  return out;
}

const server = http.createServer((req, res) => {
  const requested = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end('Not found'); }
    const headers = Object.assign(
      { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' },
      headersFor(requested)
    );
    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(port, '127.0.0.1', () => {
  const count = readHeaderRules().reduce((n, r) => n + r.headers.length, 0);
  console.log(`Duskline server: http://127.0.0.1:${port}${count ? ` (${count} headers from _headers)` : ''}`);
});
