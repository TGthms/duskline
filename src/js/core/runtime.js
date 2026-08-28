'use strict';
/* Duskline — core/runtime.js
   Classic non-module script. Shared global scope with other src/js scripts.
   Canonical load order: see header of src/js/app.js
*/

/* I18N dictionary: src/js/data/i18n.js → window.I18N */
const I18N = window.I18N || {};

/* ── I18N ENGINE ──
   English lives directly in the HTML (already written for every section),
   so it never needs duplicating here. On first run we snapshot each
   [data-i18n]/[data-i18n-html] element's original English content; switching
   back to English just restores that snapshot rather than looking anything
   up. Switching to zh/ja overwrites content from the I18N dictionary above,
   keyed by the same data-i18n attribute already present in the markup. */
const i18nEls = document.querySelectorAll('[data-i18n], [data-i18n-html], [data-i18n-aria], [data-i18n-placeholder]');
const i18nOriginals = new Map();
i18nEls.forEach(el => {
  const isHtml = el.hasAttribute('data-i18n-html');
  const isAria = el.hasAttribute('data-i18n-aria');
  const isPh = el.hasAttribute('data-i18n-placeholder');
  i18nOriginals.set(
    el,
    isAria ? el.getAttribute('aria-label')
      : isPh ? el.getAttribute('placeholder')
      : isHtml ? el.innerHTML
      : el.textContent
  );
});

/** Calendar year for © notices — never hardcode the year in UI copy. */
function copyrightYear() {
  return String(new Date().getFullYear());
}

/** Expand `{year}` (and legacy `© 20xx`) so footers/legal stay current automatically. */
function withCopyrightYear(text) {
  if (text == null || text === '') return text;
  const y = copyrightYear();
  return String(text)
    .replace(/\{year\}/g, y)
    .replace(/©\s*20\d{2}\b/g, '© ' + y);
}

/**
 * Safe lookup into window.I18N (es/zh/ja packs). English has no pack — returns null.
 * Never throws if i18n.js failed to load (site still works in English from HTML).
 */
function getI18nDict(lang) {
  let pack = null;
  try {
    if (typeof window !== 'undefined' && window.I18N) pack = window.I18N;
    else if (typeof I18N !== 'undefined') pack = I18N;
  } catch (_) {
    pack = null;
  }
  if (!lang || lang === 'en') return null;
  var base = pack && pack[lang] ? pack[lang] : null;
  var extra = null;
  try {
    if (typeof window !== 'undefined' && window.GALLERY_I18N) extra = window.GALLERY_I18N[lang] || null;
  } catch (_) {
    extra = null;
  }
  if (!extra) return base;
  if (!base) return extra;
  var merged = {};
  var k;
  for (k in base) {
    if (Object.prototype.hasOwnProperty.call(base, k)) merged[k] = base[k];
  }
  for (k in extra) {
    if (Object.prototype.hasOwnProperty.call(extra, k)) merged[k] = extra[k];
  }
  return merged;
}

function dispatchPrefs(type, extra) {
  try {
    const detail = Object.assign({ type: type }, extra || {});
    document.dispatchEvent(new CustomEvent('duskline:prefs', { detail: detail }));
  } catch (e) { /* ignore */ }
}

function applyLanguage(lang) {
  const dict = getI18nDict(lang);
  i18nEls.forEach(el => {
    const isHtml = el.hasAttribute('data-i18n-html');
    const isAria = el.hasAttribute('data-i18n-aria');
    const isPh = el.hasAttribute('data-i18n-placeholder');
    const key = isAria ? el.getAttribute('data-i18n-aria')
      : isPh ? el.getAttribute('data-i18n-placeholder')
      : isHtml ? el.getAttribute('data-i18n-html')
      : el.getAttribute('data-i18n');
    const translated = dict && dict[key];
    if (lang === 'en' || !translated) {
      const orig = withCopyrightYear(i18nOriginals.get(el));
      if (isAria) el.setAttribute('aria-label', orig);
      else if (isPh) el.setAttribute('placeholder', orig);
      else if (isHtml) el.innerHTML = orig;
      else el.textContent = orig;
    } else {
      const t = withCopyrightYear(translated);
      if (isAria) el.setAttribute('aria-label', t);
      else if (isPh) el.setAttribute('placeholder', t);
      else if (isHtml) el.innerHTML = t;
      else el.textContent = t;
    }
  });
  var localeTag = (window.DUSKLINE_LOCALE_TAGS && window.DUSKLINE_LOCALE_TAGS[lang]) || lang;
  document.documentElement.setAttribute('lang', localeTag);
  document.documentElement.setAttribute('dir', (lang === 'ar' || lang === 'he') ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('data-lang', lang);
  // Restamp unit labels (公里 / km) inside restored HTML without a units event.
  paintUnitSpans();
  dispatchPrefs('lang', { lang: lang });
}

/* ── UNIT CONVERSION ENGINE ──
   Any element with class "unit-temp" + data-f="<fahrenheit>" or "unit-dist"
   + data-mi="<miles>" gets its displayed text regenerated here. Safe to call
   after any DOM change (language swap, modal open) since it always derives
   the label fresh from the stored raw value rather than parsing prior text. */
function numberLocale() {
  return currentLang === 'zh' ? 'zh-CN' : currentLang === 'ja' ? 'ja-JP' : currentLang === 'es' ? 'es-ES' : 'en-US';
}

function paintUnitSpans() {
  const loc = numberLocale();
  const tempU = currentTempUnit;
  const distU = currentDistUnit;
  document.querySelectorAll('.unit-temp[data-f]').forEach(el => {
    const f = parseFloat(el.getAttribute('data-f'));
    if (tempU === 'c') {
      const c = Math.round((f - 32) * 5 / 9);
      el.textContent = c + '°C';
    } else {
      el.textContent = Math.round(f) + '°F';
    }
  });
  document.querySelectorAll('.unit-dist[data-mi]').forEach(el => {
    const mi = parseFloat(el.getAttribute('data-mi'));
    const suffix = el.dataset.suffix || '';
    if (distU === 'km') {
      const km = Math.round(mi * 1.60934).toLocaleString(loc);
      el.textContent = km + (currentLang === 'zh' ? ' 公里' : ' km') + suffix;
    } else {
      const miFmt = Math.round(mi).toLocaleString(loc);
      const unit = currentLang === 'zh' ? ' 英里' : currentLang === 'ja' ? ' マイル' : ' mi';
      el.textContent = miFmt + unit + suffix;
    }
  });
}

function applyUnits() {
  syncUnitGlobals();
  paintUnitSpans();
  dispatchPrefs('units', { temp: currentTempUnit, dist: currentDistUnit });
}

/* ── SAFE STORAGE ──
   Wraps localStorage in try/catch so preferences persist normally when this
   file is opened directly in a browser, but the site still works perfectly
   (just without cross-visit memory) in sandboxed contexts where storage
   access throws. In-memory `current*` variables are always the source of
   truth during a session either way. */
const safeStorage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  },
  /** True only when the user (or a prior session) has explicitly saved a value. */
  has(key) {
    try { return localStorage.getItem(key) !== null; }
    catch (e) { return false; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* in-memory state still works */ }
  }
};

