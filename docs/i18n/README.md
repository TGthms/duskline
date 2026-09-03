# Duskline README translations

The canonical English README is [`README.md`](../../README.md) at the repository root (what GitHub shows by default). Every other locale lives in this folder so the root stays uncluttered.

In the app, the same 30 locales power the language picker and the [privacy](../../privacy.html) / [terms](../../terms.html) pages. Policy strings are JSON packs in `src/js/data/legal/packs/`.

| Language | File |
| --- | --- |
| English | [`README.md`](../../README.md) |
| Español | [`README.es.md`](README.es.md) |
| Français | [`README.fr.md`](README.fr.md) |
| Deutsch | [`README.de.md`](README.de.md) |
| Italiano | [`README.it.md`](README.it.md) |
| Português (Brasil) | [`README.pt-BR.md`](README.pt-BR.md) |
| Português (Portugal) | [`README.pt-PT.md`](README.pt-PT.md) |
| Nederlands | [`README.nl.md`](README.nl.md) |
| Dansk | [`README.da.md`](README.da.md) |
| Svenska | [`README.sv.md`](README.sv.md) |
| Norsk bokmål | [`README.nb.md`](README.nb.md) |
| Suomi | [`README.fi.md`](README.fi.md) |
| Polski | [`README.pl.md`](README.pl.md) |
| Čeština | [`README.cs.md`](README.cs.md) |
| Magyar | [`README.hu.md`](README.hu.md) |
| Română | [`README.ro.md`](README.ro.md) |
| Ελληνικά | [`README.el.md`](README.el.md) |
| Türkçe | [`README.tr.md`](README.tr.md) |
| Русский | [`README.ru.md`](README.ru.md) |
| Українська | [`README.uk.md`](README.uk.md) |
| العربية | [`README.ar.md`](README.ar.md) |
| עברית | [`README.he.md`](README.he.md) |
| हिन्दी | [`README.hi.md`](README.hi.md) |
| ไทย | [`README.th.md`](README.th.md) |
| Tiếng Việt | [`README.vi.md`](README.vi.md) |
| Bahasa Indonesia | [`README.id.md`](README.id.md) |
| 日本語 | [`README.ja.md`](README.ja.md) |
| 한국어 | [`README.ko.md`](README.ko.md) |
| 简体中文 | [`README.zh.md`](README.zh.md) |
| 繁體中文 | [`README.zh-TW.md`](README.zh-TW.md) |

Regenerate the locale files with `node tools/render-readme-i18n.js` after editing the catalog in that script.
