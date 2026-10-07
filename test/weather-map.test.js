'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const root = path.join(__dirname, '..');

function loadMapFactory() {
  const window = {
    DusklineWeather: { active: true, factories: {} },
    addEventListener() {}
  };
  const document = { getElementById() { return null; } };
  const context = { window, document, URLSearchParams, fetch, AbortController, Map, Math, Date, Intl, setTimeout, clearTimeout };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/features/weather/map.js'), 'utf8'), context);
  return window.DusklineWeather.factories.map({});
}

test('weather map samples an aligned geographic grid with a bounded request budget', () => {
 const grid=loadMapFactory().helpers.gridGeometry({getWest:()=>-20,getEast:()=>30,getNorth:()=>55,getSouth:()=>-35});
 assert.ok(grid.points.length<=64);
 assert.ok(grid.west<=-20 && grid.east>=30 && grid.north>=55 && grid.south<=-35);
 assert.equal(grid.points[0].x,0);assert.equal(grid.points[0].y,0);
 assert.equal(grid.points.at(-1).x,1);assert.equal(grid.points.at(-1).y,1);
 assert.ok(grid.points.every(p=>Math.abs(p.latitude)<=85 && p.longitude>=-180 && p.longitude<=180));
});

test('weather map normalizes grid sample longitudes across the date line', () => {
  const map = loadMapFactory();
  const grid = map.helpers.gridGeometry({ getWest: () => 170, getEast: () => -170, getNorth: () => 20, getSouth: () => -20 });
  assert.equal(grid.east, 190);
  assert.equal(grid.points[0].longitude, 170);
  assert.equal(grid.points[grid.cols-1].longitude, -170);
  assert.ok(grid.points.every((point) => Math.abs(point.longitude) >= 170));
});

test('weather map layers use distinct weather palettes and keep zero rain transparent', () => {
  const map = loadMapFactory();
  const noRain = Array.from(map.helpers.palette('precipitation', 0));
  const heavyRain = Array.from(map.helpers.palette('precipitation', 100));
  const cold = Array.from(map.helpers.palette('temperature', -15));
  const hot = Array.from(map.helpers.palette('temperature', 38));
  assert.equal(noRain[3], 0);
  assert.ok(heavyRain[3] > 0);
  assert.notDeepEqual(cold, hot);
  assert.deepEqual(Array.from(map.helpers.palette('wind', 0)), [0, 0, 0, 0]);
});

test('map raster work is resolution-capped on phones and forecast timestamps expose both zones', () => {
  const map = loadMapFactory();
  assert.deepEqual(JSON.parse(JSON.stringify(map.helpers.renderDimensions(390))), { width: 98, height: 49 });
  assert.deepEqual(JSON.parse(JSON.stringify(map.helpers.renderDimensions(1440))), { width: 180, height: 90 });
  const iso = '2026-09-28T08:00';
  assert.match(map.helpers.formatTime(iso), /UTC/);
  assert.match(map.helpers.formatLocalTime(iso), /\d{1,2}:\d{2}/);
});

