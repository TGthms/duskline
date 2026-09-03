'use strict';
/* Duskline legal pages — same language picker and locale storage as index.html. */
(function () {
  var locales = window.DUSKLINE_LOCALES || [['en', 'English']];
  var codes = window.DUSKLINE_LANG_CODES || locales.map(function (item) { return item[0]; });
  var page = document.body && document.body.dataset.legalPage;
  var select = document.getElementById('dusklineLanguage');
  var EFFECTIVE = new Date(Date.UTC(2026, 7, 27));
  var REPO = '<a href="https://github.com/TGthms/duskline" rel="noreferrer">github.com/TGthms/duskline</a>';
  var applySeq = 0;

  function detectLang() {
    var stored = '';
    try { stored = localStorage.getItem('duskline-lang') || ''; } catch (e) { stored = ''; }
    if (stored && codes.indexOf(stored) !== -1) return stored;
    try {
      var raw = String(navigator.language || navigator.userLanguage || '').replace('_', '-');
      if (codes.indexOf(raw) !== -1) return raw;
      var n = raw.toLowerCase();
      if (n.indexOf('zh-tw') === 0 || n.indexOf('zh-hant') === 0 || n.indexOf('zh-hk') === 0) return 'zh-TW';
      if (n.indexOf('zh') === 0) return 'zh';
      if (n.indexOf('pt-br') === 0) return 'pt-BR';
      if (n.indexOf('pt') === 0) return 'pt-PT';
      var short = raw.split('-')[0];
      if (codes.indexOf(short) !== -1) return short;
    } catch (e2) { /* ignore */ }
    return 'en';
  }

  var current = detectLang();

  function pack(lang) {
    return (window.I18N && window.I18N[lang]) || {};
  }

  function t(key, lang) {
    lang = lang || current;
    var value = pack(lang)[key];
    if (value) return value;
    if (lang !== 'en') {
      value = pack('en')[key];
      if (value) return value;
    }
    return '';
  }

  function formatDate(lang) {
    var tag = (window.DUSKLINE_LOCALE_TAGS && window.DUSKLINE_LOCALE_TAGS[lang]) || lang;
    try {
      return new Intl.DateTimeFormat(tag, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(EFFECTIVE);
    } catch (e) {
      return 'August 27, 2026';
    }
  }

  function interpolate(text, lang) {
    if (text == null || text === '') return text;
    return String(text)
      .replace(/\{date\}/g, formatDate(lang))
      .replace(/\{repo\}/g, REPO);
  }

  var originals = new Map();
  document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-aria]').forEach(function (el) {
    var isHtml = el.hasAttribute('data-i18n-html');
    var isAria = el.hasAttribute('data-i18n-aria');
    originals.set(el, isAria ? el.getAttribute('aria-label') : isHtml ? el.innerHTML : el.textContent);
  });

  function setDocumentLang(lang) {
    var localeTag = (window.DUSKLINE_LOCALE_TAGS && window.DUSKLINE_LOCALE_TAGS[lang]) || lang;
    document.documentElement.setAttribute('lang', localeTag);
    document.documentElement.setAttribute('dir', (lang === 'ar' || lang === 'he') ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('data-lang', lang);
    if (select) select.value = lang;
  }

  function paint(lang) {
    current = lang;
    setDocumentLang(lang);

    var titleKey = page === 'terms' ? 'legal.terms.title' : 'legal.privacy.title';
    var metaKey = page === 'terms' ? 'legal.terms.meta' : 'legal.privacy.meta';
    var title = t(titleKey, lang) || (page === 'terms' ? 'Terms of Use' : 'Privacy Policy');
    document.title = 'duskline — ' + title;
    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      var desc = t(metaKey, lang);
      if (desc) meta.setAttribute('content', desc);
    }

    document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-aria]').forEach(function (el) {
      var isHtml = el.hasAttribute('data-i18n-html');
      var isAria = el.hasAttribute('data-i18n-aria');
      var key = isAria ? el.getAttribute('data-i18n-aria')
        : isHtml ? el.getAttribute('data-i18n-html')
        : el.getAttribute('data-i18n');
      var translated = t(key, lang);
      var next = interpolate(translated || originals.get(el) || '', lang);
      if (isAria) el.setAttribute('aria-label', next);
      else if (isHtml) el.innerHTML = next;
      else el.textContent = next;
    });

    if (typeof window.__dusklineLoadFonts === 'function') window.__dusklineLoadFonts();
    try {
      document.dispatchEvent(new CustomEvent('duskline:prefs', { detail: { type: 'lang', lang: lang } }));
    } catch (e3) { /* ignore */ }
  }

  function apply(lang) {
    var seq = ++applySeq;
    current = lang;
    setDocumentLang(lang);
    var load = typeof window.dusklineLoadLegalPack === 'function' ? window.dusklineLoadLegalPack : null;
    var jobs = [];
    if (load) {
      jobs.push(load('en').catch(function () { return null; }));
      if (lang !== 'en') jobs.push(load(lang).catch(function () { return null; }));
    }
    Promise.all(jobs).then(function () {
      if (seq !== applySeq) return;
      paint(lang);
    });
  }

  if (select) {
    locales.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item[0];
      option.textContent = item[1];
      select.appendChild(option);
    });
    select.value = current;
    select.addEventListener('change', function () {
      current = select.value;
      try { localStorage.setItem('duskline-lang', current); } catch (e) { /* ignore */ }
      apply(current);
    });
  }

  apply(current);
})();
