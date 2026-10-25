# Working on duskline

- Work on `main`. Use small, logical commits and push batches after relevant validation.
- Write comments about behavior, ownership and constraints. Keep conversational history out of code annotations.
- Use `npm run test:fast` and affected browser scenarios while editing. Use `npm run test:core` for changes spanning views. See [testing](docs/testing.md) for release and CI coverage.
- Preserve regressions for request races, missing versus zero values, timezone handling, offline updates, Back/focus/scroll restoration and notification ownership/cleanup.
- Add first-party runtime assets to the service-worker shell and keep the explicit script order aligned with the weather module table. Bump the shell cache for runtime releases and the locale cache for changed language packs.
- Edit source catalogs and run `npm run weather:i18n`. New UI copy needs translations for all 30 picker languages.
- Review intentional visual changes before updating snapshots. Use unchanged comparison tolerances.
- Report physical-device and production checks according to evidence. Browser emulation covers engine behavior; device acceptance includes VoiceOver, Home Screen lifecycle, haptics and notification receipt.
