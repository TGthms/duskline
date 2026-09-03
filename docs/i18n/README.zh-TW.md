**閱讀語言:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · **繁體中文**

# Duskline

免費的純瀏覽器天氣應用程式，用於日常查看與探索：全球城市搜尋、逐小時與 10 日展望、空氣品質、動態天空，以及強化的美國國家氣象局預報與警報。

[開啟 duskline](https://duskline.pages.dev/) · [隱私權政策](../../privacy.html) · [使用條款](../../terms.html)

沒有帳戶、沒有自有後端、沒有廣告識別碼。語言、單位、收藏以及刻意降低精度的儲存位置都留在瀏覽器中。

## 功能

- 搜尋全球任意城市，支援鍵盤操作的建議
- 儲存收藏，可選擇使用位置（座標在儲存或傳送前會取整）
- 目前狀況、逐小時預報與 10 日展望
- 空氣品質
- 符合條件的美國地點可使用國家氣象局預報與公開警報
- 詳細檢視中的動態天空與降水
- 溫度、距離、風、降水與氣壓單位
- 30 種介面語言，包括阿拉伯文與希伯來文（從右到左）

## 隱私與資料

天氣請求由瀏覽器直接發往 [Open-Meteo](https://open-meteo.com/)；美國地點發往 [國家氣象局](https://www.weather.gov/)。若使用位置，反向地理編碼發往 BigDataCloud，失敗時回退到 OpenStreetMap Nominatim。託管與 Google Fonts 可能看到一般技術請求資料。

duskline 不出售這些資訊。預報用於規劃與探索，不用於緊急決策。詳情見 [隱私權政策](../../privacy.html) 與 [使用條款](../../terms.html)。

## 語言

應用程式內選擇器與法律頁面共享同一套 30 種語言和 `duskline-lang` 偏好。法律文案在 `src/js/data/legal/packs/`。這些 README 譯文在 [`docs/i18n/`](README.md)。

## 開發

靜態 HTML、CSS 與傳統指令碼，沒有打包器。

```bash
npm run serve
# http://127.0.0.1:8000/
```

- 檢查每個自有 JS 檔的語法：`npm run check`
- 單元測試：`npm run test:unit`
- Playwright 煙霧測試會模擬天氣 API，不消耗線上配額：`npm test`

## 部署

儲存庫根目錄就是網站。預定的主要託管是 [Cloudflare Pages](https://duskline.pages.dev/)；GitHub Pages 為備份。兩者都按原樣發布靜態檔案。

## 授權

程式碼為 [MIT](../../LICENSE)。天氣資料屬於上述第三方，並受其條款約束。不用於生命安全或緊急用途。
