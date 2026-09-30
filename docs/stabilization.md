# September 2026 stabilization

Reviewed the fresh independent audit of revision `3964f4d` against the repository and implemented a focused stabilization pass.

## Safari update failure

Cloudflare Pages returns `308 Location: /` for `/index.html`. The v51 worker precached that followed response and returned its redirect metadata to a navigation after Update. Safari rejects that response. v55 reconstructs shell responses during installation and document responses before serving them; status, body, and headers are preserved. Extensionless legal URLs resolve to their cached documents. Updates still activate only on user request.

The Update notice now has its own status element, so a weather notification cannot erase it. Repeated activation is prevented and worker-script HTTP caching is bypassed during update checks.

Regression coverage uses a redirecting HTTP host, a legacy worker with the v51 navigation behavior, the actual current worker, the Update button, online reload, host outage, legal navigation, locale retention, and locale eviction. A host outage is used for WebKit because Playwright's `setOffline` bypasses workers during navigation; the Chromium test still exercises the browser offline switch and saved forecasts.

## Audit findings addressed

- **01:** Shell precache reduced from 120 to 58 assets, approximately 2.49 to 1.49 MiB raw and 993 to 636 KiB gzip (36% compressed reduction). Build-only weather catalogs and unused language packs are excluded. English stays available; other weather/legal packs are retained on demand in a separate cache limited to eight packs. The active pack is retained after initial worker installation.
- **02–03:** Added 27 recovery, alert, motion, offline/map, and update strings to all 30 source locales. Coverage tests inspect source catalogs before English fallbacks are merged. CI regenerates packs and rejects drift.
- **04–05:** CI runs all four configured browser projects. GitHub Pages follows successful CI, checks out that exact revision, and rejects superseded revisions. Both hosts are retained. Cloudflare dashboard automatic publishing and GitHub branch protection are external configuration and are not changed by repository workflows.
- **06:** The fallback air quality scale says `US AQI`, independent of the city's country.
- **07–09:** Search deduplicates equivalent name/country/coordinate records, preserves richer labels, cancels superseded requests and closed-panel debounces, and ignores superseded selections. A new primary city is persisted only after validating a current temperature. Failure preserves the previous primary and offers Retry.
- **10:** Rate-limit retries respect numeric and HTTP-date `Retry-After`, otherwise use bounded exponential timing with jitter. Waits are cancellable.
- **12:** Coarse-pointer mode increases mode-switch, reorder, alert Retry, primary-place, and toast action hit areas to 44 pixels.
- **13:** Node 20+ is consistent in package metadata, lockfile, README, `.nvmrc`, and CI.
- **16:** Alert response keys use resolved country and region IDs. Unmatched region spellings share the country response cache.

## Remaining work

The audit's broader coordinator decomposition, visual baseline program, breakpoint consolidation, and real-device acceptance matrix remain follow-up work. Search identity and provider timing are now separate tested pure policies; a wholesale coordinator rewrite was avoided during this reliability fix.

HTTP alert links remain permitted by the existing protocol allowlist, with escaped output and `noopener noreferrer`; the audit describes HTTPS-only links as an optional product decision, not a vulnerability.

This change does not claim production deployment, remote CI success, Cloudflare deployment gating, or a real-device Safari/Android sign-off. The local Firefox process cannot launch on this macOS host; CI runs Firefox on Linux. If an old Safari installation is already stuck, close all duskline tabs/windows and reopen after the fix is published. Clearing only this site's website data is a last resort and removes local preferences.

## Primary-city design and live browser review

The primary card uses a compact, stacked weather summary: city and temperature on the left; weather icon, condition, and high/low on the right. A full-width hourly strip and five upcoming daily rows follow. Thin divider lines keep the hierarchy clear without nested panels. Spacious screens show the eight-hour outlook and five-day preview side by side, while phones and portrait tablets use a scrollable hourly timeline above the daily rows. The card uses the city’s weather palette and caps its desktop width at 1000 pixels. Eight hourly readings, condition icons, precipitation probabilities, saved-state labeling, loading, and recovery remain available. At phone widths the strip scrolls inside the card; Arrow keys and Home/End work explicitly across engines, including right-to-left layouts.

A separate localhost origin was reviewed interactively with live providers in the browser at 1440 × 1000 and 390 × 844. The actual Update button activated the new worker and returned to a working app. Paris returned public thunderstorm alerts. Primary selection, French copy, hourly date/feels-like changes, forecast navigation, and online map layers were checked. The browser review also found and corrected a stale Today temperature-range explanation after switching forecast dates. Its context now follows the selected date and actual/feels-like mode.

Regression checks cover the primary layout at 320, 390, and 768 pixels, internal keyboard scrolling, recovery, date context, and redirecting-host upgrades across Chromium, desktop WebKit, and phone-sized WebKit. These emulated widths do not replace physical-device testing.

The final visual pass adapts Kit’s 2-pixel header progress indicator for Horizon/My Sky switching. The selected view changes immediately; the old page fade and layout-shifting loading row are removed. Motion preferences keep the bar static when appropriate. An uncached primary forecast uses a reserved skeleton, and the hourly strip keeps its height during enrichment. Browser tests cover fourteen viewport widths, complete precipitation labels, long city names, daily-preview navigation, and rapid/reduced-motion switching.
