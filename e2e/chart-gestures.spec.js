'use strict';
const {test,expect}=require('@playwright/test');
const {visualWeather}=require('./fixtures/visual-weather');

test.describe('phone forecast chart gestures',()=>{
 test.use({hasTouch:true,viewport:{width:390,height:844}});
 async function openChart(page,future=false) {
  await page.addInitScript(()=>localStorage.setItem('duskline-motion','off'));
  await visualWeather(page,'clear');
  await page.goto('/?lat=48.85&lon=2.35&name=Paris&country_code=FR&tz=Europe%2FParis');
  await page.locator('#weatherModules [data-day-date]').nth(future?1:0).click();
  const chart=page.locator('#weatherSheetBody .weather-chart-wrap').first();
  await chart.locator('svg').scrollIntoViewIfNeeded();
  return chart;
 }
 async function pointer(svg,type,x,y) {
  await svg.dispatchEvent(type,{pointerType:'touch',pointerId:31,isPrimary:true,clientX:x,clientY:y,bubbles:true,cancelable:true});
 }
 for(const future of [false,true]) test('a brief hold tracks the finger and release restores '+(future?'the future-day range':'today’s current hour'),async({page})=>{
  const chart=await openChart(page,future),svg=chart.locator('svg');
  const initial=await chart.locator('[data-readout]').textContent(),sub=await chart.locator('[data-sub]').textContent();
  const box=await svg.boundingBox(),x=box.x+box.width*.2,y=box.y+box.height*.5;
  await pointer(svg,'pointerdown',x,y);
  await expect.poll(()=>chart.getAttribute('aria-valuenow')).not.toBe(await chart.getAttribute('data-now-idx'));
  const held=await chart.getAttribute('aria-valuenow');
  await pointer(svg,'pointermove',box.x+box.width*.9,y);
  await expect(chart).not.toHaveAttribute('aria-valuenow',held);
  await pointer(svg,'pointerup',box.x+box.width*.9,y);
  await expect(chart.locator('[data-readout]')).toHaveText(initial);
  await expect(chart.locator('[data-sub]')).toHaveText(sub);
  await expect(chart.locator('[data-guide]')).toHaveCSS('display',future?'none':'inline');
 });
 test('an explicitly opened hour resets to the current hour after touch exploration',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('duskline-motion','off'));
  await visualWeather(page,'clear');await page.goto('/?lat=48.85&lon=2.35&name=Paris&country_code=FR&tz=Europe%2FParis');
  await page.locator('#weatherModules [data-hour-index]').nth(3).click();
  const chart=page.locator('#weatherSheetBody .weather-chart-wrap').first(),svg=chart.locator('svg');
  await svg.scrollIntoViewIfNeeded();const box=await svg.boundingBox();
  const selected=await chart.getAttribute('aria-valuenow'),current=await chart.getAttribute('data-rest-idx');
  expect(selected).not.toBe(current);
  await pointer(svg,'pointerdown',box.x+box.width*.2,box.y+box.height*.5);
  await expect(chart).not.toHaveAttribute('aria-valuenow',selected);
  await pointer(svg,'pointerup',box.x+box.width*.2,box.y+box.height*.5);
  await expect(chart).toHaveAttribute('aria-valuenow',current);
 });
 test('quick taps, vertical swipes and cancelled holds leave no chart selection',async({page})=>{
  const chart=await openChart(page),svg=chart.locator('svg'),box=await svg.boundingBox();
  const initial=await chart.getAttribute('aria-valuenow'),x=box.x+box.width*.2,y=box.y+box.height*.5;
  await pointer(svg,'pointerdown',x,y);await pointer(svg,'pointerup',x,y);
  await pointer(svg,'pointerdown',x,y);await pointer(svg,'pointermove',x,y+30);
  await pointer(svg,'pointerup',x,y+30);
  await page.waitForTimeout(220);
  await expect(chart).toHaveAttribute('aria-valuenow',initial);
  await pointer(svg,'pointerdown',x,y);
  await expect(chart).not.toHaveAttribute('aria-valuenow',initial);
  await pointer(svg,'pointercancel',x,y);
  await expect(chart).toHaveAttribute('aria-valuenow',initial);
 });
 test('native touch scrolling yields to a held chart without retaining the cursor',async({page,context,browserName})=>{
  test.skip(browserName!=='chromium','Native drag injection uses the Chromium input protocol; pointer lifecycle runs across engines.');
  const chart=await openChart(page),svg=chart.locator('svg'),box=await svg.boundingBox();
  const initial=await chart.getAttribute('aria-valuenow'),x=box.x+box.width*.2,y=box.y+box.height*.5;
  const input=await context.newCDPSession(page);
  const touch=(type,x,y)=>input.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
  const scroll=()=>page.locator('#weatherSheetBody').evaluate(el=>el.scrollTop);
  const before=await scroll();
  await touch('touchStart',x,y);await expect(chart).not.toHaveAttribute('aria-valuenow',initial);
  await touch('touchMove',x+80,y-35);
  await expect(chart).not.toHaveAttribute('aria-valuenow',initial);
  expect(await scroll()).toBe(before);
  await touch('touchEnd');await expect(chart).toHaveAttribute('aria-valuenow',initial);
  await touch('touchStart',x,y);
  for(let step=1;step<=5;step++) await touch('touchMove',x,y-step*15);
  await touch('touchEnd');await expect.poll(scroll).toBeGreaterThan(before);
  await expect(chart).toHaveAttribute('aria-valuenow',initial);
 });
});
