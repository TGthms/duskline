# Native experience follow-up

The October 25 audit recommendations are implemented on `main`.

- My Sky shows active primary-city warnings with severity, a direct route to expanded details, retry recovery and offline guidance. Warnings remain outside saved forecast snapshots.
- Detail, Settings and map surfaces share modal isolation and focus containment. Nested Back navigation restores the previous context. Interactive feedback, including Undo, belongs to the active surface.
- Portrait phones use a compact header and persistent My Sky/Horizon/Map navigation. Language lives in Settings; a short Saved places entry retains direct management. Wider and landscape views retain the desktop controls. The same controls and handlers are reused across layouts.
- The map offers dismissible first-use guidance for long-press, right-click and keyboard place actions.
- Update notices have a Later action for the current session. Settings retains Update and Check for updates, with explicit checking, failure and retry states. Activation remains an explicit action.
- Source catalogs include the new controls in all 30 interface languages. The shell is v91 and the locale cache is v85.

Testing now has a fast unit/content command, 24 core browser journeys and change-aware CI selection. The full release matrix, offline upgrades, reviewed visuals and actual Worker integration remain available. See [testing](testing.md).

Local validation:

| Check | Result |
| --- | --- |
| Unit/content tests | 128 passed |
| Chromium + desktop/mobile WebKit functional sweep | 558 passed; 18 intentional skips |
| Visual cases | 22 passed, comparing 24 snapshots |
| Final update-state and real worker-upgrade checks | 8 passed |
| Real Worker integration | Pages/RPC/D1, encrypted send, redirect isolation, ownership and deletion passed |
| Locale regeneration and whitespace checks | No drift or errors |

Ten phone/map baselines were deliberately refreshed after visual review. Comparison tolerances are unchanged. Exhaustive locale browser journeys run once in Chromium; representative Latin, CJK and RTL languages exercise Settings and forecast sheets across engines.

Linux mobile WebKit validation identified additional update-notice wrapping and an overlong combined locale journey. The notice now reserves a full text row and 44px action targets; locale journeys run in smaller groups with the same assertions. Touch controls keep a consistent resting surface after activation instead of retaining hover styling.

Physical iOS acceptance remains separate: Home Screen cold launch and first tap; VoiceOver modal boundaries; keyboard and touch scrolling; haptics; background/resume and rotation; offline relaunch; accepting an update; and actual push receipt. Local Firefox could not launch because of this Mac environment's sandbox/framebuffer failure; Linux CI retains Firefox coverage. Production hosting configuration is unchanged.
