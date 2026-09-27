const CACHE = 'duskline-shell-v35';
const SHELL = [
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './src/js/data/legal/packs/en.json',
  './src/js/data/legal/packs/es.json',
  './src/js/data/legal/packs/fr.json',
  './src/js/data/legal/packs/de.json',
  './src/js/data/legal/packs/it.json',
  './src/js/data/legal/packs/pt-BR.json',
  './src/js/data/legal/packs/pt-PT.json',
  './src/js/data/legal/packs/nl.json',
  './src/js/data/legal/packs/da.json',
  './src/js/data/legal/packs/sv.json',
  './src/js/data/legal/packs/nb.json',
  './src/js/data/legal/packs/fi.json',
  './src/js/data/legal/packs/pl.json',
  './src/js/data/legal/packs/cs.json',
  './src/js/data/legal/packs/hu.json',
  './src/js/data/legal/packs/ro.json',
  './src/js/data/legal/packs/el.json',
  './src/js/data/legal/packs/tr.json',
  './src/js/data/legal/packs/ru.json',
  './src/js/data/legal/packs/uk.json',
  './src/js/data/legal/packs/ar.json',
  './src/js/data/legal/packs/he.json',
  './src/js/data/legal/packs/hi.json',
  './src/js/data/legal/packs/th.json',
  './src/js/data/legal/packs/vi.json',
  './src/js/data/legal/packs/id.json',
  './src/js/data/legal/packs/ja.json',
  './src/js/data/legal/packs/ko.json',
  './src/js/data/legal/packs/zh.json',
  './src/js/data/legal/packs/zh-TW.json',
  './manifest.webmanifest',
  './favicon.ico',
  './favicon.png',
  './assets/duskline-logo-96.jpg',
  './assets/duskline-icon-192.png',
  './assets/duskline-icon-512.png',
  './assets/duskline-icon-maskable.svg',
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
  './src/js/boot.js',
  './src/js/sw-register.js',
  './src/js/data/i18n.js',
  './src/js/data/duskline-locales.js',
  './src/js/data/weather-about-i18n.js',
  './src/js/data/weather-aqi-i18n.js',
  './src/js/data/weather-copy-i18n.js',
  './src/js/data/weather-greeting-pools-i18n.js',
  './src/js/data/weather-greeting-settings-i18n.js',
  './src/js/data/legal-i18n.js',
  './src/js/legal.js',
  './src/js/data/dest-weather-cities.js',
  './src/js/core/env.js',
  './src/js/core/wx-math.js',
  './src/js/core/runtime.js',
  './src/js/duskline-controls.js',
  './src/js/features/weather/ns.js',
  './src/js/features/weather/aqi-math.js',
  './src/js/features/weather/sky.js',
  './src/js/features/weather/charts.js',
  './src/js/features/weather/alerts.js',
  './src/js/features/weather/data.js',
  './src/js/features/weather/snapshots.js',
  './src/js/features/weather/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
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
  // Public-safety alerts are time-sensitive; never serve a cached alert payload
  // when an international source is offline or the device has no connection.
  if (url.pathname.startsWith('/api/')) return;

  const dest = request.destination;
  const isNav = request.mode === 'navigate' || dest === 'document';

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok && (response.type === 'basic' || response.type === 'default')) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(function () {}));
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
