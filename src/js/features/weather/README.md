# Weather modules

Contributor notes for the forecast runtime. Project overview, privacy, and localized READMEs: [`README.md`](../../../../README.md) and [`docs/i18n/`](../../../../docs/i18n/README.md).

Sheet “About” blurbs for every picker language live in `src/js/data/weather-about-i18n.js` (`weather.about.*`).

Classic (non-module) scripts loaded by `index.html` in this order:

| File | Role |
|------|------|
| `ns.js` | Page gate + `window.DusklineWeather` factory registry |
| `aqi-math.js` | Pure US and European AQI band and scale helpers |
| `sky.js` | Sky / ambient FX (`W.factories.sky`) |
| `charts.js` | Daily bars + hourly/sun charts (`W.factories.charts`) |
| `map.js` | Lazy OpenFreeMap renderer, Open-Meteo weather grid, and local schematic fallback (`W.factories.map`) |
| `alerts.js` | NWS U.S. + international CAP alerts, area matching, accordion, and prefetch (`W.factories.alerts`) |
| `search-places.js` | Geocoder deduplication and minimum forecast validation |
| `network-policy.js` | Provider retry timing and cancellable backoff |
| `haptics.js` | Vibration API delegation; trusted iOS label taps with non-rendered native switches in Shadow DOM |
| `data.js` | NWS + Open-Meteo fetch/normalize (`W.factories.data`) |
| `city-refresh.js` | Cancellable full-city refresh ownership (`W.factories.cityRefresh`) |
| `snapshots.js` | Bounded, local forecast history for recent places and offline use (`W.factories.snapshots`) |
| `navigation.js` | Browser history for city details and forecast sheets |
| `product.js` | Personal dashboard and Horizon filtering/sorting controls |
| `app.js` | UI state, list/detail/sheets, boot |

`app.js` creates deps (units, DOM, cache) and calls each factory. Do not load `app.js` alone. The map module loads MapLibre only after the map opens; its files stay out of the startup request path.

Keep this order explicit when adding scripts. All four HTML entry points link the CSS files directly so the browser discovers them without an `@import` request step. The app map stylesheet is loaded only on the weather entry point. Same-origin scripts, stylesheets, icons, legal pages, and license notices must also appear in the service worker `SHELL`; `npm run test:unit` checks each page's offline dependency contract and CSS imports. The international alerts route is provided by a Cloudflare Pages Function and intentionally remains network-only in the service worker.

## Editing

- Sky visuals → `sky.js`
- Chart geometry / daily range colors → `charts.js`
- Lazy map, forecast-grid requests, and offline schematic → `map.js`
- Alert provider routing, CAP location matching, cards / collapse animation → `alerts.js`
- International CAP aggregation proxy → `functions/api/international-alerts.js` (Cloudflare Pages only)
- API + hybrid NWS/OM → `data.js`
- Local forecast retention → `snapshots.js`
- List, detail, units sheet, refresh → `app.js`

After edits: `npm run check` and Playwright `e2e/smoke.spec.js`.

Weather-page locale catalogs are generated with `npm run weather:i18n`. The page loads English as a fallback and fetches only the active locale. English is precached. Other weather and legal packs are cached on demand in a separate cache capped at eight packs; offline language changes require a previously used pack.

Product layout rules live in `src/css/weather-product.css`; avoid adding them to the atmospheric brand layer. Saved-place rearrangement is available inside the Units/preferences sheet.

My Sky uses the shared daily chart renderer with `limit: 5` and `skipToday: true`; preview days open the matching full day sheet. The fixed header's route progress bar adapts Kit's timing and respects resolved motion preferences. Primary-card layout and progress styling remain in `weather-product.css`.

Shared async progress lives in `src/js/core/loading.js`. Use `DusklineLoading.begin()` and release its returned token in `finally`; overlapping work must not hide another task’s progress. The map reuses the app’s reverse-geocoder with a four-second lookup budget and coordinate fallback. The primary card uses `sky.primaryPalette` to separate daytime clouds, rain, snow, and clear/night conditions while keeping small text readable.

The shared indicator is mounted outside the chrome so it remains visible above detail/sheet/map overlays. Forecast operations retain their token through retries; `loadCity`/`loadMany` and provider transports are tracked separately. Saved-place selection repaints the primary card before requesting missing data. Primary-strip scroll and focused day controls survive same-city data refreshes.

Map raster rendering caches Float64 spatial weights, reads each forecast sample once per frame, and writes into reused canvas/ImageData buffers. Preserve arithmetic order and compare the baseline pixel hashes before changing interpolation or palettes. `npm run benchmark:map` measures the CPU kernel; see `docs/map-performance.md` for scope and results. Place updates coalesce and use coordinate keys; the map's cold-load generations, visibility guards, and request deadlines must remain paired with close/fallback cleanup.
