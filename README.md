**Read this in:** **English** · [Español](docs/i18n/README.es.md) · [Français](docs/i18n/README.fr.md) · [Deutsch](docs/i18n/README.de.md) · [Italiano](docs/i18n/README.it.md) · [Português (Brasil)](docs/i18n/README.pt-BR.md) · [Português (Portugal)](docs/i18n/README.pt-PT.md) · [Nederlands](docs/i18n/README.nl.md) · [Dansk](docs/i18n/README.da.md) · [Svenska](docs/i18n/README.sv.md) · [Norsk bokmål](docs/i18n/README.nb.md) · [Suomi](docs/i18n/README.fi.md) · [Polski](docs/i18n/README.pl.md) · [Čeština](docs/i18n/README.cs.md) · [Magyar](docs/i18n/README.hu.md) · [Română](docs/i18n/README.ro.md) · [Ελληνικά](docs/i18n/README.el.md) · [Türkçe](docs/i18n/README.tr.md) · [Русский](docs/i18n/README.ru.md) · [Українська](docs/i18n/README.uk.md) · [العربية](docs/i18n/README.ar.md) · [עברית](docs/i18n/README.he.md) · [हिन्दी](docs/i18n/README.hi.md) · [ไทย](docs/i18n/README.th.md) · [Tiếng Việt](docs/i18n/README.vi.md) · [Bahasa Indonesia](docs/i18n/README.id.md) · [日本語](docs/i18n/README.ja.md) · [한국어](docs/i18n/README.ko.md) · [简体中文](docs/i18n/README.zh.md) · [繁體中文](docs/i18n/README.zh-TW.md)

# Duskline

A free, browser-only weather app for everyday checking and weather exploration: worldwide city search, hourly and 10-day outlooks, air quality, animated conditions, and enhanced U.S. National Weather Service forecasts and alerts.

[Open duskline](https://duskline.pages.dev/) · [Privacy Policy](privacy.html) · [Terms of Use](terms.html)

There is no account, no backend of our own, and no advertising identifier. Language, units, favorites, and an intentionally approximate saved location stay in your browser.

## Features

- Search any city worldwide, with keyboard-friendly suggestions
- Save favorites and optionally use your location (coordinates are rounded before they are stored or sent)
- Current conditions, hourly forecast, and a 10-day outlook
- Air quality
- For eligible U.S. places, National Weather Service forecasts and public alerts
- Animated sky and precipitation in the detailed view
- Temperature, distance, wind, precipitation, and pressure units
- 30 interface languages, including Arabic and Hebrew (right-to-left)

## Privacy and data

Weather requests leave your browser directly for [Open-Meteo](https://open-meteo.com/) and, for U.S. locations, the [National Weather Service](https://www.weather.gov/). Reverse geocoding, if you use location, goes to BigDataCloud and may fall back to OpenStreetMap Nominatim. Hosting and Google Fonts may see ordinary technical request data.

duskline does not sell that information. Forecasts are for planning and exploration, not emergency decisions. Full details: [Privacy Policy](privacy.html) and [Terms of Use](terms.html).

## Languages

The in-app picker and the policy pages share the same 30 locales and the same `duskline-lang` preference. Policy copy is stored per language in `src/js/data/legal/packs/`. These README translations live in [`docs/i18n/`](docs/i18n/README.md).

## Development

The app is static HTML, CSS, and classic scripts — no bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Syntax-check every first-party JS file: `npm run check`
- Unit tests: `npm run test:unit`
- Playwright smokes mock weather APIs and do not consume live provider quotas: `npm test`

## Deployment

The repository root is the site. [Cloudflare Pages](https://duskline.pages.dev/) is the intended primary host; GitHub Pages is the backup. Both publish the static files as-is.

## License

Code is [MIT](LICENSE). Weather data belongs to the third-party providers above and remains subject to their terms. Not for life-safety or emergency use.
