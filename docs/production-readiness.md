# October 2026 product release checks

This release implements the repository product audit in ordered commits on `main`. My Sky and Horizon have equal product priority. It does not change the hosting configuration or claim that local commits have been deployed.

## Implemented audit scope

- City-scoped full refresh, including searched places and pins; optional AQI no longer blocks weather.
- Request/view generation guards, missing AQI handling, explicit daily provider precedence and bounded concurrent batch recovery.
- Shared date-aware temperature/precipitation sheets, fixed probability axes, selected-hour actions, preserved scroll/focus and expired offline outlook handling.
- Original-tap activation with optional iOS haptics, retained switch hosts, mobile text-selection suppression, direct horizontal scrubbing and flexible mode controls.
- Empty/unsupported alert cards removed; actual alerts and compact failure recovery retained.
- Atlas-first map startup, context-loss recovery, stable geographic samples, local interpolation, bounded sample reuse, global US AQI layer, map search/value inspection, keyboard access, history and short-screen layouts.
- Distinct AQI/freezing-rain icons, compact My Sky greeting, contextual rain-window/accumulation planning, primary-place day/night atmosphere, geographic Horizon labels and preserved discovery scope/scroll.
- Focused place management with deletion/Undo and primary selection; explicit capacity feedback.
- Offline Public Sans subsets, raster maskable icons, mobile installation guidance, update checks on resume, stalled activation recovery and deferred snapshot writes with lifecycle flushes.
- Separate city-refresh, forecast-sheet, AQI and planning boundaries; consolidated toolbar/interaction CSS; documented data contracts and deterministic visual baselines.

## Automated and visual checks

Syntax, units, provider/data fixtures, Chromium, desktop/mobile WebKit, Firefox where the runtime supports it, offline worker upgrades, locale regeneration and screenshot comparisons must pass on the final revision. The visual suite covers 320px/430px phones, tablet, desktop, landscape, clear/rain, light/dark, forecast/precipitation sheets, RTL and the map. Baselines are reviewed artifacts, not evidence of physical-device haptics.

Final local results (October 6, 2026):

| Check | Result |
| --- | --- |
| First-party JavaScript syntax | 78 files checked |
| Unit and content tests | 100 passed; none skipped |
| Complete Chromium suite | 164 passed, including 22 visual cases comparing 24 reviewed PNGs |
| Complete desktop/mobile WebKit suites | 282 passed; 46 intentional skips (44 Chromium visual cases and two offline-toggle cases) |
| Locale regeneration | No generated-file drift |
| Git whitespace checks | Passed |

Provider responses in browser tests are fixtures. Screenshots were compared without updating baselines or loosening tolerances. Real worker-upgrade tests cover a host outage as well as online activation; the separate browser offline-toggle navigation test runs only in Chromium.

The raster benchmark measures CPU interpolation only. The new field is validated against analytical local-cell fixtures rather than frozen pixels from the old interpolation. Forecast accuracy still depends on provider model resolution and coverage.

Local Firefox could not launch in this macOS execution environment: its sandbox extension was denied and its software framebuffer could not initialize. No Firefox assertion ran, so this is not a Firefox pass. The existing Linux Firefox CI job remains a release gate.

## Physical-device acceptance still required

The user-reported target is **iOS 27.0.1, installed Home Screen PWA**. Desktop WebKit and user-agent shims do not certify that exact device/OS or actual vibration hardware. After deploying the final successful revision and accepting its Update prompt, verify on that device:

1. Cold launch → first My Sky tap activates once, with no second tap required.
2. Cold and warm Map opens show the atlas immediately and detailed geography without an extra tap; background/resume and orientation changes remain usable.
3. Horizontal chart scrubbing and hourly scrolling produce no selection/copy menu; vertical scrolling still works; alert descriptions/share fields remain copyable.
4. Full/Reduced/Off haptic preferences, save/remove, refresh, sheet dismissal and VoiceOver produce one action each.
5. Refresh a searched city and a saved city; weather, forecast sheets, AQI and alerts settle without losing valid data or reopening a dismissed city.
6. Update from a prior installed worker; relaunch offline with saved forecasts and local fonts. Confirm long-lived resume checks and safe recovery when an update stalls.

Production CI status, Cloudflare deployment gating and the actual deployment are external checks. Cloudflare Git-connected deployments must be gated equivalently to repository CI; GitHub Pages' successful-CI publishing cannot configure Cloudflare settings.

