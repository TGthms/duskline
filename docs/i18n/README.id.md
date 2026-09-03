**Baca dalam:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · **Bahasa Indonesia** · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Aplikasi cuaca gratis yang hanya berjalan di peramban, untuk memeriksa dan menjelajahi cuaca: pencarian kota di seluruh dunia, pandangan per jam dan 10 hari, kualitas udara, kondisi beranimasi, serta prakiraan dan peringatan U.S. National Weather Service yang diperkaya.

[Buka duskline](https://duskline.pages.dev/) · [Kebijakan Privasi](../../privacy.html) · [Ketentuan Penggunaan](../../terms.html)

Tidak ada akun, backend sendiri, atau pengenal iklan. Bahasa, satuan, favorit, dan lokasi tersimpan yang sengaja didekati tetap di peramban Anda.

## Fitur

- Cari kota mana pun di dunia, dengan saran yang ramah papan ketik
- Simpan favorit dan gunakan lokasi secara opsional (koordinat dibulatkan sebelum disimpan atau dikirim)
- Kondisi saat ini, prakiraan per jam, dan pandangan 10 hari
- Kualitas udara
- Untuk tempat AS yang memenuhi syarat, prakiraan dan peringatan publik National Weather Service
- Langit dan curah hujan beranimasi di tampilan terperinci
- Satuan suhu, jarak, angin, curah hujan, dan tekanan
- 30 bahasa antarmuka, termasuk Arab dan Ibrani (kanan ke kiri)

## Privasi dan data

Permintaan cuaca keluar dari peramban ke [Open-Meteo](https://open-meteo.com/) dan, untuk lokasi AS, [National Weather Service](https://www.weather.gov/). Jika Anda memakai lokasi, geocoding terbalik ke BigDataCloud dan dapat jatuh ke OpenStreetMap Nominatim. Hosting dan Google Fonts dapat melihat data permintaan teknis biasa.

duskline tidak menjual informasi itu. Prakiraan untuk perencanaan dan penjelajahan, bukan keputusan darurat. Rincian: [Kebijakan Privasi](../../privacy.html) dan [Ketentuan Penggunaan](../../terms.html).

## Bahasa

Pemilih di aplikasi dan halaman hukum berbagi 30 bahasa yang sama dan preferensi `duskline-lang`. Teks hukum ada di `src/js/data/legal/packs/`. Terjemahan README ini ada di [`docs/i18n/`](README.md).

## Pengembangan

Aplikasi ini HTML, CSS, dan skrip klasik statis — tanpa bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Periksa sintaksis setiap JS pihak pertama: `npm run check`
- Uji unit: `npm run test:unit`
- Smoke Playwright meniru API cuaca dan tidak memakai kuota langsung: `npm test`

## Penerbitan

Akar repositori adalah situsnya. [Cloudflare Pages](https://duskline.pages.dev/) adalah host utama yang dimaksud; GitHub Pages cadangan. Keduanya menerbitkan berkas statis apa adanya.

## Lisensi

Kode berlisensi [MIT](../../LICENSE). Data cuaca milik penyedia di atas dan tunduk pada ketentuan mereka. Bukan untuk keselamatan jiwa atau darurat.
