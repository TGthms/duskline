'use strict';
/* Duskline — app.js
   Classic non-module script. Shared global scope with other src/js scripts.

   Load order (index.html, deferred):
   1. data/i18n.js, data/duskline-locales.js, data/dest-weather-cities.js
   2. core/env.js, core/wx-math.js, core/runtime.js
   3. duskline-controls.js
   4. features/weather/{ns,sky,charts,alerts,data,app}.js
   5. app.js (this file) — apply saved prefs

   Legal pages load duskline-locales.js + legal-i18n.js + legal.js.
   Policy copy is fetched per locale from src/js/data/legal/packs/.
*/

if (typeof applyLanguage === 'function') applyLanguage(currentLang);
if (typeof applyUnits === 'function') applyUnits();
if (typeof dispatchPrefs === 'function') {
  dispatchPrefs('ready', {
    lang: currentLang,
    units: { temp: currentTempUnit, dist: currentDistUnit },
    theme: currentTheme
  });
}
