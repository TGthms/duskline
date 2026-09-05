**Dil:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · **Türkçe** · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Ücretsiz, yalnızca tarayıcıda çalışan bir hava durumu uygulaması: dünya çapında şehir araması, saatlik ve 10 günlük görünüm, hava kalitesi, animasyonlu koşullar ve geliştirilmiş U.S. National Weather Service tahminleri ile uyarıları.

[duskline’ı aç](https://dusklineweather.pages.dev/) · [Gizlilik Politikası](../../privacy.html) · [Kullanım Koşulları](../../terms.html)

Hesap yok, kendi arka ucumuz yok, reklam tanımlayıcısı yok. Dil, birimler, favoriler ve kasıtlı olarak yaklaşık kaydedilmiş konum tarayıcınızda kalır.

## Özellikler

- Dünyadaki herhangi bir şehri arayın, klavyeyle kullanılabilir önerilerle
- Favorileri kaydedin ve isteğe bağlı konum kullanın (koordinatlar saklanmadan veya gönderilmeden önce yuvarlanır)
- Güncel koşullar, saatlik tahmin ve 10 günlük görünüm
- Hava kalitesi
- Uygun ABD yerleri için National Weather Service tahminleri ve kamuya açık uyarılar
- Ayrıntılı görünümde animasyonlu gökyüzü ve yağış
- Sıcaklık, mesafe, rüzgar, yağış ve basınç birimleri
- Arapça ve İbranice (sağdan sola) dahil 30 arayüz dili

## Gizlilik ve veriler

Hava istekleri tarayıcınızdan [Open-Meteo](https://open-meteo.com/)’ya ve ABD konumları için [National Weather Service](https://www.weather.gov/)’e gider. Konum kullanırsanız ters jeokodlama BigDataCloud’a gider, başarısız olursa OpenStreetMap Nominatim’e düşebilir. Barındırma ve Google Fonts olağan teknik istek verilerini görebilir.

duskline bu bilgileri satmaz. Tahminler planlama ve keşif içindir, acil durum kararları için değil. Ayrıntılar: [Gizlilik Politikası](../../privacy.html) ve [Kullanım Koşulları](../../terms.html).

## Diller

Uygulamadaki seçici ve yasal sayfalar aynı 30 dili ve `duskline-lang` tercihini paylaşır. Yasal metinler `src/js/data/legal/packs/` altındadır. Bu README çevirileri [`docs/i18n/`](README.md) altındadır.

## Geliştirme

Uygulama statik HTML, CSS ve klasik betiklerdir — paketleyici yoktur.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Her birinci taraf JS dosyasının sözdizimi denetimi: `npm run check`
- Birim testleri: `npm run test:unit`
- Playwright duman testleri hava API’lerini sahteleyerek canlı kotayı tüketmez: `npm test`

## Yayımlama

Depo kökü sitedir. [Cloudflare Pages](https://dusklineweather.pages.dev/) amaçlanan birincil barındırıcıdır; GitHub Pages yedektir. İkisi de statik dosyaları olduğu gibi yayımlar.

## Lisans

Kod [MIT](../../LICENSE) lisanslıdır. Hava verileri yukarıdaki üçüncü taraflara aittir ve onların koşullarına tabidir. Can güvenliği veya acil kullanım için değildir.
