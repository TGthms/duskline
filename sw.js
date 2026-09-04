const CACHE = 'duskline-shell-v19';
const SHELL = [
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './src/js/data/legal/packs/en.json',
  './manifest.webmanifest',
  './assets/duskline-icon.jpg',
  './assets/duskline-icon-192.png',
  './assets/duskline-icon-512.png',
  './assets/duskline-og.jpg',
  './assets/duskline-og.svg',
  './src/css/styles.css',
  './src/css/tokens.css',
  './src/css/icons.css',
  './src/css/chrome.css',
  './src/css/weather.css',
  './src/css/legal.css',
  './src/css/motion.css',
  './src/css/responsive.css',
  './src/css/motion-levels.css',
  './src/css/tools-miniapp.css',
  './src/css/weather-app.css',
  './src/css/duskline.css',
  './src/js/app.js',
  './src/js/data/i18n.js',
  './src/js/data/duskline-locales.js',
  './src/js/data/weather-about-i18n.js',
  './src/js/data/legal-i18n.js',
  './src/js/legal.js',
  './src/js/data/dest-weather-cities.js',
  './src/js/core/env.js',
  './src/js/core/wx-math.js',
  './src/js/core/runtime.js',
  './src/js/duskline-controls.js',
  './src/js/features/weather/ns.js',
  './src/js/features/weather/sky.js',
  './src/js/features/weather/charts.js',
  './src/js/features/weather/alerts.js',
  './src/js/features/weather/data.js',
  './src/js/features/weather/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => Promise.all(
      SHELL.map((url) => cache.add(url).catch(function () {}))
    )).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  let url;
  try { url = new URL(request.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  const dest = request.destination;
  const isNav = request.mode === 'navigate' || dest === 'document';

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok && (response.type === 'basic' || response.type === 'default')) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(function () {});
      }
      return response;
    } catch (err) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (isNav) {
        const path = url.pathname || '';
        if (/privacy\.html$/i.test(path)) {
          const privacy = await caches.match('./privacy.html');
          if (privacy) return privacy;
        }
        if (/terms\.html$/i.test(path)) {
          const terms = await caches.match('./terms.html');
          if (terms) return terms;
        }
        const shell = await caches.match('./index.html');
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
