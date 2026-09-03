**Läs på:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · **Svenska** · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

En gratis väderapp som bara körs i webbläsaren, för att kolla och utforska vädret: global stadssökning, tim- och 10-dygnsutsikter, luftkvalitet, animerade förhållanden och utökade U.S. National Weather Service-prognoser och varningar.

[Öppna duskline](https://duskline.pages.dev/) · [Integritetspolicy](../../privacy.html) · [Användarvillkor](../../terms.html)

Inget konto, ingen egen backend, ingen reklamidentifierare. Språk, enheter, favoriter och en avsiktligt ungefärlig sparad plats stannar i webbläsaren.

## Funktioner

- Sök vilken stad som helst i världen, med tangentbordsvänliga förslag
- Spara favoriter och använd valfritt din plats (koordinater avrundas innan de sparas eller skickas)
- Aktuella förhållanden, timprognos och 10-dygnsöversikt
- Luftkvalitet
- För berättigade amerikanska platser, prognoser och offentliga varningar från National Weather Service
- Animerad himmel och nederbörd i detaljvyn
- Enheter för temperatur, avstånd, vind, nederbörd och tryck
- 30 gränssnittsspråk, inklusive arabiska och hebreiska (höger till vänster)

## Integritet och data

Väderförfrågningar går från webbläsaren till [Open-Meteo](https://open-meteo.com/) och, för amerikanska platser, [National Weather Service](https://www.weather.gov/). Om du använder plats går omvänd geokodning till BigDataCloud och kan falla tillbaka till OpenStreetMap Nominatim. Hosting och Google Fonts kan se vanliga tekniska förfrågningsdata.

duskline säljer inte den informationen. Prognoser är till för planering och utforskning, inte nödlägesbeslut. Detaljer: [Integritetspolicy](../../privacy.html) och [Användarvillkor](../../terms.html).

## Språk

Väljaren i appen och de juridiska sidorna delar samma 30 språk och inställningen `duskline-lang`. Juridisk text finns i `src/js/data/legal/packs/`. Dessa README-översättningar finns i [`docs/i18n/`](README.md).

## Utveckling

Appen är statisk HTML, CSS och klassiska skript — ingen bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Syntaxkontroll av varje egen JS-fil: `npm run check`
- Enhetstester: `npm run test:unit`
- Playwright-smokes mockar väder-API:er och förbrukar inte livekvoter: `npm test`

## Publicering

Förrådets rot är webbplatsen. [Cloudflare Pages](https://duskline.pages.dev/) är den avsedda primära värden; GitHub Pages är backup. Båda publicerar de statiska filerna som de är.

## Licens

Koden är [MIT](../../LICENSE). Väderdata tillhör tredjepartsleverantörerna ovan och följer deras villkor. Inte för livssäkerhet eller nödsituationer.
