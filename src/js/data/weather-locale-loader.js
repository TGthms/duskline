'use strict';
(function (global) {
  const pending = new Map();
  global.loadWeatherLocale = function (code) {
    if (!global.DUSKLINE_LANG_CODES.includes(code)) code = 'en';
    if (global.I18N[code]) return Promise.resolve();
    if (!pending.has(code)) {
      const finish = global.DusklineLoading ? global.DusklineLoading.begin() : function () {};
      pending.set(code, fetch('src/js/data/weather-packs/' + code + '.json').then(function (response) {
        if (!response.ok) throw new Error('Locale unavailable');
        return response.json();
      }).then(function (pack) { global.I18N[code] = pack; }).catch(function () {
        pending.delete(code);
      }).finally(finish));
    }
    return pending.get(code);
  };
  let selected = navigator.language || 'en';
  try { selected = localStorage.getItem('duskline-lang') || selected; } catch (error) {}
  if (!global.DUSKLINE_LANG_CODES.includes(selected)) {
    if (/^zh-(tw|hk|hant)/i.test(selected)) selected = 'zh-TW';
    else selected = selected.split('-')[0];
  }
  const ready = new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, {once:true}));
  Promise.all([global.loadWeatherLocale(selected), ready]).then(function () {
    if (typeof applyLanguage === 'function') applyLanguage(currentLang);
  });
})(window);
