<p align="center">
  <img src="assets/duskline-icon-512.png" alt="duskline app icon" width="92" height="92">
</p>

<h1 align="center">duskline</h1>

<p align="center"><strong>Weather, beautifully clear. Anywhere in the world.</strong></p>

<p align="center">A calmer way to check the next hour, plan the week, and see what the sky is doing around the world.</p>

<p align="center"><a href="https://dusklineweather.pages.dev/"><strong>Open duskline ↗</strong></a> · <a href="https://dusklineweather.pages.dev/privacy.html">Privacy</a> · <a href="https://dusklineweather.pages.dev/terms.html">Terms</a> · <a href="https://dusklineweather.pages.dev/licenses.html">Open-source licenses</a></p>

---

## Read this README in another language

**English** · [Español](docs/i18n/README.es.md) · [Français](docs/i18n/README.fr.md) · [Deutsch](docs/i18n/README.de.md) · [Italiano](docs/i18n/README.it.md) · [Português (Brasil)](docs/i18n/README.pt-BR.md) · [Português (Portugal)](docs/i18n/README.pt-PT.md) · [Nederlands](docs/i18n/README.nl.md) · [Dansk](docs/i18n/README.da.md) · [Svenska](docs/i18n/README.sv.md) · [Norsk bokmål](docs/i18n/README.nb.md) · [Suomi](docs/i18n/README.fi.md) · [Polski](docs/i18n/README.pl.md) · [Čeština](docs/i18n/README.cs.md) · [Magyar](docs/i18n/README.hu.md) · [Română](docs/i18n/README.ro.md) · [Ελληνικά](docs/i18n/README.el.md) · [Türkçe](docs/i18n/README.tr.md) · [Русский](docs/i18n/README.ru.md) · [Українська](docs/i18n/README.uk.md) · [العربية](docs/i18n/README.ar.md) · [עברית](docs/i18n/README.he.md) · [हिन्दी](docs/i18n/README.hi.md) · [ไทย](docs/i18n/README.th.md) · [Tiếng Việt](docs/i18n/README.vi.md) · [Bahasa Indonesia](docs/i18n/README.id.md) · [日本語](docs/i18n/README.ja.md) · [한국어](docs/i18n/README.ko.md) · [简体中文](docs/i18n/README.zh.md) · [繁體中文](docs/i18n/README.zh-TW.md)

## A forecast that feels at home

duskline balances a quiet, atmospheric sky with the details that help you decide what to do next. Start with your own place in **My Sky**, or open **Horizon** to explore conditions across a curated set of cities.

- **Current conditions, hourly detail, and a 10-day outlook** make it easy to move from “right now” to “what should I plan for?”
- **Useful weather context** includes air quality, feels-like temperature, wind, humidity, UV, pressure, precipitation, and sun times.
- **Saved places and direct links** make it simple to return to the forecasts that matter to you or share a city.
- **Weather maps** layer temperature, precipitation chance, wind, and US AQI over a global map, with a forecast-hour scrubber and a bundled geographic offline world map.
- **Public alerts use authoritative sources:** the National Weather Service for eligible U.S. places and official, rebroadcastable CAP feeds through IFRC Alert Hub for supported international places.
- **A living sky** brings day, night, cloud, and precipitation conditions into the city detail view.
- **30 interface languages** include Arabic and Hebrew, with right-to-left layouts.

## Ready when you come back

duskline is an installable progressive web app. Its cached app shell and recent saved forecasts can be opened offline; saved data is labeled with its original check time, and public alerts need a connection. International alert coverage depends on whether an official CAP feed is available for the place. Forecast snapshots are kept in your browser for up to seven days.

Optional US weather notifications can monitor your My Sky primary city or up to five saved places, with severity/type filters, quiet hours, significant updates and a delivery test. Configure them in Settings → Notifications.

No account or advertising identifier is needed. Your language, units, favorites, recent places, and saved forecasts stay in local browser storage. If you use your location, duskline requests permission through your browser and rounds coordinates before storage or weather requests.

## Privacy and weather data

