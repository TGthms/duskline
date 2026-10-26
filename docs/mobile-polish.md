# Mobile polish

Kit supplied design references for compact chrome, safe-area spacing, labelled navigation and grouped preferences. Kit itself was not changed.

- The page header uses the existing edge-to-edge horizon SVG, including the legal pages. The installed-app icons retain their existing artwork.
- Phone header actions use quiet 44px touch targets. Bottom navigation has matching icons and labels, consistent selected states and safe-area clearance. It retains the existing handlers, modal isolation and keyboard behavior.
- Region and sort controls sit with Featured places and use consistent, 44px platform pickers. Their 16px text avoids small iOS form controls. The empty-state card adapts to narrow phones.
- Settings groups language, motion and haptics into compact rows. Units and saved places expand in place. Unit choices retain radio semantics, arrow-key navigation, persistence and 44px targets. Notifications and app updates remain directly accessible.
- Settings follows the active screen’s light or dark appearance. Language changes retain picker focus and expanded preferences. The duplicated Settings language render is consolidated.

The interface reuses translated copy available in all 30 languages. No dependency or notification backend changes are included. The locale cache remains v85; the shell release is v97.

## Validation

- Syntax and unit/content checks: 110 files checked; 128 tests passed.
- Core Chromium and mobile WebKit journeys: 48 passed, including real service-worker upgrades and offline locale replacement.
- Affected notification, feedback, discovery and sheet flows: 45 passed across Chromium and desktop/mobile WebKit.
- The added Settings regression covers keyboard disclosure activation, translated rebuilds, picker focus, persisted unit selection, narrow-screen control geometry and dismissal focus.
- Visual comparison: 24 cases passed against 28 snapshots after review. The final Settings resting-state rendering also passed 10 repeated visual cases and 12 focused transition/focus/Back checks across Chromium and desktop/mobile WebKit.
- Visual review includes 320px and 390/430px phones, tablet, desktop and landscape; both Settings appearances and expanded units have screenshot coverage. Existing comparison tolerances are retained.

Settings releases its forced transform layer at rest for consistent text rendering. Entry, drag dismissal and desktop transitions retain their behavior.

The narrow Settings visual cases use an explicit 8px scrollbar gutter to make macOS overlay and persistent scrollbar preferences comparable. They also verify that expanded preferences scroll; screenshot tolerances are unchanged.

Revision `69fc48a` passed the [full CI matrix](https://github.com/TGthms/duskline/actions/runs/40275785663): Chromium 196 passed, Firefox 178 passed, and each desktop/mobile WebKit configuration 187 passed, with their intentional skips. Functional suites had no retries. The visual job had one transient dark Settings text-rendering retry. The subsequent resting-layer cleanup in `0c7a0ce` passed all 24 local visual cases, 10 repeated Settings comparisons and the 12 focused interaction checks noted above.

Cloudflare deployed the interface revision `78e5bdd`; its service worker, weather shell stylesheet and app controller matched the source byte-for-byte. The final rendering cleanup increments the shell to v97.

Physical iOS acceptance remains to be performed: installed Home Screen launch, keyboard and VoiceOver, actual safe-area behavior, background/resume, haptics and push delivery. Browser emulation does not establish those results.