/* ── FIRST-VISIT PREFERENCE DETECTION ──
   Only used when a key has never been saved — once the visitor picks something
   in Settings, that choice always wins (and is written to localStorage).
   Sources: navigator.languages / language, Intl.Locale region, prefers-color-scheme,
   prefers-reduced-motion, hover/pointer (cursor). No network. */
const SUPPORTED_LANGS = window.DUSKLINE_LANG_CODES || ['en', 'es', 'zh', 'ja'];

function detectLanguage() {
  const candidates = [];
  try {
    if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
    if (navigator.language) candidates.push(navigator.language);
  } catch (_) { /* ignore */ }
  // Also try resolved locale from Intl when browser omits a useful languages list
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
    if (resolved) candidates.push(resolved);
  } catch (_) { /* ignore */ }

  for (const raw of candidates) {
    const tag = String(raw || '').toLowerCase().replace(/_/g, '-');
    if (!tag) continue;
    // Chinese: zh, zh-CN, zh-TW, zh-Hans, etc.
    if (tag === 'zh' || tag.startsWith('zh-')) return 'zh';
    if (tag === 'ja' || tag.startsWith('ja-')) return 'ja';
    if (tag === 'es' || tag.startsWith('es-')) return 'es';
    if (tag === 'en' || tag.startsWith('en-')) return 'en';
    const primary = tag.split('-')[0];
    if (SUPPORTED_LANGS.includes(primary)) return primary;
  }
  return 'en';
}

const LIGHT_THEMES = ['minimal', 'elegant'];

/**
 * Appearance: system | light | dark
 * Style: classic | modern
 *   Light + Classic → Heritage Paper (elegant)
 *   Light + Modern  → Gallery Daylight (minimal)
 *   Dark  + Classic → Midnight Atlas (default)
 *   Dark  + Modern  → Twilight Glass (glass)
 */
function isOsLight() {
  return !!safeMatchMedia('(prefers-color-scheme: light)').matches;
}

function resolveThemeFromAppearanceStyle(appearance, style) {
  const light = appearance === 'system'
    ? isOsLight()
    : appearance === 'light';
  const classic = style === 'classic';
  if (light) return classic ? 'elegant' : 'minimal';
  return classic ? 'default' : 'glass';
}

function detectTheme() {
  // Used when appearance is system + default modern style
  return resolveThemeFromAppearanceStyle('system', 'modern');
}

/**
 * Units auto-detect priority (highest → lowest):
 *   1. Explicit region in system locales (en-US, zh-CN) — never invent US from bare "en"
 *   2. System time zone → country
 *   3. Metric, if nothing else is known
 *
 * Browsers do not expose OS Language & Region radios (e.g. macOS Celsius while
 * Region is United States). Auto is region + time zone only.
 *
 * Intl.Locale('en').maximize() becomes en-Latn-US on many engines, which
 * wrongly forced °F for every English speaker. Never maximize bare language tags.
 */
/** Common IANA zones → ISO 3166-1 alpha-2 (enough for units). */
const TZ_TO_REGION = {
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
  'America/Adak': 'US', 'America/Boise': 'US', 'America/Detroit': 'US',
  'America/Indiana/Indianapolis': 'US', 'America/Kentucky/Louisville': 'US',
  'America/Puerto_Rico': 'US', 'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA',
  'America/Mexico_City': 'MX', 'America/Cancun': 'MX',
  'America/Sao_Paulo': 'BR', 'America/Argentina/Buenos_Aires': 'AR',
  'America/Santiago': 'CL', 'America/Bogota': 'CO', 'America/Lima': 'PE',
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Zurich': 'CH',
  'Europe/Vienna': 'AT', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO',
  'Europe/Athens': 'GR', 'Europe/Lisbon': 'PT', 'Europe/Moscow': 'RU',
  'Europe/Istanbul': 'TR', 'Europe/Kyiv': 'UA',
  'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW',
  'Asia/Chongqing': 'CN', 'Asia/Urumqi': 'CN', 'Asia/Harbin': 'CN',
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Singapore': 'SG',
  'Asia/Bangkok': 'TH', 'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH',
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA', 'Asia/Jerusalem': 'IL', 'Asia/Ho_Chi_Minh': 'VN',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Perth': 'AU',
  'Australia/Brisbane': 'AU', 'Australia/Adelaide': 'AU', 'Pacific/Auckland': 'NZ',
  'Africa/Johannesburg': 'ZA', 'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG'
};

function collectSystemLocales() {
  const locales = [];
  const push = function (v) {
    if (!v) return;
    const s = String(v).replace(/_/g, '-');
    if (s && locales.indexOf(s) === -1) locales.push(s);
  };
  try {
    // Prefer the resolved system locale first (most accurate OS setting)
    push(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch (_) { /* ignore */ }
  try {
    if (navigator.language) push(navigator.language);
    if (Array.isArray(navigator.languages)) {
      for (let i = 0; i < navigator.languages.length; i++) push(navigator.languages[i]);
    }
  } catch (_) { /* ignore */ }
  return locales;
}

/**
 * Extract region only when the tag already implies one.
 * Do NOT call maximize() on bare "en" — that invents US.
 */
function regionFromLocaleTag(raw) {
  if (!raw) return '';
  const tag = String(raw).replace(/_/g, '-');
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.Locale === 'function') {
      const L = new Intl.Locale(tag);
      if (L.region && String(L.region).length === 2) return String(L.region).toUpperCase();
      // Only maximize when script is present but region missing (e.g. zh-Hans)
      const parts = tag.split('-');
      if (!L.region && parts.length >= 2 && typeof L.maximize === 'function') {
        // zh-Hans → CN is OK; bare en already returned above without region
        if (parts[0].toLowerCase() !== 'en' && parts[0].toLowerCase() !== 'es') {
          const maxed = L.maximize();
          if (maxed.region && String(maxed.region).length === 2) {
            return String(maxed.region).toUpperCase();
          }
        }
      }
    }
  } catch (_) { /* fall through */ }
  // Explicit region subtag: en-US, zh-CN, pt-BR (not en-Latn)
  const m = tag.match(/-([A-Za-z]{2})(?:-|$)/g);
  if (m) {
    for (let i = 0; i < m.length; i++) {
      const cand = m[i].replace(/^-/, '').toUpperCase();
      if (cand.length !== 2) continue;
      if (cand === 'HA' || cand === 'HI' || cand === 'LA') continue;
      // Prefer uppercase region-looking tags from original (en-US)
      const orig = tag.match(new RegExp('-(' + cand + ')(?:-|$)', 'i'));
      if (orig) return cand;
    }
  }
  const m2 = tag.match(/-([A-Z]{2})$/);
  if (m2) return m2[1];
  return '';
}

function detectSystemRegion() {
  const locales = collectSystemLocales();
  for (let i = 0; i < locales.length; i++) {
    const r = regionFromLocaleTag(locales[i]);
    if (r) return r;
  }
  return '';
}

