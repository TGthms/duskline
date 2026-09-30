'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window:{DusklineWeather:{}}, setTimeout, clearTimeout, DOMException};
vm.createContext(context);
for (const name of ['search-places', 'network-policy']) vm.runInContext(fs.readFileSync('src/js/features/weather/'+name+'.js','utf8'),context);
const W = context.window.DusklineWeather;

test('geocoder coalesces equivalent places while keeping the most informative label and distinct cities', () => {
  const sparse = {name:' Paris ',country_code:'FR',latitude:48.8566,longitude:2.3522};
  const rich = {...sparse,name:'Paris',admin1:'Île-de-France',timezone:'Europe/Paris'};
  const other = {...rich, country_code:'US'};
  assert.deepEqual(Array.from(W.searchPlaces.deduplicate([sparse,rich,other])),[rich,other]);
  assert.equal(W.searchPlaces.deduplicate([{name:'Unknown',latitude:null,longitude:null}]).length,0);
});
test('primary selection requires a valid current reading; missing, partial and error packs fail', () => {
  for (const pack of [null,{}, {weather:{}}, {weather:{current:{temperature_2m:null}}}, {error:true,weather:{current:{temperature_2m:20}}}]) assert.equal(W.searchPlaces.validForecast(pack),false);
  assert.equal(W.searchPlaces.validForecast({weather:{current:{temperature_2m:0}}}),true);
});
test('provider retry respects seconds and date headers and bounds exponential jitter', () => {
  const p = W.networkPolicy;
  assert.equal(p.retryDelay('30',0,1000,0),30000);
  const now = Date.parse('2026-09-29T12:00:00Z');
  assert.equal(p.retryDelay('Tue, 29 Sep 2026 12:01:00 GMT',0,now,0),60000);
  assert.equal(p.retryDelay('bad',1,now,0),975);
  assert.equal(p.retryDelay(null,100,now,1),10000);
});
test('provider backoff cancels immediately when user work is superseded', async () => {
  const controller = new AbortController();
  const pending = W.networkPolicy.wait(60000, controller.signal);
  controller.abort();
  await assert.rejects(pending,{name:'AbortError'});
});
test('literal runtime translation keys exist in every source locale before English fallback is merged', () => {
  const c = {window:{}};vm.createContext(c);
  for (const name of ['i18n','duskline-locales','weather-about-i18n','weather-aqi-i18n','weather-copy-i18n','weather-greeting-pools-i18n','weather-greeting-settings-i18n','weather-stability-i18n']) vm.runInContext(fs.readFileSync('src/js/data/'+name+'.js','utf8'),c);
  const keys = new Set();
  for (const name of ['app','charts','map','alerts','product']) {
    for (const match of fs.readFileSync('src/js/features/weather/'+name+'.js','utf8').matchAll(/\bt\(\s*['"]([^'"]+)['"]\s*[,)]/g)) keys.add(match[1]);
  }
  for (const match of fs.readFileSync('src/js/sw-register.js','utf8').matchAll(/\btKey\(\s*['"]([^'"]+)['"]\s*[,)]/g)) keys.add(match[1]);
  for (const [code] of c.window.DUSKLINE_LOCALES) for (const key of keys) assert.ok(c.window.I18N[code][key], code+' is missing '+key);
});
