'use strict';
async function visualWeather(page,variant='clear') {
 const night=variant==='rain',now=Date.parse(night?'2026-10-06T20:00:00Z':'2026-10-06T12:00:00Z');
 await page.clock.setFixedTime(now);
 await page.route(/fonts\.googleapis\.com|fonts\.gstatic\.com/,r=>r.fulfill({contentType:'text/css',body:''}));
 await page.route('**/api/international-alerts?**',r=>r.fulfill({json:{availability:'available',alerts:[],truncated:false}}));
 await page.route('https://api.weather.gov/**',r=>r.fulfill({status:404,body:'No NWS fixture'}));
 await page.route('https://tiles.openfreemap.org/**',r=>r.fulfill({json:{version:8,sources:{},layers:[{id:'background',type:'background',paint:{'background-color':'#102137'}}]}}));
 const times=Array.from({length:264},(_,i)=>new Date(Date.parse('2026-10-05T00:00Z')+i*3600000).toISOString().slice(0,16));
 const days=Array.from({length:11},(_,i)=>new Date(Date.parse('2026-10-05T12:00Z')+i*86400000).toISOString().slice(0,10));
 function weather() {return {timezone:'Europe/Paris',current:{time:'2026-10-06T'+(night?'22':'14')+':00',temperature_2m:night?14:22,apparent_temperature:night?12:21,weather_code:night?61:1,is_day:night?0:1,relative_humidity_2m:65,wind_speed_10m:3,wind_direction_10m:210,wind_gusts_10m:7,surface_pressure:1013,visibility:18000,precipitation:night?.2:0},hourly:{time:times,temperature_2m:times.map((_,i)=>16+5*Math.sin(i*Math.PI/12)),apparent_temperature:times.map((_,i)=>15+5*Math.sin(i*Math.PI/12)),weather_code:times.map(()=>night?61:1),precipitation_probability:times.map(()=>night?70:0),precipitation:times.map(()=>night?.2:0),wind_speed_10m:times.map(()=>3),wind_gusts_10m:times.map(()=>7),wind_direction_10m:times.map(()=>210),surface_pressure:times.map(()=>1013),relative_humidity_2m:times.map(()=>65),uv_index:times.map(()=>night?0:3)},daily:{time:days,weather_code:days.map(()=>night?61:1),temperature_2m_max:days.map((_,i)=>23+i%3),temperature_2m_min:days.map((_,i)=>13+i%3),precipitation_probability_max:days.map(()=>night?70:0),precipitation_sum:days.map(()=>night?2.4:0),sunrise:days.map(d=>d+'T07:30'),sunset:days.map(d=>d+'T18:30'),uv_index_max:days.map(()=>4)}};}
 await page.route('https://api.open-meteo.com/**',r=>{const count=(new URL(r.request().url()).searchParams.get('latitude')||'').split(',').length;const values=Array.from({length:count},weather);return r.fulfill({json:count>1?values:values[0]});});
 await page.route('https://air-quality-api.open-meteo.com/**',r=>{const count=(new URL(r.request().url()).searchParams.get('latitude')||'').split(',').length;const values=Array.from({length:count},()=>({current:{us_aqi:42,european_aqi:30,pm2_5:8,pm10:12},hourly:{time:times,us_aqi:times.map(()=>42),european_aqi:times.map(()=>30)}}));return r.fulfill({json:count>1?values:values[0]});});
}
module.exports={visualWeather};
