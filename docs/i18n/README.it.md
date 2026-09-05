**Leggi in:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · **Italiano** · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Un’app meteo gratuita, solo nel browser, per consultare ed esplorare il tempo: ricerca mondiale di città, previsioni orarie e a 10 giorni, qualità dell’aria, condizioni animate e previsioni e allerte potenziate del U.S. National Weather Service.

[Apri duskline](https://dusklineweather.pages.dev/) · [Privacy](../../privacy.html) · [Termini di utilizzo](../../terms.html)

Nessun account, nessun backend nostro, nessun identificatore pubblicitario. Lingua, unità, preferiti e una posizione salvata volutamente approssimativa restano nel browser.

## Funzioni

- Cerca qualsiasi città nel mondo, con suggerimenti usabili da tastiera
- Salva i preferiti e, se vuoi, usa la posizione (le coordinate vengono arrotondate prima di essere salvate o inviate)
- Condizioni attuali, previsione oraria e panorama a 10 giorni
- Qualità dell’aria
- Per i luoghi USA ammissibili, previsioni e allerte pubbliche del National Weather Service
- Cielo e precipitazioni animati nella vista dettagliata
- Unità di temperatura, distanza, vento, precipitazioni e pressione
- 30 lingue dell’interfaccia, tra cui arabo ed ebraico (destra-sinistra)

## Privacy e dati

Le richieste meteo escono dal browser verso [Open-Meteo](https://open-meteo.com/) e, per le località USA, il [National Weather Service](https://www.weather.gov/). Se usi la posizione, il geocoding inverso va a BigDataCloud e può passare a OpenStreetMap Nominatim. Hosting e Google Fonts possono vedere dati tecnici ordinari della richiesta.

duskline non vende queste informazioni. Le previsioni servono a pianificare ed esplorare, non a decisioni di emergenza. Dettagli: [Privacy](../../privacy.html) e [Termini di utilizzo](../../terms.html).

## Lingue

Il selettore nell’app e le pagine legali condividono le stesse 30 lingue e la preferenza `duskline-lang`. I testi legali sono in `src/js/data/legal/packs/`. Queste traduzioni del README sono in [`docs/i18n/`](README.md).

## Sviluppo

L’app è HTML, CSS e script classici statici — nessun bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Controllo sintassi di ogni JS di prima parte: `npm run check`
- Test unitari: `npm run test:unit`
- Gli smoke Playwright simulano le API meteo e non consumano quote reali: `npm test`

## Pubblicazione

La radice del repository è il sito. [Cloudflare Pages](https://dusklineweather.pages.dev/) è l’host principale previsto; GitHub Pages è il backup. Entrambi pubblicano i file statici così come sono.

## Licenza

Il codice è [MIT](../../LICENSE). I dati meteo appartengono ai fornitori sopra e restano soggetti ai loro termini. Non per sicurezza della vita o emergenze.
