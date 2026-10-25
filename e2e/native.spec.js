'use strict';
const {test,expect}=require('@playwright/test');
const {visualWeather}=require('./fixtures/visual-weather');

async function personalSky(page) {
  await page.addInitScript(()=>{
    localStorage.setItem('duskline-motion','reduced');
    localStorage.setItem('duskline-weather-mode','my-sky');
    localStorage.setItem('duskline-weather-greeting-city',JSON.stringify({name:'Paris',lat:48.85,lon:2.35,country:'France',country_code:'FR',tz:'Europe/Paris'}));
  });
  await visualWeather(page);
}

test('modal surfaces isolate the page and restore nested contexts @core',async({page})=>{
  await personalSky(page);await page.goto('/');
  const main=page.locator('#main'),header=page.locator('#navbar');
  const isolated=async value=>{
    await expect(main).toHaveJSProperty('inert',value);
    await expect(header).toHaveJSProperty('inert',value);
  };
  await page.locator('#weatherUnitsBtn').click();await isolated(true);
  await expect(page.locator('#weatherSheetPanel')).toBeFocused();
  await page.locator('#weatherSearch').evaluate(el=>el.focus());
  await expect(page.locator('#weatherSearch')).not.toBeFocused();
  await page.keyboard.press('Tab');
  await expect.poll(()=>page.evaluate(()=>!!document.activeElement.closest('#weatherSheet'))).toBe(true);
  await page.locator('#weatherSheetClose').click();await isolated(false);
  await page.locator('[data-home-open]').click();await isolated(true);
  await page.locator('#weatherModules [data-sheet="feels"]').click();
  await expect(page.locator('#weatherDetail')).toHaveJSProperty('inert',true);
  await page.locator('#weatherSheetClose').click();
  await expect(page.locator('#weatherDetail')).toHaveJSProperty('inert',false);await isolated(true);
  await page.locator('#weatherDetailBack').click();await isolated(false);
  await page.locator('#weatherMapOpen').click();await isolated(true);
  await page.locator('#weatherMapClose').click();await isolated(false);
  await expect(page.locator('#weatherMapOpen')).toBeFocused();
});

test('My Sky exposes the active warning and opens its expanded detail @core',async({page,context})=>{
  await personalSky(page);
  await page.route('**/api/international-alerts?**',route=>route.fulfill({json:{availability:'available',alerts:[{
    id:'wind-paris',event:'Strong Wind Warning',severity:'Severe',description:'Secure loose outdoor objects.',
    providerName:'IFRC Alert Hub',sent:'2026-10-06T11:00:00Z',ends:'2026-10-06T13:00:00Z',
    areas:[{polygons:[{valuePolygon:{type:'Polygon',coordinates:[[[2,48],[3,48],[3,49],[2,49],[2,48]]]}}]}]
  }],truncated:false}}));
  await page.goto('/');
  const warning=page.locator('[data-primary-alert]');
  await expect(warning).toContainText('Strong Wind Warning');await expect(warning).toHaveAttribute('data-severity','severe');
  await warning.click();
  await expect(page.locator('.weather-alert.is-open')).toContainText('Secure loose outdoor objects.');
  await page.locator('#weatherDetailBack').click();
  await context.setOffline(true);await page.evaluate(()=>window.dispatchEvent(new Event('offline')));
  await expect(warning).toHaveCount(0);await expect(page.locator('#weatherHome')).toContainText('Connect to check public alerts');
});

test('primary alert checks can retry without interrupting the forecast',async({page})=>{
  await personalSky(page);let available=false;
  await page.route('**/api/international-alerts?**',route=>available
    ? route.fulfill({json:{availability:'available',alerts:[],truncated:false}})
    : route.fulfill({status:503,json:{error:'upstream_unavailable'}}));
  await page.goto('/');
  await expect(page.locator('#weatherHome .weather-home-temperature')).toBeVisible();
  const retry=page.locator('[data-primary-alert-retry]');await expect(retry).toBeVisible();
  available=true;await retry.click();await expect(retry).toHaveCount(0);
  await expect(page.locator('[data-primary-alert]')).toHaveCount(0);
  await expect(page.locator('#weatherHome .weather-home-temperature')).toBeVisible();
});
