'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function feedback() {
  let now = 1000, timer = 0;
  const timers = new Map();
  const element = {hidden:true,dataset:{},setAttribute(key,value){this[key]=value;},style:{setProperty(){}}};
  const window = {setTimeout(fn,delay){timers.set(++timer,{fn,at:now+delay});return timer;},clearTimeout(id){timers.delete(id);},addEventListener(){}};
  const context = {window,Date:{now:()=>now},Map,Array,Promise,document:{getElementById:id=>id==='weatherModeLoading'?element:null}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('src/js/core/loading.js','utf8'),context);
  return {api:window.DusklineLoading,element,tick(ms){now+=ms;for(const [id,timer] of timers) if(timer.at<=now){timers.delete(id);timer.fn();}}};
}
test('shared loading feedback stays visible until the final overlapping operation finishes', () => {
  const f = feedback(); const first = f.api.begin('Search'); const second = f.api.begin('Forecast');
  assert.equal(f.element.hidden,false);
  first();first();f.tick(1000);
  assert.equal(f.element.hidden,false);
  second();f.tick(0);
  assert.equal(f.element.hidden,true);
});
test('a new operation cancels a pending hide and failed work releases its token', async () => {
  const f = feedback();const done = f.api.begin();done();f.tick(100);
  const next = f.api.begin();f.tick(500);
  assert.equal(f.element.hidden,false);
  next();f.tick(0);assert.equal(f.element.hidden,true);
  await assert.rejects(f.api.run(()=>Promise.reject(new Error('failure'))));
  f.tick(500);assert.equal(f.element.hidden,true);
});
test('primary weather palettes distinguish conditions and night while keeping small text readable', () => {
  const window = {DusklineWeather:{active:true,factories:{}}};
  const c = {window};vm.createContext(c);
  vm.runInContext(fs.readFileSync('src/js/features/weather/sky.js','utf8'),c);
  const api = window.DusklineWeather.factories.sky({});
  const luminance = rgb => rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const secondary = luminance([220,232,242]);
  const colors = new Set();
  for (const code of [0,2,3,45,61,71,95]) for (const night of [false,true]) {
    const palette = api.primaryPalette(code,night,12);
    colors.add(palette.top+palette.bottom);
    for (const stop of [palette.top,palette.bottom]) {
      const rgb = [1,3,5].map((index,i)=>parseInt(stop.slice(index,index+2),16)*.84+[8,20,38][i]*.16);
      assert.ok((secondary+.05)/(luminance(rgb)+.05)>=4.5,palette.name+' needs legible metadata');
    }
  }
  assert.equal(colors.size,14);
  assert.match(api.primaryPalette(null,false,12).name,/unknown/);
});
