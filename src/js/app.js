'use strict';
/* Duskline — app.js
   Classic non-module script. Shared global scope with other src/js scripts.
   Canonical load order: see header of src/js/app.js
*/

/* ═══════════════════════════════════════════════════════════════════════
   Duskline — application boot

   Companion data (load before these runtime scripts):
   · src/js/data/i18n.js          → window.I18N          (all pages)
   · src/js/data/fun-facts.js     → window.FUN_FACTS     (index)
   · src/js/data/intro-gallery.js → window.INTRO_GALLERY_PHOTOS (index)
   · src/js/data/modal-content.js → window.MODAL_DATA*   (index)
   · src/js/data/dest-links.js    → window.DEST_*        (index)
   · src/js/data/legal-i18n.js    → window.LEGAL_I18N    (privacy/terms)

   Runtime load order (classic deferred scripts, shared global scope):
   1. core/env.js
   2. core/nav-return.js   guide ↔ tools back-stack
   3. core/runtime.js      prefs · i18n · chrome · settings
   4. features/home.js     (index only)
   5. features/dest-weather.js (index)
   6. features/tools.js    (tools hub + mini-apps — not index)
   7. features/weather/*   (tools-weather only — ns/sky/charts/alerts/data/app)
   8. features/legal.js    (privacy / terms)
   9. features/gallery.js  (gallery page)
  10. app.js               this file — apply saved prefs + final init

   Load only the feature scripts a page needs. Kept as non-module scripts so
   window.* hooks remain available (e.g. toggleFavorite, refreshWeatherUi).
   ═══════════════════════════════════════════════════════════════════════ */

/* Apply saved preferences once all feature scripts have registered. */
if (typeof initFunFacts === 'function') initFunFacts();
if (typeof applyLanguage === 'function') applyLanguage(currentLang);
if (typeof applyUnits === 'function') applyUnits();
if (typeof dispatchPrefs === 'function') {
  dispatchPrefs('ready', {
    lang: currentLang,
    units: { temp: currentTempUnit, dist: currentDistUnit },
    theme: currentTheme
  });
}