function detectRegionFromTimeZone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (!tz) return '';
    if (TZ_TO_REGION[tz]) return TZ_TO_REGION[tz];
    // Prefix heuristics
    if (tz.indexOf('America/') === 0) {
      // Default non-mapped America/* to metric (Canada/LatAm) unless clearly US list
      if (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Adak|Boise|Detroit|Indiana\/|Kentucky\/|Menominee|Metlakatla|Nome|North_Dakota\/|Sitka|Yakutat|Juneau)/.test(tz)) {
        return 'US';
      }
      return ''; // unknown America — don't assume US
    }
    if (tz.indexOf('Asia/Shanghai') === 0 || tz.indexOf('Asia/Chongqing') === 0) return 'CN';
    if (tz.indexOf('Asia/Tokyo') === 0) return 'JP';
    if (tz.indexOf('Europe/') === 0) return 'EU'; // metric stand-in
    if (tz.indexOf('Australia/') === 0) return 'AU';
  } catch (_) { /* ignore */ }
  return '';
}

/**
 * UK (and similar) use °C with miles — not full US imperial.
 * Temp °F regions ≈ classic imperial set; dist mi includes UK.
 */
const TEMP_F_REGIONS = new Set(['US', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW', 'FM', 'MH', 'GU', 'AS', 'MP', 'VI', 'PR']);
const DIST_MI_REGIONS = new Set([
  'US', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW', 'FM', 'MH', 'GU', 'AS', 'MP', 'VI', 'PR',
  'GB', 'UK' // United Kingdom: °C + miles
]);

function unitsFromRegion(region) {
  if (!region) return null;
  if (region === 'EU') return { temp: 'c', dist: 'km', source: 'timezone:EU' };
  // Normalize UK code
  const r = region === 'UK' ? 'GB' : region;
  const tempF = TEMP_F_REGIONS.has(r) || TEMP_F_REGIONS.has(region);
  const distMi = DIST_MI_REGIONS.has(r) || DIST_MI_REGIONS.has(region);
  return {
    temp: tempF ? 'f' : 'c',
    dist: distMi ? 'mi' : 'km',
    source: 'region:' + r
  };
}

function detectUnits() {
  const region = detectSystemRegion();
  const fromRegion = unitsFromRegion(region);
  if (fromRegion) return fromRegion;

  const tzRegion = detectRegionFromTimeZone();
  const fromTz = unitsFromRegion(tzRegion);
  if (fromTz) {
    return {
      temp: fromTz.temp,
      dist: fromTz.dist,
      source: 'timezone:' + tzRegion
    };
  }

  return { temp: 'c', dist: 'km', source: 'default:metric' };
}

/** Default animation level: OS “reduce motion” → reduced; constrained → off. */
function detectMotionModeDefault() {
  if (ENV.constrained) return 'off';
  if (ENV.reduceMotion) return 'reduced';
  return 'full';
}

function detectCursorDefault() {
  // No trail on touch-first / no-hover devices (phones, most tablets, watch).
  if (ENV.constrained) return false;
  if (safeMatchMedia('(hover: none)').matches) return false;
  if (safeMatchMedia('(pointer: coarse)').matches && !safeMatchMedia('(pointer: fine)').matches) return false;
  return true;
}

/** Migrate legacy on/off reduce-motion storage → full | reduced | off. */
function loadMotionModePreference() {
  if (safeStorage.has('duskline-motion')) {
    const v = safeStorage.get('duskline-motion', 'full');
    if (v === 'full' || v === 'reduced' || v === 'off') return v;
  }
  // Legacy: duskline-reduce-motion on = reduced-like (was near-off), off = full
  if (safeStorage.has('duskline-reduce-motion')) {
    return safeStorage.get('duskline-reduce-motion', 'off') === 'on' ? 'reduced' : 'full';
  }
  return detectMotionModeDefault();
}

/* ── SETTINGS STATE ──
   pref* = what Settings stores (may be "auto" / "system")
   current* = effective value used by the app (always concrete) */

let currentLang = safeStorage.has('duskline-lang')
  ? safeStorage.get('duskline-lang', 'en')
  : detectLanguage();
if (!SUPPORTED_LANGS.includes(currentLang)) currentLang = 'en';

/** Appearance: system | light | dark · Style: classic | modern */
function migrateAppearanceStyleFromLegacyTheme() {
  if (safeStorage.has('duskline-appearance')) {
    return {
      appearance: safeStorage.get('duskline-appearance', 'system'),
      style: safeStorage.get('duskline-style', 'modern')
    };
  }
  // Migrate old 6-theme key once
  const old = safeStorage.has('duskline-theme')
    ? safeStorage.get('duskline-theme', 'auto')
    : 'auto';
  let appearance = 'system';
  let style = 'modern';
  if (old === 'auto') { appearance = 'system'; style = 'modern'; }
  else if (old === 'minimal') { appearance = 'light'; style = 'modern'; }
  else if (old === 'elegant') { appearance = 'light'; style = 'classic'; }
  else if (old === 'default') { appearance = 'dark'; style = 'classic'; }
  else if (old === 'glass') { appearance = 'dark'; style = 'modern'; }
  else if (old === 'luxury' || old === 'nature') { appearance = 'dark'; style = 'classic'; }
  try {
    safeStorage.set('duskline-appearance', appearance);
    safeStorage.set('duskline-style', style);
  } catch (e) {}
  return { appearance: appearance, style: style };
}
const _as0 = migrateAppearanceStyleFromLegacyTheme();
let prefAppearance = _as0.appearance;
let prefStyle = _as0.style;
if (prefAppearance !== 'system' && prefAppearance !== 'light' && prefAppearance !== 'dark') {
  prefAppearance = 'system';
}
if (prefStyle !== 'classic' && prefStyle !== 'modern') prefStyle = 'modern';
let currentTheme = resolveThemeFromAppearanceStyle(prefAppearance, prefStyle);
// Legacy alias used by some UI code
let prefTheme = prefAppearance === 'system' ? 'auto' : currentTheme;

/** Unit prefs: auto | f/c | mi/km.
 *  v5 already shipped. Keep the one-time migrate for browsers that never ran it.
 *  Do not add v6 — if Auto looks wrong, fix detectUnits. */
if (!safeStorage.has('duskline-units-v5')) {
  try {
    safeStorage.set('duskline-temp-unit', 'auto');
    safeStorage.set('duskline-dist-unit', 'auto');
    safeStorage.set('duskline-units-v5', '1');
    safeStorage.set('duskline-units-v4', '1');
  } catch (_) { /* ignore */ }
}
let prefTempUnit = safeStorage.has('duskline-temp-unit')
  ? safeStorage.get('duskline-temp-unit', 'auto')
  : 'auto';
let prefDistUnit = safeStorage.has('duskline-dist-unit')
  ? safeStorage.get('duskline-dist-unit', 'auto')
  : 'auto';
if (prefTempUnit !== 'auto' && prefTempUnit !== 'f' && prefTempUnit !== 'c') prefTempUnit = 'auto';
if (prefDistUnit !== 'auto' && prefDistUnit !== 'mi' && prefDistUnit !== 'km') prefDistUnit = 'auto';

function resolveUnitsFromPrefs() {
  // Auto → system locale / timezone first (detectUnits) — always live, never cached wrong
  const detected = detectUnits();
  return {
    temp: prefTempUnit === 'auto' ? detected.temp : prefTempUnit,
    dist: prefDistUnit === 'auto' ? detected.dist : prefDistUnit,
    source: detected.source || '',
    autoTemp: prefTempUnit === 'auto',
    autoDist: prefDistUnit === 'auto'
  };
}

/** Sync window globals used by weather / tools (must not go stale). */
function syncUnitGlobals() {
  const r = resolveUnitsFromPrefs();
  currentTempUnit = r.temp;
  currentDistUnit = r.dist;
  try {
    window.currentTempUnit = currentTempUnit;
    window.currentDistUnit = currentDistUnit;
    window.prefTempUnit = prefTempUnit;
    window.prefDistUnit = prefDistUnit;
    document.documentElement.setAttribute('data-temp-unit', currentTempUnit);
    document.documentElement.setAttribute('data-dist-unit', currentDistUnit);
    document.documentElement.setAttribute('data-temp-pref', prefTempUnit);
    document.documentElement.setAttribute('data-dist-pref', prefDistUnit);
  } catch (_) { /* ignore */ }
  return r;
}

let _u0 = resolveUnitsFromPrefs();
let currentTempUnit = _u0.temp;
let currentDistUnit = _u0.dist;
syncUnitGlobals();

/** Live getters — read the last synced values. Sync only from applyUnits / visibility. */
window.getEffectiveTempUnit = function getEffectiveTempUnit() {
  return currentTempUnit;
};
window.getEffectiveDistUnit = function getEffectiveDistUnit() {
  return currentDistUnit;
};

/** Debug helper — open console: __usaTravelUnits() */
window.__usaTravelUnits = function () {
  const d = detectUnits();
  const r = syncUnitGlobals();
  return {
    prefTemp: prefTempUnit,
    prefDist: prefDistUnit,
    effectiveTemp: currentTempUnit,
    effectiveDist: currentDistUnit,
    detected: d,
    resolved: r,
    locales: collectSystemLocales(),
    region: detectSystemRegion(),
    tzRegion: detectRegionFromTimeZone(),
    timeZone: (function () {
      try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; }
    })()
  };
};

/** User preference: full | reduced | off */
let motionMode = loadMotionModePreference();
let cursorEffectEnabled = safeStorage.has('duskline-cursor-fx')
  ? safeStorage.get('duskline-cursor-fx', 'on') !== 'off'
  : detectCursorDefault();
// Gallery lightbox quality: thumb | medium (default) | full
let galleryQuality = safeStorage.get('duskline-gallery-quality', 'medium');

// Guard against corrupt effective values
if (!['default', 'minimal', 'elegant', 'glass'].includes(currentTheme)) currentTheme = 'default';
if (currentTempUnit !== 'f' && currentTempUnit !== 'c') {
  const fixed = resolveUnitsFromPrefs();
  currentTempUnit = (fixed.temp === 'f' || fixed.temp === 'c') ? fixed.temp : 'c';
}
if (currentDistUnit !== 'mi' && currentDistUnit !== 'km') {
  const fixed = resolveUnitsFromPrefs();
  currentDistUnit = (fixed.dist === 'mi' || fixed.dist === 'km') ? fixed.dist : 'km';
}
if (!['thumb', 'medium', 'full'].includes(galleryQuality)) galleryQuality = 'medium';
if (!['full', 'reduced', 'off'].includes(motionMode)) motionMode = 'full';

function recomputeAutoPrefs({ paint = true } = {}) {
  let themeChanged = false;
  let unitsChanged = false;
  const nextTheme = resolveThemeFromAppearanceStyle(prefAppearance, prefStyle);
  if (nextTheme !== currentTheme) {
    currentTheme = nextTheme;
    themeChanged = true;
  }
  const u = resolveUnitsFromPrefs();
  if (u.temp !== currentTempUnit || u.dist !== currentDistUnit) {
    currentTempUnit = u.temp;
    currentDistUnit = u.dist;
    unitsChanged = true;
  }
  if (!paint) return { themeChanged, unitsChanged };
  if (themeChanged || prefAppearance === 'system') {
    document.documentElement.setAttribute('data-theme', currentTheme);
    applyThemeChrome(currentTheme);
    if (typeof updateAppearanceStyleUI === 'function') updateAppearanceStyleUI();
    dispatchPrefs('theme', { theme: currentTheme });
  }
  if (unitsChanged || (prefTempUnit === 'auto' || prefDistUnit === 'auto')) {
    syncUnitGlobals();
    updateUnitUI();
    if (typeof applyUnits === 'function') applyUnits();
  }
  return { themeChanged, unitsChanged };
}

/* Respects the Settings choice AND the OS-level preference. Checked live so
   OS flips mid-session still calm things down. Constrained devices force off. */
const prefersReducedMotionMQ = safeMatchMedia('(prefers-reduced-motion: reduce)');

/**
 * Effective animation level after combining user + OS + device.
 * - off: no motion
 * - reduced: short, opacity-first, a11y-friendly motion
 * - full: standard experience
 */
function getEffectiveMotionMode() {
  // Tiny / wearable webviews: always off (GPU + battery budget)
  if (ENV.constrained) return 'off';
  // Explicit user choice always wins (Settings “Full” must re-enable motion
  // even when OS prefers-reduced-motion is on — user opted in)
  if (motionMode === 'off') return 'off';
  if (motionMode === 'full') return 'full';
  if (motionMode === 'reduced') return 'reduced';
  // Unset / unexpected: fall back to OS preference
  if (prefersReducedMotionMQ.matches) return 'reduced';
  return 'full';
}

/** True when non-essential motion should be avoided (reduced or off). */
function motionActive() {
  return getEffectiveMotionMode() !== 'full';
}
function motionIsOff() {
  return getEffectiveMotionMode() === 'off';
}
function motionIsReduced() {
  return getEffectiveMotionMode() === 'reduced';
}

function applyMotionModeToDom() {
  const effective = getEffectiveMotionMode();
  // User's explicit choice (for Settings UI)
  document.documentElement.setAttribute('data-motion', motionMode);
  // What CSS should actually paint
  document.documentElement.setAttribute('data-motion-effective', effective);
  dispatchPrefs('motion', { motion: effective });
}

applyMotionModeToDom();

/** Instant anchors when motion is reduced/off; smooth when Full (incl. mobile). */
function scrollBehaviorPref() {
  const mode = getEffectiveMotionMode();
  if (mode !== 'full') return 'auto';
  return 'smooth';
}

/* ── APPEARANCE × STYLE ── */
const appearancePills = document.querySelectorAll('#appearancePillGroup .pill-btn');
const stylePills = document.querySelectorAll('#stylePillGroup .pill-btn');

function updateAppearanceStyleUI() {
  appearancePills.forEach(function (p) {
    p.classList.toggle('active', p.dataset.appearanceVal === prefAppearance);
  });
  stylePills.forEach(function (p) {
    p.classList.toggle('active', p.dataset.styleVal === prefStyle);
  });
}
function updateThemeUI() {
  updateAppearanceStyleUI();
}

const THEME_META_COLORS = {
  default: '#07101c',
  minimal: '#f5f5f7',
  elegant: '#f6f1e8',
  glass: '#000000'
};
function applyThemeChrome(theme) {
  const light = LIGHT_THEMES.includes(theme);
  document.documentElement.style.colorScheme = light ? 'light' : 'dark';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_META_COLORS[theme] || THEME_META_COLORS.default);
}

