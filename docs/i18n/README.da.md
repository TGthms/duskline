**Læs på:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · **Dansk** · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

En gratis, browser-only vejrapp til at tjekke og udforske vejret: global bysøgning, time- og 10-dages udsigter, luftkvalitet, animerede forhold og forbedrede U.S. National Weather Service-udsigter og -advarsler.

[Åbn duskline](https://duskline.pages.dev/) · [Privatlivspolitik](../../privacy.html) · [Brugsvilkår](../../terms.html)

Ingen konto, intet eget backend og intet reklame-id. Sprog, enheder, favoritter og en bevidst omtrentlig gemt placering bliver i din browser.

## Funktioner

- Søg efter en hvilken som helst by i verden, med tastaturvenlige forslag
- Gem favoritter og brug eventuelt din placering (koordinater afrundes før de gemmes eller sendes)
- Aktuelle forhold, timeudsigt og 10-dages overblik
- Luftkvalitet
- For berettigede amerikanske steder, udsigter og offentlige advarsler fra National Weather Service
- Animeret himmel og nedbør i detaljevisningen
- Enheder for temperatur, afstand, vind, nedbør og tryk
- 30 grænsefladesprog, herunder arabisk og hebraisk (højre-til-venstre)

## Privatliv og data

Vejrforespørgsler går fra din browser til [Open-Meteo](https://open-meteo.com/) og, for amerikanske steder, [National Weather Service](https://www.weather.gov/). Hvis du bruger placering, går omvendt geokodning til BigDataCloud og kan falde tilbage til OpenStreetMap Nominatim. Hosting og Google Fonts kan se almindelige tekniske forespørgselsdata.

duskline sælger ikke de oplysninger. Udsigter er til planlægning og udforskning, ikke nødbeslutninger. Detaljer: [Privatlivspolitik](../../privacy.html) og [Brugsvilkår](../../terms.html).

## Sprog

Vælgeren i appen og de juridiske sider deler de samme 30 sprog og indstillingen `duskline-lang`. Juridisk tekst ligger i `src/js/data/legal/packs/`. Disse README-oversættelser ligger i [`docs/i18n/`](README.md).

## Udvikling

Appen er statisk HTML, CSS og klassiske scripts — ingen bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Syntakstjek af hver egen JS-fil: `npm run check`
- Enhedstest: `npm run test:unit`
- Playwright-smokes mocker vejr-API’er og bruger ikke live-kvoter: `npm test`

## Udgivelse

Lagerets rod er sitet. [Cloudflare Pages](https://duskline.pages.dev/) er den tilsigtede primære vært; GitHub Pages er backup. Begge udgiver de statiske filer som de er.

## Licens

Koden er [MIT](../../LICENSE). Vejrdata tilhører tredjepartsudbyderne ovenfor og er underlagt deres vilkår. Ikke til livssikkerhed eller nødsituationer.
