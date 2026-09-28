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
| `data.js` | NWS + Open-Meteo fetch/normalize (`W.factories.data`) |
| `snapshots.js` | Bounded, local forecast history for recent places and offline use (`W.factories.snapshots`) |
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