function applyAppearanceStyle({ persist = false } = {}) {
  currentTheme = resolveThemeFromAppearanceStyle(prefAppearance, prefStyle);
  prefTheme = prefAppearance === 'system' ? 'auto' : currentTheme;
  if (persist) {
    safeStorage.set('duskline-appearance', prefAppearance);
    safeStorage.set('duskline-style', prefStyle);
  }
  document.documentElement.setAttribute('data-theme', currentTheme);
  applyThemeChrome(currentTheme);
  updateAppearanceStyleUI();
  dispatchPrefs('theme', { theme: currentTheme });
}

appearancePills.forEach(function (p) {
  p.addEventListener('click', function () {
    const v = p.dataset.appearanceVal;
    if (v !== 'system' && v !== 'light' && v !== 'dark') return;
    prefAppearance = v;
    applyAppearanceStyle({ persist: true });
  });
});
stylePills.forEach(function (p) {
  p.addEventListener('click', function () {
    const v = p.dataset.styleVal;
    if (v !== 'classic' && v !== 'modern') return;
    prefStyle = v;
    applyAppearanceStyle({ persist: true });
    dispatchPrefs('style', { style: prefStyle });
  });
});
applyAppearanceStyle({ persist: false });

const prefersColorSchemeDarkMQ = safeMatchMedia('(prefers-color-scheme: dark)');
function onColorSchemeChange() {
  // Only System appearance tracks OS light/dark
  if (prefAppearance === 'system') {
    applyAppearanceStyle({ persist: false });
  }
}
if (typeof prefersColorSchemeDarkMQ.addEventListener === 'function') {
  prefersColorSchemeDarkMQ.addEventListener('change', onColorSchemeChange);
} else if (typeof prefersColorSchemeDarkMQ.addListener === 'function') {
  prefersColorSchemeDarkMQ.addListener(onColorSchemeChange);
}
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') recomputeAutoPrefs({ paint: true });
});

