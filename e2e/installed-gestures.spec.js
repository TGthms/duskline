'use strict';
const {test,expect}=require('@playwright/test');
const {visualWeather}=require('./fixtures/visual-weather');

test.describe('installed window gestures',()=>{
 test.use({hasTouch:true,viewport:{width:390,height:844}});
 for(const installed of [false,true]) test((installed?'installed':'browser')+' windows apply their page gesture policy',async({page})=>{
  if(installed) await page.addInitScript(()=>Object.defineProperty(navigator,'standalone',{value:true,configurable:true}));
  await visualWeather(page);await page.goto('/');
  expect(await page.evaluate(()=>document.documentElement.hasAttribute('data-installed-app'))).toBe(installed);
  const handled=await page.evaluate(()=>{
   const event=new Event('gesturestart',{bubbles:true,cancelable:true});document.body.dispatchEvent(event);return event.defaultPrevented;
  });
  expect(handled).toBe(installed);
  await page.locator('#weatherUnitsBtn').click();
  await expect(page.locator('#weatherSheetBody')).toHaveCSS('touch-action',installed?'pan-x pan-y':'auto');
 });
 test('native installed page pinches leave scrolling and map zoom usable',async({browser,browserName})=>{
  test.skip(browserName!=='chromium','Native multi-touch injection uses the Chromium input protocol.');
  const context=await browser.newContext({isMobile:true,hasTouch:true,viewport:{width:390,height:844},serviceWorkers:'block'});
  try {
  async function pinch(page,input,x,y) {
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const points=radius=>[{id:1,x:x-radius,y},{id:2,x:x+radius,y}];
    await input.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(25)});
    for(let step=1;step<=12;step++) {
      await input.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(25+step*8)});
      await page.evaluate(()=>new Promise(requestAnimationFrame));
    }
    await input.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  const browserPage=await context.newPage();await visualWeather(browserPage);await browserPage.goto('http://127.0.0.1:4173/');
  await expect(browserPage.locator('#weatherList .weather-row-hl').first()).toContainText('H:');
  const browserInput=await context.newCDPSession(browserPage);
  await pinch(browserPage,browserInput,190,280);
  await expect.poll(()=>browserPage.evaluate(()=>visualViewport.scale)).toBeGreaterThan(1.4);await browserPage.close();
  const page=await context.newPage();
  await page.addInitScript(()=>Object.defineProperty(navigator,'standalone',{value:true}));
  await visualWeather(page);await page.route('**/src/js/features/weather/map.js',route=>{
   const source=require('node:fs').readFileSync('src/js/features/weather/map.js','utf8').replace('map = new library.Map(','map = window.__gestureMap = new library.Map(');
   return route.fulfill({contentType:'text/javascript',body:source});
  });
  await page.goto('http://127.0.0.1:4173/');const input=await context.newCDPSession(page);
  await expect(page.locator('#weatherList .weather-row-hl').first()).toContainText('H:');
  await pinch(page,input,190,280);expect(await page.evaluate(()=>visualViewport.scale)).toBe(1);
  await page.locator('#weatherUnitsBtn').click();await pinch(page,input,190,440);expect(await page.evaluate(()=>visualViewport.scale)).toBe(1);
  await page.locator('.weather-settings-units summary').click();
  const surface=page.locator('#weatherSheetBody'),box=await surface.boundingBox();
  const y=Math.min(box.y+box.height-30,740),x=190;
  await input.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
  for(let n=1;n<=5;n++) await input.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-n*20,id:1}]});
  await input.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect.poll(()=>surface.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await page.locator('#weatherSheetClose').click();await page.locator('#weatherMapOpen').click();
  await expect(page.locator('#weatherMap')).toHaveAttribute('data-map-state','ready');
  const zoom=await page.evaluate(()=>window.__gestureMap.getZoom()),mapBox=await page.locator('#weatherMapCanvas').boundingBox();
  await pinch(page,input,mapBox.x+mapBox.width/2,mapBox.y+mapBox.height/2);
  await expect.poll(()=>page.evaluate(()=>window.__gestureMap.getZoom())).toBeGreaterThan(zoom);
  expect(await page.evaluate(()=>visualViewport.scale)).toBe(1);
  } finally {await context.close();}
 });
});
