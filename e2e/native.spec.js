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
  await expect.poll(()=>page.evaluate(()=>!!document.activeElement.closest('#weatherSheetPanel'))).toBe(true);
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
  await page.locator('#weatherMapOpen').click();await expect(page.locator('#weatherMap')).toHaveJSProperty('inert',false);
  await page.locator('#weatherMapClose').click();await isolated(false);
});

test('sheet focus waits for its visible surface without leaving the page active',async({page})=>{
  await personalSky(page);await page.goto('/');
  await page.addStyleTag({content:'#weatherSheetPanel{visibility:hidden;transition:visibility .01s linear .18s !important} #weatherSheet.open #weatherSheetPanel{visibility:visible}'});
  await page.locator('#weatherUnitsBtn').click();
  await expect(page.locator('#main')).toHaveJSProperty('inert',true);
  await expect.poll(()=>page.evaluate(()=>!!document.activeElement.closest('#weatherSheetPanel'))).toBe(true);
  await page.locator('#weatherSheetClose').click();
  await expect(page.locator('#main')).toHaveJSProperty('inert',false);
  await expect(page.locator('#weatherUnitsBtn')).toBeFocused();
});

test('My Sky exposes the active warning and opens its expanded detail @core',async({page,context},testInfo)=>{
  await personalSky(page);
  await page.route('**/api/international-alerts?**',route=>route.fulfill({json:{availability:'available',alerts:[{
    id:'wind-paris',event:'Strong Wind Warning',severity:'Severe',description:'Secure loose outdoor objects.',
    providerName:'IFRC Alert Hub',sent:'2026-10-06T11:00:00Z',ends:'2026-10-06T13:00:00Z',
    areas:[{polygons:[{valuePolygon:{type:'Polygon',coordinates:[[[2,48],[3,48],[3,49],[2,49],[2,48]]]}}]}]
  }],truncated:false}}));
  await page.goto('/');
  const warning=page.locator('[data-primary-alert]');
  await expect(warning).toContainText('Strong Wind Warning');await expect(warning).toHaveAttribute('data-severity','severe');
  await page.screenshot({path:testInfo.outputPath('primary-warning.png')});
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
  await expect(page.locator('#weatherModeLoading')).toBeHidden();
  const retry=page.locator('[data-primary-alert-retry]');await expect(retry).toBeVisible();
  available=true;await retry.click();await expect(retry).toHaveCount(0);
  await expect(page.locator('[data-primary-alert]')).toHaveCount(0);
  await expect(page.locator('#weatherHome .weather-home-temperature')).toBeVisible();
});

test('phone navigation stays reachable and Settings owns the language picker @core',async({page},testInfo)=>{
  await page.setViewportSize({width:430,height:932});await personalSky(page);await page.goto('/');
  await expect(page.locator('#weatherHome .weather-home-temperature')).toBeVisible();
  const nav=page.locator('#weatherMobileNav');await expect(nav).toBeVisible();
  await page.screenshot({path:testInfo.outputPath('phone-home.png'),fullPage:true});
  expect((await page.locator('#weatherHome').boundingBox()).y).toBeLessThan(280);
  await expect(page.locator('#dusklineLanguage')).toBeHidden();
  await page.locator('#weatherUnitsBtn').click();await expect(nav).toBeHidden();
  await page.locator('[data-shell-language]').selectOption('he');await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await page.locator('#weatherSheetClose').click();await expect(nav).toBeVisible();
  await page.setViewportSize({width:320,height:568});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('#weatherUnitsBtn').click();await page.locator('[data-shell-language]').selectOption('en');
  await page.locator('#weatherSheetClose').click();
  await page.setViewportSize({width:1440,height:1000});await expect(nav).toBeHidden();
  await expect(page.locator('#dusklineLanguage')).toBeVisible();
  await expect(page.locator('.weather-toolbar-actions #weatherMapOpen')).toBeVisible();
  await page.locator('#weatherUnitsBtn').click();await expect(page.locator('[data-shell-language]')).toHaveValue('en');
});

test('deferred updates stay available in Settings and activation can retry @core',async({page})=>{
  await personalSky(page);
  await page.clock.install();
  await page.addInitScript(()=>{
    window.__activations=0;
    const registration={active:{postMessage(){}},waiting:{postMessage(){window.__activations++;}},addEventListener(){},update:async()=>{}};
    Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{register:async()=>registration,ready:Promise.resolve(registration),controller:{},addEventListener(){}}});
  });
  await page.goto('/');
  const notice=page.locator('#weatherUpdateToast');await expect(notice).toBeVisible();
  await notice.getByRole('button',{name:'Later',exact:true}).click();await expect(notice).toBeHidden();
  expect(await page.evaluate(()=>window.__activations)).toBe(0);
  await page.locator('#weatherUnitsBtn').click();
  const update=page.locator('[data-app-update]');await expect(update).toHaveText('Update');
  await update.click();await expect(update).toBeDisabled();expect(await page.evaluate(()=>window.__activations)).toBe(1);
  await page.clock.fastForward(10001);await expect(page.locator('.weather-settings-updates')).toContainText('The update did not finish');
  await update.click();expect(await page.evaluate(()=>window.__activations)).toBe(2);
});