/* ── LANGUAGE PILLS ── */
const langPills = document.querySelectorAll('#langPillGroup .pill-btn');
function updateLangUI(lang) {
  langPills.forEach(p => p.classList.toggle('active', p.dataset.langVal === lang));
}
langPills.forEach(p => {
  p.addEventListener('click', () => {
    currentLang = p.dataset.langVal;
    safeStorage.set('duskline-lang', currentLang);
    updateLangUI(currentLang);
    // Auto units: system locale still wins; language is only fallback
    recomputeAutoPrefs({ paint: true });
    applyLanguage(currentLang);
  });
});
updateLangUI(currentLang);

/* ── UNIT PILLS (auto | f/c | mi/km) ── */
const tempPills = document.querySelectorAll('#unitTempGroup .pill-btn');
const distPills = document.querySelectorAll('#unitDistGroup .pill-btn');

function unitsResolvedHintText(resolved) {
  const r = resolved || resolveUnitsFromPrefs();
  const tempLab = r.temp === 'f' ? '°F' : '°C';
  const distLab = r.dist === 'mi'
    ? (currentLang === 'zh' ? '英里' : currentLang === 'ja' ? 'マイル' : currentLang === 'es' ? 'millas' : 'mi')
    : (currentLang === 'zh' ? '公里' : currentLang === 'ja' ? 'km' : currentLang === 'es' ? 'km' : 'km');
  if (currentLang === 'zh') return '当前：' + tempLab + ' · ' + distLab;
  if (currentLang === 'ja') return '現在：' + tempLab + ' · ' + distLab;
  if (currentLang === 'es') return 'Ahora: ' + tempLab + ' · ' + distLab;
  return 'Using ' + tempLab + ' · ' + distLab;
}

function ensureUnitsResolvedHintEl() {
  let el = document.getElementById('unitsResolvedHint');
  if (el) return el;
  const tempGroup = document.getElementById('unitTempGroup');
  const host = tempGroup && tempGroup.closest
    ? (tempGroup.closest('.settings-group') || tempGroup.parentElement)
    : null;
  if (!host) return null;
  el = document.createElement('p');
  el.id = 'unitsResolvedHint';
  el.className = 'settings-units-resolved';
  el.setAttribute('aria-live', 'polite');
  // Place after the distance subgroup (end of units group content)
  host.appendChild(el);
  return el;
}

function updateUnitsResolvedHint() {
  const el = ensureUnitsResolvedHintEl();
  if (!el) return;
  const r = syncUnitGlobals();
  el.textContent = unitsResolvedHintText(r);
  el.hidden = false;
  el.setAttribute('data-temp', r.temp);
  el.setAttribute('data-dist', r.dist);
  el.setAttribute('data-source', r.source || '');
}

function updateUnitUI() {
  tempPills.forEach(function (p) {
    p.classList.toggle('active', p.dataset.unitVal === prefTempUnit);
  });
  distPills.forEach(function (p) {
    p.classList.toggle('active', p.dataset.unitVal === prefDistUnit);
  });
  updateUnitsResolvedHint();
}

function paintUnitsEverywhere() {
  const resolved = syncUnitGlobals();
  updateUnitUI();
  applyUnits();
  return resolved;
}

function applyResolvedUnits(resolved) {
  if (resolved) {
    currentTempUnit = resolved.temp;
    currentDistUnit = resolved.dist;
  }
  return paintUnitsEverywhere();
}

/** Shared setters — Settings pills + Weather units sheet use the same prefs. */
window.getTempUnitPreference = function getTempUnitPreference() {
  return prefTempUnit;
};
window.getDistUnitPreference = function getDistUnitPreference() {
  return prefDistUnit;
};
window.setTempUnitPreference = function setTempUnitPreference(next) {
  if (next !== 'auto' && next !== 'f' && next !== 'c') return null;
  prefTempUnit = next;
  safeStorage.set('duskline-temp-unit', prefTempUnit);
  return applyResolvedUnits(resolveUnitsFromPrefs());
};
window.setDistUnitPreference = function setDistUnitPreference(next) {
  if (next !== 'auto' && next !== 'mi' && next !== 'km') return null;
  prefDistUnit = next;
  safeStorage.set('duskline-dist-unit', prefDistUnit);
  return applyResolvedUnits(resolveUnitsFromPrefs());
};

tempPills.forEach(function (p) {
  p.addEventListener('click', function () {
    window.setTempUnitPreference(p.dataset.unitVal);
  });
});
distPills.forEach(function (p) {
  p.addEventListener('click', function () {
    window.setDistUnitPreference(p.dataset.unitVal);
  });
});
updateUnitUI();
updateUnitsResolvedHint();

function formatTempFromC(celsius, opts) {
  opts = opts || {};
  if (celsius == null || Number.isNaN(Number(celsius))) return '—';
  const unit = opts.unit || currentTempUnit || 'c';
  let n = Number(celsius);
  if (unit === 'f') n = n * 9 / 5 + 32;
  return String(Math.round(n)) + '°';
}

