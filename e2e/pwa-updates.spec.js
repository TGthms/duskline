'use strict';
const {test, expect} = require('@playwright/test');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

test.describe('redirecting host worker upgrade', () => {
  test.use({serviceWorkers:'allow'});
  let server, origin, current, unavailable;
  test.beforeEach(async () => {
    current = false; unavailable = false;
    server = http.createServer((request, response) => {
      if (unavailable) return request.socket.destroy();
      const pathname = new URL(request.url, 'http://localhost').pathname;
      response.setHeader('Cache-Control', 'no-store');
      if (/\/(index|terms|privacy|licenses)\.html$/.test(pathname)) {
        response.writeHead(308, {Location: pathname === '/index.html' ? '/' : pathname.replace('.html', '')});
        return response.end();
      }
      if (pathname === '/' || /\/(terms|privacy|licenses)$/.test(pathname)) {
        response.setHeader('Content-Type','text/html');
        return response.end('<!doctype html><link rel="stylesheet" href="/src/css/duskline.css"><link rel="stylesheet" href="/src/css/weather-product.css"><h1>duskline test shell</h1><div id="weatherToast"></div><script src="/src/js/sw-register.js"></script>');
      }
      if (pathname === '/sw.js') {
        response.setHeader('Content-Type','text/javascript');
        return response.end(current ? fs.readFileSync('sw.js') : `
          const CACHE='duskline-shell-v51';
          self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/', '/index.html']))));
          self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
          self.addEventListener('fetch',e=>e.respondWith((async()=>{
            const cache=await caches.open(CACHE);
            const navigation=e.request.mode==='navigate'||e.request.destination==='document';
            const path=new URL(e.request.url).pathname;
            const cached=await cache.match(navigation&&path.endsWith('/')?'/index.html':e.request,{ignoreSearch:true});
            return cached||fetch(e.request);
          })()));
        `);
      }
      const file = path.join(process.cwd(), pathname);
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {response.writeHead(404);return response.end();}
      response.setHeader('Content-Type', pathname.endsWith('.js') ? 'text/javascript' : pathname.endsWith('.json') ? 'application/json' : pathname.endsWith('.css') ? 'text/css' : 'application/octet-stream');
      response.end(fs.readFileSync(file));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1',resolve));
    origin = 'http://127.0.0.1:' + server.address().port;
  });
  test.afterEach(async () => {await new Promise(resolve => server.close(resolve));});

  test('Update activates a coherent redirect-free shell and reloads online and offline', async ({page, context}) => {
    await page.goto(origin);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    current = true;
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    const update = page.getByRole('button', {name:'Update',exact:true});
    await expect(update).toBeVisible({timeout:20000});
    await page.evaluate(() => {document.getElementById('weatherToast').textContent = 'Weather refreshed';});
    await expect(update).toBeVisible();
    const toastBox = await page.locator('#weatherUpdateToast').boundingBox();
    expect(toastBox.height).toBeLessThan(160);
    expect(toastBox.y).toBeLessThan(200);
    await Promise.all([page.waitForEvent('load'), update.click()]);
    await expect(page.getByRole('heading')).toHaveText('duskline test shell');
    const cacheState = await page.evaluate(async () => {
      const cache = await caches.open('duskline-shell-v60');
      const document = await cache.match('./index.html');
      return {redirected:document.redirected, keys:await caches.keys()};
    });
    expect(cacheState.redirected).toBe(false);
    expect(cacheState.keys).not.toContain('duskline-shell-v51');
    const localeResult = await page.evaluate(async () => {
      for (const code of ['fr','es','de','it','nl','da','sv','nb','fi','pl']) {
        const response = await fetch('/src/js/data/weather-packs/'+code+'.json');
        if (!response.ok) throw new Error('Locale missing: '+code);
      }
      const cache = await caches.open('duskline-locales-v60');
      return (await cache.keys()).map(request=>request.url);
    });
    expect(localeResult).toHaveLength(8);
    expect(localeResult.some(url=>url.endsWith('/fr.json'))).toBe(false);
    expect(localeResult.some(url=>url.endsWith('/pl.json'))).toBe(true);
    await page.goto(origin + '/?city=Paris');
    await expect(page.getByRole('heading')).toBeVisible();
    unavailable = true; // Real host outage; WebKit setOffline bypasses workers on reload.
    await page.reload({waitUntil:'domcontentloaded'});
    expect(await page.evaluate(async () => (await fetch('/src/js/data/weather-packs/pl.json')).ok)).toBe(true);
    await expect(page.getByRole('heading')).toBeVisible();
    await page.goto(origin + '/terms');
    await expect(page.getByRole('heading')).toBeVisible();
    unavailable = false;
  });
});
