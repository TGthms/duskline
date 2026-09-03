**Olvasás nyelve:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · **Magyar** · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Ingyenes, csak böngészős időjárás-alkalmazás a mindennapi ellenőrzéshez és felfedezéshez: világszintű városkeresés, óránkénti és 10 napos kilátás, levegőminőség, animált viszonyok, valamint bővített U.S. National Weather Service előrejelzések és riasztások.

[duskline megnyitása](https://duskline.pages.dev/) · [Adatvédelmi szabályzat](../../privacy.html) · [Felhasználási feltételek](../../terms.html)

Nincs fiók, nincs saját háttérrendszer, nincs hirdetési azonosító. A nyelv, az egységek, a kedvencek és egy szándékosan hozzávetőleges mentett hely a böngészőben marad.

## Funkciók

- Keressen bármely várost a világon, billentyűzettel használható javaslatokkal
- Mentse a kedvenceket, és opcionálisan használja a helyzetét (a koordinátákat mentés vagy küldés előtt kerekítjük)
- Jelenlegi viszonyok, óránkénti előrejelzés és 10 napos kilátás
- Levegőminőség
- Jogosult amerikai helyeken a National Weather Service előrejelzései és nyilvános riasztásai
- Animált ég és csapadék a részletes nézetben
- Hőmérséklet, távolság, szél, csapadék és nyomás egységei
- 30 felületi nyelv, köztük az arab és a héber (jobbról balra)

## Adatvédelem és adatok

Az időjárási kérések a böngészőből mennek az [Open-Meteo](https://open-meteo.com/) felé, amerikai helyeken a [National Weather Service](https://www.weather.gov/) felé. Ha helyzetet használ, a fordított geokódolás a BigDataCloudhoz megy, és visszaeshet az OpenStreetMap Nominatimre. A tárhely és a Google Fonts láthatja a szokásos technikai kérésadatokat.

A duskline nem adja el ezeket az információkat. Az előrejelzések tervezésre és felfedezésre valók, nem vészhelyzeti döntésekre. Részletek: [Adatvédelmi szabályzat](../../privacy.html) és [Felhasználási feltételek](../../terms.html).

## Nyelvek

Az alkalmazás választója és a jogi oldalak ugyanazt a 30 nyelvet és a `duskline-lang` beállítást használják. A jogi szövegek a `src/js/data/legal/packs/` mappában vannak. Ezek a README-fordítások a [`docs/i18n/`](README.md) mappában vannak.

## Fejlesztés

Az alkalmazás statikus HTML, CSS és klasszikus scriptek — nincs bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Minden saját JS szintaxisellenőrzése: `npm run check`
- Egységtesztek: `npm run test:unit`
- A Playwright füsttesztek mockolják az időjárási API-kat, és nem fogyasztanak élő kvótát: `npm test`

## Közzététel

A tároló gyökere a webhely. A [Cloudflare Pages](https://duskline.pages.dev/) a tervezett elsődleges host; a GitHub Pages a biztonsági másolat. Mindkettő változatlanul közzéteszi a statikus fájlokat.

## Licenc

A kód [MIT](../../LICENSE). Az időjárási adatok a fenti harmadik feleké, és az ő feltételeik vonatkoznak rájuk. Nem életbiztonsági vagy vészhelyzeti használatra.
