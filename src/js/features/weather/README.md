# Weather modules

Contributor notes for the forecast runtime. Project overview, privacy, and localized READMEs: [`README.md`](../../../../README.md) and [`docs/i18n/`](../../../../docs/i18n/README.md).

Classic (non-module) scripts loaded by `index.html` in this order:

| File | Role |
|------|------|
| `ns.js` | Page gate + `window.DusklineWeather` factory registry |
| `sky.js` | Sky / ambient FX (`W.factories.sky`) |
| `charts.js` | Daily bars + hourly/sun charts (`W.factories.charts`) |
| `alerts.js` | NWS alerts accordion + prefetch (`W.factories.alerts`) |
| `data.js` | NWS + Open-Meteo fetch/normalize (`W.factories.data`) |
| `app.js` | UI state, list/detail/sheets, boot |

`app.js` creates deps (units, DOM, cache) and calls each factory. Do not load `app.js` alone.

## Editing

- Sky visuals → `sky.js`
- Chart geometry / daily range colors → `charts.js`
- Alert cards / collapse animation → `alerts.js`
- API + hybrid NWS/OM → `data.js`
- List, detail, units sheet, refresh → `app.js`

After edits: `npm run check` and Playwright `e2e/smoke.spec.js`.