function formatDistFromMi(miles, opts) {
  opts = opts || {};
  if (miles == null || Number.isNaN(Number(miles))) return '—';
  const unit = opts.unit || currentDistUnit || 'km';
  const loc = opts.locale || numberLocale();
  const n = unit === 'km' ? Number(miles) * 1.60934 : Number(miles);
  return Math.round(n).toLocaleString(loc);
}

function tKey(key, fallback) {
  const dict = getI18nDict(currentLang);
  if (dict && key && dict[key]) return dict[key];
  return fallback != null ? fallback : key;
}

/** Shared public namespace — prefer this over loose globals going forward. */
window.Duskline = Object.assign(window.Duskline || {}, {
  getTempUnitPreference: window.getTempUnitPreference,
  setTempUnitPreference: window.setTempUnitPreference,
  getDistUnitPreference: window.getDistUnitPreference,
  setDistUnitPreference: window.setDistUnitPreference,
  getEffectiveTempUnit: window.getEffectiveTempUnit,
  getEffectiveDistUnit: window.getEffectiveDistUnit,
  formatTempFromC: formatTempFromC,
  formatDistFromMi: formatDistFromMi,
  numberLocale: numberLocale,
  paintUnitSpans: paintUnitSpans,
  t: tKey,
  detectUnits: detectUnits,
  resolveUnitsFromPrefs: resolveUnitsFromPrefs,
  dispatchPrefs: dispatchPrefs,
  debugUnits: window.__usaTravelUnits
});

/* ── ACCESSIBILITY PILLS (Animations: full / reduced / off · Cursor Effect) ── */
const motionPills = document.querySelectorAll('#motionPillGroup .pill-btn');
function updateMotionUI() {
  motionPills.forEach(p => p.classList.toggle('active', p.dataset.motionVal === motionMode));
}
function setMotionMode(next, { persist = true } = {}) {
  if (!['full', 'reduced', 'off'].includes(next)) next = 'full';
  motionMode = next;
  if (persist) safeStorage.set('duskline-motion', motionMode);
  applyMotionModeToDom();
  updateMotionUI();
  if (typeof updateCursorUI === 'function') updateCursorUI();
}
motionPills.forEach(p => p.addEventListener('click', () => {
  setMotionMode(p.dataset.motionVal || 'full', { persist: true });
}));
updateMotionUI();

const cursorPills = document.querySelectorAll('#cursorPillGroup .pill-btn');
function updateCursorUI() {
  cursorPills.forEach(p => p.classList.toggle('active', p.dataset.cursorVal === (cursorEffectEnabled ? 'on' : 'off')));
  // Keep the overlay canvas in sync — trail is off in reduced/off modes.
  const cursorCanvasEl = document.getElementById('cursorCanvas');
  if (cursorCanvasEl) {
    const off = !cursorEffectEnabled || motionActive();
    cursorCanvasEl.classList.toggle('is-disabled', off);
    cursorCanvasEl.setAttribute('aria-hidden', off ? 'true' : 'false');
  }
}
cursorPills.forEach(p => p.addEventListener('click', () => {
  cursorEffectEnabled = p.dataset.cursorVal === 'on';
  safeStorage.set('duskline-cursor-fx', cursorEffectEnabled ? 'on' : 'off');
  updateCursorUI();
}));
updateCursorUI();
// If the OS reduced-motion preference flips mid-session, re-apply effective mode.
function onOsMotionPreferenceChange() {
  applyMotionModeToDom();
  updateCursorUI();
}
if (typeof prefersReducedMotionMQ.addEventListener === 'function') {
  prefersReducedMotionMQ.addEventListener('change', onOsMotionPreferenceChange);
} else if (typeof prefersReducedMotionMQ.addListener === 'function') {
  prefersReducedMotionMQ.addListener(onOsMotionPreferenceChange);
}

/* ── GALLERY QUALITY PILLS (thumb / medium / full) ── */
const galleryQualityPills = document.querySelectorAll('#galleryQualityGroup .pill-btn');
function updateGalleryQualityUI() {
  galleryQualityPills.forEach(p => {
    p.classList.toggle('active', p.dataset.galleryQuality === galleryQuality);
  });
}
galleryQualityPills.forEach(p => p.addEventListener('click', () => {
  const next = p.dataset.galleryQuality;
  if (!['thumb', 'medium', 'full'].includes(next)) return;
  galleryQuality = next;
  safeStorage.set('duskline-gallery-quality', galleryQuality);
  updateGalleryQualityUI();
  dispatchPrefs('gallery-quality', { quality: galleryQuality });
}));
updateGalleryQualityUI();

/* ── UTILITY: GET CSS VARIABLE ── */
function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#e8a435';
}

// Sizes a canvas's backing store to the device pixel ratio so drawing stays
// crisp on Retina / HiDPI / 4K+ screens instead of looking soft/blurry, while
// letting the rest of the drawing code keep working in plain CSS-pixel units.
// Capped lower on mobile so we don't allocate multi‑megapixel bitmaps.
// Explicit CSS width/height keep clientX/clientY coordinates aligned with the
// drawing buffer after the bitmap is scaled up for DPR.
function fitCanvasToDPR(canvas, ctx) {
  const maxDpr = ENV.mobile || ENV.constrained ? 1.5 : 3;
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const cssW = window.innerWidth;
  const cssH = window.innerHeight;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width: cssW, height: cssH };
}

// Throttles a resize handler to at most once per animation frame so live
// window drag-resizing doesn't repeatedly reallocate canvas buffers.
// Ignores pure height-only visualViewport changes (mobile URL bar show/hide),
// which used to thrash canvas rebuilds mid-scroll and could crash Safari.
function onResizeRAF(fn) {
  let pending = false;
  let lastW = window.innerWidth || 0;
  let lastH = window.innerHeight || 0;
  const run = (force) => {
    if (pending) return;
    pending = true;
    raf(() => {
      pending = false;
      try {
        const w = window.innerWidth || 0;
        const h = window.innerHeight || 0;
        // Treat as meaningful only if width changed or height jumped a lot
        // (orientation / keyboard), not the ~50–100px URL-bar collapse.
        const dw = Math.abs(w - lastW);
        const dh = Math.abs(h - lastH);
        if (!force && dw < 40 && dh < 140) return;
        lastW = w;
        lastH = h;
        fn();
      } catch (e) { /* ignore */ }
    });
  };
  try {
    window.addEventListener('resize', () => run(false), { passive: true });
    window.addEventListener('orientationchange', () => run(true), { passive: true });
    // Intentionally NOT listening to visualViewport.resize — that fires on
    // every iOS chrome show/hide and caused mid-scroll canvas reallocations.
  } catch (e) { /* ignore */ }
}

/* ── SCROLL UI (navigation only) ── */
let scrollUiPending = false;

function updateScrollUi() {
  scrollUiPending = false;
  const y = window.scrollY || document.documentElement.scrollTop || 0;
  if (typeof onPageScroll === 'function') onPageScroll(y);
}
window.addEventListener('scroll', () => {
  if (scrollUiPending) return;
  scrollUiPending = true;
  raf(updateScrollUi);
}, { passive: true });

