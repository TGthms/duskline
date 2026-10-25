# Testing duskline

Choose checks by the behavior that changed. Keep regression assertions about observable results, missing data, request ownership, persistence, accessibility and runtime contracts.

| Work | Command |
| --- | --- |
| Syntax and all unit/content checks | `npm run test:fast` |
| Core Chrome and mobile Safari journeys | `npm run test:core` |
| Affected behavior | `npx playwright test --project=mobile-webkit --grep 'scenario title'` |
| Reviewed macOS Chrome visuals | `npm run test:visual` |
| Complete release validation | `npm run test:release` |

Run the fast checks and affected scenarios while editing. Run core checks for changes spanning several views. Shared navigation, modal, boot and service-worker changes receive the complete browser matrix. UI changes also receive visual review. A provider-only change normally needs data tests and relevant forecast journeys.

The 24 `@core` scenarios cover forecast loading and fallback; search and keyboard charts; units, persistence and saved places; official alerts and primary warning entry; map controls and gesture guidance; nested modal isolation and Back; notification denial and disable recovery; phone navigation; representative French, German, Japanese, Arabic and Hebrew layouts; deferred updates; and real offline worker upgrades. List the selected cases with:

```sh
npx playwright test --project=chromium --grep @core --list
```

The complete 30-language forecast/sheet and legal journeys carry `@localeAll` and run in Chromium. Representative languages run across engines. Source keys, placeholders, translation regressions and generated-pack parity remain unit/content checks for every language.

CI uses `tools/test-scope.js` to select checks from changed paths:

- Every run checks syntax, generated locales and units.
- Routine PRs run core plus affected scenarios in Chromium and mobile WebKit.
- Changes to shared runtime/navigation and app changes pushed to `main` run Chromium, Firefox, desktop WebKit and mobile WebKit. The full matrix retains sharding for WebKit.
- CSS, HTML, visual assets and shared UI runtime receive the separate pinned visual job.
- Notification backend/client, Worker or dependency changes receive the actual Worker push integration check.
- Documentation-only changes use the fast checks. An unavailable Git comparison selects full coverage.
- Manual CI dispatch runs complete release checks. GitHub Pages publishes only a successful CI revision on `main`.
- New pushes supersede earlier CI runs for the same branch or pull request.

The two background-scroll checks are consolidated into one scenario that verifies a nonzero starting position, a stationary page beneath Settings, restored position and scrolling after dismissal. Static SEO/icon assertions live in units; one HTTP check verifies the served HTML and favicon MIME type. Copy checks require populated translations and preserved placeholders rather than a fixed slogan or arbitrary paragraph length.

Review changed screenshots before recording intentional baselines. Keep tolerances intact. Physical iOS acceptance covers Home Screen launch, touch and keyboard behavior, VoiceOver, haptics, background/resume, rotation, offline relaunch, updates and real push receipt.