test('map legend tick marks follow the actual palette thresholds', () => {
  const map = loadMapFactory();
  const temperature = map.helpers.legendConfig('temperature');
  const precipitation = map.helpers.legendConfig('precipitation');
  const wind = map.helpers.legendConfig('wind');
  assert.deepEqual(Array.from(temperature.ticks), [-20, -5, 8, 18, 28, 40]);
  assert.deepEqual(Array.from(precipitation.ticks), [0, 25, 50, 75, 100]);
  assert.deepEqual(Array.from(wind.ticks), [0, 6, 12, 18, 26]);
  assert.equal(precipitation.transparentUntil, 8);
  assert.equal(wind.transparentUntil, 2);
  assert.match(map.helpers.gradientCss(temperature), /25\.00%/);
  assert.match(map.helpers.gradientCss(precipitation), /transparent 8\.00%,#6dcbff 8\.00%/);
  assert.match(map.helpers.gradientCss(wind), /transparent 7\.69%,#49b0d9 7\.69%/);
});

test('local-cell interpolation reconstructs a linear field and preserves missing cells',()=>{
 const api=loadMapFactory().helpers;
 const geometry=api.gridGeometry({getWest:()=>170,getEast:()=>-170,getNorth:()=>60,getSouth:()=>-35});
 geometry.points.forEach(p=>{p.hourly={temperature_2m:[10+p.x*12+p.y*8]};});
 const width=25,height=17,data=new Uint8ClampedArray(width*height*4);
 api.renderPixels({geometry},'temperature',0,width,height,data);
 for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
   const expected=api.palette('temperature',10+x/(width-1)*12+y/(height-1)*8);
   for(let c=0;c<4;c++) assert.ok(Math.abs(data[(y*width+x)*4+c]-expected[c])<=1);
 }
 geometry.points[0].hourly.temperature_2m[0]=null;
 api.renderPixels({geometry},'temperature',0,width,height,data);
 assert.equal(data[3],0);assert.ok(data.at(-1)>0,'missing local data must not erase unrelated cells');
});

test('nearby pans reuse geographic sample positions and AQI uses its dedicated source',()=>{
 const api=loadMapFactory().helpers;
 const first=api.gridGeometry({getWest:()=>10.1,getEast:()=>12.1,getNorth:()=>40.1,getSouth:()=>38.1});
 const second=api.gridGeometry({getWest:()=>10.2,getEast:()=>12.2,getNorth:()=>40.2,getSouth:()=>38.2});
 assert.equal(first.key,second.key);
 const request=new URL(api.makeGridUrl({...first,kind:'aqi'}));
 assert.equal(request.hostname,'air-quality-api.open-meteo.com');
 assert.equal(request.searchParams.get('hourly'),'us_aqi');
 assert.equal(request.searchParams.get('domains'),'cams_global');
 assert.deepEqual(Array.from(api.palette('aqi',50)),[70,190,122,170]);
 assert.deepEqual(Array.from(api.palette('aqi',51)),[241,211,68,185]);
});

test('map raster reads each forecast sample once per frame and clears stale pixels when data is missing', () => {
  const api=loadMapFactory().helpers;
  const geometry=api.gridGeometry({getWest:()=>-20,getEast:()=>30,getNorth:()=>55,getSouth:()=>-35});
  let reads=0;
  geometry.points.forEach(point=>{
    point.hourly={};
    Object.defineProperty(point.hourly,'temperature_2m',{get(){reads++;return [15,null];}});
  });
  const target=new Uint8ClampedArray(98*49*4);
  api.renderPixels({geometry},'temperature',0,98,49,target);
  assert.equal(reads,geometry.points.length);
  assert.ok(target.some(value=>value>0));
  api.renderPixels({geometry},'temperature',1,98,49,target);
  assert.equal(reads,geometry.points.length*2);
  assert.ok(target.every(value=>value===0));
});

test('Lucide glyphs and complete third-party license notices are local', () => {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const lucideLicense = fs.readFileSync(path.join(root, 'assets/icons/LUCIDE-LICENSE.txt'), 'utf8');
  const mapLicense = fs.readFileSync(path.join(root, 'assets/vendor/maplibre-gl/LICENSE.txt'), 'utf8');
  const licensesPage = fs.readFileSync(path.join(root, 'licenses.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'src/js/features/weather/app.js'), 'utf8');
  assert.match(index, /symbol id="lucide-cloud-sun"/);
  assert.match(index, /symbol id="lucide-alert-circle"/);
  assert.match(index, /symbol id="duskline-alert-triangle"/);
  assert.match(index, /symbol id="duskline-cloud-rain-heavy"/);
  assert.match(app, /glyph\.indexOf\('duskline-'\) === 0/);
  assert.match(app, /aqi: 'wind'/);
  assert.match(app, /'cloud\.heavyrain': 'duskline-cloud-rain-heavy'/);
  assert.match(app, /weatherIcon\('duskline-alert-triangle'/);
  assert.doesNotMatch(index, /assets\/icons\/lucide-sprite\.svg#/);
  assert.match(lucideLicense, /ISC License/);
  assert.match(lucideLicense, /The MIT License \(MIT\)/);
  assert.match(mapLicense, /Copyright \(c\) 2023, MapLibre contributors/);
  assert.match(licensesPage, /LUCIDE-LICENSE\.txt/);
  assert.match(licensesPage, /vendor\/maplibre-gl\/LICENSE\.txt/);
  assert.match(licensesPage, /original weather alert and rain glyphs/);
});

test('weather map has responsive footer, loading, and long-press action surfaces', () => {
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'src/css/weather-map.css'), 'utf8');
  const map = fs.readFileSync(path.join(root, 'src/js/features/weather/map.js'), 'utf8');
  assert.match(index, /id="weatherMapContextMenu" role="menu"/);
  assert.match(index, /id="weatherMapContextView"/);
  assert.match(index, /id="weatherMapContextAdd"/);
  assert.match(css, /grid-template-areas: "legend legend" "time time" "credit credit"/);
  assert.match(css, /max-width: 520px/);
  assert.match(css, /weather-map-status\[data-loading="true"\]::before/);
  assert.match(map, /setTimeout\(function \(\) \{[\s\S]{0,180}showContextMenu\(x, y\)/);
  assert.match(map, /function updateTimeOutput\(grid\)/);
  assert.match(map, /var local = formatLocalTime\(iso\)/);
  assert.match(map, /prefix \+ formatTime\(iso\)/);
});

test('map actions, local-time labels, and day ranges are translated in every locale', () => {
  const context = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'src/js/data/duskline-locales.js'), 'utf8'), context);
  const win = context.window;
  const keys = [
    'weather.mapPlaceActions', 'weather.mapViewHere', 'weather.mapViewPlace',
    'weather.mapAddPin', 'weather.mapAddPlace', 'weather.mapAlreadySaved',
    'weather.mapPinnedPlace', 'weather.mapForecastHour', 'weather.dailyRange'
  ];
  for (const code of win.DUSKLINE_LANG_CODES) {
    for (const key of keys) {
      const value = win.I18N[code] && win.I18N[code][key];
      assert.equal(typeof value, 'string', code + ' ' + key);
      assert.ok(value.trim().length > 3, code + ' ' + key);
      assert.notEqual(value, key, code + ' raw key ' + key);
      if (code !== 'en') assert.notEqual(value, win.I18N.en[key], code + ' English fallback: ' + key);
    }
  }
});
