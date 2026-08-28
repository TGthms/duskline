# Duskline

Duskline is a browser-only weather app for everyday checking and weather exploration: global city forecasts, saved places, air quality, animated conditions, and enhanced U.S. National Weather Service forecasts and alerts.

## Development

```bash
npm run serve
# http://127.0.0.1:8000/
```

The app is static and has no account or backend layer. Weather requests are made from the browser to Open-Meteo and, for U.S. locations, the National Weather Service. Favorites, preferences, and an intentionally approximate location are stored locally.

Run syntax checks with `npm run check`. Playwright tests use mocked weather APIs and never consume live provider quotas.

## Deployment

The repository is compatible with GitHub Pages and Cloudflare Pages. GitHub Pages is the backup deployment; Cloudflare Pages is the intended primary deployment. Both publish the repository root as static files.

## Languages

Duskline exposes 30 locales in Preferences. Locale metadata, RTL handling, locale-aware formatting, and English fallback are defined in `src/js/data/duskline-locales.js`; translation packs can evolve independently from the weather runtime.

## License and data notice

Code is MIT licensed. Weather data is provided by third parties and is for general guidance only, not emergency decisions. See [Privacy](privacy.html) and [Terms](terms.html).
