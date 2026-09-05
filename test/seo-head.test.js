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
