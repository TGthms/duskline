'use strict';
/* Duskline locale registry. UI packs may grow independently of the weather runtime. */
(function (global) {
  var locales = [
    ['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'],
    ['it', 'Italiano'], ['pt-BR', 'Português (Brasil)'], ['pt-PT', 'Português (Portugal)'],
    ['nl', 'Nederlands'], ['da', 'Dansk'], ['sv', 'Svenska'], ['nb', 'Norsk bokmål'],
    ['fi', 'Suomi'], ['pl', 'Polski'], ['cs', 'Čeština'], ['hu', 'Magyar'],
    ['ro', 'Română'], ['el', 'Ελληνικά'], ['tr', 'Türkçe'], ['ru', 'Русский'],
    ['uk', 'Українська'], ['ar', 'العربية'], ['he', 'עברית'], ['hi', 'हिन्दी'],
    ['th', 'ไทย'], ['vi', 'Tiếng Việt'], ['id', 'Bahasa Indonesia'], ['ja', '日本語'],
    ['ko', '한국어'], ['zh', '简体中文'], ['zh-TW', '繁體中文']
  ];
  global.DUSKLINE_LANG_CODES = locales.map(function (item) { return item[0]; });
  global.DUSKLINE_LOCALES = locales;
  global.DUSKLINE_LOCALE_TAGS = {
    'pt-BR': 'pt-BR', 'pt-PT': 'pt-PT', nb: 'nb-NO', zh: 'zh-CN', 'zh-TW': 'zh-TW',
    he: 'he', ar: 'ar', el: 'el', uk: 'uk', ru: 'ru'
  };

  (function () {
    var host = document.getElementById('langPillGroup');
    if (!host) return;
    host.innerHTML = '';
    locales.forEach(function (item) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'pill-btn';
      button.dataset.langVal = item[0];
      button.innerHTML = '<span>' + item[1] + '</span><span class="pill-check" aria-hidden="true">✓</span>';
      host.appendChild(button);
    });
  })();
})(window);
