'use strict';
(function () {
  var select = document.getElementById('dusklineLanguage');
  var locales = window.DUSKLINE_LOCALES || [['en', 'English']];
  var languageGeneration = 0;
  window.setDusklineLanguage = async function (value) {
    if (!locales.some(item=>item[0]===value)) return;
    var generation=++languageGeneration;
    if (typeof safeStorage !== 'undefined') safeStorage.set('duskline-lang',value);
    if (typeof window.loadWeatherLocale === 'function') await window.loadWeatherLocale(value);
    if (generation!==languageGeneration) return;
    if (select) select.value=value;
    if (typeof currentLang !== 'undefined') currentLang=value;
    if (typeof applyLanguage === 'function') applyLanguage(value);
  };
  var year = document.getElementById('dusklineYear');
  if (year) year.textContent = new Date().getFullYear();
  if (select) {
    locales.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item[0]; option.textContent = item[1]; select.appendChild(option);
    });
    select.value = typeof currentLang === 'string' ? currentLang : 'en';
    select.addEventListener('change',function () { window.setDusklineLanguage(select.value); });
  }
})();
