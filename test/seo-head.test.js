'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const ORIGIN = 'https://dusklineweather.pages.dev';

function jsonLdFrom(html) {
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(m, 'JSON-LD script missing');
  return JSON.parse(m[1]);
}

test('homepage WebSite JSON-LD names duskline at the live origin', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, new RegExp('rel="canonical" href="' + ORIGIN + '/"'));
  assert.match(html, /property="og:site_name" content="duskline"/);
  assert.doesNotMatch(html, /https:\/\/duskline\.pages\.dev/);

  const data = jsonLdFrom(html);
  const nodes = Array.isArray(data['@graph']) ? data['@graph'] : [data];
  const website = nodes.find((n) => n['@type'] === 'WebSite');
  assert.ok(website, 'WebSite node missing');
  assert.equal(website.name, 'duskline');
  assert.equal(website.url, ORIGIN + '/');
  assert.ok(Array.isArray(website.alternateName));
  assert.ok(website.alternateName.includes('duskline weather'));
  assert.ok(website.alternateName.includes('dusklineweather.pages.dev'));

  const app = nodes.find((n) => n['@type'] === 'WebApplication');
  assert.ok(app, 'WebApplication node missing');
  assert.equal(app.name, 'duskline');
  assert.equal(app.url, ORIGIN + '/');
});

test('search favicon is a square image at a stable root URL', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /rel="icon" href="\/favicon\.ico"/);
  assert.match(html, /rel="icon" type="image\/png" sizes="192x192" href="\/favicon\.png"/);
  assert.doesNotMatch(html, /rel="icon"[^>]+duskline-icon\.jpg/);

  const ico = fs.readFileSync(path.join(root, 'favicon.ico'));
  assert.equal(ico.subarray(0, 4).toString('hex'), '00000100', 'favicon.ico is not an ICO file');
  assert.ok(ico.length > 1000);

  const png = fs.readFileSync(path.join(root, 'favicon.png'));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert.equal(width, height);
  assert.ok(width >= 48, 'Google recommends a favicon larger than 48px');
});

test('sitemap, robots, and legal canonicals use the live origin', () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
  const privacy = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
  const terms = fs.readFileSync(path.join(root, 'terms.html'), 'utf8');
  assert.match(sitemap, new RegExp('<loc>' + ORIGIN + '/</loc>'));
  assert.match(sitemap, new RegExp('<loc>' + ORIGIN + '/privacy.html</loc>'));
  assert.match(sitemap, new RegExp('<loc>' + ORIGIN + '/terms.html</loc>'));
  assert.doesNotMatch(sitemap, /duskline\.pages\.dev/);
  assert.match(robots, new RegExp('Sitemap: ' + ORIGIN + '/sitemap.xml'));
  assert.match(privacy, new RegExp('rel="canonical" href="' + ORIGIN + '/privacy.html"'));
  assert.match(terms, new RegExp('rel="canonical" href="' + ORIGIN + '/terms.html"'));
});
