**阅读语言:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **简体中文** · [繁體中文](README.zh-TW.md)

# Duskline

免费的纯浏览器天气应用，用于日常查看与探索：全球城市搜索、逐小时与 10 日展望、空气质量、动态天空，以及增强的美国国家气象局预报与警报。

[打开 duskline](https://dusklineweather.pages.dev/) · [隐私政策](../../privacy.html) · [使用条款](../../terms.html)

没有账户、没有自有后端、没有广告标识符。语言、单位、收藏以及有意降低精度的保存位置都留在浏览器中。

## 功能

- 搜索全球任意城市，支持键盘操作的建议
- 保存收藏，可选使用位置（坐标在存储或发送前会取整）
- 当前状况、逐小时预报与 10 日展望
- 空气质量
- 符合条件的美国地点可使用国家气象局预报与公共警报
- 详细视图中的动态天空与降水
- 温度、距离、风、降水与气压单位
- 30 种界面语言，包括阿拉伯语和希伯来语（从右到左）

## 隐私与数据

天气请求由浏览器直接发往 [Open-Meteo](https://open-meteo.com/)；美国地点发往 [国家气象局](https://www.weather.gov/)。若使用位置，反向地理编码发往 BigDataCloud，失败时回退到 OpenStreetMap Nominatim。托管与 Google Fonts 可能看到常规技术请求数据。

duskline 不出售这些信息。预报用于规划与探索，不用于紧急决策。详情见 [隐私政策](../../privacy.html) 与 [使用条款](../../terms.html)。

## 语言

应用内选择器与法律页面共享同一套 30 种语言和 `duskline-lang` 偏好。法律文案在 `src/js/data/legal/packs/`。这些 README 译文在 [`docs/i18n/`](README.md)。

## 开发

静态 HTML、CSS 与传统脚本，没有打包器。

```bash
npm run serve
# http://127.0.0.1:8000/
```

- 检查每个自有 JS 文件的语法：`npm run check`
- 单元测试：`npm run test:unit`
- Playwright 冒烟测试会模拟天气 API，不消耗线上配额：`npm test`

## 部署

仓库根目录就是站点。预定的主托管是 [Cloudflare Pages](https://dusklineweather.pages.dev/)；GitHub Pages 为备份。两者都按原样发布静态文件。

## 许可

代码为 [MIT](../../LICENSE)。天气数据属于上述第三方，并受其条款约束。不用于生命安全或紧急用途。
