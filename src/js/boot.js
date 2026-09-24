'use strict';
/* Duskline — src/js/boot.js
   Runs before first paint on every page (index, privacy, terms). Two jobs, both of which
   must happen before the browser paints or the user sees a flash:

     1. resolve the OS appearance into `data-theme`, and flag the effective animation level
     2. register the web fonts the active language needs

   This used to be three near-identical inline copies — one in index.html and one pair in
   privacy.html and terms.html — which had already drifted apart (only the legal copies
   updated `meta[theme-color]`; only index.html guarded against an invalid saved appearance).
   Keeping it in one file also means the pages carry no inline script, so a strict
   Content-Security-Policy can be served without hashes. See `_headers`.

   Loaded with a plain blocking <script> in <head>, deliberately ahead of the stylesheet:
   `data-theme` must be on <html> before any CSS is applied.
*/

/* ── 1. OS appearance → data-theme ──
   Mirrors resolveTheme() in core/runtime.js; the two must agree. The app follows the OS
   light/dark setting — runtime.js records why the Appearance × Style pair (and the
   `elegant` / `default` themes it produced) is gone.
   A user's saved motion choice always wins over the OS. */
(function () {
  var THEME_LIGHT = 'minimal';
  var THEME_DARK = 'glass';
  var LIGHT_THEMES = [THEME_LIGHT];
  /* Kept in step with THEME_META_COLORS in core/runtime.js. */
  var THEME_META_COLORS = {
    minimal: '#f5f5f7',
    glass: '#000000'
  };

  function isOsLight() {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);
  }

  var motion = null;
  try {
    var savedMotion = localStorage.getItem('duskline-motion');
    // Legacy key: `duskline-reduce-motion` = on meant "calm things down".
    if (!savedMotion && localStorage.getItem('duskline-reduce-motion') === 'on') savedMotion = 'reduced';
    if (savedMotion === 'full' || savedMotion === 'reduced' || savedMotion === 'off') motion = savedMotion;
  } catch (e) {
    /* storage unavailable (sandboxed webview, private mode) — defaults stand */
  }

  var theme = isOsLight() ? THEME_LIGHT : THEME_DARK;

  var root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.style.colorScheme = LIGHT_THEMES.indexOf(theme) >= 0 ? 'light' : 'dark';

  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_META_COLORS[theme] || THEME_META_COLORS[THEME_DARK]);

  var osReduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (motion) root.setAttribute('data-motion', motion);
  var effective = motion === 'off' ? 'off'
    : motion === 'full' ? 'full'
      : motion === 'reduced' ? 'reduced'
        : (osReduce ? 'reduced' : null);
  if (effective) root.setAttribute('data-motion-effective', effective);
})();

/* ── 2. Web fonts ──
   Public Sans always; one Noto script family only when the active language needs it.
   Navigation is detected from the saved preference first (so the right font is in flight
   for the first paint) and the browser language second. */
(function () {
  var SANS = 'family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400';
  /* lang → [google family, link id] */
  var NOTO = {
    'zh': ['Noto+Sans+SC', 'duskline-font-zh'],
    'zh-TW': ['Noto+Sans+TC', 'duskline-font-zh-tw'],
    'ja': ['Noto+Sans+JP', 'duskline-font-ja'],
    'ko': ['Noto+Sans+KR', 'duskline-font-ko'],
    'ar': ['Noto+Sans+Arabic', 'duskline-font-ar'],
    'he': ['Noto+Sans+Hebrew', 'duskline-font-he'],
    'th': ['Noto+Sans+Thai', 'duskline-font-th'],
    'hi': ['Noto+Sans+Devanagari', 'duskline-font-hi']
  };

  function detectLang() {
    try {
      var saved = localStorage.getItem('duskline-lang');
      if (saved) return saved;
    } catch (e) { /* ignore */ }
    try {
      var n = String(navigator.language || '').toLowerCase();
      if (n.indexOf('zh-tw') === 0 || n.indexOf('zh-hant') === 0 || n.indexOf('zh-hk') === 0) return 'zh-TW';
      if (n.indexOf('zh') === 0) return 'zh';
      if (n.indexOf('ja') === 0) return 'ja';
      if (n.indexOf('ko') === 0) return 'ko';
      if (n.indexOf('ar') === 0) return 'ar';
      if (n.indexOf('he') === 0) return 'he';
      if (n.indexOf('th') === 0) return 'th';
      if (n.indexOf('hi') === 0) return 'hi';
    } catch (e2) { /* ignore */ }
    return 'en';
  }

  var loaded = {};
  function add(id, familySpec) {
    if (loaded[id] || document.getElementById(id)) {
      loaded[id] = true;
      return;
    }
    var link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?' + familySpec + '&display=swap';
    document.head.appendChild(link);
    loaded[id] = true;
  }

  function apply() {
    add('duskline-font-sans', SANS);
    var set = NOTO[detectLang()];
    if (set) add(set[1], 'family=' + set[0] + ':wght@300;400;500;600;700');
  }

  apply();
  /* legal.js calls this after a language change; the picker also fires duskline:prefs. */
  window.__dusklineLoadFonts = apply;
  document.addEventListener('duskline:prefs', function (e) {
    var type = e && e.detail && e.detail.type;
    if (type === 'lang' || type === 'style') apply();
  });
})();
