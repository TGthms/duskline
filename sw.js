const CACHE = 'duskline-shell-v65';
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
  './src/js/data/weather-packs/en.json',
  './src/js/data/duskline-locales.js',
  './src/js/data/legal-i18n.js',
  './src/js/legal.js',
  './src/js/data/dest-weather-cities.js',
  './src/js/core/loading.js',
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
  './src/js/features/weather/search-places.js',
  './src/js/features/weather/network-policy.js',
  './src/js/features/weather/data.js',
  './src/js/features/weather/snapshots.js',
  './src/js/features/weather/navigation.js',
  './src/js/features/weather/product.js',
  './src/js/features/weather/app.js'
];

// A followed host redirect carries internal URL-list metadata. WebKit rejects
// that response for a navigation with redirect mode "manual", including a reload
// after controllerchange. Rebuild it both at install and at the response boundary.
function navigationResponse(response) {
  if (!response || response.type === 'error' || response.type === 'opaque') return response;
  return new Response(response.body, {
    status: response.status, statusText: response.statusText, headers: response.headers
  });
}
const LOCALES = 'duskline-locales-v65';
const LOCALE_LIMIT = 8; // Four recently used languages, weather + legal packs.
function isLocale(url) {
  return /\/src\/js\/data\/(?:weather-packs|legal\/packs)\/[a-zA-Z-]+\.json$/.test(url.pathname);
}
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await Promise.all(SHELL.map(async (path) => {
      const response = await fetch(new Request(new URL(path, self.location.href), {cache: 'reload'}));
      if (!response.ok) throw new Error('Shell install failed: ' + path);
      await cache.put(path, navigationResponse(response));
    }));
  }));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => (key.startsWith('duskline-shell-') && key !== CACHE) || (key.startsWith('duskline-locales-') && key !== LOCALES)).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ACTIVATE_UPDATE') self.skipWaiting();
  if (event.data && event.data.type === 'CACHE_LOCALE' && /^[a-z]{2}(?:-[A-Za-z]{2})?$/.test(event.data.code)) {
    const folder = event.data.legal ? 'legal/packs/' : 'weather-packs/';
    event.waitUntil(caches.open(LOCALES).then(async cache => {
      const url = new URL('./src/js/data/' + folder + event.data.code + '.json', self.location.href);
      if (await cache.match(url) || await (await caches.open(CACHE)).match(url)) return;
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
        const keys = await cache.keys();
        await Promise.all(keys.slice(0, Math.max(0, keys.length - LOCALE_LIMIT)).map(key => cache.delete(key)));
      }
    }).catch(() => {}));
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  const navigation = request.mode === 'navigate' || request.destination === 'document';
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isLocale(url)) {
      const localeCache = await caches.open(LOCALES);
      const cached = await localeCache.match(request, {ignoreSearch: true});
      if (cached) return cached;
      const english = await cache.match(request, {ignoreSearch: true});
      if (english) return english;
      const response = await fetch(request);
      if (response.ok) {
        await localeCache.put(url.origin + url.pathname, response.clone());
        const keys = await localeCache.keys();
        await Promise.all(keys.slice(0, Math.max(0, keys.length - LOCALE_LIMIT)).map(key => localeCache.delete(key)));
      }
      return response;
    }
    if (!navigation) {
      const cached = await cache.match(request, {ignoreSearch: true});
      if (cached) return cached;
      return fetch(request);
    }
    // Keep the installed shell coherent; support Pages' extensionless legal URLs.
    const path = url.pathname.endsWith('/') ? './index.html' :
      /\/(privacy|terms|licenses)$/.test(url.pathname) ? url.pathname + '.html' : url.pathname;
    const cached = await cache.match(path, {ignoreSearch: true});
    if (cached) return navigationResponse(cached);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      return navigationResponse(await fetch(request, {signal: controller.signal}));
    } catch (error) {
      return navigationResponse(await cache.match('./index.html')) || Response.error();
    } finally { clearTimeout(timer); }
  })());
});
