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
const { pathToFileURL } = require('node:url');

const root = process.cwd();
const port = Number(process.argv[2] || 4173);
const HEADERS_FILE = path.join(root, '_headers');
const INTERNATIONAL_ALERTS_FUNCTION = path.join(root, 'functions', 'api', 'international-alerts.js');
let internationalAlertsFunction;
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
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

const localCapEntries = new Map();
const localCapCache = {
  async match(request) {
    const entry = localCapEntries.get(request.url);
    if (!entry || entry.until <= Date.now()) { localCapEntries.delete(request.url); return undefined; }
    return entry.response.clone();
  },
  async put(request, response) {
    const ttl = Number((response.headers.get('cache-control') || '').match(/s-maxage=(\d+)/)?.[1] || 0);
    if (!ttl) return;
    localCapEntries.set(request.url, {until:Date.now()+ttl*1000,response:response.clone()});
    while (localCapEntries.size > 100) localCapEntries.delete(localCapEntries.keys().next().value);
  }
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', 'http://' + (req.headers.host || '127.0.0.1'));
  const requested = decodeURIComponent(requestUrl.pathname);
  if (requested === '/api/international-alerts' || requested === '/api/international-alerts/') {
    try {
      internationalAlertsFunction = internationalAlertsFunction || import(pathToFileURL(INTERNATIONAL_ALERTS_FUNCTION).href);
      const handler = await internationalAlertsFunction;
      const pending = [];
      const request = new Request(requestUrl.href, { method: req.method || 'GET' });
      const response = await handler.onRequest({
        request: request,
        env: {CAP_CACHE:localCapCache},
        waitUntil: function (promise) { pending.push(promise); }
      });
      response.headers.forEach(function (value, name) { res.setHeader(name, value); });
      res.writeHead(response.status);
      res.end(await response.text());
      Promise.allSettled(pending);
    } catch (error) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('{"error":"upstream_unavailable"}');
    }
    return;
  }
  if (requested.startsWith('/functions/')) { res.writeHead(404); return res.end('Not found'); }
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