/* ── CURSOR TRAIL ──
   Fine-pointer desktops only. Spawns particles only while the cursor is
   actually moving (not a stationary fountain), keeps CSS/bitmap size in
   lockstep for correct coordinates, and hard-caps particle count. */
(function() {
  const c = document.getElementById('cursorCanvas');
  if (!c) return;

  // Prefer devices that can hover with a fine pointer (mice / trackpads).
  // pointer:coarse alone is wrong on hybrid convertibles that report both.
  // Always off on constrained / wearable webviews (GPU + battery budget).
  const canHoverFine = !ENV.constrained
    && safeMatchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHoverFine) {
    c.classList.add('is-disabled');
    c.setAttribute('aria-hidden', 'true');
    return;
  }

  const ctx = c.getContext('2d', { alpha: true });
  if (!ctx) return;

  const particles = [];
  /* Toned-down editorial trail: fewer, smaller, shorter-lived sparks */
  const MAX_PARTICLES = 22;
  let mx = -999, my = -999;
  let prevX = -999, prevY = -999;
  let isMouseIn = false;
  let movedThisFrame = false;
  let cssW = 0, cssH = 0;
  let rafId = 0;
  let running = false;

  function resize() { ({ width: cssW, height: cssH } = fitCanvasToDPR(c, ctx)); }
  resize();
  onResizeRAF(resize);

  document.addEventListener('pointermove', e => {
    // Ignore touch/pen so hybrid tablets don't paint trails from finger pans.
    if (e.pointerType && e.pointerType !== 'mouse') return;
    mx = e.clientX;
    my = e.clientY;
    isMouseIn = true;
    // Only treat as "moving" when the cursor actually traveled a pixel.
    if (Math.abs(mx - prevX) > 0.5 || Math.abs(my - prevY) > 0.5) {
      movedThisFrame = true;
      prevX = mx;
      prevY = my;
    }
    if (!running && cursorEffectEnabled && !motionActive()) startLoop();
  }, { passive: true });

  // window/document "mouseleave" is unreliable; relatedTarget null means the
  // pointer left the document (to chrome / another app).
  document.addEventListener('mouseout', e => {
    if (!e.relatedTarget && !e.toElement) {
      isMouseIn = false;
      movedThisFrame = false;
    }
  });
  document.documentElement.addEventListener('mouseleave', () => {
    isMouseIn = false;
    movedThisFrame = false;
  });
  window.addEventListener('blur', () => {
    isMouseIn = false;
    movedThisFrame = false;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isMouseIn = false;
      movedThisFrame = false;
      particles.length = 0;
      ctx.clearRect(0, 0, cssW, cssH);
    }
  });

  function startLoop() {
    if (running) return;
    running = true;
    rafId = raf(tick);
  }
  function stopLoop() {
    running = false;
    if (rafId) cancelRaf(rafId);
    rafId = 0;
    ctx.clearRect(0, 0, cssW, cssH);
  }

  function tick() {
    if (!running) return;
    rafId = raf(tick);
    ctx.clearRect(0, 0, cssW, cssH);

    // Respect the "Cursor Trail" Settings toggle and reduced-motion preference.
    if (!cursorEffectEnabled || motionActive()) {
      if (particles.length) particles.length = 0;
      stopLoop();
      return;
    }

    const themeAccent = getCssVar('--accent-1');

    // Emit only while the pointer is moving — a quiet ink-trail, not a fountain.
    if (isMouseIn && movedThisFrame) {
      const burst = particles.length < MAX_PARTICLES / 3 ? 1 : (Math.random() > 0.45 ? 1 : 0);
      for (let n = 0; n < burst; n++) {
        if (particles.length >= MAX_PARTICLES) break;
        particles.push({
          x: mx + (Math.random() - 0.5) * 4,
          y: my + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -Math.random() * 0.55 - 0.12,
          life: 1,
          size: Math.random() * 1.6 + 0.7,
          color: themeAccent
        });
      }
      movedThisFrame = false;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.006;
      p.life -= 0.045;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.globalAlpha = p.life * 0.32;
      ctx.fillStyle = p.color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Idle with nothing left to draw — pause the RAF loop until next move.
    if (!particles.length && !movedThisFrame) {
      stopLoop();
    }
  }

  // Kick once if the trail is enabled so resize state is warm.
  if (cursorEffectEnabled && !motionActive()) {
    // Loop starts on first pointermove; keep canvas ready and visible.
    c.classList.remove('is-disabled');
  }
})();

/* ── NAVBAR + ACTIVE LINK ── */
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]:not(#settings):not(#tools)');
const navLinks = document.querySelectorAll('.nav-links a[data-section]');
const isGalleryPage = document.body.classList.contains('page-gallery');
const isToolsPage = document.body.classList.contains('page-tools');
const isMiniAppPage = isGalleryPage || isToolsPage;

// Cache section tops — avoid layout thrash from offsetTop on every scroll tick.
let sectionTopsCache = [];
let sectionTopsDirty = true;
function invalidateSectionTops() { sectionTopsDirty = true; }
function refreshSectionTops() {
  if (!sectionTopsDirty) return;
  sectionTopsCache = [];
  sections.forEach((s) => {
    sectionTopsCache.push({ id: s.id, top: s.offsetTop });
  });
  sectionTopsDirty = false;
}
try {
  window.addEventListener('resize', invalidateSectionTops, { passive: true });
  window.addEventListener('orientationchange', invalidateSectionTops, { passive: true });
  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => { invalidateSectionTops(); });
    sections.forEach((s) => { try { ro.observe(s); } catch (e) { /* ignore */ } });
  }
} catch (e) { /* ignore */ }

/* Nav scrolled + section spy: only write DOM when state changes.
   Scroll thresholds use a small hysteresis band to avoid flicker. */
let navIsScrolled = false;
const NAV_SCROLL_ON = 72;
const NAV_SCROLL_OFF = 40;
let lastActiveSection = null;

function setNavScrolled(on) {
  if (!navbar || on === navIsScrolled) return;
  navIsScrolled = on;
  navbar.classList.toggle('scrolled', on);
}

function setActiveNavSection(current) {
  if (current === lastActiveSection) return;
  lastActiveSection = current;
  navLinks.forEach((a) => {
    a.classList.toggle('active-link', a.dataset.section === current);
  });
}

function onPageScroll(y) {
  if (navbar) {
    if (!navIsScrolled && y > NAV_SCROLL_ON) setNavScrolled(true);
    else if (navIsScrolled && y < NAV_SCROLL_OFF) setNavScrolled(false);
  }

  // Mini-apps use their own chrome (no section spy on guide nav links).
  if (isMiniAppPage) {
    if (isGalleryPage) setActiveNavSection('gallery');
    return;
  }

  refreshSectionTops();
  let current = '';
  const threshold = y + 200;
  for (let i = 0; i < sectionTopsCache.length; i++) {
    if (threshold >= sectionTopsCache[i].top) current = sectionTopsCache[i].id;
  }
  // Homepage teaser uses id="gallery" — highlight Gallery while it's in view.
  setActiveNavSection(current);
}

