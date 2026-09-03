**Czytaj po:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · **Polski** · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Darmowa, wyłącznie przeglądarkowa aplikacja pogodowa do sprawdzania i odkrywania pogody: światowe wyszukiwanie miast, widoki godzinowe i 10-dniowe, jakość powietrza, animowane warunki oraz rozszerzone prognozy i alerty U.S. National Weather Service.

[Otwórz duskline](https://duskline.pages.dev/) · [Polityka prywatności](../../privacy.html) · [Warunki korzystania](../../terms.html)

Bez konta, bez własnego backendu, bez identyfikatora reklamowego. Język, jednostki, ulubione i celowo przybliżona zapisana lokalizacja zostają w przeglądarce.

## Funkcje

- Szukaj dowolnego miasta na świecie, z podpowiedziami wygodnymi z klawiatury
- Zapisuj ulubione i opcjonalnie używaj lokalizacji (współrzędne są zaokrąglane przed zapisem lub wysłaniem)
- Aktualne warunki, prognoza godzinowa i perspektywa 10-dniowa
- Jakość powietrza
- Dla kwalifikujących się miejsc w USA prognozy i publiczne alerty National Weather Service
- Animowane niebo i opady w widoku szczegółowym
- Jednostki temperatury, odległości, wiatru, opadów i ciśnienia
- 30 języków interfejsu, w tym arabski i hebrajski (od prawej do lewej)

## Prywatność i dane

Żądania pogodowe wychodzą z przeglądarki do [Open-Meteo](https://open-meteo.com/) oraz, dla lokalizacji w USA, do [National Weather Service](https://www.weather.gov/). Jeśli używasz lokalizacji, odwrotne geokodowanie idzie do BigDataCloud i może wrócić do OpenStreetMap Nominatim. Hosting i Google Fonts mogą widzieć zwykłe techniczne dane żądania.

duskline nie sprzedaje tych informacji. Prognozy służą planowaniu i eksploracji, nie decyzjom awaryjnym. Szczegóły: [Polityka prywatności](../../privacy.html) i [Warunki korzystania](../../terms.html).

## Języki

Selektor w aplikacji i strony prawne współdzielą te same 30 języków i preferencję `duskline-lang`. Teksty prawne są w `src/js/data/legal/packs/`. Te tłumaczenia README są w [`docs/i18n/`](README.md).

## Rozwój

Aplikacja to statyczny HTML, CSS i klasyczne skrypty — bez bundlera.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Sprawdzenie składni każdego własnego JS: `npm run check`
- Testy jednostkowe: `npm run test:unit`
- Smoke Playwright mockuje API pogodowe i nie zużywa żywych limitów: `npm test`

## Wdrożenie

Korzeń repozytorium jest witryną. [Cloudflare Pages](https://duskline.pages.dev/) to planowany główny host; GitHub Pages to kopia zapasowa. Oba publikują pliki statyczne bez zmian.

## Licencja

Kod jest na licencji [MIT](../../LICENSE). Dane pogodowe należą do wymienionych dostawców i podlegają ich warunkom. Nie do bezpieczeństwa życia ani sytuacji awaryjnych.
