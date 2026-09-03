**Citește în:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · **Română** · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

O aplicație meteo gratuită, doar în browser, pentru verificarea și explorarea vremii: căutare mondială de orașe, perspective orare și pe 10 zile, calitatea aerului, condiții animate și prognoze și alerte îmbunătățite de la U.S. National Weather Service.

[Deschide duskline](https://duskline.pages.dev/) · [Politica de confidențialitate](../../privacy.html) · [Termeni de utilizare](../../terms.html)

Fără cont, fără backend propriu, fără identificator publicitar. Limba, unitățile, favoritele și o locație salvată intenționat aproximativă rămân în browser.

## Funcții

- Căutați orice oraș din lume, cu sugestii ușor de folosit de la tastatură
- Salvați favorite și, opțional, folosiți locația (coordonatele sunt rotunjite înainte de a fi stocate sau trimise)
- Condiții actuale, prognoză orară și perspectivă pe 10 zile
- Calitatea aerului
- Pentru locuri din SUA eligibile, prognoze și alerte publice de la National Weather Service
- Cer și precipitații animate în vederea detaliată
- Unități de temperatură, distanță, vânt, precipitații și presiune
- 30 de limbi de interfață, inclusiv arabă și ebraică (de la dreapta la stânga)

## Confidențialitate și date

Cererile meteo pleacă din browser către [Open-Meteo](https://open-meteo.com/) și, pentru locații din SUA, [National Weather Service](https://www.weather.gov/). Dacă folosiți locația, geocodarea inversă merge la BigDataCloud și poate trece la OpenStreetMap Nominatim. Găzduirea și Google Fonts pot vedea date tehnice obișnuite ale cererii.

duskline nu vinde aceste informații. Prognozele sunt pentru planificare și explorare, nu pentru decizii de urgență. Detalii: [Politica de confidențialitate](../../privacy.html) și [Termeni de utilizare](../../terms.html).

## Limbi

Selectorul din aplicație și paginile legale împart aceleași 30 de limbi și preferința `duskline-lang`. Textele legale sunt în `src/js/data/legal/packs/`. Aceste traduceri ale README sunt în [`docs/i18n/`](README.md).

## Dezvoltare

Aplicația este HTML, CSS și scripturi clasice statice — fără bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Verificarea sintaxei fiecărui JS propriu: `npm run check`
- Teste unitare: `npm run test:unit`
- Smoke-urile Playwright simulează API-urile meteo și nu consumă cote reale: `npm test`

## Publicare

Rădăcina depozitului este situl. [Cloudflare Pages](https://duskline.pages.dev/) este gazda principală prevăzută; GitHub Pages este copia de rezervă. Ambele publică fișierele statice ca atare.

## Licență

Codul este [MIT](../../LICENSE). Datele meteo aparțin furnizorilor de mai sus și rămân supuse termenilor lor. Nu pentru siguranța vieții sau urgențe.
