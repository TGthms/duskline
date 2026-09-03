**Lezen in:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · **Nederlands** · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Een gratis, alleen-in-de-browser weer-app om het weer te checken en te verkennen: wereldwijde stedenzoek, uur- en 10-daagse verwachtingen, luchtkwaliteit, geanimeerde omstandigheden en uitgebreide Amerikaanse National Weather Service-verwachtingen en -waarschuwingen.

[duskline openen](https://duskline.pages.dev/) · [Privacybeleid](../../privacy.html) · [Gebruiksvoorwaarden](../../terms.html)

Geen account, geen eigen backend, geen advertentie-identificatie. Taal, eenheden, favorieten en een expres benaderde opgeslagen locatie blijven in je browser.

## Functies

- Zoek elke stad ter wereld, met toetsenbordvriendelijke suggesties
- Bewaar favorieten en gebruik optioneel je locatie (coördinaten worden afgerond voordat ze worden opgeslagen of verzonden)
- Actuele omstandigheden, uurverwachting en 10-daags overzicht
- Luchtkwaliteit
- Voor in aanmerking komende Amerikaanse plaatsen, verwachtingen en openbare waarschuwingen van de National Weather Service
- Geanimeerde hemel en neerslag in de detailweergave
- Eenheden voor temperatuur, afstand, wind, neerslag en luchtdruk
- 30 interfacetalen, waaronder Arabisch en Hebreeuws (rechts-naar-links)

## Privacy en gegevens

Weerverzoeken gaan vanuit je browser naar [Open-Meteo](https://open-meteo.com/) en, voor Amerikaanse locaties, de [National Weather Service](https://www.weather.gov/). Reverse geocoding bij locatiegebruik gaat naar BigDataCloud en kan terugvallen op OpenStreetMap Nominatim. Hosting en Google Fonts kunnen gewone technische verzoekgegevens zien.

duskline verkoopt die informatie niet. Verwachtingen zijn voor planning en verkenning, niet voor noodbeslissingen. Details: [Privacybeleid](../../privacy.html) en [Gebruiksvoorwaarden](../../terms.html).

## Talen

De kiezer in de app en de juridische pagina’s delen dezelfde 30 locales en de voorkeur `duskline-lang`. Juridische teksten staan in `src/js/data/legal/packs/`. Deze README-vertalingen staan in [`docs/i18n/`](README.md).

## Ontwikkeling

De app is statische HTML, CSS en klassieke scripts — geen bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Syntaxcontrole van elk eigen JS-bestand: `npm run check`
- Unittests: `npm run test:unit`
- Playwright-smokes mocken weer-API’s en verbruiken geen live quota: `npm test`

## Publicatie

De repositorywortel is de site. [Cloudflare Pages](https://duskline.pages.dev/) is de beoogde primaire host; GitHub Pages de back-up. Beide publiceren de statische bestanden ongewijzigd.

## Licentie

De code is [MIT](../../LICENSE). Weergegevens horen bij de genoemde derden en vallen onder hun voorwaarden. Niet voor levensveiligheid of noodgevallen.
