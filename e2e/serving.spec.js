'use strict';
const {test,expect}=require('@playwright/test');
test('the static host serves the app document and favicon with correct media types',async({request},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium','HTTP responses are independent of browser engine.');
  const page=await request.get('/');expect(page.ok()).toBeTruthy();
  expect(page.headers()['content-type']).toContain('text/html');
  expect(await page.text()).toContain('id="weatherList"');
  const icon=await request.get('/favicon.ico');expect(icon.ok()).toBeTruthy();
  expect(icon.headers()['content-type']).toMatch(/image\/(x-icon|vnd\.microsoft\.icon|png)/);
  expect(Buffer.from(await icon.body()).subarray(0,4).toString('hex')).toBe('00000100');
});
