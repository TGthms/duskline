**言語:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · **日本語** · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

無料のブラウザ専用天気アプリ。世界の都市検索、1時間ごとと10日の見通し、大気質、アニメーションの空、そして米国 National Weather Service の強化された予報と警報。

[duskline を開く](https://dusklineweather.pages.dev/) · [プライバシーポリシー](../../privacy.html) · [利用規約](../../terms.html)

アカウントも独自バックエンドも広告識別子もありません。言語、単位、お気に入り、意図的に粗くした保存位置はブラウザ内に残ります。

## 機能

- 世界中の都市を検索。キーボードで使える候補
- お気に入りの保存と、任意の現在地（座標は保存・送信前に丸めます）
- 現在の状況、時間予報、10日見通し
- 大気質
- 対象となる米国の地点では National Weather Service の予報と公開警報
- 詳細ビューのアニメーションの空と降水
- 気温・距離・風・降水・気圧の単位
- アラビア語とヘブライ語（右から左）を含む 30 のインターフェース言語

## プライバシーとデータ

天気リクエストはブラウザから [Open-Meteo](https://open-meteo.com/) へ、米国の地点では [National Weather Service](https://www.weather.gov/) へ直接送られます。位置情報を使う場合の逆ジオコーディングは BigDataCloud、失敗時は OpenStreetMap Nominatim です。ホスティングと Google Fonts は通常の技術的リクエストデータを見ることがあります。

duskline はこの情報を販売しません。予報は計画と探索のためであり、緊急判断用ではありません。詳細は [プライバシーポリシー](../../privacy.html) と [利用規約](../../terms.html)。

## 言語

アプリ内の言語選択と法務ページは同じ 30 ロケールと `duskline-lang` 設定を共有します。法務文面は `src/js/data/legal/packs/` にあります。これらの README 翻訳は [`docs/i18n/`](README.md) にあります。

## 開発

静的な HTML・CSS・クラシックスクリプトで、バンドラはありません。

```bash
npm run serve
# http://127.0.0.1:8000/
```

- 自前 JS の構文チェック: `npm run check`
- ユニットテスト: `npm run test:unit`
- Playwright のスモークは天気 API をモックし、本番枠を消費しません: `npm test`

## 公開

リポジトリのルートがサイトです。想定の主ホストは [Cloudflare Pages](https://dusklineweather.pages.dev/)、GitHub Pages は予備です。どちらも静的ファイルをそのまま公開します。

## ライセンス

コードは [MIT](../../LICENSE) です。天気データは上記の第三者に帰属し、各規約に従います。生命の安全や緊急用途ではありません。
