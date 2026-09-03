<div dir="rtl" lang="he">

**קראו ב:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · **עברית** · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

יישום מזג אוויר חינמי שרץ רק בדפדפן, לבדיקה ולחקירה: חיפוש ערים עולמי, תחזיות שעתיות ו־10 ימים, איכות אוויר, תנאים מונפשים ותחזיות והתראות משופרות של U.S. National Weather Service.

[פתיחת duskline](https://duskline.pages.dev/) · [מדיניות פרטיות](../../privacy.html) · [תנאי שימוש](../../terms.html)

אין חשבון, אין שרת אחורי משלנו ואין מזהה פרסום. השפה, היחידות, המועדפים ומיקום שמור במכוון מקורב נשארים בדפדפן.

## יכולות

- חפשו כל עיר בעולם, עם הצעות נוחות למקלדת
- שמרו מועדפים והשתמשו במיקום לפי בחירה (הקואורדינטות מעוגלות לפני שמירה או שליחה)
- תנאים נוכחיים, תחזית שעתית ואופק של 10 ימים
- איכות אוויר
- למקומות בארה״ב הזכאים, תחזיות והתראות ציבוריות של National Weather Service
- שמים ומשקעים מונפשים בתצוגה המפורטת
- יחידות טמפרטורה, מרחק, רוח, משקעים ולחץ
- 30 שפות ממשק, כולל ערבית ועברית (מימין לשמאל)

## פרטיות ונתונים

בקשות מזג האוויר יוצאות מהדפדפן אל [Open-Meteo](https://open-meteo.com/) ואל [National Weather Service](https://www.weather.gov/) למקומות בארה״ב. אם משתמשים במיקום, geocoding הפוך הולך ל־BigDataCloud ועשוי ליפול ל־OpenStreetMap Nominatim. אירוח ו־Google Fonts עשויים לראות נתוני בקשה טכניים רגילים.

duskline אינו מוכר מידע זה. התחזיות הן לתכנון ולחקירה, לא להחלטות חירום. פרטים: [מדיניות פרטיות](../../privacy.html) ו[תנאי שימוש](../../terms.html).

## שפות

בורר השפה באפליקציה והדפים המשפטיים חולקים את אותן 30 שפות ואת ההעדפה `duskline-lang`. הטקסטים המשפטיים נמצאים ב־`src/js/data/legal/packs/`. תרגומי README אלה נמצאים ב־[`docs/i18n/`](README.md).

## פיתוח

האפליקציה היא HTML, CSS וסקריפטים קלאסיים סטטיים — בלי bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- בדיקת תחביר לכל JS פנימי: `npm run check`
- בדיקות יחידה: `npm run test:unit`
- בדיקות Playwright מדמות את ממשקי מזג האוויר ואינן צורכות מכסות חיות: `npm test`

## פרסום

שורש המאגר הוא האתר. [Cloudflare Pages](https://duskline.pages.dev/) הוא המארח העיקרי המיועד; GitHub Pages הוא הגיבוי. שניהם מפרסמים את הקבצים הסטטיים כפי שהם.

## רישיון

הקוד ברישיון [MIT](../../LICENSE). נתוני מזג האוויר שייכים לספקים שלמעלה וכפופים לתנאיהם. לא לבטיחות חיים ולא לחירום.

</div>
