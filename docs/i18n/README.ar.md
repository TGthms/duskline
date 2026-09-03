<div dir="rtl" lang="ar">

**اقرأ باللغة:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · **العربية** · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

تطبيق طقس مجاني يعمل في المتصفح فقط للاطلاع والاستكشاف: بحث عالمي عن المدن، توقعات ساعية ولعشرة أيام، جودة الهواء، أحوال متحركة، وتوقعات وتنبيهات محسّنة من U.S. National Weather Service.

[فتح duskline](https://duskline.pages.dev/) · [سياسة الخصوصية](../../privacy.html) · [شروط الاستخدام](../../terms.html)

لا حساب ولا خلفية خاصة بنا ولا معرّف إعلاني. تبقى اللغة والوحدات والمفضّلات وموقع محفوظ تقريبًا عن قصد في متصفحك.

## الميزات

- ابحث عن أي مدينة في العالم، مع اقتراحات سهلة للوحة المفاتيح
- احفظ المفضّلات واستخدم موقعك اختياريًا (تُقرَّب الإحداثيات قبل الحفظ أو الإرسال)
- الظروف الحالية والتوقع الساعي والأفق لعشرة أيام
- جودة الهواء
- للأماكن الأمريكية المؤهّلة، توقعات وتنبيهات عامة من National Weather Service
- سماء وهطول متحركان في العرض التفصيلي
- وحدات الحرارة والمسافة والرياح والهطول والضغط
- 30 لغة للواجهة، منها العربية والعبرية (من اليمين إلى اليسار)

## الخصوصية والبيانات

تغادر طلبات الطقس متصفحك إلى [Open-Meteo](https://open-meteo.com/) وإلى [National Weather Service](https://www.weather.gov/) للمواقع الأمريكية. إن استخدمت الموقع، يذهب الترميز الجغرافي العكسي إلى BigDataCloud وقد يعود إلى OpenStreetMap Nominatim. قد ترى الاستضافة وGoogle Fonts بيانات تقنية معتادة للطلب.

لا يبيع duskline هذه المعلومات. التوقعات للتخطيط والاستكشاف لا لقرارات الطوارئ. التفاصيل: [سياسة الخصوصية](../../privacy.html) و[شروط الاستخدام](../../terms.html).

## اللغات

منتقي التطبيق والصفحات القانونية يشتركان في اللغات الثلاثين نفسها وتفضيل `duskline-lang`. النصوص القانونية في `src/js/data/legal/packs/`. ترجمات README هذه في [`docs/i18n/`](README.md).

## التطوير

التطبيق HTML وCSS ونصوص تقليدية ثابتة — بلا حزمة بناء.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- فحص صياغة كل ملف JS خاص: `npm run check`
- اختبارات الوحدة: `npm run test:unit`
- اختبارات Playwright تحاكي واجهات الطقس ولا تستهلك الحصص الحيّة: `npm test`

## النشر

جذر المستودع هو الموقع. [Cloudflare Pages](https://duskline.pages.dev/) هو المضيف الأساسي المقصود؛ GitHub Pages للنسخ الاحتياطي. كلاهما ينشر الملفات الثابتة كما هي.

## الترخيص

الرمز مرخّص [MIT](../../LICENSE). بيانات الطقس تخصّ المزوّدين أعلاه وتخضع لشروطهم. ليست لسلامة الأرواح أو الطوارئ.

</div>
