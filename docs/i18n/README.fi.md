<div align="center">
  <img src="../../assets/duskline-icon-512.png" alt="duskline app icon" width="88" height="88">
  <h1>duskline</h1>
  <p>Ilmainen, vain selaimessa toimiva sääsovellus säätilan tarkistamiseen ja tutkimiseen: maailmanlaajuinen kaupunkihaku, tunti- ja 10 päivän näkymät, ilmanlaatu, animoidut olosuhteet sekä täydennetyt U.S. National Weather Service -ennusteet ja -varoitukset.</p>
  <p><a href="https://dusklineweather.pages.dev/">Avaa duskline</a> · <a href="../../privacy.html">Tietosuojakäytäntö</a> · <a href="../../terms.html">Käyttöehdot</a></p>
</div>

<details>
<summary>Lue kielellä</summary>

[English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · **Suomi** · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)
</details>

Ei tiliä, ei omaa taustajärjestelmää, ei mainostunnistetta. Kieli, yksiköt, suosikit ja tahallaan karkea tallennettu sijainti jäävät selaimeen.

## Ominaisuudet

- Hae mitä tahansa kaupunkia maailmassa, näppäimistöystävällisillä ehdotuksilla
- Tallenna suosikkeja ja käytä halutessasi sijaintia (koordinaatit pyöristetään ennen tallennusta tai lähetystä)
- Nykyiset olosuhteet, tunti-ennuste ja 10 päivän näkymä
- Ilmanlaatu
- Kelpoisissa Yhdysvaltain paikoissa National Weather Servicen ennusteet ja julkiset varoitukset
- Animoitu taivas ja sade yksityiskohtanäkymässä
- Lämpötilan, etäisyyden, tuulen, sateen ja paineen yksiköt
- 30 käyttöliittymäkieltä, mukaan lukien arabia ja heprea (oikealta vasemmalle)

## Tietosuoja ja tiedot

Sääpyynnöt lähtevät selaimesta [Open-Meteoon](https://open-meteo.com/) ja Yhdysvaltain sijainneissa [National Weather Serviceen](https://www.weather.gov/). Jos käytät sijaintia, käänteinen geokoodaus menee BigDataCloudille ja voi siirtyä OpenStreetMap Nominatimiin. Isännöinti ja Google Fonts voivat nähdä tavanomaisia teknisiä pyyntötietoja.

duskline ei myy näitä tietoja. Ennusteet ovat suunnittelua ja tutkimista varten, eivät hätäpäätöksiä. Tiedot: [Tietosuojakäytäntö](../../privacy.html) ja [Käyttöehdot](../../terms.html).

## Kielet

Sovelluksen valitsin ja oikeudelliset sivut jakavat samat 30 kieltä ja `duskline-lang`-asetuksen. Oikeudelliset tekstit ovat kansiossa `src/js/data/legal/packs/`. Nämä README-käännökset ovat kansiossa [`docs/i18n/`](README.md).

## Kehitys

Sovellus on staattista HTML:ää, CSS:ää ja klassisia skriptejä — ei bundleria.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Jokaisen oman JS-tiedoston syntaksin tarkistus: `npm run check`
- Yksikkötestit: `npm run test:unit`
- Playwright-savutestit simuloivat säärajapintoja eivätkä kuluta live-kiintiöitä: `npm test`

## Julkaisu

Tietovaraston juuri on sivusto. [Cloudflare Pages](https://dusklineweather.pages.dev/) on tarkoitettu pääisäntä; GitHub Pages on varmuuskopio. Molemmat julkaisevat staattiset tiedostot sellaisinaan.

## Lisenssi

Koodi on [MIT](../../LICENSE). Säätiedot kuuluvat yllä oleville kolmansille osapuolille ja noudattavat heidän ehtojaan. Ei henkeä uhkaaviin tai hätätilanteisiin.
