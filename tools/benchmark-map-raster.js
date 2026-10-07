'use strict';
// CPU kernel comparison only: excludes network, Canvas uploads, and WebGL.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const root=path.join(__dirname,'..');
const window={DusklineWeather:{active:true,factories:{}},addEventListener(){}};
const document={getElementById(){return null;},addEventListener(){}};
// Compile both checked-in kernels in the same native realm so VM global lookups
// do not distort the comparison. Neither factory opens a map or fetches data.
new Function('window','document',fs.readFileSync(path.join(root,'src/js/features/weather/map.js'),'utf8'))(window,document);
const reference={exports:{}};
new Function('module',fs.readFileSync(path.join(root,'test/fixtures/map-raster-reference.js'),'utf8'))(reference);
const baseline=reference.exports.renderPixels;
console.log(JSON.stringify({runtime:process.version,platform:process.platform,architecture:process.arch,
  scope:'CPU raster kernel only; excludes Canvas uploads and WebGL',iterations:12,warmup:3}));
const api=window.DusklineWeather.factories.map({}).helpers;
const grid={geometry:api.gridGeometry({getWest:()=>-20,getEast:()=>30,getNorth:()=>55,getSouth:()=>-35})};
grid.geometry.points.forEach((point,i)=>{
  point.hourly={};
  for(const [key,scale,offset] of [['temperature_2m',1.5,-12],['precipitation_probability',2.5,0],['wind_speed_10m',.6,0]]) {
    point.hourly[key]=Array.from({length:13},(_,hour)=>offset+i*scale+Math.sin(i+hour)*scale);
  }
});
function median(values) { return values.slice().sort((a,b)=>a-b)[Math.floor(values.length/2)]; }
for(const viewport of [390,1440]) {
  const {width,height}=api.renderDimensions(viewport);
  const before=new Uint8ClampedArray(width*height*4),after=new Uint8ClampedArray(before.length);
  for(const layer of ['temperature','precipitation','wind']) {
    const oldTimes=[],newTimes=[];let firstOptimized=0;
    for(let repeat=0;repeat<12;repeat++) {
      const hour=repeat%13;
      let start=performance.now();baseline(grid,layer,hour,width,height,before);const oldMs=performance.now()-start;
      start=performance.now();api.renderPixels(grid,layer,hour,width,height,after);const newMs=performance.now()-start;
      assert.equal(after.length,before.length);
      assert.ok(after.some(channel=>channel>0));
      if(repeat===0) firstOptimized=newMs;
      if(repeat>=3) {oldTimes.push(oldMs);newTimes.push(newMs);}
    }
    const oldMs=median(oldTimes),newMs=median(newTimes);
    console.log(JSON.stringify({viewport,layer,width,height,baselineMs:+oldMs.toFixed(2),
      optimizedMs:+newMs.toFixed(2),firstOptimizedMs:+firstOptimized.toFixed(2),
      reductionPercent:+((1-newMs/oldMs)*100).toFixed(1),interpolation:'local bilinear',pixelsIdentical:false}));
  }
}
