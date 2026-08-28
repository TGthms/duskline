'use strict';
(function () {
  var select = document.getElementById('dusklineLanguage');
  var locales = window.DUSKLINE_LOCALES || [['en', 'English']];
  var year = document.getElementById('dusklineYear');
  if (year) year.textContent = new Date().getFullYear();
  if (select) {
    locales.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item[0]; option.textContent = item[1]; select.appendChild(option);
    });
    select.value = typeof currentLang === 'string' ? currentLang : 'en';
    select.addEventListener('change', function () {
      var value = select.value;
      if (typeof currentLang !== 'undefined') currentLang = value;
      if (typeof safeStorage !== 'undefined') safeStorage.set('duskline-lang', value);
      if (typeof applyLanguage === 'function') applyLanguage(value);
    });
  }
})();
