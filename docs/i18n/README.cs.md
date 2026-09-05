**Číst v jazyce:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · **Čeština** · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Bezplatná, pouze prohlížečová meteorologická aplikace ke kontrole a zkoumání počasí: celosvětové hledání měst, hodinové a 10denní výhledy, kvalita ovzduší, animované podmínky a rozšířené předpovědi a výstrahy U.S. National Weather Service.

[Otevřít duskline](https://dusklineweather.pages.dev/) · [Zásady ochrany soukromí](../../privacy.html) · [Podmínky použití](../../terms.html)

Žádný účet, žádný vlastní backend, žádný reklamní identifikátor. Jazyk, jednotky, oblíbené položky a záměrně přibližná uložená poloha zůstanou v prohlížeči.

## Funkce

- Hledejte libovolné město na světě, s návrhy ovladatelnými z klávesnice
- Ukládejte oblíbené a volitelně použijte polohu (souřadnice se zaokrouhlují před uložením nebo odesláním)
- Aktuální podmínky, hodinová předpověď a 10denní výhled
- Kvalita ovzduší
- Pro způsobilá americká místa předpovědi a veřejné výstrahy National Weather Service
- Animovaná obloha a srážky v podrobném zobrazení
- Jednotky teploty, vzdálenosti, větru, srážek a tlaku
- 30 jazyků rozhraní včetně arabštiny a hebrejštiny (zprava doleva)

## Soukromí a data

Požadavky na počasí odcházejí z prohlížeče na [Open-Meteo](https://open-meteo.com/) a u amerických míst na [National Weather Service](https://www.weather.gov/). Pokud použijete polohu, reverzní geokódování jde na BigDataCloud a může spadnout na OpenStreetMap Nominatim. Hosting a Google Fonts mohou vidět běžná technická data požadavku.

duskline tyto informace neprodává. Předpovědi slouží k plánování a zkoumání, ne k nouzovým rozhodnutím. Podrobnosti: [Zásady ochrany soukromí](../../privacy.html) a [Podmínky použití](../../terms.html).

## Jazyky

Přepínač v aplikaci a právní stránky sdílejí stejných 30 jazyků a předvolbu `duskline-lang`. Právní texty jsou v `src/js/data/legal/packs/`. Tyto překlady README jsou v [`docs/i18n/`](README.md).

## Vývoj

Aplikace je statické HTML, CSS a klasické skripty — bez bundleru.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Kontrola syntaxe každého vlastního JS: `npm run check`
- Jednotkové testy: `npm run test:unit`
- Playwright smoke testy mockují meteorologická API a nespotřebovávají živé kvóty: `npm test`

## Nasazení

Kořen repozitáře je web. [Cloudflare Pages](https://dusklineweather.pages.dev/) je zamýšlený hlavní hostitel; GitHub Pages je záloha. Oba publikují statické soubory beze změny.

## Licence

Kód je [MIT](../../LICENSE). Data o počasí patří výše uvedeným poskytovatelům a podléhají jejich podmínkám. Ne pro životní bezpečnost ani nouzové použití.
