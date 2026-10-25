'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(forecast) {
  const window = {DusklineWeather:{active:true,factories:{}},setTimeout,clearTimeout};
  const cache = new Map();
  vm.runInNewContext(fs.readFileSync('src/js/features/weather/data.js','utf8'), {
    window, AbortController,
    fetch: async url => url.startsWith('https://air.test')
      ? {ok:true,json:async()=>({})} : forecast(url)
  });
  const data = window.DusklineWeather.factories.data({
    cache, cityKey:city=>city.name, sameCity:(a,b)=>a.name===b.name,
    FORECAST:'https://forecast.test', AIR:'https://air.test', FORECAST_Q:'hourly=temperature_2m'
  });
  return {data,cache};
}
const city = {name:'Paris',lat:48.85,lon:2.35,country_code:'FR'};
function pack(temperature) {
  return {city,fetchedAt:Date.now(),light:true,needsEnrich:true,
    weather:{current:{temperature_2m:temperature},daily:{},hourly:{}}};
}
function response(temperature) {
  return {ok:true,json:async()=>({current:{temperature_2m:temperature},daily:{},
    hourly:{time:Array.from({length:24},(_,i)=>'2026-10-25T'+String(i).padStart(2,'0')+':00'),temperature_2m:Array(24).fill(temperature)}})};
}

test('a delayed detail enrichment cannot replace a newer full refresh', async () => {
  let release, started;
  const requested = new Promise(resolve=>{started=resolve;});
  let count=0;
  const {data,cache}=setup(async()=>{
    if (++count===1) { started(); return new Promise(resolve=>{release=resolve;}); }
    return response(30);
  });
  cache.set(city.name,pack(10));
  const older=data.loadCity(city,null,{enrich:true});
  await requested;
  const newer=await data.loadCity(city,null,{enrich:true,forceFetch:true});
  release(response(10));
  const settled=await older;
  assert.equal(cache.get(city.name).weather.current.temperature_2m,30);
  assert.equal(settled,newer);
});

test('a failed full refresh marks the retained cache record as saved weather', async () => {
  const {data,cache}=setup(async()=>{throw new Error('Provider offline');});
  const previous=pack(20);
  previous.light=false; previous.needsEnrich=false;
  cache.set(city.name,previous);
  const retained=await data.loadCity(city,null,{enrich:true,forceFetch:true});
  assert.equal(retained.stored,true);
  assert.equal(cache.get(city.name).stored,true);
  assert.equal(cache.get(city.name).fetchedAt,previous.fetchedAt);
  assert.equal(cache.get(city.name).weather.current.temperature_2m,20);
});
