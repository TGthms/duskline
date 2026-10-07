'use strict';
/* Duskline — app.js
   Classic non-module script. Shared global scope with other src/js scripts.

   Runtime order is explicit in index.html and the weather contributor module table.
   English and the active locale pack supply UI copy; build-only catalogs are not shipped.

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