// Initial paint (gallery load, deep-linked homepage section)
{
  const y0 = window.scrollY || 0;
  setNavScrolled(y0 > NAV_SCROLL_ON);
  if (isGalleryPage) setActiveNavSection('gallery');
  else if (!isMiniAppPage) {
    try { onPageScroll(y0); } catch (e) { /* ignore */ }
  }
}

/* ── HAMBURGER (main guide only — gallery mini-app has no mobile drawer) ── */
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');
if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    const willOpen = !hamburger.classList.contains('open');
    if (willOpen) {
      lockBodyScroll();
      hamburger.classList.add('open');
      navMobile.classList.add('open');
    } else {
      hamburger.classList.remove('open');
      navMobile.classList.remove('open');
      unlockBodyScroll();
    }
    hamburger.setAttribute('aria-expanded', String(willOpen));
  });
}

function closeMobileNav() {
  if (!hamburger || !navMobile) return;
  const wasOpen = navMobile.classList.contains('open');
  navMobile.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  if (wasOpen) unlockBodyScroll();
}

/* ── SETTINGS DIALOG ── */
const settingsOverlay = document.getElementById('settingsOverlay');
const settingsOpenBtn = document.getElementById('settingsOpen');
const mobileSettingsBtn = document.getElementById('mobileSettingsBtn'); // may be null on gallery mini-app
const settingsCloseBtn = document.getElementById('settingsClose');
let lastSettingsTrigger = null;
// Nested-safe scroll lock: mobile nav, settings, tools, modals, and the
// lightbox all share this so opening one over another never resets scroll to 0
// or leaves body permanently fixed.
let scrollLockCount = 0;
let lockedScrollY = 0;

/** True when any full-screen overlay that owns the scroll lock is open. */
function isAnyScrollLockOverlayOpen() {
  const lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) return true;
  if (settingsOverlay && settingsOverlay.classList.contains('open')) return true;
  const modal = document.getElementById('modal-overlay');
  if (modal && modal.classList.contains('open')) return true;
  const mobile = document.getElementById('navMobile');
  if (mobile && mobile.classList.contains('open')) return true;
  return false;
}

function clearBodyScrollLockStyles() {
  const html = document.documentElement;
  const y = lockedScrollY;
  // Force instant scroll BEFORE releasing body lock — otherwise CSS
  // `scroll-behavior: smooth` animates from the top to the saved offset.
  const prevInline = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  html.classList.add('scroll-instant');

  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  html.style.overflow = '';

  if (typeof window.scrollTo === 'function') {
    try {
      window.scrollTo({ top: y, left: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, y);
    }
  } else {
    html.scrollTop = y;
    document.body.scrollTop = y;
  }

  // Restore smooth anchors on the next frame (after paint settles).
  raf(() => {
    raf(() => {
      html.style.scrollBehavior = prevInline;
      html.classList.remove('scroll-instant');
    });
  });
}

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    // Prevent iOS rubber-band from fighting the lock.
    document.documentElement.style.overflow = 'hidden';
  }
  scrollLockCount++;
}

function unlockBodyScroll() {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount > 0) return;
  clearBodyScrollLockStyles();
}

/**
 * Safety net: if no overlay is open but the body is still locked (e.g. Enter
 * on role=button also synthesized a click and double-incremented the counter),
 * force a full release so mouse wheel / trackpad scrolling works again.
 */
function ensureBodyScrollUnlocked() {
  if (isAnyScrollLockOverlayOpen()) return;
  if (scrollLockCount === 0
      && !document.body.style.position
      && !document.documentElement.style.overflow) {
    return;
  }
  scrollLockCount = 0;
  clearBodyScrollLockStyles();
}

function openSettings(trigger) {
  if (!settingsOverlay || settingsOverlay.classList.contains('open')) return;
  dispatchPrefs('gallery-close');
  lastSettingsTrigger = trigger || document.activeElement;
  closeMobileNav();
  lockBodyScroll();
  settingsOverlay.classList.add('open');
  settingsOverlay.setAttribute('aria-hidden', 'false');
  settingsOverlay.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  if (settingsCloseBtn) setTimeout(() => settingsCloseBtn.focus(), 100);
}

function closeSettings() {
  if (!settingsOverlay || !settingsOverlay.classList.contains('open')) return;
  const restoreY = lockedScrollY;
  settingsOverlay.classList.remove('open');
  settingsOverlay.setAttribute('aria-hidden', 'true');
  unlockBodyScroll();
  ensureBodyScrollUnlocked();
  if (lastSettingsTrigger && typeof lastSettingsTrigger.focus === 'function') {
    try { lastSettingsTrigger.focus({ preventScroll: true }); }
    catch (e) { lastSettingsTrigger.focus(); }
  }
  try { window.scrollTo({ top: restoreY, left: 0, behavior: 'instant' }); }
  catch (e) { window.scrollTo(0, restoreY); }
}

if (settingsOpenBtn) settingsOpenBtn.addEventListener('click', () => openSettings(settingsOpenBtn));
if (mobileSettingsBtn) mobileSettingsBtn.addEventListener('click', () => openSettings(mobileSettingsBtn));
if (settingsCloseBtn) settingsCloseBtn.addEventListener('click', closeSettings);
if (settingsOverlay) settingsOverlay.addEventListener('click', e => { if (e.target === settingsOverlay) closeSettings(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && settingsOverlay && settingsOverlay.classList.contains('open')) {
    e.preventDefault();
    closeSettings();
    // Prevent the later modal / mobile-nav Escape handler from also firing.
    e.stopImmediatePropagation();
  }
});

/* ── SCROLL REVEAL (all pages) ──
   .reveal starts at opacity:0 until .visible is added. This used to live only
   in features/home.js, so gallery/tools mini-apps never revealed their headers,
   search, or filters — leaving a huge empty band above the content. */
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  // Mini-apps are short pages; show chrome immediately (no scroll required).
  const isMiniApp = document.body.classList.contains('page-gallery')
    || document.body.classList.contains('page-tools')
    || document.body.classList.contains('page-legal');
  if (isMiniApp) {
    els.forEach((el) => { el.classList.add('visible'); });
    return;
  }
  if (typeof observeWhenVisible === 'function') {
    observeWhenVisible(els, (el) => { el.classList.add('visible'); }, {
      threshold: 0.05,
      rootMargin: '0px 0px -40px 0px'
    });
  } else {
    els.forEach((el) => { el.classList.add('visible'); });
  }
})();



/* Hybrid tablet / mouse: enable fine-pointer hover when a real mouse moves */
(function initFinePointerHover() {
  const root = document.documentElement;
  const mq = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');
  const apply = (on) => {
    try {
      if (on) root.classList.add('has-fine-pointer');
      else root.classList.remove('has-fine-pointer');
    } catch (e) {}
  };
  if (mq) {
    apply(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', (e) => apply(e.matches));
    else if (mq.addListener) mq.addListener((e) => apply(e.matches));
  }
  // First real mouse move also enables (covers iPadOS + trackpad quirks)
  const onMove = (e) => {
    if (e && e.pointerType === 'mouse') {
      apply(true);
      window.removeEventListener('pointermove', onMove, true);
    }
  };
  window.addEventListener('pointermove', onMove, true);
})();