test('compact Settings keeps disclosures, focus and unit choices usable on a small phone',async({page})=>{
  await page.setViewportSize({width:320,height:568});await personalSky(page);await page.goto('/');
  await page.locator('#weatherUnitsBtn').click();
  const units=page.locator('.weather-settings-units'),summary=units.locator('summary');
  await expect(units).not.toHaveAttribute('open');
  await expect(page.locator('#wxTempUnits')).toBeHidden();
  await expect(page.locator('#weatherSheetPanel')).toBeFocused();
  await summary.scrollIntoViewIfNeeded();
  await summary.focus();await expect(summary).toBeFocused();await page.keyboard.press('Enter');
  await expect(units).toHaveAttribute('open');
  const celsius=page.locator('#wxTempUnits [data-unit="c"]');await celsius.click();
  await expect(summary).toContainText('°C');
  await page.locator('[data-shell-language]').focus();
  await page.locator('[data-shell-language]').selectOption('de');
  await expect(page.locator('html')).toHaveAttribute('data-lang','de');
  await expect(units).toHaveAttribute('open');
  await expect(page.locator('[data-shell-language]')).toBeFocused();
  await expect(celsius).toHaveAttribute('aria-checked','true');
  for(const id of ['wxTempUnits','wxDistUnits','wxWindUnits2','wxPrecipUnits2','wxPressUnits2']) {
    const row=page.locator('#'+id);
    expect(await row.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
    expect((await row.locator('button').first().boundingBox()).height).toBeGreaterThanOrEqual(44);
  }
  await summary.click();await expect(page.locator('#wxTempUnits')).toBeHidden();
  await page.locator('#weatherSheetClose').click();await expect(page.locator('#weatherUnitsBtn')).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('map gesture guidance can be dismissed and stays dismissed @core',async({page})=>{
  await personalSky(page);await page.goto('/');
  await page.locator('#weatherMapOpen').click();
  const hint=page.locator('#weatherMapHint');await expect(hint).toBeVisible();
  await expect(hint).toContainText(/map|place/);
  await page.locator('#weatherMapHintClose').click();await expect(hint).toBeHidden();
  await page.locator('#weatherMapClose').click();await page.locator('#weatherMapOpen').click();await expect(hint).toBeHidden();
});

for (const locales of [['fr','de','ja'],['ar','he']]) test('representative languages keep Settings and phone layout usable: '+locales.join(', ')+' @core',async({page})=>{
  await page.setViewportSize({width:390,height:844});await personalSky(page);await page.goto('/');
  for(const code of locales) {
    await page.locator('#weatherUnitsBtn').click();await page.locator('[data-shell-language]').selectOption(code);
    await expect(page.locator('html')).toHaveAttribute('data-lang',code);
    await expect(page.locator('html')).toHaveAttribute('dir',['ar','he'].includes(code)?'rtl':'ltr');
    await expect(page.locator('#weatherSheetTitle')).not.toHaveText('Settings');
    await page.locator('#weatherSheetClose').click();
    await expect(page.locator('#weatherMobileNav')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('#weatherHome [data-home-hour]').first().click();
    await expect(page.locator('#weatherSheetBody .weather-chart-wrap').first()).toBeVisible();
    expect((await page.locator('#weatherSheetPanel').boundingBox()).width).toBeLessThanOrEqual(390);
    await page.locator('#weatherSheetClose').click();await page.locator('#weatherDetailBack').click();
  }
});

test('manual update checks distinguish failure from a current installation',async({page})=>{
  await personalSky(page);
  await page.addInitScript(()=>{
    window.__updateFailure=true;
    const registration={active:{postMessage(){}},waiting:null,addEventListener(){},update:async()=>{
      if(window.__updateFailure)throw Error('offline');
      registration.installing=window.__installFailure?{state:'redundant'}:null;
    }};
    Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{register:async()=>registration,ready:Promise.resolve(registration),controller:{},addEventListener(){}}});
  });
  await page.goto('/');await page.locator('#weatherUnitsBtn').click();
  const updates=page.locator('.weather-settings-updates'),action=page.locator('[data-app-update]');
  await expect(updates).not.toContainText('is up to date');await action.click();
  await expect(updates).toContainText('Could not check for updates');
  await page.evaluate(()=>{window.__updateFailure=false;window.__installFailure=true;});await action.click();
  await expect(updates).toContainText('Could not check for updates');
  await page.evaluate(()=>{window.__installFailure=false;});await action.click();
  await expect(updates).toContainText('duskline is up to date');
});
