**อ่านเป็น:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · **ไทย** · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

แอปสภาพอากาศฟรีที่ทำงานในเบราว์เซอร์เท่านั้น สำหรับตรวจและสำรวจอากาศ: ค้นหาเมืองทั่วโลก รายชั่วโมงและ 10 วัน คุณภาพอากาศ สภาพเคลื่อนไหว และพยากรณ์กับคำเตือนเสริมจาก U.S. National Weather Service

[เปิด duskline](https://duskline.pages.dev/) · [นโยบายความเป็นส่วนตัว](../../privacy.html) · [ข้อกำหนดการใช้งาน](../../terms.html)

ไม่มีบัญชี ไม่มีแบ็กเอนด์ของเราเอง ไม่มีตัวระบุโฆษณา ภาษา หน่วย รายการโปรด และตำแหน่งที่บันทึกแบบประมาณโดยตั้งใจอยู่ในเบราว์เซอร์ของคุณ

## คุณสมบัติ

- ค้นหาเมืองใดก็ได้ทั่วโลก พร้อมคำแนะนำที่ใช้คีย์บอร์ดได้
- บันทึกรายการโปรด และใช้ตำแหน่งได้ตามต้องการ (พิกัดจะถูกปัดก่อนบันทึกหรือส่ง)
- สภาพปัจจุบัน พยากรณ์รายชั่วโมง และมุมมอง 10 วัน
- คุณภาพอากาศ
- สำหรับสถานที่ในสหรัฐฯ ที่เข้าเกณฑ์ พยากรณ์และคำเตือนสาธารณะจาก National Weather Service
- ท้องฟ้าและหยาดน้ำฟ้าเคลื่อนไหวในมุมมองรายละเอียด
- หน่วยอุณหภูมิ ระยะทาง ลม หยาดน้ำฟ้า และความกดอากาศ
- 30 ภาษาของส่วนติดต่อ รวมอาหรับและฮีบรู (ขวาไปซ้าย)

## ความเป็นส่วนตัวและข้อมูล

คำขอสภาพอากาศออกจากเบราว์เซอร์ไปยัง [Open-Meteo](https://open-meteo.com/) และสำหรับสถานที่ในสหรัฐฯ ไปยัง [National Weather Service](https://www.weather.gov/) หากใช้ตำแหน่ง การถอดรหัสพิกัดย้อนกลับไปที่ BigDataCloud และอาจถอยไป OpenStreetMap Nominatim การโฮสต์และ Google Fonts อาจเห็นข้อมูลคำขอทางเทคนิคทั่วไป

duskline ไม่ขายข้อมูลนั้น พยากรณ์มีไว้เพื่อวางแผนและสำรวจ ไม่ใช่การตัดสินใจฉุกเฉิน รายละเอียด: [นโยบายความเป็นส่วนตัว](../../privacy.html) และ [ข้อกำหนดการใช้งาน](../../terms.html)

## ภาษา

ตัวเลือกในแอปและหน้ากฎหมายใช้ 30 ภาษาเดียวกันและการตั้งค่า `duskline-lang` ข้อความกฎหมายอยู่ที่ `src/js/data/legal/packs/` คำแปล README เหล่านี้อยู่ที่ [`docs/i18n/`](README.md)

## การพัฒนา

แอปเป็น HTML, CSS และสคริปต์คลาสสิกแบบคงที่ — ไม่มีตัวรวมไฟล์

```bash
npm run serve
# http://127.0.0.1:8000/
```

- ตรวจไวยากรณ์ JS ของเราทุกไฟล์: `npm run check`
- การทดสอบหน่วย: `npm run test:unit`
- ควันทดสอบ Playwright จำลอง API สภาพอากาศและไม่ใช้โควตาจริง: `npm test`

## การเผยแพร่

รากของที่เก็บคือเว็บไซต์ [Cloudflare Pages](https://duskline.pages.dev/) เป็นโฮสต์หลักที่ตั้งใจไว้ GitHub Pages เป็นสำรอง ทั้งคู่เผยแพร่ไฟล์สถิตตามเดิม

## สัญญาอนุญาต

โค้ดเป็น [MIT](../../LICENSE) ข้อมูลสภาพอากาศเป็นของผู้ให้บริการข้างต้นและอยู่ภายใต้ข้อกำหนดของพวกเขา ไม่สำหรับความปลอดภัยของชีวิตหรือเหตุฉุกเฉิน
