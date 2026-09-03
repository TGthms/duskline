# Legal locale packs

Privacy Policy and Terms of Use copy lives here, one JSON file per picker language.

```
src/js/data/legal/packs/<locale>.json
```

`src/js/data/legal-i18n.js` fetches only English plus the active locale. Pages keep English in the HTML as the fallback if a pack fails to load.

Each pack is an object of `legal.*` keys (not an ordered array), so a missing string falls back to English without shifting later keys. After editing a pack, run `npm run test:unit` and the Playwright legal smokes.
