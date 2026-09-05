**Lesen auf:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · **Deutsch** · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Eine kostenlose, rein browserbasierte Wetter-App zum Nachschlagen und Erkunden: weltweite Städtesuche, stündliche und 10-Tage-Aussichten, Luftqualität, animierte Bedingungen sowie erweiterte Vorhersagen und Warnungen des U.S. National Weather Service.

[duskline öffnen](https://dusklineweather.pages.dev/) · [Datenschutz](../../privacy.html) · [Nutzungsbedingungen](../../terms.html)

Kein Konto, kein eigenes Backend, keine Werbekennung. Sprache, Einheiten, Favoriten und ein bewusst ungefährer gespeicherter Standort bleiben in Ihrem Browser.

## Funktionen

- Suche nach jeder Stadt weltweit, mit tastaturfreundlichen Vorschlägen
- Favoriten speichern und optional den Standort nutzen (Koordinaten werden vor dem Speichern oder Senden gerundet)
- Aktuelle Bedingungen, stündliche Vorhersage und 10-Tage-Ausblick
- Luftqualität
- Für berechtigte US-Orte Vorhersagen und öffentliche Warnungen des National Weather Service
- Animierter Himmel und Niederschlag in der Detailansicht
- Einheiten für Temperatur, Distanz, Wind, Niederschlag und Druck
- 30 Oberflächensprachen, einschließlich Arabisch und Hebräisch (rechts nach links)

## Datenschutz und Daten

Wetteranfragen gehen direkt aus Ihrem Browser an [Open-Meteo](https://open-meteo.com/) und für US-Standorte an den [National Weather Service](https://www.weather.gov/). Reverse Geocoding bei Standortnutzung geht an BigDataCloud und kann auf OpenStreetMap Nominatim zurückfallen. Hosting und Google Fonts können gewöhnliche technische Anfragedaten sehen.

duskline verkauft diese Informationen nicht. Vorhersagen dienen der Planung und Erkundung, nicht Notfallentscheidungen. Details: [Datenschutz](../../privacy.html) und [Nutzungsbedingungen](../../terms.html).

## Sprachen

Der In-App-Wähler und die Rechtstexte teilen dieselben 30 Locales und die Einstellung `duskline-lang`. Rechtstexte liegen in `src/js/data/legal/packs/`. Diese README-Übersetzungen liegen in [`docs/i18n/`](README.md).

## Entwicklung

Die App ist statisches HTML, CSS und klassische Skripte — kein Bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Syntaxprüfung jeder eigenen JS-Datei: `npm run check`
- Unit-Tests: `npm run test:unit`
- Playwright-Smokes mocken Wetter-APIs und verbrauchen keine Live-Kontingente: `npm test`

## Bereitstellung

Die Repository-Wurzel ist die Website. [Cloudflare Pages](https://dusklineweather.pages.dev/) ist der vorgesehene Haupthost; GitHub Pages die Absicherung. Beide veröffentlichen die statischen Dateien unverändert.

## Lizenz

Der Code steht unter [MIT](../../LICENSE). Wetterdaten gehören den genannten Drittanbietern und unterliegen deren Bedingungen. Nicht für Lebenssicherheit oder Notfälle.
