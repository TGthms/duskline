**Les på:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · **Norsk bokmål** · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

En gratis værapp som bare kjører i nettleseren, for å sjekke og utforske været: globalt bysøk, time- og 10-dagersutsikter, luftkvalitet, animerte forhold og utvidede U.S. National Weather Service-varsler og advarsler.

[Åpne duskline](https://duskline.pages.dev/) · [Personvern](../../privacy.html) · [Bruksvilkår](../../terms.html)

Ingen konto, ingen egen backend, ingen reklameidentifikator. Språk, enheter, favoritter og en bevisst omtrentlig lagret posisjon blir i nettleseren.

## Funksjoner

- Søk etter hvilken som helst by i verden, med tastaturvennlige forslag
- Lagre favoritter og bruk eventuelt posisjonen (koordinater avrundes før de lagres eller sendes)
- Aktuelle forhold, timevarsel og 10-dagers oversikt
- Luftkvalitet
- For kvalifiserte amerikanske steder, varsler og offentlige advarsler fra National Weather Service
- Animert himmel og nedbør i detaljvisningen
- Enheter for temperatur, avstand, vind, nedbør og trykk
- 30 grensesnittspråk, inkludert arabisk og hebraisk (høyre mot venstre)

## Personvern og data

Værforespørsler går fra nettleseren til [Open-Meteo](https://open-meteo.com/) og, for amerikanske steder, [National Weather Service](https://www.weather.gov/). Hvis du bruker posisjon, går omvendt geokoding til BigDataCloud og kan falle tilbake til OpenStreetMap Nominatim. Hosting og Google Fonts kan se vanlige tekniske forespørselsdata.

duskline selger ikke den informasjonen. Varsler er til planlegging og utforskning, ikke nødavgjørelser. Detaljer: [Personvern](../../privacy.html) og [Bruksvilkår](../../terms.html).

## Språk

Velgeren i appen og de juridiske sidene deler de samme 30 språkene og innstillingen `duskline-lang`. Juridisk tekst ligger i `src/js/data/legal/packs/`. Disse README-oversettelsene ligger i [`docs/i18n/`](README.md).

## Utvikling

Appen er statisk HTML, CSS og klassiske skript — ingen bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Syntakssjekk av hver egen JS-fil: `npm run check`
- Enhetstester: `npm run test:unit`
- Playwright-smokes mocker vær-API-er og bruker ikke livekvoter: `npm test`

## Publisering

Lagerets rot er nettstedet. [Cloudflare Pages](https://duskline.pages.dev/) er den tiltenkte primære verten; GitHub Pages er sikkerhetskopi. Begge publiserer de statiske filene som de er.

## Lisens

Koden er [MIT](../../LICENSE). Værdata tilhører tredjepartsleverandørene over og er underlagt vilkårene deres. Ikke for livssikkerhet eller nødsituasjoner.
