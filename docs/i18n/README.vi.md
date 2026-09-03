**Đọc bằng:** [English](../../README.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Nederlands](README.nl.md) · [Dansk](README.da.md) · [Svenska](README.sv.md) · [Norsk bokmål](README.nb.md) · [Suomi](README.fi.md) · [Polski](README.pl.md) · [Čeština](README.cs.md) · [Magyar](README.hu.md) · [Română](README.ro.md) · [Ελληνικά](README.el.md) · [Türkçe](README.tr.md) · [Русский](README.ru.md) · [Українська](README.uk.md) · [العربية](README.ar.md) · [עברית](README.he.md) · [हिन्दी](README.hi.md) · [ไทย](README.th.md) · **Tiếng Việt** · [Bahasa Indonesia](README.id.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [简体中文](README.zh.md) · [繁體中文](README.zh-TW.md)

# Duskline

Ứng dụng thời tiết miễn phí, chỉ chạy trên trình duyệt, để kiểm tra và khám phá: tìm thành phố toàn cầu, triển vọng theo giờ và 10 ngày, chất lượng không khí, điều kiện chuyển động, cùng dự báo và cảnh báo tăng cường từ U.S. National Weather Service.

[Mở duskline](https://duskline.pages.dev/) · [Chính sách quyền riêng tư](../../privacy.html) · [Điều khoản sử dụng](../../terms.html)

Không tài khoản, không backend riêng, không mã nhận dạng quảng cáo. Ngôn ngữ, đơn vị, mục yêu thích và vị trí đã lưu được làm tròn có chủ đích ở lại trình duyệt.

## Tính năng

- Tìm bất kỳ thành phố nào trên thế giới, với gợi ý dùng được bằng bàn phím
- Lưu mục yêu thích và tùy chọn dùng vị trí (tọa độ được làm tròn trước khi lưu hoặc gửi)
- Điều kiện hiện tại, dự báo theo giờ và tầm nhìn 10 ngày
- Chất lượng không khí
- Với địa điểm Hoa Kỳ đủ điều kiện, dự báo và cảnh báo công cộng từ National Weather Service
- Bầu trời và mưa chuyển động trong chế độ chi tiết
- Đơn vị nhiệt độ, khoảng cách, gió, mưa và áp suất
- 30 ngôn ngữ giao diện, gồm Ả Rập và Do Thái (phải sang trái)

## Quyền riêng tư và dữ liệu

Yêu cầu thời tiết rời trình duyệt tới [Open-Meteo](https://open-meteo.com/) và, với vị trí Hoa Kỳ, [National Weather Service](https://www.weather.gov/). Nếu dùng vị trí, geocoding ngược tới BigDataCloud và có thể về OpenStreetMap Nominatim. Hosting và Google Fonts có thể thấy dữ liệu kỹ thuật thông thường của yêu cầu.

duskline không bán thông tin đó. Dự báo dành cho lập kế hoạch và khám phá, không phải quyết định khẩn cấp. Chi tiết: [Chính sách quyền riêng tư](../../privacy.html) và [Điều khoản sử dụng](../../terms.html).

## Ngôn ngữ

Bộ chọn trong ứng dụng và các trang pháp lý dùng chung 30 ngôn ngữ và tùy chọn `duskline-lang`. Văn bản pháp lý nằm ở `src/js/data/legal/packs/`. Các bản dịch README này nằm ở [`docs/i18n/`](README.md).

## Phát triển

Ứng dụng là HTML, CSS và script cổ điển tĩnh — không có bundler.

```bash
npm run serve
# http://127.0.0.1:8000/
```

- Kiểm tra cú pháp từng JS nội bộ: `npm run check`
- Kiểm thử đơn vị: `npm run test:unit`
- Smoke Playwright giả lập API thời tiết và không dùng hạn ngạch thật: `npm test`

## Triển khai

Thư mục gốc kho chứa là trang web. [Cloudflare Pages](https://duskline.pages.dev/) là máy chủ chính dự kiến; GitHub Pages là bản sao lưu. Cả hai xuất bản tệp tĩnh nguyên trạng.

## Giấy phép

Mã nguồn là [MIT](../../LICENSE). Dữ liệu thời tiết thuộc các nhà cung cấp trên và tuân theo điều khoản của họ. Không dùng cho an toàn tính mạng hay khẩn cấp.
