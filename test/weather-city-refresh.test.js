'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function create(deps) {
  const window = {DusklineWeather:{active:true,factories:{}}};
  vm.runInNewContext(fs.readFileSync('src/js/features/weather/city-refresh.js','utf8'),{window,AbortController,Promise});
  return window.DusklineWeather.factories.cityRefresh({cityKey:c=>c.name,failed:()=>{},...deps});
}
test('refresh paints weather immediately and completes only after air and alerts settle',async()=>{
  let air, alerts; const paints=[];
  const pack={city:{name:'Paris'},weather:{},_airReady:new Promise(r=>{air=r;})};
  const api=create({load:async()=>pack,alerts:()=>new Promise(r=>{alerts=r;}),paint:p=>paints.push(p)});
  let done=false; const work=api.refresh(pack.city).then(()=>{done=true;});
  await new Promise(r=>setImmediate(r)); assert.equal(paints.length,1); assert.equal(done,false);
  alerts(); await new Promise(r=>setImmediate(r)); assert.equal(done,false);
  air(); await work; assert.equal(done,true); assert.equal(paints.length,2);
});
test('dismissal and newer work suppress stale failures and stale forecasts',async()=>{
  const city={name:'Paris'}; let fail, finish; const paints=[],errors=[];
  const api=create({load:()=>new Promise((r,j)=>{finish=r;fail=j;}),alerts:()=>{},paint:p=>paints.push(p),failed:()=>errors.push(true)});
  const first=api.refresh(city); api.cancel(city); fail(new Error('timeout')); await first;
  assert.equal(errors.length,0);
  const second=api.refresh(city); api.cancel(city); finish({city,weather:{}}); await second;
  assert.equal(paints.length,0);
});
