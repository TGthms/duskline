**언어:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · **한국어** · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

무료 브라우저 전용 날씨 앱. 전 세계 도시 검색, 시간별 및 10일 전망, 대기질, 애니메이션 하늘, 미국 National Weather Service 예보와 경보.

[duskline 열기](https://dusklineweather.pages.dev/) · [개인정보 처리방침](../../privacy.html) · [이용약관](../../terms.html)

계정, 자체 백엔드, 광고 식별자가 없습니다. 언어, 단위, 즐겨찾기, 의도적으로 대략적인 저장 위치는 브라우저에 남습니다.

## 기능

- 전 세계 도시 검색, 키보드로 쓸 수 있는 제안
- 즐겨찾기 저장과 선택적 위치 사용(좌표는 저장·전송 전에 반올림)
- 현재 상태, 시간별 예보, 10일 전망
- 대기질
- 해당하는 미국 장소의 National Weather Service 예보와 공개 경보
- 상세 보기의 애니메이션 하늘과 강수
- 기온, 거리, 바람, 강수, 기압 단위
- 아랍어와 히브리어(오른쪽에서 왼쪽)를 포함한 30개 인터페이스 언어

## 개인정보와 데이터

날씨 요청은 브라우저에서 [Open-Meteo](https://open-meteo.com/)로, 미국 위치는 [National Weather Service](https://www.weather.gov/)로 바로 갑니다. 위치를 쓰면 역지오코딩은 BigDataCloud, 실패 시 OpenStreetMap Nominatim입니다. 호스팅과 Google Fonts는 일반적인 기술 요청 데이터를 볼 수 있습니다.

duskline은 그 정보를 판매하지 않습니다. 예보는 계획과 탐색용이며 긴급 결정용이 아닙니다. 자세한 내용: [개인정보 처리방침](../../privacy.html), [이용약관](../../terms.html).

## 언어

앱의 언어 선택과 법률 페이지는 같은 30개 로케일과 `duskline-lang` 설정을 공유합니다. 법률 문구는 `src/js/data/legal/packs/`에 있습니다. 이 README 번역은 [`docs/i18n/`](README.md)에 있습니다.

## 개발

정적 HTML, CSS, 클래식 스크립트이며 번들러가 없습니다.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- 자체 JS 구문 검사: `npm run check`
- 단위 테스트: `npm run test:unit`
- Playwright 스모크는 날씨 API를 모의하며 실제 할당량을 쓰지 않습니다: `npm test`

## 배포

저장소 루트가 사이트입니다. 주 호스트는 [Cloudflare Pages](https://dusklineweather.pages.dev/), GitHub Pages는 백업입니다. 둘 다 정적 파일을 그대로 게시합니다.

## 라이선스

코드는 [MIT](../../LICENSE)입니다. 날씨 데이터는 위 제공업체의 것이며 해당 약관을 따릅니다. 생명 안전이나 긴급 용도가 아닙니다.
