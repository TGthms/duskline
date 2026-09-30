const CACHE = 'duskline-shell-v51';
const SHELL = [
  './',
  './index.html',
  './privacy.html',
  './terms.html',
  './licenses.html',
  './LICENSE',
  './assets/icons/LUCIDE-LICENSE.txt',
  './assets/vendor/maplibre-gl/LICENSE.txt',
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
  './assets/world-land.svg',
  './assets/WORLD-MAP-LICENSE.txt',
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
  './src/css/weather-map.css',
  './src/css/duskline.css',
  './src/css/weather-product.css',
  './src/js/app.js',
  './src/js/boot.js',
  './src/js/sw-register.js',
  './src/js/data/weather-locale-registry.js',
  './src/js/data/weather-locale-loader.js',
  './src/js/data/weather-packs/ar.json',
  './src/js/data/weather-packs/cs.json',
  './src/js/data/weather-packs/da.json',
  './src/js/data/weather-packs/de.json',
  './src/js/data/weather-packs/el.json',
  './src/js/data/weather-packs/en.json',
  './src/js/data/weather-packs/es.json',
  './src/js/data/weather-packs/fi.json',
  './src/js/data/weather-packs/fr.json',
  './src/js/data/weather-packs/he.json',
  './src/js/data/weather-packs/hi.json',
  './src/js/data/weather-packs/hu.json',
  './src/js/data/weather-packs/id.json',
  './src/js/data/weather-packs/it.json',
  './src/js/data/weather-packs/ja.json',
  './src/js/data/weather-packs/ko.json',
  './src/js/data/weather-packs/nb.json',
  './src/js/data/weather-packs/nl.json',
  './src/js/data/weather-packs/pl.json',
  './src/js/data/weather-packs/pt-BR.json',
  './src/js/data/weather-packs/pt-PT.json',
  './src/js/data/weather-packs/ro.json',
  './src/js/data/weather-packs/ru.json',
  './src/js/data/weather-packs/sv.json',
  './src/js/data/weather-packs/th.json',
  './src/js/data/weather-packs/tr.json',
  './src/js/data/weather-packs/uk.json',
  './src/js/data/weather-packs/vi.json',
  './src/js/data/weather-packs/zh-TW.json',
  './src/js/data/weather-packs/zh.json',
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
  './src/js/features/weather/map.js',
  './src/js/features/weather/alerts.js',
  './src/js/features/weather/data.js',
  './src/js/features/weather/snapshots.js',
  './src/js/features/weather/navigation.js',
  './src/js/features/weather/product.js',
  './src/js/features/weather/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('duskline-shell-') && key !== CACHE).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  const navigation = request.mode === 'navigate' || request.destination === 'document';
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (!navigation) {
      const cached = await cache.match(request, {ignoreSearch: true});
      if (cached) return cached;
      return fetch(request);
    }
    // Keep the installed shell coherent; deploy changes activate with a user-visible update.
    const path = url.pathname.endsWith('/') ? './index.html' : url.pathname;
    const cached = await cache.match(path, {ignoreSearch: true});
    if (cached) return cached;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      return await fetch(request, {signal: controller.signal});
    } catch (error) {
      return await cache.match('./index.html') || Response.error();
    } finally { clearTimeout(timer); }
  })());
});
