'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const window={DusklineWeather:{}};
vm.runInNewContext(fs.readFileSync('src/js/features/weather/planning.js','utf8'),{window});
test('rain planning reports the first upcoming window and preserves missing accumulation',()=>{
 const now=Date.parse('2026-10-06T08:00:00Z'),time=Array.from({length:6},(_,i)=>new Date(now+i*3600000).toISOString());
 const hourly={time,precipitation_probability:[0,45,70,10,90,90],precipitation:[null,null,null,null,null,null]};
 const result=window.DusklineWeather.planning.rainWindow(hourly,Date.parse,now);
 assert.equal(result.start,now+3600000);assert.equal(result.end,now+3*3600000);
 assert.equal(result.peak,70);assert.equal(result.amount,null);
 hourly.precipitation=[0,.3,.8,0,1,1];
 assert.equal(window.DusklineWeather.planning.rainWindow(hourly,Date.parse,now).amount,1.1);
 assert.equal(window.DusklineWeather.planning.rainWindow({time,precipitation_probability:Array(6).fill(null)},Date.parse,now),null);
});