Forecast requests go directly from your browser to [Open-Meteo](https://open-meteo.com/) and, for eligible U.S. locations, the [National Weather Service](https://www.weather.gov/). For international public alerts, duskline sends the selected country code, country name, and interface language to its same-origin Cloudflare Pages function, which requests official CAP data from [IFRC Alert Hub](https://alerthub.ifrc.org/). When available, the selected place’s first-level administrative region (such as a state or province) is also sent for alert matching; city coordinates stay in your browser. Opening the weather map sends the visible map area and zoom level to [OpenFreeMap](https://openfreemap.org/) for map tiles and sampled forecast-grid coordinates to Open-Meteo. Reverse geocoding for device location uses BigDataCloud and may fall back to OpenStreetMap Nominatim. Hosting and Google Fonts may receive ordinary technical request data.

Enabling background notifications sends the selected places (coordinates rounded to two decimals), notification preferences, and browser push subscription to duskline’s Cloudflare service. Subscriptions expire after 90 days without renewal; using the app renews them. Turning notifications off online removes the server record. Clear browser data after disabling notifications if you also want immediate server removal; otherwise the record expires.

Forecasts are for planning and exploration, not emergency decisions. Read the [Privacy Policy](https://dusklineweather.pages.dev/privacy.html) and [Terms of Use](https://dusklineweather.pages.dev/terms.html) for details. Removing a saved place removes its forecast snapshot unless the same place remains saved elsewhere; clear the site's browser data to remove all local history.

## For contributors

The app shell is static HTML, CSS, and classic JavaScript; it has no build step. Cloudflare Pages provides the international CAP proxy and optional notification APIs; background notifications use the scheduled Worker and D1 described in [push setup](docs/push-setup.md). With Node.js 22 or newer:

```bash
npm install
npm run serve
# Open http://127.0.0.1:8000/
```

After changing weather UI catalogs, run `npm run weather:i18n` to regenerate the active-language packs.

Useful checks:

```bash
npm run check       # syntax-check first-party JavaScript
npm run test:unit   # unit and content tests
npm test            # Chromium browser tests
npm run test:cross  # Firefox, desktop WebKit, and phone-sized WebKit
npm run test:all    # unit and Chromium suites
npm run test:visual # pinned macOS Chromium visual baselines
```

Playwright tests mock the weather providers, so they do not use live API quotas. Localized README files live in [`docs/i18n/`](docs/i18n/README.md); regenerate them with `npm run readme:i18n` after changing their catalog in [`tools/render-readme-i18n.js`](tools/render-readme-i18n.js).

## Hosting

The repository root is the static site. [Cloudflare Pages](https://dusklineweather.pages.dev/) is the primary host and runs the international alert function. Function requests count toward the account’s Cloudflare Workers allowance; static asset requests remain separate. GitHub Pages can serve the static shell, but does not run that function, so international alerts are unavailable on that backup host.

## License

The code is available under the [MIT License](LICENSE). Bundled icon and map-rendering licenses are listed on the [open-source licenses page](https://dusklineweather.pages.dev/licenses.html). Weather data belongs to its providers and remains subject to their terms. duskline is not an emergency or life-safety service.

The offline world map uses public-domain Natural Earth coastlines. See [`assets/WORLD-MAP-LICENSE.txt`](assets/WORLD-MAP-LICENSE.txt). Weather map color fields are interpolated forecast estimates.

### Offline updates and release checks

The worker stores a coherent, versioned shell. Navigation responses are reconstructed to remove host redirect metadata before Safari receives them. An update stays waiting until the user selects **Update**. The update prompt is separate from weather notifications. If an older installation is already stuck on a Safari error page, close all duskline tabs/windows and reopen after the fixed release is published; clearing this site's website data is a last resort because it removes saved preferences.

English is included in the shell; other weather and legal language packs are fetched only when used. The separate locale cache keeps at most eight packs, and the currently selected language is retained after first installation. Offline language changes require a previously downloaded pack. Public alerts remain network-only.

CI uses Node 22, verifies generated locale files and source translation coverage, and runs Chromium, Firefox, desktop WebKit, and phone-sized WebKit. GitHub Pages publishes only the exact successful CI revision, and skips superseded revisions. Cloudflare Git-connected automatic deployments are managed in the Cloudflare dashboard and must be disabled or configured with an equivalent check gate; the GitHub Pages workflow cannot govern them.

Runtime contracts and release acceptance checks: [weather contracts](docs/weather-contracts.md) · [production readiness](docs/production-readiness.md).
