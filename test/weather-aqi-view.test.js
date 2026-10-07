'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function create(overrides={}) {
 const window={DusklineWeather:{active:true,factories:{}}};
 const context={window,Date,Intl,Promise,Map};
 for(const name of ['aqi-math','aqi']) vm.runInNewContext(fs.readFileSync('src/js/features/weather/'+name+'.js','utf8'),context);
 return window.DusklineWeather.factories.aqi({t:(_key,fallback)=>fallback,escapeHtml:String,localeTag:()=> 'en-US',aqiScale:()=> 'us',cityKey:c=>c.name,cache:new Map(),stampToMs:Date.parse,formatClock:t=>t.slice(11,16),AIR:'https://air-quality-api.open-meteo.com/v1/air-quality',refreshMs:600000,...overrides});
}
test('AQI outlook omits missing readings and retains a real zero',()=>{
 const times=Array.from({length:4},(_,i)=>new Date(Date.now()+(i+1)*3600000).toISOString());
 const html=create().aqiOutlookHtml({hourly:{time:times,us_aqi:[null,'',0,85]}},'us','UTC',false);
 assert.equal((html.match(/class="wx-aqi-outlook-item"/g)||[]).length,2);
 assert.equal((html.match(/class="wx-aqi-outlook-value"[^>]*>0<\/span>/g)||[]).length,1);
 assert.match(html,/>85<\/span>/);
});
test('a late detailed AQI response patches no older weather over a refreshed city',async()=>{
 const city={name:'Paris'},cache=new Map();let complete;
 const old={city,fetchedAt:Date.now()-1000,weather:{current:{temperature_2m:20}},air:{current:{us_aqi:40}}};
 cache.set(city.name,old);
 const api=create({cache,fetchJson:()=>new Promise(r=>{complete=r;})});
 const pending=api.loadAqiDetail(old);
 const latest={city,fetchedAt:Date.now()+1000,weather:{current:{temperature_2m:30}},air:{current:{us_aqi:60}}};
 cache.set(city.name,latest);complete({current:{us_aqi:10}});await pending;
 assert.equal(cache.get(city.name),latest);assert.equal(latest.air.current.us_aqi,60);
});

test('unavailable AQI has no marker that could imply a healthy zero',()=>{
 const api=create();assert.equal(api.aqiBarHtml(null,true,'us'),'');assert.equal(api.aqiBarHtml('',true,'us'),'');assert.match(api.aqiBarHtml(0,true,'us'),/wx-aqi-dot/);
});
