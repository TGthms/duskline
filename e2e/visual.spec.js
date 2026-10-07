'use strict';
const {test,expect}=require('@playwright/test');
const {visualWeather}=require('./fixtures/visual-weather');
const sizes=[{width:320,height:568},{width:430,height:932},{width:768,height:1024},{width:1440,height:1000},{width:844,height:390}];
test.describe('visual baselines @visual',()=>{
 test.use({locale:'en-US',timezoneId:'America/Los_Angeles'});
 test.beforeEach(async ({page,browserName})=>{
  test.skip(process.platform!=='darwin' || browserName!=='chromium','Pinned macOS Chromium visual environment; cross-engine behavior is covered by the functional suites.');
  await page.addInitScript(()=>{localStorage.setItem('duskline-motion','reduced');localStorage.setItem('duskline-lang','en');Object.defineProperty(window.crypto,'getRandomValues',{configurable:true,value:array=>{array.fill(12345);return array;}});});
 });
 for(const variant of ['clear','rain']) for(const mode of ['horizon','my-sky']) for(const size of sizes) {
  test(mode+' '+variant+' '+size.width+'×'+size.height,async ({page})=>{
   await page.setViewportSize(size);await page.emulateMedia({colorScheme:variant==='clear'?'light':'dark',reducedMotion:'reduce'});
   await page.addInitScript(mode=>{
    localStorage.setItem('duskline-weather-mode',mode);
    if(mode==='my-sky') localStorage.setItem('duskline-weather-greeting-city',JSON.stringify({name:'Paris',lat:48.85,lon:2.35,country:'France',country_code:'FR',tz:'Europe/Paris'}));
   },mode);
   await visualWeather(page,variant);await page.goto('/');
   await expect(page.locator('#weatherModeLoading')).toBeHidden();
   await page.evaluate(()=>document.fonts.ready);
   if(mode==='my-sky') await expect(page.locator('#weatherHome .weather-daily-row')).toHaveCount(5);
   else await expect(page.locator('#weatherList .weather-row-hl').first()).toContainText('H:');
   await expect(page).toHaveScreenshot(mode+'-'+variant+'-'+size.width+'x'+size.height+'.png',{animations:'disabled',caret:'hide',maxDiffPixelRatio:.005});
  });
 }
 test('future-day sheet and RTL layout',async ({page})=>{
  await page.setViewportSize({width:430,height:932});await visualWeather(page,'clear');await page.goto('/?lat=48.85&lon=2.35&name=Paris&country=France&country_code=FR&tz=Europe%2FParis');
  await page.locator('[data-day-date]').nth(1).click();
  await expect(page).toHaveScreenshot('future-day-sheet.png',{animations:'disabled',maxDiffPixelRatio:.02}); // Sheet is text/chart-dense; .02 absorbs cross-macOS font and canvas rasterization variance while still catching structural regressions.
  await page.locator('#weatherSheetBody').evaluate(el=>el.scrollTop=el.scrollHeight);
  await expect(page).toHaveScreenshot('future-day-precipitation.png',{animations:'disabled',maxDiffPixelRatio:.005});
  await page.locator('#weatherSheetClose').click();await page.locator('#weatherDetailBack').click();
  await page.locator('#dusklineLanguage').selectOption('he');await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page).toHaveScreenshot('hebrew-phone.png',{animations:'disabled',maxDiffPixelRatio:.01});
 });
 test('landscape map',async ({page})=>{
  await page.setViewportSize({width:844,height:390});await visualWeather(page,'clear');await page.goto('/');await page.locator('#weatherMapOpen').click();
  await expect(page.locator('#weatherMap')).toHaveAttribute('data-map-state',/ready|fallback/,{timeout:15000});
  await expect(page.locator('#weatherMapStatus')).toBeHidden();
  await expect(page).toHaveScreenshot('landscape-map.png',{animations:'disabled',maxDiffPixelRatio:.01});
 });
});