## October 7 follow-up

The map search bar and persistent “View weather here” button were removed at the user's request. Right-click/long-press place actions remain; keyboard users can open them with Enter, the context-menu key or Shift+F10 while the map is focused. The reclaimed row increases map space. Hourly strips fit their contents and allow internal horizontal scrolling only; the surrounding page still scrolls vertically. Loading placeholders reserve the same space as the loaded detail timeline.

City Back restores an opaque map beneath the exiting detail in the same frame, preserving camera, layer and forecast-hour selection without adding a history entry. Ready map renderers are retained for up to two foreground minutes while closed; backgrounding releases them immediately. Startup installs weather layers at style readiness and reveals detailed geography after geographic features paint, without waiting for every optional source or label. Individual tile/glyph failures preserve the usable map. Retryable failures get two actual recovery attempts, after three and twelve seconds; backgrounding pauses recovery without spending an attempt, and close cancels it.

Live OpenFreeMap geography, right-click city opening, direct return and final map dismissal were checked in the in-app browser. Browser fixtures separately verify partial-source loading, isolated errors, recovery limits, return-frame opacity, history, focus, hourly sizing and resource cleanup. Only the reviewed landscape-map baseline was updated for the requested UI removal. The user's prior test adjustments and visual tolerances were preserved. Physical iOS 27.0.1 installed-PWA acceptance remains required.

Follow-up validation: 78 syntax checks and 100 unit tests passed; the complete Chromium suite passed 177 tests, including all 22 visual cases. The affected desktop/mobile WebKit suite passed 62 checks (two Chromium-only visual cases skipped). The focused native-feedback and background/recovery-budget regressions also passed separately in Chromium, desktop WebKit and mobile WebKit. The native-tick observer now waits for initial fixture enrichment to settle before attaching; its exact one-trusted-tick assertion remains intact.

## October 9 notification release

The new notification service replaces handwritten cryptography and the non-atomic KV index with a pinned RFC 8291/8292 transport and transactional D1 records. Default-entrypoint Worker RPC keeps the private key out of Pages/browser code. Subscription capabilities, strict provider/key validation, origin checks, bounded requests and rate limits protect the public registration routes. Polling has a Free-tier query budget, grouped locations, bounded sends, immediate delivery acknowledgement and indexed retention. An unused service makes two bounded indexed reads per minute, with writes only to collect expired rate-limit buckets. No legacy migration is needed: the owner confirmed there are no existing users, and the aggregate production check found zero subscriptions.

Settings now renders notifications explicitly on every opening, follows the actual My Sky primary city or selected saved US places, and separates permission/browser/server state. It supports severity/type filters, updates, timezone-aware quiet hours and an extreme override, persistent recovery, an actual transport test and recent activity. Settings/privacy copy covers all 30 locales. Native control labels, targets, focus, reduced motion, storage-failure disable behavior and warning deep links have regression coverage. A slow warning check does not hold the app's return to the forecast catalog.

Validation before rollout: 101 JavaScript syntax checks; 124 unit tests; the actual Pages + default Worker RPC + D1 local integration gate; 196 Chromium tests including all reviewed visual baselines, unchanged; and 40 desktop/mobile WebKit notification/PWA upgrade checks passed. Warning navigation additionally passed targeted checks in Chromium and both WebKit configurations. The new storage-failure test waits for the handler's final state before asserting both server deletion and browser unsubscription; neither assertion nor any visual tolerance was relaxed.

The dedicated production D1 database and both tracked migrations are configured. The Worker and production Pages service binding are deployed; `/api/push/config` reports an available service with a verified keypair. Both runtime KV bindings are removed, one existing cron runs each minute, and Worker public/preview URLs are disabled. The unbound old namespace runs no jobs or operations. Full CI for the preceding release passed syntax/unit, visual, Chromium, Firefox and desktop/mobile WebKit jobs.

Final lifecycle checks cover a primary-city change during registration and foreground events during a denied native prompt; neither loses the pending reconciliation or permission recovery guidance. The final focused notification/PWA suite passed 69 checks across Chromium and both WebKit configurations. The runtime gate also checks ten concurrent configuration requests. Physical notification receipt on the reported installed iOS device remains a separate acceptance step; push-service acceptance does not certify device delivery. See `docs/push-setup.md` for the repeatable deployment and device checks.
