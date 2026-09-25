'use strict';
/* Duskline — weather/app.js
   Main weather UI, state, and boot.
   Modules: ns, sky, charts, alerts, data (factories).
*/
(function () {
  var W = window.DusklineWeather;
  if (!W || !W.active) return;

  if (!document.getElementById('weatherList') && !document.querySelector('[data-tool="weather"]')) return;

  // ── API + storage keys ──────────────────────────────────────────────
  const FORECAST = 'https://api.open-meteo.com/v1/forecast';
  const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search';
  const AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  const REFRESH_MS = 10 * 60 * 1000;
  const WIND_KEY = 'duskline-weather-wind';
  const PRECIP_KEY = 'duskline-weather-precip';
  const PRESS_KEY = 'duskline-weather-pressure';
  const FAV_KEY = 'duskline-weather-favorites';
  const MYLOC_KEY = 'duskline-weather-myloc';
  const MODE_KEY = 'duskline-weather-mode';
  const SELECTED_CITY_KEY = 'duskline-weather-greeting-city';
  const GREETING_SOURCE_KEY = 'duskline-weather-greeting-source';

  const MAJOR = (window.WEATHER_CITIES && window.WEATHER_CITIES.length)
    ? window.WEATHER_CITIES
    : [];

  /**
   * Localized major-city display names (static — no network).
   * Keys match cityKey() = lat.toFixed(3)+','+lon.toFixed(3)
   *
   * COVERAGE: en / es / zh / ja only, the four languages the interface was originally
   * written in. Every other locale falls back to the English name. That is deliberate —
   * city and state names are proper nouns, and a mistranslation is worse than leaving them
   * untranslated. Extend this only with native review; do not machine-translate the set.
   */
  const CITY_NAMES = {
    '40.713,-74.006': { en: 'New York', es: 'Nueva York', zh: '纽约', ja: 'ニューヨーク' },
    '34.052,-118.244': { en: 'Los Angeles', es: 'Los Ángeles', zh: '洛杉矶', ja: 'ロサンゼルス' },
    '41.878,-87.630': { en: 'Chicago', es: 'Chicago', zh: '芝加哥', ja: 'シカゴ' },
    '29.760,-95.370': { en: 'Houston', es: 'Houston', zh: '休斯顿', ja: 'ヒューストン' },
    '33.448,-112.074': { en: 'Phoenix', es: 'Phoenix', zh: '凤凰城', ja: 'フェニックス' },
    '39.953,-75.165': { en: 'Philadelphia', es: 'Filadelfia', zh: '费城', ja: 'フィラデルフィア' },
    '29.424,-98.494': { en: 'San Antonio', es: 'San Antonio', zh: '圣安东尼奥', ja: 'サンアントニオ' },
    '32.716,-117.161': { en: 'San Diego', es: 'San Diego', zh: '圣地亚哥', ja: 'サンディエゴ' },
    '32.777,-96.797': { en: 'Dallas', es: 'Dallas', zh: '达拉斯', ja: 'ダラス' },
    '37.338,-121.886': { en: 'San Jose', es: 'San José', zh: '圣何塞', ja: 'サンノゼ' },
    '30.267,-97.743': { en: 'Austin', es: 'Austin', zh: '奥斯汀', ja: 'オースティン' },
    '30.332,-81.656': { en: 'Jacksonville', es: 'Jacksonville', zh: '杰克逊维尔', ja: 'ジャクソンビル' },
    '37.775,-122.419': { en: 'San Francisco', es: 'San Francisco', zh: '旧金山', ja: 'サンフランシスコ' },
    '39.961,-82.999': { en: 'Columbus', es: 'Columbus', zh: '哥伦布', ja: 'コロンバス' },
    '35.227,-80.843': { en: 'Charlotte', es: 'Charlotte', zh: '夏洛特', ja: 'シャーロット' },
    '39.768,-86.158': { en: 'Indianapolis', es: 'Indianápolis', zh: '印第安纳波利斯', ja: 'インディアナポリス' },
    '47.606,-122.332': { en: 'Seattle', es: 'Seattle', zh: '西雅图', ja: 'シアトル' },
    '39.739,-104.990': { en: 'Denver', es: 'Denver', zh: '丹佛', ja: 'デンバー' },
    '38.907,-77.037': { en: 'Washington', es: 'Washington D. C.', zh: '华盛顿', ja: 'ワシントン' },
    '42.360,-71.059': { en: 'Boston', es: 'Boston', zh: '波士顿', ja: 'ボストン' },
    '36.163,-86.782': { en: 'Nashville', es: 'Nashville', zh: '纳什维尔', ja: 'ナッシュビル' },
    '42.331,-83.046': { en: 'Detroit', es: 'Detroit', zh: '底特律', ja: 'デトロイト' },
    '45.515,-122.678': { en: 'Portland', es: 'Portland', zh: '波特兰', ja: 'ポートランド' },
    '36.170,-115.140': { en: 'Las Vegas', es: 'Las Vegas', zh: '拉斯维加斯', ja: 'ラスベガス' },
    '35.150,-90.049': { en: 'Memphis', es: 'Memphis', zh: '孟菲斯', ja: 'メンフィス' },
    '38.253,-85.758': { en: 'Louisville', es: 'Louisville', zh: '路易斯维尔', ja: 'ルイビル' },
    '39.290,-76.612': { en: 'Baltimore', es: 'Baltimore', zh: '巴尔的摩', ja: 'ボルチモア' },
    '43.039,-87.906': { en: 'Milwaukee', es: 'Milwaukee', zh: '密尔沃基', ja: 'ミルウォーキー' },
    '35.084,-106.650': { en: 'Albuquerque', es: 'Albuquerque', zh: '阿尔伯克基', ja: 'アルバカーキ' },
    '32.223,-110.975': { en: 'Tucson', es: 'Tucson', zh: '图森', ja: 'ツーソン' },
    '36.738,-119.787': { en: 'Fresno', es: 'Fresno', zh: '弗雷斯诺', ja: 'フレズノ' },
    '38.582,-121.494': { en: 'Sacramento', es: 'Sacramento', zh: '萨克拉门托', ja: 'サクラメント' },
    '33.749,-84.388': { en: 'Atlanta', es: 'Atlanta', zh: '亚特兰大', ja: 'アトランタ' },
    '25.762,-80.192': { en: 'Miami', es: 'Miami', zh: '迈阿密', ja: 'マイアミ' },
    '29.951,-90.072': { en: 'New Orleans', es: 'Nueva Orleans', zh: '新奥尔良', ja: 'ニューオーリンズ' },
    '44.978,-93.265': { en: 'Minneapolis', es: 'Minneapolis', zh: '明尼阿波利斯', ja: 'ミネアポリス' },
    '40.761,-111.891': { en: 'Salt Lake City', es: 'Salt Lake City', zh: '盐湖城', ja: 'ソルトレイクシティ' },
    '21.307,-157.858': { en: 'Honolulu', es: 'Honolulu', zh: '火奴鲁鲁', ja: 'ホノルル' },
    '61.218,-149.900': { en: 'Anchorage', es: 'Anchorage', zh: '安克雷奇', ja: 'アンカレッジ' }
  };
  Object.assign(CITY_NAMES, {
    '43.653,-79.383': { en: 'Toronto', es: 'Toronto', zh: '多伦多', ja: 'トロント' },
    '49.283,-123.121': { en: 'Vancouver', es: 'Vancouver', zh: '温哥华', ja: 'バンクーバー' },
    '19.433,-99.133': { en: 'Mexico City', es: 'Ciudad de México', zh: '墨西哥城', ja: 'メキシコシティ' },
    '51.507,-0.128': { en: 'London', es: 'Londres', zh: '伦敦', ja: 'ロンドン' },
    '48.857,2.352': { en: 'Paris', es: 'París', zh: '巴黎', ja: 'パリ' },
    '40.417,-3.704': { en: 'Madrid', es: 'Madrid', zh: '马德里', ja: 'マドリード' },
    '41.903,12.496': { en: 'Rome', es: 'Roma', zh: '罗马', ja: 'ローマ' },
    '52.520,13.405': { en: 'Berlin', es: 'Berlín', zh: '柏林', ja: 'ベルリン' },
    '41.008,28.978': { en: 'Istanbul', es: 'Estambul', zh: '伊斯坦布尔', ja: 'イスタンブール' },
    '35.676,139.650': { en: 'Tokyo', es: 'Tokio', zh: '东京', ja: '東京' },
    '37.567,126.978': { en: 'Seoul', es: 'Seúl', zh: '首尔', ja: 'ソウル' },
    '39.904,116.407': { en: 'Beijing', es: 'Pekín', zh: '北京', ja: '北京' },
    '22.319,114.169': { en: 'Hong Kong', es: 'Hong Kong', zh: '香港', ja: '香港' },
    '1.352,103.820': { en: 'Singapore', es: 'Singapur', zh: '新加坡', ja: 'シンガポール' },
    '13.756,100.502': { en: 'Bangkok', es: 'Bangkok', zh: '曼谷', ja: 'バンコク' },
    '19.076,72.878': { en: 'Mumbai', es: 'Bombay', zh: '孟买', ja: 'ムンバイ' },
    '28.614,77.209': { en: 'Delhi', es: 'Delhi', zh: '德里', ja: 'デリー' },
    '-33.869,151.209': { en: 'Sydney', es: 'Sídney', zh: '悉尼', ja: 'シドニー' },
    '-37.814,144.963': { en: 'Melbourne', es: 'Melbourne', zh: '墨尔本', ja: 'メルボルン' },
    '-36.851,174.765': { en: 'Auckland', es: 'Auckland', zh: '奥克兰', ja: 'オークランド' },
    '-23.551,-46.633': { en: 'São Paulo', es: 'São Paulo', zh: '圣保罗', ja: 'サンパウロ' },
    '-34.604,-58.382': { en: 'Buenos Aires', es: 'Buenos Aires', zh: '布宜诺斯艾利斯', ja: 'ブエノスアイレス' },
    '30.044,31.236': { en: 'Cairo', es: 'El Cairo', zh: '开罗', ja: 'カイロ' },
    '-26.204,28.047': { en: 'Johannesburg', es: 'Johannesburgo', zh: '约翰内斯堡', ja: 'ヨハネスブルク' }
  });

  /** Localized US state / region labels for list meta line */
  const ADMIN1_NAMES = {
    'New York': { es: 'Nueva York', zh: '纽约州', ja: 'ニューヨーク州' },
    'California': { es: 'California', zh: '加利福尼亚州', ja: 'カリフォルニア州' },
    'Illinois': { es: 'Illinois', zh: '伊利诺伊州', ja: 'イリノイ州' },
    'Texas': { es: 'Texas', zh: '得克萨斯州', ja: 'テキサス州' },
    'Arizona': { es: 'Arizona', zh: '亚利桑那州', ja: 'アリゾナ州' },
    'Pennsylvania': { es: 'Pensilvania', zh: '宾夕法尼亚州', ja: 'ペンシルベニア州' },
    'Florida': { es: 'Florida', zh: '佛罗里达州', ja: 'フロリダ州' },
    'Ohio': { es: 'Ohio', zh: '俄亥俄州', ja: 'オハイオ州' },
    'North Carolina': { es: 'Carolina del Norte', zh: '北卡罗来纳州', ja: 'ノースカロライナ州' },
    'Indiana': { es: 'Indiana', zh: '印第安纳州', ja: 'インディアナ州' },
    'Washington': { es: 'Washington', zh: '华盛顿州', ja: 'ワシントン州' },
    'Colorado': { es: 'Colorado', zh: '科罗拉多州', ja: 'コロラド州' },
    'District of Columbia': { es: 'Distrito de Columbia', zh: '哥伦比亚特区', ja: 'コロンビア特別区' },
    'Massachusetts': { es: 'Massachusetts', zh: '马萨诸塞州', ja: 'マサチューセッツ州' },
    'Tennessee': { es: 'Tennessee', zh: '田纳西州', ja: 'テネシー州' },
    'Michigan': { es: 'Míchigan', zh: '密歇根州', ja: 'ミシガン州' },
    'Oregon': { es: 'Oregón', zh: '俄勒冈州', ja: 'オレゴン州' },
    'Nevada': { es: 'Nevada', zh: '内华达州', ja: 'ネバダ州' },
    'Kentucky': { es: 'Kentucky', zh: '肯塔基州', ja: 'ケンタッキー州' },
    'Maryland': { es: 'Maryland', zh: '马里兰州', ja: 'メリーランド州' },
    'Wisconsin': { es: 'Wisconsin', zh: '威斯康星州', ja: 'ウィスコンシン州' },
    'New Mexico': { es: 'Nuevo México', zh: '新墨西哥州', ja: 'ニューメキシコ州' },
    'Georgia': { es: 'Georgia', zh: '佐治亚州', ja: 'ジョージア州' },
    'Louisiana': { es: 'Luisiana', zh: '路易斯安那州', ja: 'ルイジアナ州' },
    'Minnesota': { es: 'Minnesota', zh: '明尼苏达州', ja: 'ミネソタ州' },
    'Utah': { es: 'Utah', zh: '犹他州', ja: 'ユタ州' },
    'Hawaii': { es: 'Hawái', zh: '夏威夷', ja: 'ハワイ' },
    'Alaska': { es: 'Alaska', zh: '阿拉斯加州', ja: 'アラスカ州' }
  };

  /**
   * Main list + page canvas: static visuals (no rain/particle loops) for performance.
   * City detail keeps full animated FX (rain, storm, ornaments) as before.
   */
  const WEATHER_STATIC_LIST_FX = true;

  const WMO = {
    0: { en: 'Clear', es: 'Despejado', zh: '晴', ja: '快晴' },
    1: { en: 'Mainly clear', es: 'Mayormente despejado', zh: '大部晴朗', ja: 'ほぼ晴れ' },
    2: { en: 'Partly cloudy', es: 'Parcialmente nublado', zh: '多云', ja: '晴れ時々曇り' },
    3: { en: 'Overcast', es: 'Cubierto', zh: '阴', ja: '曇り' },
    45: { en: 'Fog', es: 'Niebla', zh: '雾', ja: '霧' },
    48: { en: 'Rime fog', es: 'Niebla helada', zh: '雾凇', ja: '着氷性の霧' },
    51: { en: 'Light drizzle', es: 'Llovizna ligera', zh: '小毛毛雨', ja: '弱い霧雨' },
    53: { en: 'Drizzle', es: 'Llovizna', zh: '毛毛雨', ja: '霧雨' },
    55: { en: 'Heavy drizzle', es: 'Llovizna intensa', zh: '强毛毛雨', ja: '強い霧雨' },
    56: { en: 'Light freezing drizzle', es: 'Llovizna helada ligera', zh: '轻度冻毛毛雨', ja: '弱い着氷性の霧雨' },
    57: { en: 'Freezing drizzle', es: 'Llovizna helada', zh: '冻毛毛雨', ja: '着氷性の霧雨' },
    61: { en: 'Light rain', es: 'Lluvia ligera', zh: '小雨', ja: '弱い雨' },
    63: { en: 'Rain', es: 'Lluvia', zh: '雨', ja: '雨' },
    65: { en: 'Heavy rain', es: 'Lluvia intensa', zh: '大雨', ja: '強い雨' },
    66: { en: 'Freezing rain', es: 'Lluvia helada', zh: '冻雨', ja: '着氷性の雨' },
    67: { en: 'Heavy freezing rain', es: 'Lluvia helada intensa', zh: '强冻雨', ja: '強い着氷性の雨' },
    71: { en: 'Light snow', es: 'Nieve ligera', zh: '小雪', ja: '弱い雪' },
    73: { en: 'Snow', es: 'Nieve', zh: '雪', ja: '雪' },
    75: { en: 'Heavy snow', es: 'Nieve intensa', zh: '大雪', ja: '大雪' },
    77: { en: 'Snow grains', es: 'Granos de nieve', zh: '雪粒', ja: '雪あられ' },
    80: { en: 'Rain showers', es: 'Chubascos', zh: '阵雨', ja: 'にわか雨' },
    81: { en: 'Rain showers', es: 'Chubascos', zh: '阵雨', ja: 'にわか雨' },
    82: { en: 'Violent rain showers', es: 'Chubascos fuertes', zh: '强阵雨', ja: '激しいにわか雨' },
    85: { en: 'Snow showers', es: 'Chubascos de nieve', zh: '阵雪', ja: 'にわか雪' },
    86: { en: 'Heavy snow showers', es: 'Chubascos de nieve intensos', zh: '强阵雪', ja: '激しいにわか雪' },
    95: { en: 'Thunderstorm', es: 'Tormenta', zh: '雷暴', ja: '雷雨' },
    96: { en: 'Thunderstorm with hail', es: 'Tormenta con granizo', zh: '雷暴伴冰雹', ja: '雷雨（ひょう）' },
    99: { en: 'Thunderstorm with hail', es: 'Tormenta con granizo', zh: '雷暴伴冰雹', ja: '雷雨（ひょう）' }
  };

  const $ = (id) => document.getElementById(id);
  const listEl = $('weatherList');
  const favListEl = $('weatherFavoritesList');
  const favBlock = $('weatherFavoritesBlock');
  const mySkyEmptyEl = $('weatherMySkyEmpty');
  const myLocListEl = $('weatherMyLocationList');
  const myLocBlock = $('weatherMyLocationBlock');
  const majorsBlock = $('weatherMajorsBlock');
  const shellEl = $('weatherShell');
  const errorEl = $('weatherError');
  const updatedEl = $('weatherUpdated');
  const searchEl = $('weatherSearch');
  const searchClear = $('weatherSearchClear');
  const suggestEl = $('weatherSuggest');
  const refreshBtn = $('weatherRefresh');
  const locateBtn = $('weatherLocate');
  const mySkyLocateBtn = $('weatherMySkyLocate');
  const mySkySearchBtn = $('weatherMySkySearch');
  const greetingTitleEl = $('weatherGreeting');
  const greetingSizerEl = $('weatherGreetingSizer');
  const greetingTextEl = $('weatherGreetingText');
  const greetingPlaceBtn = $('weatherGreetingPlace');
  const modeButtons = Array.from(document.querySelectorAll('[data-weather-mode]'));
  const unitsBtn = $('weatherUnitsBtn');
  const detailEl = $('weatherDetail');
  const detailHero = $('weatherDetailHero');
  const detailMods = $('weatherModules');
  const detailScroll = $('weatherDetailScroll');
  const detailBack = $('weatherDetailBack');
  const detailRefresh = $('weatherDetailRefresh');
  const detailFavBtn = $('weatherDetailFav');
  const detailSky = $('weatherDetailSky');
  const sheetEl = $('weatherSheet');
  const sheetBody = $('weatherSheetBody');
  const sheetClose = $('weatherSheetClose');

  const CACHE_SOFT_MAX = 200;
  const cacheStore = new Map();
  function isPinnedCacheKey(key) {
    if (myLocationCity && cityKey(myLocationCity) === key) return true;
    if (selectedGreetingCity && cityKey(selectedGreetingCity) === key) return true;
    if (MAJOR.some(function (c) { return cityKey(c) === key; })) return true;
    try {
      return loadFavorites().some(function (c) { return cityKey(c) === key; });
    } catch (e) { return false; }
  }
  function evictWeatherCache() {
    if (cacheStore.size <= CACHE_SOFT_MAX) return;
    for (const k of cacheStore.keys()) {
      if (cacheStore.size <= CACHE_SOFT_MAX) break;
      if (isPinnedCacheKey(k)) continue;
      cacheStore.delete(k);
    }
  }
  const cache = {
    get: function (k) {
      if (!cacheStore.has(k)) return undefined;
      const v = cacheStore.get(k);
      cacheStore.delete(k);
      cacheStore.set(k, v);
      return v;
    },
    set: function (k, v) {
      if (cacheStore.has(k)) cacheStore.delete(k);
      cacheStore.set(k, v);
      evictWeatherCache();
      return cache;
    },
    has: function (k) { return cacheStore.has(k); },
    delete: function (k) { return cacheStore.delete(k); },
    clear: function () { cacheStore.clear(); },
    forEach: function (fn, thisArg) { cacheStore.forEach(fn, thisArg); },
    get size() { return cacheStore.size; }
  };
  let autoRefreshTimer = null;
  let searchTimer = 0;
  let openCity = null;
  let weatherMode = null;
  let weatherModeExplicit = false;
  let selectedGreetingCity = null;
  let selectingGreetingPlace = false;
  let greetingTypeTimer = 0;
  let greetingTypeGeneration = 0;
  let greetingBoundaryTimer = 0;
  let lastGreetingText = '';
  let greetingVisitSeed = null;
  const aqiDetailInflight = new Map();
  let activeSheetKind = null;

  let lastListFetch = 0;
  let myLocationCity = null;
  let refreshGen = 0;       // supersede stale refresh() completions
  let refreshInflight = null; // Promise of current refresh, if any
  let alertsPrefetchGen = 0; // cancel in-flight alert prefetch (module-owned gen also exists)
  /** Detail open/close motion — generation counters cancel stale rAF/timeouts. */
  let detailMotionGen = 0;
  let detailMotionTimer = 0;
  let detailEnterTimer = 0;
  let detailCloseListener = null;
  let searchGen = 0;
  let overlaysHoisted = false;

  function lang() {
    return (typeof currentLang === 'string' && currentLang) || 'en';
  }
  function langFallbacks() {
    const L = lang();
    const keys = [L];
    if (L === 'zh-TW') keys.push('zh');
    if (L === 'pt-BR') keys.push('pt-PT');
    if (L === 'pt-PT') keys.push('pt-BR');
    if (L.indexOf('-') > 0) keys.push(L.split('-')[0]);
    keys.push('en');
    return keys;
  }
  function pickLangMap(map, fallback) {
    if (!map) return fallback || '';
    const keys = langFallbacks();
    for (let i = 0; i < keys.length; i++) {
      if (map[keys[i]]) return map[keys[i]];
    }
    return fallback || map.en || '';
  }
  function t(key, fallback) {
    const get = typeof getI18nDict === 'function' ? getI18nDict : null;
    const keys = langFallbacks();
    if (get) {
      for (let i = 0; i < keys.length; i++) {
        const dict = get(keys[i]);
        if (dict && dict[key]) return dict[key];
      }
    }
    try {
      const pack = window.I18N;
      if (pack) {
        for (let j = 0; j < keys.length; j++) {
          if (pack[keys[j]] && pack[keys[j]][key]) return pack[keys[j]][key];
        }
      }
    } catch (e) { /* ignore */ }
    // Empty-string fallback must win. `fallback || key` turned missing
    // `weather.about.*` lookups into the key itself ("weather.about.uv").
    if (fallback !== undefined && fallback !== null) return fallback;
    return key;
  }
  function geocodeLangParam() {
    const L = lang();
    if (L === 'zh-TW') return 'zh-TW';
    if (window.DUSKLINE_LANG_CODES && window.DUSKLINE_LANG_CODES.indexOf(L) !== -1) return L;
    return L.split('-')[0] || 'en';
  }
  function localeTag() {
    const L = lang();
    if (window.DUSKLINE_LOCALE_TAGS && window.DUSKLINE_LOCALE_TAGS[L]) return window.DUSKLINE_LOCALE_TAGS[L];
    if (L === 'zh') return 'zh-CN';
    if (L === 'ja') return 'ja-JP';
    if (L === 'es') return 'es-ES';
    if (L && L.indexOf('-') > 0) return L;
    return L || 'en-US';
  }
  function useF() {
    if (typeof window.getEffectiveTempUnit === 'function') {
      return window.getEffectiveTempUnit() === 'f';
    }
    return document.documentElement.getAttribute('data-temp-unit') === 'f';
  }
  function useMi() {
    if (typeof window.getEffectiveDistUnit === 'function') {
      return window.getEffectiveDistUnit() === 'mi';
    }
    return document.documentElement.getAttribute('data-dist-unit') !== 'km';
  }
  function motionLevel() {
    try {
      const m = document.documentElement.getAttribute('data-motion-effective');
      if (m === 'off' || m === 'reduced') return m;
      return 'full';
    } catch (e) { return 'full'; }
  }
  function motionFull() { return motionLevel() === 'full'; }

  function windUnit() {
    const fallback = useMi() ? 'mph' : 'kmh';
    try {
      const value = localStorage.getItem(WIND_KEY);
      return ['mph', 'kmh', 'ms', 'bft', 'kn'].indexOf(value) >= 0 ? value : fallback;
    } catch (e) { return fallback; }
  }
  function precipUnit() {
    const fallback = useMi() ? 'in' : 'mm';
    try {
      const value = localStorage.getItem(PRECIP_KEY);
      return ['in', 'mm', 'cm'].indexOf(value) >= 0 ? value : fallback;
    } catch (e) { return fallback; }
  }
  function pressUnit() {
    try {
      const value = localStorage.getItem(PRESS_KEY);
      return ['hPa', 'mbar', 'inHg', 'mmHg', 'kPa'].indexOf(value) >= 0 ? value : 'hPa';
    } catch (e) { return 'hPa'; }
  }
  function setWindUnit(u) { if (['mph', 'kmh', 'ms', 'bft', 'kn'].indexOf(u) >= 0) try { localStorage.setItem(WIND_KEY, u); } catch (e) {} }
  function setPrecipUnit(u) { if (['in', 'mm', 'cm'].indexOf(u) >= 0) try { localStorage.setItem(PRECIP_KEY, u); } catch (e) {} }
  function setPressUnit(u) { if (['hPa', 'mbar', 'inHg', 'mmHg', 'kPa'].indexOf(u) >= 0) try { localStorage.setItem(PRESS_KEY, u); } catch (e) {} }


  /* ── Wire factory modules ── */
  var skyApi = (W.factories.sky && W.factories.sky({
    motionLevel: motionLevel,
    staticListFx: typeof WEATHER_STATIC_LIST_FX !== 'undefined' ? WEATHER_STATIC_LIST_FX : true
  })) || {};
  var applySky = skyApi.applySky;
  var applyAmbientPageSky = skyApi.applyAmbientPageSky;

  var chartsApi = null;
  var alertsApi = null;
  var dataApi = null;

  function wireRemainingModules() {
    if (!W.factories.charts || !W.factories.alerts || !W.factories.data) {
      console.error('[weather] missing factories', Object.keys(W.factories || {}));
      return;
    }
    chartsApi = W.factories.charts({
      t: t, escapeHtml: escapeHtml, lang: lang, localeTag: localeTag,
      fmtTemp: fmtTemp, fmtWind: fmtWind, fmtPress: fmtPress, fmtPrecip: fmtPrecip,
      degToCompass: degToCompass,
      motionLevel: motionLevel, formatClock: formatClock, formatChartAxisHour: formatChartAxisHour,
      useF: useF, condIcon: condIcon
    });
    // data first — alert hooks resolve lazily at call time
    dataApi = W.factories.data({
      cache: cache, cityKey: cityKey, sameCity: sameCity, MAJOR: MAJOR,
      FORECAST: FORECAST, GEOCODE: GEOCODE, AIR: AIR,
      FORECAST_Q: FORECAST_Q,
      FORECAST_Q_LIST: FORECAST_Q_LIST,
      REFRESH_MS: REFRESH_MS,
      t: t,
      onCityLoaded: function (city, pack) {
        pendingCityKeys.delete(cityKey(city));
        if (pack && pack.fetchedAt) setUpdated(pack.fetchedAt);
        if (pack && pack.city && pack.city.isMyLocation) applyAmbientPageSky();
        // The greeting starts with a lightweight “checking” line while the
        // selected place loads. Refresh it as soon as that place's real pack
        // lands so it can use current conditions and the evening outlook.
        const greetingCity = getGreetingSourceCity();
        if (greetingCity && sameCity(city, greetingCity)) updateGreeting();
        if (refreshInflight && !replaceCityCard(city, pack)) {
          refreshListsFromCache({ force: true, skipAmbient: true });
        }
      },
      loadNwsAlerts: function () { return alertsApi.loadNwsAlerts.apply(null, arguments); },
      applyAlertsToPack: function () { return alertsApi.applyAlertsToPack.apply(null, arguments); },
      ensureNwsAlerts: function () { return alertsApi.ensureNwsAlerts.apply(null, arguments); }
    });
    alertsApi = W.factories.alerts({
      t: t, escapeHtml: escapeHtml, lang: lang, formatClock: formatClock, motionLevel: motionLevel,
      roundCoord: roundCoord, isLikelyUs: function (c) { return dataApi.isLikelyUs(c); }, sameCity: sameCity,
      NWS_BASE: NWS_BASE,
      nwsFetchJson: function (url, signal) { return dataApi.nwsFetchJson(url, signal); },
      cityKey: cityKey, cache: cache,
      getDetailMods: function () { return detailMods; },
      isDetailVisible: isDetailShowingOrOpening,
      getOpenCity: function () { return openCity; },
      scheduleListPaintFromAlerts: function (pack) {
        if (typeof scheduleListPaintFromAlerts === 'function') scheduleListPaintFromAlerts(pack);
      }
    });
  }


  // Shared Open-Meteo query (also used inside data module)
  // past_days=1 so hourly includes earlier hours of the local calendar day (Apple-style 00–24 charts)
  const FORECAST_Q =
    'current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,precipitation'
    + '&hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,precipitation,wind_speed_10m,wind_direction_10m,relative_humidity_2m,surface_pressure,uv_index'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max'
    + '&temperature_unit=celsius&wind_speed_unit=ms&timezone=auto&forecast_days=10&past_days=1';
  /**
   * List rows show only current conditions plus today's H/L, so the list load asks
   * Open-Meteo for exactly that: no hourly series and no daily fields beyond the three it
   * renders. That is ~94% smaller per city than the full query (measured: 19,017 -> 1,171
   * bytes), and packs built from it are marked `needsEnrich` so opening a city upgrades it
   * to FORECAST_Q. Detail, sheets and enrichment always use the full FORECAST_Q.
   */
  const FORECAST_Q_LIST =
    'current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,precipitation'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min'
    + '&temperature_unit=celsius&wind_speed_unit=ms&timezone=auto&forecast_days=10';
  const NWS_BASE = 'https://api.weather.gov';

  function roundCoord(n) {
    return Math.round(Number(n) * 100) / 100;
  }

  // List paint lock (was in alerts slice — kept here for load orchestration)
  var listPaintLocked = false;
  var pendingCityKeys = new Set();
  var listPaintTimer = 0;
  var listPaintQueued = false;
  function cancelPendingListPaints() {
    listPaintQueued = false;
    if (listPaintTimer) {
      try { clearTimeout(listPaintTimer); } catch (e) {}
      listPaintTimer = 0;
    }
  }
  function scheduleListPaintFromAlerts(pack) {
    if (pack && pack.city) {
      pendingCityKeys.delete(cityKey(pack.city));
      if (replaceCityCard(pack.city, pack)) return;
    }
    if (listPaintLocked) {
      listPaintQueued = true;
      return;
    }
    listPaintQueued = true;
    if (listPaintTimer) return;
    listPaintTimer = setTimeout(function () {
      listPaintTimer = 0;
      if (!listPaintQueued || listPaintLocked) return;
      listPaintQueued = false;
      refreshListsFromCache({ skipAmbient: true });
    }, 500);
  }

  function cityKey(c) {
    return (Number(c.lat).toFixed(3) + ',' + Number(c.lon).toFixed(3));
  }
  function sameCity(a, b) {
    return cityKey(a) === cityKey(b);
  }

  function cityTimeZone(pack, city) {
    return (pack && pack.weather && pack.weather.timezone)
      || (city && city.tz)
      || (pack && pack.city && pack.city.tz)
      || undefined;
  }

  /** Index of the local calendar day in an Open-Meteo/NWS daily array (past_days=1 puts yesterday at [0]). */
  function dailyTodayIndex(daily, timeZone) {
    const times = (daily && daily.time) || [];
    if (!times.length) return 0;
    let today = '';
    try {
      if (chartsApi && typeof chartsApi.localDateKey === 'function') {
        today = chartsApi.localDateKey(Date.now(), timeZone);
      } else {
        today = new Intl.DateTimeFormat('en-CA', {
          timeZone: timeZone || undefined,
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date());
      }
    } catch (e) {
      today = new Date().toISOString().slice(0, 10);
    }
    for (let i = 0; i < times.length; i++) {
      if (String(times[i] || '').slice(0, 10) === today) return i;
    }
    for (let i = 0; i < times.length; i++) {
      if (String(times[i] || '').slice(0, 10) >= today) return i;
    }
    return 0;
  }

  function dailyFieldAt(daily, field, index) {
    const arr = daily && daily[field];
    if (!arr || index == null || index < 0) return null;
    return arr[index] != null ? arr[index] : null;
  }

  /** Expand the day's high/low so the current reading cannot sit outside it. */
  function dayHiLo(daily, dayIdx, currentTemp) {
    let hi = dailyFieldAt(daily, 'temperature_2m_max', dayIdx);
    let lo = dailyFieldAt(daily, 'temperature_2m_min', dayIdx);
    const cur = currentTemp != null ? Number(currentTemp) : NaN;
    if (Number.isFinite(cur)) {
      if (hi == null || !Number.isFinite(Number(hi)) || cur > Number(hi)) hi = cur;
      if (lo == null || !Number.isFinite(Number(lo)) || cur < Number(lo)) lo = cur;
    }
    return { hi: hi, lo: lo };
  }

  function hourlyNowValue(hourly, field, timeZone) {
    const times = (hourly && hourly.time) || [];
    const arr = hourly && hourly[field];
    if (!times.length || !arr) return null;
    const now = Date.now();
    let idx = 0;
    let found = false;
    for (let i = 0; i < times.length; i++) {
      const ms = stampToMs(times[i], timeZone);
      if (Number.isFinite(ms) && ms >= now - 3600000) { idx = i; found = true; break; }
    }
    if (!found) return null;
    const v = arr[idx];
    return v != null && Number.isFinite(Number(v)) ? Number(v) : null;
  }

  function uvLabelFor(v) {
    if (v == null || !Number.isFinite(Number(v))) return '';
    if (v >= 11) return t('weather.uvExtreme', 'Extreme');
    if (v >= 8) return t('weather.uvVeryHigh', 'Very High');
    if (v >= 6) return t('weather.uvHigh', 'High');
    if (v >= 3) return t('weather.uvModerate', 'Moderate');
    return t('weather.uvLow', 'Low');
  }

  /** Current UV when hourly exists; at night do not fall back to the daily max. */
  function uvNowValue(pack, daily, dayIdx, hourly, timeZone) {
    const nowUv = hourlyNowValue(hourly, 'uv_index', timeZone);
    if (nowUv != null) return nowUv;
    const hour = localHourForPack(pack);
    if (hour < 6 || hour >= 20) return 0;
    return dailyFieldAt(daily, 'uv_index_max', dayIdx);
  }

  function sheetContextText(kind, pack, timeZone) {
    const weather = pack && pack.weather || {};
    const current = weather.current || {};
    const hourly = weather.hourly || {};
    const daily = weather.daily || {};
    if (kind === 'humidity') {
      const raw = current.relative_humidity_2m;
      const humidity = Number(raw);
      if (raw == null || raw === '' || !Number.isFinite(humidity)) return '';
      const value = new Intl.NumberFormat(localeTag(), { maximumFractionDigits: 0 }).format(Math.round(humidity));
      if (humidity <= 25) return t('weather.context.humidity.low', '{value}% humidity is low, so the air may feel dry.').replace('{value}', value);
      if (humidity >= 80) return t('weather.context.humidity.high', 'Humidity is high at {value}%, which can make the air feel muggy.').replace('{value}', value);
      return '';
    }
    if (kind === 'wind') {
      const raw = current.wind_speed_10m;
      const wind = Number(raw);
      if (raw == null || raw === '' || !Number.isFinite(wind) || wind < 8) return '';
      return t('weather.context.wind.strong', 'Winds are strong at {value}, so exposed areas may feel blustery.')
        .replace('{value}', fmtWind(wind));
    }
    if (kind === 'sun') {
      const index = dailyTodayIndex(daily, timeZone);
      const sunrise = dailyFieldAt(daily, 'sunrise', index);
      const sunset = dailyFieldAt(daily, 'sunset', index);
      if (!sunrise || !sunset) return '';
      const start = stampToMs(sunrise, timeZone);
      let end = stampToMs(sunset, timeZone);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return '';
      if (end < start) end += 24 * 3600000;
      const totalMinutes = Math.round((end - start) / 60000);
      if (totalMinutes <= 0 || totalMinutes > 24 * 60) return '';
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const format = function (n) { return new Intl.NumberFormat(localeTag(), { maximumFractionDigits: 0 }).format(n); };
      return t('weather.context.sun.daylight', 'There are about {hours} hours and {minutes} minutes of daylight today.')
        .replace('{hours}', format(hours)).replace('{minutes}', format(minutes));
    }
    if (kind === 'conditions') {
      const index = dailyTodayIndex(daily, timeZone);
      const high = dailyFieldAt(daily, 'temperature_2m_max', index);
      const low = dailyFieldAt(daily, 'temperature_2m_min', index);
      if (high == null || low == null || !Number.isFinite(Number(high)) || !Number.isFinite(Number(low))) return '';
      return t('weather.context.conditions.range', 'Today’s forecast ranges from {low} to {high}.')
        .replace('{low}', fmtTemp(low)).replace('{high}', fmtTemp(high));
    }
    if (kind === 'uv') {
      const day = dailyTodayIndex(daily, timeZone);
      const peakRaw = dailyFieldAt(daily, 'uv_index_max', day);
      const peak = peakRaw != null && peakRaw !== '' && Number.isFinite(Number(peakRaw))
        ? Number(peakRaw) : null;
      const currentUv = hourlyNowValue(hourly, 'uv_index', timeZone);
      const value = peak == null ? currentUv : Math.max(peak, currentUv == null ? 0 : currentUv);
      if (value == null || !Number.isFinite(value)) return '';
      const band = value >= 11 ? 'extreme' : value >= 8 ? 'veryHigh' : value >= 6 ? 'high' : value >= 3 ? 'moderate' : 'low';
      return t('weather.context.uv.' + band, '');
    }
    if (kind === 'precip') {
      const times = hourly.time || [];
      const chances = hourly.precipitation_probability || [];
      const codes = hourly.weather_code || [];
      const now = Date.now();
      let peak = null;
      let peakCode = Number(current.weather_code);
      for (let i = 0; i < times.length; i++) {
        const at = stampToMs(times[i], timeZone);
        if (!Number.isFinite(at) || at < now - 3600000 || at > now + 8 * 3600000) continue;
        if (chances[i] == null || chances[i] === '') continue;
        const chance = Number(chances[i]);
        if (!Number.isFinite(chance)) continue;
        if (peak == null || chance > peak) {
          peak = chance;
          if (codes[i] != null) peakCode = Number(codes[i]);
        }
      }
      const currentAmount = Number(current.precipitation);
      if (peak == null && !Number.isFinite(currentAmount)) return '';
      if (Number.isFinite(currentAmount) && currentAmount > 0 && (peak == null || peak < 50)) peak = 60;
      if (peak == null) return '';
      const snow = (peakCode >= 71 && peakCode <= 77) || peakCode === 85 || peakCode === 86;
      const band = peak < 20 ? 'none' : peak < 50 ? 'possible' : 'likely';
      const message = band === 'none' ? 'none' : (snow ? 'snow' : 'rain') + (band === 'possible' ? 'Possible' : 'Likely');
      return t('weather.context.precip.' + message, '');
    }
    if (kind === 'feels') {
      if (current.temperature_2m == null || current.apparent_temperature == null
          || current.temperature_2m === '' || current.apparent_temperature === '') return '';
      const actual = Number(current.temperature_2m);
      const feels = Number(current.apparent_temperature);
      if (!Number.isFinite(actual) || !Number.isFinite(feels)) return '';
      const delta = feels - actual;
      const amount = Math.abs(delta) * (useF() ? 1.8 : 1);
      const rounded = Math.round(amount);
      if (rounded < 1) return t('weather.feelsSimilar', 'Similar to actual');
      return t(delta > 0 ? 'weather.feelsWarmer' : 'weather.feelsCooler', delta > 0 ? 'Warmer by {n}°' : 'Cooler by {n}°')
        .replace('{n}', String(rounded));
    }
    if (kind === 'vis') {
      if (current.visibility == null || current.visibility === '') return '';
      const visibility = Number(current.visibility);
      if (!Number.isFinite(visibility) || visibility >= 5000) return '';
      return t('weather.visReduced', 'Reduced visibility');
    }
    if (kind === 'pressure') {
      const times = hourly.time || [];
      const values = hourly.surface_pressure || [];
      let index = -1;
      for (let i = 0; i < times.length; i++) {
        const at = stampToMs(times[i], timeZone);
        if (Number.isFinite(at) && at >= Date.now() - 3600000) { index = i; break; }
      }
      if (index < 3 || values[index] == null || values[index - 3] == null) return '';
      const change = Number(values[index]) - Number(values[index - 3]);
      if (!Number.isFinite(change)) return '';
      const key = change > 0.8 ? 'weather.pressureRising' : change < -0.8 ? 'weather.pressureFalling' : 'weather.pressureSteady';
      return t(key, '');
    }
    return '';
  }

  function isBareWallClock(iso) {
    const s = String(iso || '');
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) && !/[zZ]$/.test(s) && !/[+-]\d{2}:\d{2}$/.test(s);
  }

  function stampToMs(iso, timeZone) {
    const s = String(iso || '');
    if (!s) return NaN;
    if (isBareWallClock(s) && chartsApi && typeof chartsApi.wallClockInZoneToUtcMs === 'function') {
      return chartsApi.wallClockInZoneToUtcMs(s, timeZone);
    }
    if (isBareWallClock(s) && window.DusklineWxMath && typeof window.DusklineWxMath.wallClockInZoneToUtcMs === 'function') {
      return window.DusklineWxMath.wallClockInZoneToUtcMs(s, timeZone);
    }
    const t = new Date(s).getTime();
    return Number.isFinite(t) ? t : NaN;
  }

  function wallHour(iso, timeZone) {
    const s = String(iso || '');
    if (isBareWallClock(s)) {
      const m = s.match(/T(\d{2})/);
      return m ? parseInt(m[1], 10) : 12;
    }
    try {
      const opts = { hour: 'numeric', hourCycle: 'h23' };
      if (timeZone) opts.timeZone = timeZone;
      const parts = new Intl.DateTimeFormat('en-GB', opts).formatToParts(new Date(s));
      const h = parts.find(function (p) { return p.type === 'hour'; });
      return h ? parseInt(h.value, 10) % 24 : 12;
    } catch (e) {
      try { return new Date(s).getHours(); } catch (e2) { return 12; }
    }
  }

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr.filter((c) => c && Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lon)) && c.name)
        .map((c) => ({
          name: c.name,
          admin1: c.admin1 || '',
          lat: Number(c.lat),
          lon: Number(c.lon),
          tz: c.tz,
          country: c.country || '',
          country_code: c.country_code || ''
        }));
    } catch (e) { return []; }
  }
  function saveFavorites(list) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list.slice(0, 24))); } catch (e) {}
  }
  function isFavorite(c) {
    return loadFavorites().some((f) => sameCity(f, c));
  }
  function toggleFavorite(c) {
    let list = loadFavorites();
    if (list.some((f) => sameCity(f, c))) {
      list = list.filter((f) => !sameCity(f, c));
    } else {
      list = [{
        name: c.name, admin1: c.admin1 || '', lat: c.lat, lon: c.lon, tz: c.tz,
        country: c.country || '', country_code: c.country_code || ''
      }, ...list.filter((f) => !sameCity(f, c))];
    }
    saveFavorites(list);
    return list;
  }

  function loadMyLocation() {
    try {
      const raw = localStorage.getItem(MYLOC_KEY);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (!c || !Number.isFinite(Number(c.lat)) || !Number.isFinite(Number(c.lon)) || !c.name) return null;
      const locatedAt = (typeof c.locatedAt === 'number' && c.locatedAt > 0) ? c.locatedAt : 0;
      return {
        name: c.name, admin1: c.admin1 || '', lat: Number(c.lat), lon: Number(c.lon), tz: c.tz,
        country: c.country || '', country_code: c.country_code || '',
        isMyLocation: true, locatedAt: locatedAt
      };
    } catch (e) { return null; }
  }
  function saveMyLocation(c, opts) {
    opts = opts || {};
    if (!c) {
      try { localStorage.removeItem(MYLOC_KEY); } catch (e) {}
      myLocationCity = null;
      return;
    }
    // Stamp when the device position was (re)fetched — not the weather pack time.
    const prev = myLocationCity || loadMyLocation();
    let locatedAt = typeof c.locatedAt === 'number' && c.locatedAt > 0 ? c.locatedAt : 0;
    if (opts.refreshLocatedAt || !locatedAt) {
      locatedAt = Date.now();
    } else if (prev && prev.locatedAt && sameCity(prev, c) && !opts.refreshLocatedAt) {
      // Keep prior stamp when re-saving same pin without a new geolocation fix
      locatedAt = prev.locatedAt;
    }
    if (!locatedAt) locatedAt = Date.now();
    myLocationCity = {
      name: c.name, admin1: c.admin1 || '', lat: c.lat, lon: c.lon, tz: c.tz,
      country: c.country || '', country_code: c.country_code || '',
      isMyLocation: true, locatedAt: locatedAt
    };
    try { localStorage.setItem(MYLOC_KEY, JSON.stringify(myLocationCity)); } catch (e) {}
  }

  function loadGreetingCity() {
    try {
      const c = JSON.parse(localStorage.getItem(SELECTED_CITY_KEY) || 'null');
      if (!c || !Number.isFinite(Number(c.lat)) || !Number.isFinite(Number(c.lon)) || !c.name) return null;
      return {
        name: String(c.name), admin1: c.admin1 || '', lat: Number(c.lat), lon: Number(c.lon),
        tz: c.tz, country: c.country || '', country_code: c.country_code || '', names: c.names || {}
      };
    } catch (e) { return null; }
  }
  function saveGreetingCity(c) {
    if (!c || c.isMyLocation || !c.name || !Number.isFinite(Number(c.lat)) || !Number.isFinite(Number(c.lon))) return;
    selectedGreetingCity = {
      name: String(c.name), admin1: c.admin1 || '', lat: Number(c.lat), lon: Number(c.lon),
      tz: c.tz, country: c.country || '', country_code: c.country_code || '', names: c.names || {}
    };
    try { localStorage.setItem(SELECTED_CITY_KEY, JSON.stringify(selectedGreetingCity)); } catch (e) {}
  }
  function greetingSourceOptions() {
    const options = [];
    const seen = new Set();
    function add(city, kind) {
      if (!city || !Number.isFinite(Number(city.lat)) || !Number.isFinite(Number(city.lon))) return;
      const key = cityKey(city);
      if (seen.has(key)) {
        const existing = options.find(function (option) { return cityKey(option.city) === key; });
        // A device location keeps its dedicated label if the fallback city happens
        // to resolve to the same coordinates.
        if (existing && kind === 'chosen' && existing.kind !== 'location') existing.kind = kind;
        return;
      }
      seen.add(key);
      options.push({ id: (city.isMyLocation ? 'my-location' : 'city:' + key), city: city, kind: kind });
    }
    if (myLocationCity) add(myLocationCity, 'location');
    if (selectedGreetingCity) add(selectedGreetingCity, 'chosen');
    loadFavorites().forEach(function (city) { add(city, 'favorite'); });
    return options;
  }
  function getGreetingSourceId() {
    const options = greetingSourceOptions();
    let stored = '';
    try { stored = localStorage.getItem(GREETING_SOURCE_KEY) || ''; } catch (e) {}
    if (stored && options.some(function (option) { return option.id === stored; })) return stored;
    if (stored) {
      try { localStorage.removeItem(GREETING_SOURCE_KEY); } catch (e) {}
    }
    const location = options.find(function (option) { return option.id === 'my-location'; });
    if (location) return location.id;
    const chosen = options.find(function (option) { return option.kind === 'chosen'; });
    return (chosen || options[0] || {}).id || '';
  }
  function getGreetingSourceCity() {
    const id = getGreetingSourceId();
    const option = greetingSourceOptions().find(function (item) { return item.id === id; });
    return option ? option.city : null;
  }
  function saveGreetingSource(id) {
    const option = greetingSourceOptions().find(function (item) { return item.id === id; });
    if (!option) return false;
    try { localStorage.setItem(GREETING_SOURCE_KEY, option.id); } catch (e) {}
    return true;
  }
  function readWeatherModePreference() {
    try {
      const mode = localStorage.getItem(MODE_KEY);
      return mode === 'horizon' || mode === 'my-sky' ? mode : null;
    } catch (e) { return null; }
  }
  function setWeatherMode(mode, remember) {
    if (mode !== 'horizon' && mode !== 'my-sky') return;
    if (weatherMode !== mode) greetingVisitSeed = null;
    weatherMode = mode;
    if (remember) {
      weatherModeExplicit = true;
      try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
    }
    refreshListsFromCache({ force: true });
  }

  async function reverseGeocode(lat, lon) {
    const langParam = geocodeLangParam();
    // BigDataCloud client reverse geocode (browser-safe, no API key)
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${langParam}`;
      const data = await dataApi.fetchJson(url);
      const name = data.city || data.locality || data.principalSubdivision || data.countryName;
      if (name) {
        return {
          name,
          admin1: data.principalSubdivision || '',
          lat, lon,
          country: shortCountryName(data.countryName, data.countryCode),
          country_code: data.countryCode || ''
        };
      }
    } catch (e) { /* fall through */ }
    // Nominatim fallback
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${langParam}`;
      const data = await dataApi.fetchJson(url);
      const a = data.address || {};
      const name = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || data.name;
      if (name) {
        return {
          name,
          admin1: a.state || a.county || '',
          lat, lon,
          country: shortCountryName(a.country, a.country_code),
          country_code: a.country_code || ''
        };
      }
    } catch (e) { /* fall through */ }
    return {
      name: lat.toFixed(2) + '°, ' + lon.toFixed(2) + '°',
      admin1: t('weather.myLocation', 'My Location'),
      lat, lon
    };
  }

  function condLabel(code) {
    const packed = t('weather.wmo.' + code, '');
    if (packed && packed !== 'weather.wmo.' + code) return packed;
    const row = WMO[code] || WMO[3];
    const L = lang();
    // Keep reviewed, detailed labels where the locale pack has one. For the
    // remaining locales, use the fully localized condition vocabulary shared
    // by the greeting pools instead of falling back to English. This also
    // avoids showing Simplified Chinese in a Traditional Chinese interface.
    if (row[L]) return row[L];
    const broadCondition = code === 0 ? 'clear'
      : code === 1 ? 'mostlyClear'
        : code === 2 ? 'partlyCloudy'
          : code === 3 ? 'overcast'
            : code === 45 || code === 48 ? 'fog'
              : code >= 51 && code <= 57 ? 'drizzle'
                : code >= 61 && code <= 67 || code >= 80 && code <= 82 ? 'rain'
                  : code >= 71 && code <= 86 ? 'snow'
                    : code >= 95 ? 'thunderstorms' : '';
    if (broadCondition) {
      const localized = t('weather.greeting.condition.' + broadCondition, '');
      if (localized && localized !== 'weather.greeting.condition.' + broadCondition) return localized;
    }
    return pickLangMap(row, row.en);
  }

  /* SF Symbols–inspired stroke glyphs (24×24, consistent optical weight) */
  function sfIcon(name, cls) {
    const c = cls || 'weather-sf';
    const base = `class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
    const fillBase = `class="${c}" viewBox="0 0 24 24" fill="currentColor"`;
    const map = {
      'sun.max': `<svg ${base}><circle cx="12" cy="12" r="3.25"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.05 5.05l1.55 1.55M17.4 17.4l1.55 1.55M5.05 18.95l1.55-1.55M17.4 6.6l1.55-1.55"/></svg>`,
      /* Clean crescent (SF-style) + small star — no ambiguous filled disc */
      'moon.stars': `<svg ${base}><path d="M14 4.2a6.8 6.8 0 1 0 5.5 10.6 5.2 5.2 0 0 1-5.5-10.6z"/><path d="m18.2 5.1.4 1.15h1.2l-.95.7.35 1.15-.95-.7-.95.7.35-1.15-.95-.7h1.2z"/></svg>`,
      moon: `<svg ${base}><path d="M14.2 4a7 7 0 1 0 5.8 11 5.4 5.4 0 0 1-5.8-11z"/></svg>`,
      cloud: `<svg ${base}><path d="M7 18h10.2A3.8 3.8 0 0 0 18 10.5a5.6 5.6 0 0 0-10.7 1.5A3.6 3.6 0 0 0 7 18z"/></svg>`,
      'cloud.sun': `<svg ${base}><circle cx="8.2" cy="9" r="2.4"/><path d="M8.2 3.8v1.4M8.2 12.8v1.4M3.4 9h1.4M11.6 9h1.4M4.7 5.5l1 1M10.7 11.5l1 1M4.7 12.5l1-1M10.7 6.5l1-1"/><path d="M8.5 18h8.8A3.3 3.3 0 0 0 18 11.6a4.8 4.8 0 0 0-8.6 1.6A3.1 3.1 0 0 0 8.5 18z"/></svg>`,
      'cloud.moon': `<svg ${base}><path d="M14.5 5.2A4.2 4.2 0 1 0 17.8 11a3.4 3.4 0 0 1-3.3-5.8z"/><path d="M7.2 18.2h9.2A3.4 3.4 0 0 0 17 11.8a5 5 0 0 0-9.5 1.5A3.2 3.2 0 0 0 7.2 18.2z"/></svg>`,
      'cloud.rain': `<svg ${base}><path d="M7 15.2h10.2A3.8 3.8 0 0 0 18 7.7a5.6 5.6 0 0 0-10.7 1.5A3.6 3.6 0 0 0 7 15.2z"/><path d="m9.2 17.5-1 2.6M12.2 17.5l-1 2.6M15.2 17.5l-1 2.6"/></svg>`,
      'cloud.drizzle': `<svg ${base}><path d="M7 15h10.2A3.8 3.8 0 0 0 18 7.5a5.6 5.6 0 0 0-10.7 1.5A3.6 3.6 0 0 0 7 15z"/><path d="M9.5 17.2v1.6M12.2 18v1.6M14.9 17.2v1.6"/></svg>`,
      'cloud.heavyrain': `<svg ${base}><path d="M7 14.5h10.2A3.8 3.8 0 0 0 18 7a5.6 5.6 0 0 0-10.7 1.5A3.6 3.6 0 0 0 7 14.5z"/><path d="m8.8 16.5-1.2 3.2M11.5 16.5l-1.2 3.2M14.2 16.5l-1.2 3.2M16.9 16.5l-1.2 3.2"/></svg>`,
      'cloud.snow': `<svg ${base}><path d="M7 15h10.2A3.8 3.8 0 0 0 18 7.5a5.6 5.6 0 0 0-10.7 1.5A3.6 3.6 0 0 0 7 15z"/><path d="M9.2 17.6h.01M12.2 19h.01M15.2 17.6h.01M10.7 19.8h.01M13.7 18.2h.01"/></svg>`,
      'cloud.bolt': `<svg ${base}><path d="M7 15.5h9.5A3.6 3.6 0 0 0 17 8.2a5.4 5.4 0 0 0-10.2 1.4A3.5 3.5 0 0 0 7 15.5z"/><path d="m12.2 13.2-2.2 4.2h2.1l-1 3.4 3.5-5.2h-2.1l1.2-2.4z"/></svg>`,
      'cloud.fog': `<svg ${base}><path d="M7 11.5h10.2A3.8 3.8 0 0 0 18 4a5.6 5.6 0 0 0-10.7 1.5A3.6 3.6 0 0 0 7 11.5z"/><path d="M4 15h16M5.5 18h13M7 21h10"/></svg>`,
      wind: `<svg ${base}><path d="M3.5 9.5h11.2a2.4 2.4 0 1 0-1.2-4.5"/><path d="M3.5 13.5h14a2.6 2.6 0 1 1-1.3 4.9"/><path d="M3.5 17.5h7"/></svg>`,
      snowflake: `<svg ${base}><path d="M12 3v18M5.2 6.5l13.6 11M5.2 17.5l13.6-11"/><path d="M9.5 4.8 12 7l2.5-2.2M9.5 19.2 12 17l2.5 2.2"/></svg>`,
      thermometer: `<svg ${base}><path d="M10 14.2V6.5a2 2 0 1 1 4 0v7.7a3.2 3.2 0 1 1-4 0z"/><path d="M12 17.5v0"/></svg>`,
      drop: `<svg ${base}><path d="M12 3.5c0 0 5.5 6.2 5.5 10.2a5.5 5.5 0 1 1-11 0C6.5 9.7 12 3.5 12 3.5z"/></svg>`,
      eye: `<svg ${base}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.4"/></svg>`,
      gauge: `<svg ${base}><path d="M5.2 16.2a7.5 7.5 0 1 1 13.6 0"/><path d="M12 13.5 15.5 8"/><circle cx="12" cy="13.5" r="1.2"/></svg>`,
      barometer: `<svg ${base}><circle cx="12" cy="13" r="7"/><path d="M12 6.5V4.8M8 7.8 6.8 6.6M16 7.8l1.2-1.2"/><path d="M12 13 15 9.5"/></svg>`,
      umbrella: `<svg ${base}><path d="M12 3.5v1.2M4.5 12.5a7.5 7.5 0 0 1 15 0H4.5z"/><path d="M12 12.5v6a1.8 1.8 0 0 0 3.5.4"/></svg>`,
      sunrise: `<svg ${base}><path d="M3.5 17.5h17"/><path d="M12 14.5V8M7.5 12.5 5.8 10.8M16.5 12.5l1.7-1.7M4.5 17.5a7.5 7.5 0 0 1 15 0"/><path d="M9 7.2 12 4.5l3 2.7"/></svg>`,
      location: `<svg ${base}><path d="M12 21s6.5-5.4 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.6 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.2"/></svg>`,
      'location.fill': `<svg ${fillBase}><path d="M12 21s6.5-5.4 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.6 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.1" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/></svg>`,
      star: `<svg ${base}><path d="m12 3.5 2.2 4.5 5 .7-3.6 3.5.9 5L12 14.8 7.5 17l.9-5L4.8 8.7l5-.7z"/></svg>`,
      'star.fill': `<svg ${fillBase}><path d="m12 3.5 2.2 4.5 5 .7-3.6 3.5.9 5L12 14.8 7.5 17l.9-5L4.8 8.7l5-.7z"/></svg>`,
      plus: `<svg ${base}><path d="M12 5v14M5 12h14"/></svg>`,
      checkmark: `<svg ${base}><path d="m5 12.5 4.4 4.2L19 7"/></svg>`,
      xmark: `<svg ${base}><path d="m6 6 12 12M18 6 6 18"/></svg>`,
      'arrow.clockwise': `<svg ${base}><path d="M20 7.5v5h-5"/><path d="M19.2 12.5A7.2 7.2 0 1 1 17 6.6L20 7.5"/></svg>`,
      sparkles: `<svg ${base}><path d="M12 3.5 13.2 8l4.8 1.2-4.8 1.2L12 15l-1.2-4.6L6 9.2l4.8-1.2z"/><path d="m18 14 .6 2 2 .5-2 .5-.6 2-.6-2-2-.5 2-.5z"/></svg>`
    };
    return map[name] || map.cloud;
  }

  function condIcon(code, night, cls) {
    const c = cls || 'weather-row-icon';
    if (code >= 95) return sfIcon('cloud.bolt', c);
    if (code >= 71 && code < 80) return sfIcon('cloud.snow', c);
    if (code >= 85 && code < 90) return sfIcon('cloud.snow', c);
    if (code >= 80 && code < 85) return sfIcon('cloud.heavyrain', c);
    if (code >= 61 && code < 70) return sfIcon(code >= 65 ? 'cloud.heavyrain' : 'cloud.rain', c);
    if (code >= 51 && code < 60) return sfIcon('cloud.drizzle', c);
    if (code === 45 || code === 48) return sfIcon('cloud.fog', c);
    if (code === 3) return sfIcon('cloud', c);
    if (code === 2) return sfIcon(night ? 'cloud.moon' : 'cloud.sun', c);
    if (code === 1) return sfIcon(night ? 'moon.stars' : 'cloud.sun', c);
    return sfIcon(night ? 'moon.stars' : 'sun.max', c);
  }

  function modLabelIcon(key) {
    const map = {
      aqi: 'sparkles', feels: 'thermometer', humidity: 'drop', wind: 'wind',
      uv: 'sun.max', vis: 'eye', pressure: 'barometer', precip: 'umbrella',
      sun: 'sunrise', conditions: 'cloud.sun'
    };
    return sfIcon(map[key] || 'cloud', 'weather-mod-sf');
  }

  function savedPlaceIcon(saved) {
    return sfIcon(saved ? 'checkmark' : 'plus', 'weather-save-icon');
  }
  function removeLocationIcon() {
    return sfIcon('xmark', 'weather-save-icon');
  }
  function savedPlaceLabel(saved) {
    return t(saved ? 'weather.removeFromMySky' : 'weather.addToMySky', saved ? 'Remove from My Sky' : 'Add to My Sky');
  }

  function locBadgeHtml() {
    return `<span class="weather-row-loc" aria-hidden="true">${sfIcon('location.fill', 'weather-loc-sf')}</span>`;
  }

  function fmtTemp(c) {
    if (window.DusklineWxMath && typeof window.DusklineWxMath.fmtTempFromC === 'function') {
      return window.DusklineWxMath.fmtTempFromC(c, useF());
    }
    if (window.Duskline && typeof window.Duskline.formatTempFromC === 'function') {
      return window.Duskline.formatTempFromC(c, { unit: useF() ? 'f' : 'c' });
    }
    if (c == null || Number.isNaN(c)) return '—';
    if (useF()) return Math.round(c * 9 / 5 + 32) + '°';
    return Math.round(c) + '°';
  }
  function windMsTo(unit, ms) {
    if (window.DusklineWxMath && typeof window.DusklineWxMath.windMsTo === 'function') {
      return window.DusklineWxMath.windMsTo(unit, ms);
    }
    if (ms == null) return null;
    if (unit === 'mph') return ms * 2.23694;
    if (unit === 'kmh') return ms * 3.6;
    if (unit === 'kn') return ms * 1.94384;
    if (unit === 'bft') {
      const t = Math.pow(ms / 0.836, 2 / 3);
      return Math.max(0, Math.min(12, Math.round(t)));
    }
    return ms;
  }
  function fmtWind(ms) {
    const u = windUnit();
    if (window.DusklineWxMath && typeof window.DusklineWxMath.fmtWind === 'function') {
      return window.DusklineWxMath.fmtWind(ms, u);
    }
    const v = windMsTo(u, ms);
    if (v == null) return '—';
    if (u === 'bft') return v + ' bft';
    if (u === 'mph') return Math.round(v) + ' mph';
    if (u === 'kmh') return Math.round(v) + ' km/h';
    if (u === 'kn') return Math.round(v) + ' kn';
    return Number(v).toFixed(1) + ' m/s';
  }
  function fmtVis(m) {
    if (window.DusklineWxMath && typeof window.DusklineWxMath.fmtVis === 'function') {
      return window.DusklineWxMath.fmtVis(m, useMi());
    }
    if (m == null) return '—';
    if (useMi()) return (m / 1609.34).toFixed(1) + ' mi';
    return (m / 1000).toFixed(1) + ' km';
  }
  function fmtPrecip(mm) {
    const u = precipUnit();
    if (window.DusklineWxMath && typeof window.DusklineWxMath.fmtPrecip === 'function') {
      return window.DusklineWxMath.fmtPrecip(mm, u);
    }
    if (mm == null) return '—';
    if (u === 'in') return (mm / 25.4).toFixed(2) + ' in';
    if (u === 'cm') return (mm / 10).toFixed(1) + ' cm';
    return mm.toFixed(1) + ' mm';
  }
  function fmtPress(hpa) {
    const u = pressUnit();
    if (window.DusklineWxMath && typeof window.DusklineWxMath.fmtPress === 'function') {
      return window.DusklineWxMath.fmtPress(hpa, u);
    }
    if (hpa == null) return '—';
    if (u === 'mbar') return Math.round(hpa) + ' mbar';
    if (u === 'inHg') return (hpa * 0.02953).toFixed(2) + ' inHg';
    if (u === 'mmHg') return Math.round(hpa * 0.75006) + ' mmHg';
    if (u === 'kPa') return (hpa / 10).toFixed(1) + ' kPa';
    return Math.round(hpa) + ' hPa';
  }
  function formatClock(iso, timeZone) {
    if (!iso) return '—';
    const s = String(iso);
    const bare = s.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
    if (bare && isBareWallClock(s)) {
      try {
        const d = new Date(2000, 0, 1, Number(bare[2]), Number(bare[3]));
        return d.toLocaleTimeString(localeTag(), { hour: 'numeric', minute: '2-digit' });
      } catch (e0) {
        return bare[2] + ':' + bare[3];
      }
    }
    try {
      const opts = { hour: 'numeric', minute: '2-digit' };
      const tz = timeZone || cityTimeZone(openCity, openCity && openCity.city);
      if (tz) opts.timeZone = tz;
      return new Date(iso).toLocaleTimeString(localeTag(), opts);
    } catch (e) { return '—'; }
  }
  /** Sparse chart axis labels — Apple Weather style (00 / 06 / 12 / 18), not full “9:00 AM”. */
  function formatChartAxisHour(iso, timeZone) {
    if (!iso) return '';
    const s = String(iso);
    if (isBareWallClock(s)) {
      const bare = s.match(/T(\d{2}):/);
      return bare ? bare[1] : '';
    }
    try {
      return String(wallHour(s, timeZone)).padStart(2, '0');
    } catch (e) {
      return '';
    }
  }
  function degToCompass(d) {
    if (d == null) return '';
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(d / 45) % 8];
  }
  function aqiLabel(v) {
    const band = aqiBandKey(v);
    const labels = {
      Good: ['weather.aqiGood', 'Good'],
      Moderate: ['weather.aqiModerate', 'Moderate'],
      UnhealthySG: ['weather.aqiUnhealthySG', 'Unhealthy for Sensitive Groups'],
      Unhealthy: ['weather.aqiUnhealthy', 'Unhealthy'],
      VeryUnhealthy: ['weather.aqiVeryUnhealthy', 'Very unhealthy'],
      Hazardous: ['weather.aqiHazardous', 'Hazardous']
    };
    return band ? t(labels[band][0], labels[band][1]) : '';
  }
  function aqiBandKey(v) {
    if (v == null || v === '' || !Number.isFinite(Number(v)) || Number(v) < 0) return '';
    // AQI is an integer index; use the same rounded value shown in the interface.
    const n = Math.round(Number(v));
    if (n <= 50) return 'Good';
    if (n <= 100) return 'Moderate';
    if (n <= 150) return 'UnhealthySG';
    if (n <= 200) return 'Unhealthy';
    if (n <= 300) return 'VeryUnhealthy';
    return 'Hazardous';
  }
  function aqiDescription(v) {
    const band = aqiBandKey(v);
    return band ? t('weather.aqiDesc' + band, '') : '';
  }
  function aqiGreetingDescription(v) {
    const band = aqiBandKey(v);
    return band ? t('weather.aqiGreeting' + band, aqiLabel(v)) : '';
  }
  function aqiRange(v) {
    const band = aqiBandKey(v);
    if (!band) return '';
    const ranges = {
      Good: [0, 50], Moderate: [51, 100], UnhealthySG: [101, 150],
      Unhealthy: [151, 200], VeryUnhealthy: [201, 300]
    };
    const format = function (n) {
      try { return new Intl.NumberFormat(localeTag(), { maximumFractionDigits: 0 }).format(n); }
      catch (e) { return String(n); }
    };
    if (band === 'Hazardous') return format(301) + '+';
    return format(ranges[band][0]) + '–' + format(ranges[band][1]);
  }
  const AQI_DETAIL_FIELDS = [
    'us_aqi', 'us_aqi_pm2_5', 'us_aqi_pm10', 'us_aqi_ozone', 'us_aqi_nitrogen_dioxide',
    'us_aqi_sulphur_dioxide', 'us_aqi_carbon_monoxide', 'pm2_5', 'pm10', 'ozone',
    'nitrogen_dioxide', 'sulphur_dioxide', 'carbon_monoxide', 'dust', 'aerosol_optical_depth',
    'ammonia', 'alder_pollen', 'birch_pollen', 'grass_pollen', 'mugwort_pollen',
    'olive_pollen', 'ragweed_pollen', 'european_aqi', 'uv_index', 'uv_index_clear_sky'
  ];
  const AQI_POLLUTANTS = [
    { key: 'pm2_5', label: 'PM₂.₅', sub: 'us_aqi_pm2_5' },
    { key: 'pm10', label: 'PM₁₀', sub: 'us_aqi_pm10' },
    { key: 'ozone', label: 'O₃', sub: 'us_aqi_ozone' },
    { key: 'nitrogen_dioxide', label: 'NO₂', sub: 'us_aqi_nitrogen_dioxide' },
    { key: 'sulphur_dioxide', label: 'SO₂', sub: 'us_aqi_sulphur_dioxide' },
    { key: 'carbon_monoxide', label: 'CO', sub: 'us_aqi_carbon_monoxide' },
    { key: 'dust', label: 'Dust', labelKey: 'weather.aqiDust' },
    { key: 'aerosol_optical_depth', label: 'Aerosol optical depth', labelKey: 'weather.aqiAerosolOpticalDepth' },
    { key: 'ammonia', label: 'Ammonia (NH₃)', labelKey: 'weather.aqiAmmonia' },
    { key: 'alder_pollen', label: 'Alder pollen', labelKey: 'weather.aqiPollenAlder' },
    { key: 'birch_pollen', label: 'Birch pollen', labelKey: 'weather.aqiPollenBirch' },
    { key: 'grass_pollen', label: 'Grass pollen', labelKey: 'weather.aqiPollenGrass' },
    { key: 'mugwort_pollen', label: 'Mugwort pollen', labelKey: 'weather.aqiPollenMugwort' },
    { key: 'olive_pollen', label: 'Olive pollen', labelKey: 'weather.aqiPollenOlive' },
    { key: 'ragweed_pollen', label: 'Ragweed pollen', labelKey: 'weather.aqiPollenRagweed' }
  ];
  function airValueText(value, unit) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '';
    const digits = Math.abs(n) < 10 && n !== 0 ? 1 : 0;
    let formatted;
    try { formatted = new Intl.NumberFormat(localeTag(), { maximumFractionDigits: digits }).format(n); }
    catch (e) { formatted = String(Math.round(n * (digits ? 10 : 1)) / (digits ? 10 : 1)); }
    return formatted + (unit ? ' ' + unit : '');
  }
  function aqiExtendedHtml(air) {
    const current = air && air.current || {};
    const units = air && air.current_units || {};
    const rows = AQI_POLLUTANTS.filter(function (p) {
      return current[p.key] != null && Number.isFinite(Number(current[p.key]));
    });
    const additional = [
      { key: 'european_aqi', label: t('weather.aqiEuropeanAqi', 'European AQI'), unitless: true },
      { key: 'uv_index', label: t('weather.uv', 'UV Index'), unitless: true },
      { key: 'uv_index_clear_sky', label: t('weather.aqiClearSkyUv', 'Clear-sky UV'), unitless: true }
    ].filter(function (item) { return current[item.key] != null && Number.isFinite(Number(current[item.key])); });
    if (!rows.length && !additional.length) return '';
    const contributors = AQI_POLLUTANTS.filter(function (p) {
      return p.sub && current[p.sub] != null && Number.isFinite(Number(current[p.sub]));
    }).map(function (p) { return { pollutant: p, value: Number(current[p.sub]) }; });
    contributors.sort(function (a, b) { return b.value - a.value; });
    let html = '<div class="wx-air-detail">';
    if (rows.length && contributors.length) {
      const top = contributors[0];
      const mainLabel = top.pollutant.labelKey ? t(top.pollutant.labelKey, top.pollutant.label) : top.pollutant.label;
      html += `<div class="wx-air-main"><span class="wx-air-main-label">${escapeHtml(t('weather.aqiMainPollutant', 'Main pollutant'))}</span><strong>${escapeHtml(mainLabel)}</strong><span class="wx-air-main-score" style="color:${aqiColor(top.value)}">${Math.round(top.value)}</span></div>`;
    }
    if (rows.length) {
      html += `<div class="wx-air-list-title">${escapeHtml(t('weather.aqiPollutantLevels', 'Pollutant levels'))}</div><div class="wx-air-list">`;
      rows.forEach(function (p) {
        const contribution = p.sub && current[p.sub] != null && Number.isFinite(Number(current[p.sub]))
          ? Number(current[p.sub]) : null;
        const unit = units[p.key] || (p.key.indexOf('_pollen') >= 0 ? 'grains/m³' : 'µg/m³');
        const amount = airValueText(current[p.key], p.key === 'aerosol_optical_depth' ? '' : unit);
        const label = p.labelKey ? t(p.labelKey, p.label) : p.label;
        const contributionHtml = contribution == null ? ''
          : `<span class="wx-air-contribution${contribution > 100 ? ' is-elevated' : ''}" style="--wx-air-color:${aqiColor(contribution)}"><span>${escapeHtml(t('weather.aqiContribution', 'AQI contribution'))}</span><strong>${Math.round(contribution)}</strong></span>`;
        html += `<div class="wx-air-row"><span class="wx-air-name">${escapeHtml(label)}</span><span class="wx-air-amount">${escapeHtml(amount)}</span>${contributionHtml}</div>`;
      });
      html += '</div>';
    }
    if (additional.length) {
      html += `<div class="wx-air-list-title">${escapeHtml(t('weather.aqiAdditionalReadings', 'Additional readings'))}</div><div class="wx-air-list">`;
      additional.forEach(function (item) {
        const amount = airValueText(current[item.key], item.unitless ? '' : units[item.key]);
        html += `<div class="wx-air-row"><span class="wx-air-name">${escapeHtml(item.label)}</span><span class="wx-air-amount">${escapeHtml(amount)}</span></div>`;
      });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }
  function loadAqiDetail(pack) {
    if (!pack || !pack.city || !dataApi || typeof dataApi.fetchJson !== 'function') return Promise.resolve(null);
    // Cache a successful detailed response even if a region omits the optional
    // PM2.5-specific AQI field; otherwise reopening the sheet refetches forever.
    if (pack.air && pack.air._detailFetchedAt) return Promise.resolve(pack);
    if (pack.air && pack.air.current && pack.air.current.us_aqi_pm2_5 != null) return Promise.resolve(pack);
    const key = cityKey(pack.city);
    if (aqiDetailInflight.has(key)) return aqiDetailInflight.get(key);
    const fields = AQI_DETAIL_FIELDS.join(',');
    const url = AIR + '?latitude=' + encodeURIComponent(pack.city.lat)
      + '&longitude=' + encodeURIComponent(pack.city.lon)
      + '&current=' + encodeURIComponent(fields) + '&timezone=auto';
    const request = dataApi.fetchJson(url).then(function (detail) {
      if (!detail || !detail.current) return null;
      const oldAir = pack.air || {};
      const current = Object.assign({}, oldAir.current || {}, detail.current);
      pack.air = Object.assign({}, oldAir, detail, { current: current, _detailFetchedAt: Date.now() });
      cache.set(key, pack);
      return pack;
    }).catch(function () {
      return null;
    }).finally(function () {
      aqiDetailInflight.delete(key);
    });
    aqiDetailInflight.set(key, request);
    return request;
  }
  function aqiColor(v) {
    const band = aqiBandKey(v);
    return ({
      Good: '#34c759', Moderate: '#ffd60a', UnhealthySG: '#ff9f0a',
      Unhealthy: '#ff453a', VeryUnhealthy: '#bf5af2', Hazardous: '#9b2335'
    })[band] || '#8e8e93';
  }
  function aqiPct(v) {
    const band = aqiBandKey(v);
    if (!band) return 0;
    return Math.max(0, Math.min(100, (Math.round(Number(v)) / 300) * 100));
  }
  function aqiBarHtml(v, compact) {
    const pct = aqiPct(v);
    const col = aqiColor(v);
    if (compact) {
      return `<div class="wx-aqi-bar wx-aqi-bar--compact" aria-hidden="true">
        <span class="wx-aqi-track"><span class="wx-aqi-fill" style="width:${pct.toFixed(1)}%;background:${col}"></span></span>
        <span class="wx-aqi-dot" style="left:${pct.toFixed(1)}%;background:${col}"></span>
      </div>`;
    }
    return `<div class="wx-aqi-scale" aria-hidden="true">
      <div class="wx-aqi-scale-track">
        <span class="wx-aqi-seg" style="background:#34c759"></span>
        <span class="wx-aqi-seg" style="background:#ffd60a"></span>
        <span class="wx-aqi-seg" style="background:#ff9f0a"></span>
        <span class="wx-aqi-seg" style="background:#ff453a"></span>
        <span class="wx-aqi-seg" style="background:#bf5af2"></span>
        <span class="wx-aqi-seg" style="background:#9b2335"></span>
      </div>
      <span class="wx-aqi-marker" style="left:${pct.toFixed(1)}%"></span>
    </div>
    <div class="wx-aqi-labels"><span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300</span></div>`;
  }
  function humidityBarHtml(pct) {
    const p = pct == null ? 0 : Math.max(0, Math.min(100, pct));
    return `<div class="wx-metric-bar" aria-hidden="true"><span style="width:${p}%"></span></div>`;
  }
  function uvBarHtml(v) {
    const pct = v == null ? 0 : Math.max(0, Math.min(100, (v / 12) * 100));
    return `<div class="weather-mod-viz"><span class="weather-mod-viz-bar"></span><span class="weather-mod-viz-dot" style="left:${pct.toFixed(1)}%"></span></div>`;
  }
  function escapeHtml(s) {
    if (window.DusklineWxMath && typeof window.DusklineWxMath.escapeHtml === 'function') {
      return window.DusklineWxMath.escapeHtml(s);
    }
    return String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  /** Local clock hour as a fraction (14.5 = 14:30) so the sun creeps, not hops. */
  function localHourForPack(pack) {
    try {
      const tz = (pack && pack.weather && pack.weather.timezone)
        || (pack && pack.city && pack.city.tz);
      if (tz) {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz, hour: 'numeric', minute: 'numeric', hour12: false, hourCycle: 'h23'
        }).formatToParts(new Date());
        let h = 0;
        let min = 0;
        for (let i = 0; i < parts.length; i++) {
          if (parts[i].type === 'hour') h = parseInt(parts[i].value, 10) % 24;
          if (parts[i].type === 'minute') min = parseInt(parts[i].value, 10) || 0;
        }
        return h + min / 60;
      }
      const cur = pack && pack.weather && pack.weather.current;
      if (cur && cur.time && typeof cur.time === 'string') {
        const m = cur.time.match(/T(\d{2})(?::(\d{2}))?/);
        if (m) return parseInt(m[1], 10) + (parseInt(m[2] || '0', 10) / 60);
      }
    } catch (e) {}
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }

  wireRemainingModules();

  function clearWeatherSkeleton() {
    if (listEl) {
      listEl.hidden = false;
      listEl.classList.remove('weather-skeleton-list');
    }
  }

  function formatUpdatedStamp(ts) {
    const d = new Date(ts || Date.now());
    try {
      return d.toLocaleString(localeTag(), {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      });
    } catch (e) {
      return d.toLocaleString();
    }
  }
  function setUpdated(ts, el) {
    const target = el || updatedEl;
    if (!target) return;
    target.textContent = t('weather.updated', 'Updated') + ' ' + formatUpdatedStamp(ts);
  }
  /** Short stamp for list rows (and offline/unavailable state). */
  function rowUpdatedLabel(pack) {
    if (!pack) return '';
    if (pack.fetchedAt) {
      return t('weather.updated', 'Updated') + ' ' + formatUpdatedStamp(pack.fetchedAt);
    }
    if (pack.error) return t('weather.unavailable', 'Unavailable');
    return '';
  }
  /** When the device position for My Location was last obtained. */
  function locationLocatedLabel(city) {
    if (!city || !city.isMyLocation) return '';
    const ts = city.locatedAt || (myLocationCity && sameCity(myLocationCity, city) && myLocationCity.locatedAt);
    if (!ts) return '';
    return t('weather.locatedAt', 'Located') + ' ' + formatUpdatedStamp(ts);
  }
  function showError(msg) {
    if (!errorEl) return;
    if (!msg) { errorEl.hidden = true; errorEl.textContent = ''; return; }
    errorEl.hidden = false;
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = msg;
  }

  function buildRowButton(pack) {
    const c = pack.city || {};
    const li = document.createElement('li');
    const fav = isFavorite(c);

    if (pack.pending && !pack.weather) {
      const row = document.createElement('div');
      row.className = 'weather-row weather-row--loading';
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      row.setAttribute('aria-label', (displayCityName(c) || c.name || '') + '. ' + t('weather.loadingForecast', 'Loading forecast…'));
      row.setAttribute('aria-busy', 'true');
      row.innerHTML = `<div class="weather-row-main"><div class="weather-row-city"><span class="weather-row-city-name">${escapeHtml(displayCityName(c) || c.name || '?')}</span></div><div class="weather-row-meta">${escapeHtml(displayAdmin1(c) || c.admin1 || '')}</div><div class="weather-row-updated">${escapeHtml(t('weather.loadingForecast', 'Loading forecast…'))}</div></div><div class="weather-row-temps"><div class="weather-row-temp weather-row-temp--loading"><span class="loader" aria-hidden="true"></span><span class="visually-hidden">${escapeHtml(t('weather.loadingForecast', 'Loading forecast…'))}</span></div></div>`;
      const openPending = async () => {
        if (isDetailVisible() && openCity && openCity.city && sameCity(openCity.city, c)) return;
        openDetailLoading(c);
        try {
          const fresh = await dataApi.loadCity(c, null, { forceFetch: true, enrich: true });
          cache.set(cityKey(c), fresh);
          pendingCityKeys.delete(cityKey(c));
          if (openCity && openCity.city && sameCity(openCity.city, c)) openDetail(fresh);
          replaceCityCard(c, fresh);
        } catch (e) {
          showError(t('weather.error', 'Could not load weather data.'));
        }
      };
      row.addEventListener('click', openPending);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPending(); }
      });
      li.appendChild(row);
      return li;
    }
    if (pack.error || !pack.weather || !pack.weather.current) {
      const row = document.createElement('div');
      row.className = 'weather-row weather-row--error';
      row.setAttribute('role', 'button');
      row.tabIndex = 0;
      const stamp = rowUpdatedLabel(pack);
      const locStamp = locationLocatedLabel(c);
      const failMsg = stamp
        ? stamp
        : t('weather.tapRetry', 'Tap to retry');
      const failLines = [failMsg, locStamp].filter(Boolean).join(' · ');
      row.innerHTML = `<div class="weather-row-main"><div class="weather-row-city"><span class="weather-row-city-name">${escapeHtml(displayCityName(c) || c.name || '?')}</span></div><div class="weather-row-meta">${escapeHtml(displayAdmin1(c) || c.admin1 || '')}</div><div class="weather-row-updated weather-row-updated--fail">${escapeHtml(failLines)}</div></div><div class="weather-row-temps"><div class="weather-row-temp">—</div></div>`;
      row.setAttribute('aria-label', (displayCityName(c) || c.name || '') + '. ' + failLines);
      const retry = async () => {
        try {
          const fresh = await dataApi.loadCity(c);
          openDetail(fresh);
          refreshListsFromCache();
        } catch (e) { showError(t('weather.error', 'Could not load weather data.')); }
      };
      row.addEventListener('click', retry);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); retry(); }
      });
      li.appendChild(row);
      return li;
    }

    const cur = pack.weather.current;
    const daily = pack.weather.daily || {};
    const code = cur.weather_code;
    const dayIdx = dailyTodayIndex(daily, cityTimeZone(pack, c));
    const range = dayHiLo(daily, dayIdx, cur.temperature_2m);
    const hi = range.hi;
    const lo = range.lo;
    let localTime = '';
    try {
      localTime = new Date().toLocaleTimeString(localeTag(), {
        timeZone: pack.weather.timezone || c.tz,
        hour: 'numeric', minute: '2-digit'
      });
    } catch (e) { localTime = ''; }
    const hour = localHourForPack(pack);
    const night = hour < 6 || hour >= 20;
    const seed = Math.abs(Math.round((c.lat || 0) * 100) + Math.round((c.lon || 0) * 10));

    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'weather-row';
    applySky(row, code, cur.time, {
      hour, seed, isRow: true,
      noOrnaments: true,
      timeZone: cityTimeZone(pack, c),
      precipMm: cur.precipitation,
      windDeg: cur.wind_direction_10m,
      windMs: cur.wind_speed_10m,
      humidity: cur.relative_humidity_2m,
      visibility: cur.visibility
    });

    const alert = alertsApi.topAlert(pack);
    const alertSev = alert ? String(alert.severity || '').toLowerCase() : '';
    const alertTone = alertSev === 'extreme' || alertSev === 'severe'
      ? 'weather-row-alert--severe'
      : (alertSev === 'moderate' ? 'weather-row-alert--moderate' : 'weather-row-alert--minor');
    // Apple-style list: when an alert is active, surface it as the primary status line
    const statusLine = alert
      ? `<div class="weather-row-alert ${alertTone}"><span class="weather-row-alert-ico" aria-hidden="true">!</span><span>${escapeHtml(alert.event || t('weather.alert', 'Alert'))}</span></div>`
      : `<div class="weather-row-cond">${condIcon(code, night)}<span>${escapeHtml(condLabel(code))}</span></div>`;

    const main = document.createElement('div');
    const stamp = rowUpdatedLabel(pack);
    const locStamp = locationLocatedLabel(c);
    const stampLine = [stamp, locStamp].filter(Boolean).join(' · ');
    main.className = 'weather-row-main';
    main.innerHTML = `
        <div class="weather-row-city"><span class="weather-row-city-name">${escapeHtml(displayCityName(c))}</span></div>
        <div class="weather-row-meta">${escapeHtml(localTime)}${displayAdmin1(c) ? ' · ' + escapeHtml(displayAdmin1(c)) : ''}</div>
        ${statusLine}
        ${stampLine ? '<div class="weather-row-updated">' + escapeHtml(stampLine) + '</div>' : ''}`;

    const temps = document.createElement('div');
    temps.className = 'weather-row-temps';
    temps.innerHTML = `
        <div class="weather-row-temp">${fmtTemp(cur.temperature_2m)}</div>
        <div class="weather-row-hl">${t('weather.high', 'H')}:${fmtTemp(hi)}  ${t('weather.low', 'L')}:${fmtTemp(lo)}</div>`;

    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'weather-row-save';
    if (c.isMyLocation) {
      star.classList.add('weather-row-save--location');
      star.setAttribute('aria-pressed', 'true');
      star.setAttribute('aria-label', t('weather.clearLocation', 'Remove my location'));
      star.title = t('weather.clearLocation', 'Remove my location');
      star.innerHTML = removeLocationIcon();
      star.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveMyLocation(null);
        refreshListsFromCache();
      });
    } else {
      star.setAttribute('aria-pressed', fav ? 'true' : 'false');
      star.setAttribute('aria-label', savedPlaceLabel(fav));
      star.title = savedPlaceLabel(fav);
      star.innerHTML = savedPlaceIcon(fav);
      star.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(c);
        refreshListsFromCache();
        if (openCity && openCity.city && sameCity(openCity.city, c)) syncDetailFav(c);
      });
    }

    const cityLab = displayCityName(c) || c.name || '';
    const tempLab = fmtTemp(cur.temperature_2m);
    row.setAttribute('aria-label', cityLab + (tempLab ? ', ' + tempLab : '') + (stampLine ? '. ' + stampLine : ''));

    const open = () => openDetail(pack);
    row.addEventListener('click', open);

    if (c.isMyLocation) {
      row.classList.add('weather-row--myloc');
      const cityEl = main.querySelector('.weather-row-city');
      if (cityEl) cityEl.insertAdjacentHTML('afterbegin', locBadgeHtml());
    }

    row.appendChild(main);
    row.appendChild(temps);
    li.classList.add('weather-row-cluster');
    li.appendChild(row);
    li.appendChild(star);
    return li;
  }

  function renderCityList(ul, packs) {
    if (!ul) return;
    ul.innerHTML = '';
    let region = '';
    packs.forEach((pack) => {
      const nextRegion = pack && pack.city && pack.city.region;
      if (nextRegion && nextRegion !== region) {
        const heading = document.createElement('li');
        heading.className = 'weather-region-heading';
        heading.setAttribute('role', 'presentation');
        heading.textContent = t('region.' + nextRegion, nextRegion);
        ul.appendChild(heading);
        region = nextRegion;
      }
      const item = buildRowButton(pack);
      item.dataset.cityKey = cityKey(pack.city || {});
      ul.appendChild(item);
    });
  }

  function replaceCityCard(city, pack) {
    const key = cityKey(city || (pack && pack.city) || {});
    const lists = [myLocListEl, favListEl, listEl];
    for (const list of lists) {
      if (!list) continue;
      const current = list.querySelector('li[data-city-key="' + CSS.escape(key) + '"]');
      if (!current) continue;
      const next = buildRowButton(pack);
      next.dataset.cityKey = key;
      current.replaceWith(next);
      return true;
    }
    return false;
  }

  function localDateTimeParts(timeZone, date) {
    try {
      const opts = {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
        hourCycle: 'h23'
      };
      if (timeZone) opts.timeZone = timeZone;
      const out = {};
      new Intl.DateTimeFormat('en-GB', opts).formatToParts(date || new Date()).forEach(function (p) {
        if (p.type !== 'literal') out[p.type] = Number(p.value);
      });
      return out;
    } catch (e) {
      const d = date || new Date();
      return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds() };
    }
  }
  function greetingPeriod(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }
  function greetingDayOfYear(parts) {
    const day0 = Date.UTC(parts.year, parts.month - 1, parts.day);
    const year0 = Date.UTC(parts.year, 0, 1);
    return Math.floor((day0 - year0) / 86400000) + 1;
  }
  function getGreetingVisitSeed() {
    if (greetingVisitSeed != null) return greetingVisitSeed;
    try {
      if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
        const value = new Uint32Array(1);
        window.crypto.getRandomValues(value);
        greetingVisitSeed = value[0];
      }
    } catch (e) { /* use the local fallback below */ }
    // Like Kit, choose fresh entropy once per page entry and keep it stable for
    // routine list repaints. Manual refresh resets it to reroll the greeting.
    if (greetingVisitSeed == null) greetingVisitSeed = Math.floor(Math.random() * 4294967296);
    return greetingVisitSeed;
  }
  function greetingWeatherCode(code) {
    if (code == null || code === '') return null;
    const n = Number(code);
    if (!Number.isInteger(n)) return null;
    const valid = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67,
      71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];
    return valid.indexOf(n) >= 0 ? n : null;
  }
  function greetingWeatherPhrase(code) {
    const n = greetingWeatherCode(code);
    if (n == null) return t('weather.greeting.condition.special4', 'changeable weather');
    if (n === 0) return t('weather.greeting.condition.clear', 'clear');
    if (n === 1) return t('weather.greeting.condition.mostlyClear', 'mostly clear');
    if (n === 2) return t('weather.greeting.condition.partlyCloudy', 'partly cloudy');
    if (n === 3) return t('weather.greeting.condition.overcast', 'overcast');
    if (n === 45 || n === 48) return t('weather.greeting.condition.fog', 'foggy');
    if (n === 56 || n === 57 || n === 66 || n === 67) return t('weather.greeting.condition.special0', 'freezing precipitation');
    if (n === 65 || n === 82) return t('weather.greeting.condition.special1', 'heavy rain');
    if (n === 75 || n === 86) return t('weather.greeting.condition.special2', 'heavy snow');
    if (n === 96 || n === 99) return t('weather.greeting.condition.special3', 'thunderstorms with hail');
    if (n === 51 || n === 53 || n === 55) return t('weather.greeting.condition.drizzle', 'drizzly');
    if (n === 61 || n === 63 || n === 80 || n === 81) return t('weather.greeting.condition.rain', 'rainy');
    if (n === 71 || n === 73 || n === 77 || n === 85) return t('weather.greeting.condition.snow', 'snowy');
    if (n === 95) return t('weather.greeting.condition.thunderstorms', 'stormy');
    return t('weather.greeting.condition.special4', 'changeable weather');
  }
  function greetingWeatherUsesSpecialTemplate(code) {
    const n = greetingWeatherCode(code);
    return n === 56 || n === 57 || n === 65 || n === 66 || n === 67
      || n === 75 || n === 82 || n === 86 || n === 96 || n === 99;
  }
  function greetingPrecipitationScore(pack, timeZone) {
    const weather = pack && pack.weather || {};
    const current = weather.current || {};
    const hourly = weather.hourly || {};
    const times = hourly.time || [];
    const chances = hourly.precipitation_probability || [];
    let peak = null;
    const now = Date.now();
    for (let i = 0; i < times.length; i++) {
      const at = stampToMs(times[i], timeZone);
      if (!Number.isFinite(at) || at < now - 3600000 || at > now + 8 * 3600000) continue;
      if (chances[i] == null || chances[i] === '') continue;
      const chance = Number(chances[i]);
      if (Number.isFinite(chance) && (peak == null || chance > peak)) peak = chance;
    }
    if (current.precipitation != null && Number(current.precipitation) > 0) return 88;
    if (peak == null) return null;
    if (peak >= 80) return 72;
    if (peak >= 50) return 62;
    if (peak >= 20) return 48;
    return 10;
  }
  function greetingIsDaylight(daily, timeZone, parts, currentUv) {
    const dayIndex = dailyTodayIndex(daily, timeZone);
    const sunrise = dailyFieldAt(daily, 'sunrise', dayIndex);
    const sunset = dailyFieldAt(daily, 'sunset', dayIndex);
    const clockMinutes = parts ? Number(parts.hour) * 60 + Number(parts.minute) : NaN;
    const minuteOf = function (stamp) {
      const match = String(stamp || '').match(/T(\d{2}):(\d{2})/);
      return match ? Number(match[1]) * 60 + Number(match[2]) : null;
    };
    const sunriseMinutes = minuteOf(sunrise);
    const sunsetMinutes = minuteOf(sunset);
    if (sunriseMinutes != null && sunsetMinutes != null && Number.isFinite(clockMinutes)) {
      return clockMinutes >= sunriseMinutes && clockMinutes <= sunsetMinutes;
    }
    // Without solar-event data, require both a conservative local daylight
    // window and a positive hourly UV value when one is available. This avoids
    // stale hourly values extending a sun-safety greeting into the night.
    const withinDaylightWindow = !!(parts && Number(parts.hour) >= 6 && Number(parts.hour) < 20);
    if (!withinDaylightWindow) return false;
    if (currentUv != null && Number.isFinite(Number(currentUv))) return Number(currentUv) > 0;
    return true;
  }
  function greetingTomorrowInsight(pack, timeZone) {
    const daily = pack && pack.weather && pack.weather.daily || {};
    const times = daily.time || [];
    if (!times.length) return '';
    const today = localDateTimeParts(timeZone);
    const tomorrowDate = new Date(Date.UTC(today.year, today.month - 1, today.day + 1)).toISOString().slice(0, 10);
    const index = times.findIndex(function (value) { return String(value || '').slice(0, 10) === tomorrowDate; });
    if (index < 0) return '';
    const code = greetingWeatherCode(dailyFieldAt(daily, 'weather_code', index));
    const high = dailyFieldAt(daily, 'temperature_2m_max', index);
    const low = dailyFieldAt(daily, 'temperature_2m_min', index);
    if (code == null || high == null || high === '' || low == null || low === ''
        || !Number.isFinite(Number(high)) || !Number.isFinite(Number(low))) return '';
    return t('weather.context.tomorrow.outlook', 'Tomorrow: {condition}, with a high of {high} and a low of {low}.')
      .replace('{condition}', greetingWeatherPhrase(code))
      .replace('{high}', fmtTemp(high))
      .replace('{low}', fmtTemp(low));
  }
  function greetingWeatherInsight(pack, timeZone, parts, seed) {
    if (!pack || !pack.weather || !pack.weather.current) return '';
    const weather = pack.weather;
    const current = weather.current || {};
    const hourly = weather.hourly || {};
    const daily = weather.daily || {};
    const candidates = [];
    const add = function (score, text) {
      if (score != null && Number.isFinite(Number(score)) && text) {
        candidates.push({ score: Number(score), text: text });
      }
    };

    const precipitation = sheetContextText('precip', pack, timeZone);
    add(greetingPrecipitationScore(pack, timeZone), precipitation);

    const airRaw = pack.air && pack.air.current && pack.air.current.us_aqi;
    const airValue = Number(airRaw);
    if (airRaw != null && airRaw !== '' && Number.isFinite(airValue)) {
      const description = aqiGreetingDescription(airValue);
      const band = aqiBandKey(airValue);
      // Satisfactory air quality is useful in the detail sheet, but adds little
      // to a personal hello. Keep the greeting focused on timely conditions.
      const score = ({
        Moderate: 25, UnhealthySG: 76, Unhealthy: 84,
        VeryUnhealthy: 90, Hazardous: 96
      })[band];
      add(score, description);
    }

    const localHour = parts ? Number(parts.hour) : NaN;
    if (Number.isFinite(localHour) && (localHour >= 17 || localHour < 5)) {
      add(52, greetingTomorrowInsight(pack, timeZone));
    }

    const dayIndex = dailyTodayIndex(daily, timeZone);
    const uvMax = dailyFieldAt(daily, 'uv_index_max', dayIndex);
    const uvNow = hourlyNowValue(hourly, 'uv_index', timeZone);
    const uvPeak = uvMax != null && uvMax !== '' && Number.isFinite(Number(uvMax)) ? Number(uvMax) : null;
    const uv = uvPeak == null ? uvNow : Math.max(uvPeak, uvNow == null ? 0 : uvNow);
    if (greetingIsDaylight(daily, timeZone, parts, uvNow) && Number.isFinite(uv) && uv >= 3) {
      const uvText = sheetContextText('uv', pack, timeZone);
      const score = uv >= 11 ? 82 : uv >= 8 ? 70 : uv >= 6 ? 60 : uv >= 3 ? 38 : 8;
      add(score, uvText);
    }

    const currentTemp = Number(current.temperature_2m);
    const feels = Number(current.apparent_temperature);
    if (current.temperature_2m != null && current.apparent_temperature != null
        && current.temperature_2m !== '' && current.apparent_temperature !== ''
        && Number.isFinite(currentTemp) && Number.isFinite(feels)) {
      const delta = feels - currentTemp;
      if (Math.abs(delta) >= 3) {
        const n = String(Math.round(Math.abs(delta) * (useF() ? 1.8 : 1)));
        const reading = t(delta > 0 ? 'weather.feelsWarmer' : 'weather.feelsCooler', delta > 0 ? 'Warmer by {n}°' : 'Cooler by {n}°')
          .replace('{n}', n);
        add(42, t('weather.feelsLike', 'Feels like') + ': ' + reading + '.');
      }
    }

    const wind = Number(current.wind_speed_10m);
    if (current.wind_speed_10m != null && current.wind_speed_10m !== '' && Number.isFinite(wind) && wind >= 8) {
      const direction = current.wind_direction_10m != null && current.wind_direction_10m !== ''
        ? degToCompass(Number(current.wind_direction_10m)) : '';
      add(wind >= 20 ? 74 : wind >= 14 ? 61 : 43,
        t('weather.wind', 'Wind') + ': ' + fmtWind(wind) + (direction ? ' · ' + direction : '') + '.');
    }

    const humidity = Number(current.relative_humidity_2m);
    if (current.relative_humidity_2m != null && current.relative_humidity_2m !== ''
        && Number.isFinite(humidity) && (humidity >= 80 || humidity <= 25)) {
      add(36, t('weather.humidity', 'Humidity') + ': ' + Math.round(humidity) + '%.');
    }

    const visibility = Number(current.visibility);
    if (current.visibility != null && current.visibility !== '' && Number.isFinite(visibility) && visibility < 5000) {
      add(visibility < 1000 ? 74 : 55, t('weather.visReduced', 'Reduced visibility') + '.');
    }

    const pressureValues = hourly.surface_pressure || [];
    const pressureTimes = hourly.time || [];
    let pressureIndex = -1;
    for (let i = 0; i < pressureTimes.length; i++) {
      const at = stampToMs(pressureTimes[i], timeZone);
      if (Number.isFinite(at) && at >= Date.now() - 3600000) { pressureIndex = i; break; }
    }
    if (pressureIndex >= 3 && pressureValues[pressureIndex] != null && pressureValues[pressureIndex - 3] != null) {
      const pressureDelta = Number(pressureValues[pressureIndex]) - Number(pressureValues[pressureIndex - 3]);
      if (pressureDelta >= 1.5) add(22, t('weather.pressure', 'Pressure') + ': ' + t('weather.pressureRising', 'Rising') + '.');
      else if (pressureDelta <= -1.5) add(22, t('weather.pressure', 'Pressure') + ': ' + t('weather.pressureFalling', 'Falling') + '.');
    }

    const hi = dailyFieldAt(daily, 'temperature_2m_max', dayIndex);
    const lo = dailyFieldAt(daily, 'temperature_2m_min', dayIndex);
    if (hi != null && lo != null && Number.isFinite(Number(hi)) && Number.isFinite(Number(lo))
        && Number(hi) - Number(lo) >= 12) {
      add(20, t('weather.high', 'High') + ': ' + fmtTemp(hi) + ' · '
        + t('weather.low', 'Low') + ': ' + fmtTemp(lo) + '.');
    }

    const nowMinutes = parts ? Number(parts.hour) * 60 + Number(parts.minute) : NaN;
    if (Number.isFinite(nowMinutes)) {
      [['sunrise', 'weather.sunrise', 27], ['sunset', 'weather.sunset', 27]].forEach(function (entry) {
        const event = dailyFieldAt(daily, entry[0], dayIndex);
        const match = String(event || '').match(/T(\d{2}):(\d{2})/);
        if (!match) return;
        const eventMinutes = Number(match[1]) * 60 + Number(match[2]);
        if (eventMinutes >= nowMinutes && eventMinutes - nowMinutes <= 45) {
          add(entry[2], t(entry[1], entry[0]) + ': ' + formatClock(event, timeZone) + '.');
        }
      });
    }

    if (!candidates.length) return '';
    candidates.sort(function (a, b) { return b.score - a.score; });
    const top = candidates[0].score;
    const options = candidates.filter(function (item) { return item.score >= Math.max(0, top - 24); }).slice(0, 4);
    return (options[Math.abs(Number(seed) || 0) % options.length] || candidates[0]).text;
  }
  function greetingGraphemes(value) {
    const text = String(value || '');
    try {
      if (window.Intl && Intl.Segmenter) {
        return Array.from(new Intl.Segmenter(lang(), { granularity: 'grapheme' }).segment(text), function (part) { return part.segment; });
      }
    } catch (e) { /* use code point fallback */ }
    return Array.from(text);
  }
  function greetingLineGroups(graphemes) {
    if (!greetingSizerEl || !graphemes.length || typeof document.createRange !== 'function') return [graphemes];
    const node = greetingSizerEl.firstChild;
    if (!node || node.nodeType !== 3) return [graphemes];
    const groups = [];
    const range = document.createRange();
    let offset = 0;
    let lineTop = null;
    let line = [];
    try {
      graphemes.forEach(function (grapheme) {
        range.setStart(node, offset);
        range.setEnd(node, offset + grapheme.length);
        const rect = range.getBoundingClientRect();
        const top = rect && rect.height ? Math.round(rect.top * 2) / 2 : lineTop;
        if (line.length && top != null && lineTop != null && Math.abs(top - lineTop) > 1) {
          groups.push(line);
          line = [];
        }
        line.push(grapheme);
        if (top != null) lineTop = top;
        offset += grapheme.length;
      });
      if (line.length) groups.push(line);
    } catch (e) {
      return [graphemes];
    }
    return groups.length ? groups : [graphemes];
  }
  function renderGreetingLines(groups) {
    const lines = [];
    greetingTextEl.replaceChildren();
    groups.forEach(function (graphemes) {
      const line = document.createElement('span');
      line.className = 'weather-greeting-line';
      const text = document.createElement('span');
      text.className = 'weather-greeting-line-text';
      line.appendChild(text);
      greetingTextEl.appendChild(line);
      lines.push({ element: line, text: text, graphemes: graphemes });
    });
    return lines;
  }
  function finishGreetingTyping(text) {
    const finalText = text == null ? lastGreetingText : String(text);
    window.clearTimeout(greetingTypeTimer);
    greetingTypeTimer = 0;
    greetingTypeGeneration += 1;
    if (finalText) {
      lastGreetingText = finalText;
      if (greetingTitleEl) greetingTitleEl.setAttribute('aria-label', finalText);
      if (greetingSizerEl) greetingSizerEl.textContent = finalText;
      if (greetingTextEl) greetingTextEl.textContent = finalText;
    }
    if (greetingTitleEl) greetingTitleEl.removeAttribute('data-typing');
  }
  function typeGreeting(fullText) {
    if (!greetingTitleEl || !greetingTextEl || !greetingSizerEl) return;
    // List repaints call updateGreeting often. Keep the active typewriter when the
    // text is unchanged instead of clearing its only pending character timer.
    if (fullText === lastGreetingText) {
      if (greetingTypeTimer) return;
      if (greetingTitleEl.getAttribute('data-typing') === 'true') {
        finishGreetingTyping(fullText);
      }
      return;
    }
    // A data refresh can replace the checking message while it is typing. End on
    // the newest copy in one step instead of repeatedly restarting midway through.
    if (greetingTypeTimer || greetingTitleEl.getAttribute('data-typing') === 'true') {
      finishGreetingTyping(fullText);
      return;
    }
    window.clearTimeout(greetingTypeTimer);
    greetingTypeTimer = 0;
    const generation = ++greetingTypeGeneration;
    lastGreetingText = fullText;
    greetingTitleEl.setAttribute('aria-label', fullText);
    greetingSizerEl.textContent = fullText;
    const graphemes = greetingGraphemes(fullText);
    const reduced = motionLevel() !== 'full';
    if (reduced || !graphemes.length) {
      greetingTextEl.textContent = fullText;
      greetingTitleEl.removeAttribute('data-typing');
      return;
    }
    const lines = renderGreetingLines(greetingLineGroups(graphemes));
    greetingTitleEl.setAttribute('data-typing', 'true');
    const duration = Math.max(380, Math.min(1400, graphemes.length * 26));
    const delay = duration / graphemes.length;
    let i = 0;
    let lineIndex = 0;
    let charInLine = 0;
    const typeNext = function () {
      if (generation !== greetingTypeGeneration) return;
      if (i >= graphemes.length) {
        greetingTypeTimer = 0;
        greetingTitleEl.removeAttribute('data-typing');
        return;
      }
      const line = lines[lineIndex];
      if (!line) {
        finishGreetingTyping(fullText);
        return;
      }
      line.element.classList.add('is-typing');
      line.text.textContent += line.graphemes[charInLine++];
      i += 1;
      if (charInLine >= line.graphemes.length) {
        line.element.classList.remove('is-typing');
        lineIndex += 1;
        charInLine = 0;
      }
      greetingTypeTimer = window.setTimeout(typeNext, delay);
    };
    typeNext();
  }
  function scheduleGreetingBoundary(timeZone, parts, pack) {
    window.clearTimeout(greetingBoundaryTimer);
    const p = parts || localDateTimeParts(timeZone);
    const boundaries = [5, 12, 17, 22];
    let nextHour = boundaries.find(function (hour) { return hour > p.hour; });
    if (nextHour == null) nextHour = 29; // tomorrow at 05:00
    let delay = Math.max(1000, (nextHour - p.hour) * 3600000 - p.minute * 60000 - p.second * 1000 + 1500);
    const daily = pack && pack.weather && pack.weather.daily || {};
    const now = Date.now();
    let nextSunEvent = Infinity;
    ['sunrise', 'sunset'].forEach(function (field) {
      (daily[field] || []).forEach(function (event) {
        const at = stampToMs(event, timeZone);
        if (Number.isFinite(at) && at > now && at < nextSunEvent) nextSunEvent = at;
      });
    });
    // Recheck My Sky just after sunrise or sunset so a daytime UV insight
    // cannot linger into night, and a new daylight insight can appear at dawn.
    if (Number.isFinite(nextSunEvent)) delay = Math.min(delay, nextSunEvent - now + 60500);
    greetingBoundaryTimer = window.setTimeout(function () { updateGreeting(); }, delay);
  }
  function updateGreeting() {
    const selectedCity = weatherMode === 'my-sky' ? getGreetingSourceCity() : null;
    const pack = selectedCity
      ? ((openCity && openCity.weather && openCity.city && sameCity(openCity.city, selectedCity))
        ? openCity : cache.get(cityKey(selectedCity)))
      : null;
    const timeZone = selectedCity
      ? ((pack && pack.weather && pack.weather.timezone) || selectedCity.tz || undefined)
      : undefined;
    const parts = localDateTimeParts(timeZone);
    const period = greetingPeriod(parts.hour);
    const periodSlot = { night: 0, morning: 1, afternoon: 2, evening: 3 }[period];
    const visit = getGreetingVisitSeed();
    const selectionSeed = greetingDayOfYear(parts) * 13 + periodSlot * 7 + visit;
    const choice = selectionSeed % 15;
    const greet = t('weather.greeting.' + period, {
      morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', night: 'Good night'
    }[period]);
    const cur = pack && pack.weather && pack.weather.current || {};
    let fullText;
    if (weatherMode === 'my-sky') {
      if (!selectedCity) {
        fullText = t('weather.greeting.mySkyPrompt', '{greeting} — choose a city to see your local forecast.')
          .replace('{greeting}', greet);
      } else if (pack && pack.error) {
        fullText = t('weather.greeting.mySkyUnavailable', '{greeting} — the forecast for {place} is temporarily unavailable.')
          .replace('{greeting}', greet).replace('{place}', displayCityName(selectedCity));
      } else if (!pack || !pack.weather || !pack.weather.current) {
        fullText = t('weather.greeting.mySkyChecking', '{greeting} — checking the weather in {place}.')
          .replace('{greeting}', greet).replace('{place}', displayCityName(selectedCity));
      } else if (cur.temperature_2m == null || cur.temperature_2m === '' || !Number.isFinite(Number(cur.temperature_2m))
          || greetingWeatherCode(cur.weather_code) == null) {
        fullText = t('weather.greeting.mySkyChecking', '{greeting} — checking the weather in {place}.')
          .replace('{greeting}', greet).replace('{place}', displayCityName(selectedCity));
      } else {
        const place = displayCityName(selectedCity);
        const temp = fmtTemp(cur.temperature_2m);
        const weatherPhrase = greetingWeatherPhrase(cur.weather_code);
        const isSpecial = greetingWeatherUsesSpecialTemplate(cur.weather_code);
        const template = isSpecial
          ? t('weather.greeting.mySkySpecialForecast', '{greeting} — {place}: {temp}, {condition}.')
          : t('weather.greeting.mySkyForecast', '{greeting} — {temp} and {condition} in {place}.');
        fullText = template
          .replace('{greeting}', greet).replace('{temp}', temp)
          .replace('{condition}', weatherPhrase).replace('{place}', place);
        const insight = greetingWeatherInsight(pack, timeZone, parts, selectionSeed);
        if (insight) {
          const dict = typeof getI18nDict === 'function' ? getI18nDict(lang()) : null;
          const separator = dict && typeof dict['weather.greeting.insightSeparator'] === 'string'
            ? dict['weather.greeting.insightSeparator'] : ' ';
          fullText += separator + insight;
        }
      }
    } else {
      const horizonFallbacks = [
        'Explore the weather unfolding around the world.',
        'See how conditions change from city to city.',
        'Follow the day’s skies across the globe.',
        'Discover forecasts from cities near and far.',
        'From sunshine to showers, see what the day brings.',
        'Take a closer look at weather around the world.',
        'A world of weather is waiting to be explored.',
        'See where clouds are gathering and skies are clearing.',
        'Check in on forecasts from near and far.',
        'Each city has its own forecast. See what today brings.',
        'Follow the sunshine, showers, and changing skies.',
        'Explore current conditions in cities around the world.',
        'Look beyond the horizon to see what the forecast holds.',
        'Watch the forecast shift as the day moves along.',
        'See what the weather has in store across the map.'
      ];
      fullText = greet + t('weather.greeting.separator', '. ')
        + t('weather.greeting.horizon' + choice, horizonFallbacks[choice]);
    }
    typeGreeting(fullText);
    if (greetingPlaceBtn) {
      const hasGreetingSources = greetingSourceOptions().length > 0;
      greetingPlaceBtn.hidden = weatherMode !== 'my-sky';
      greetingPlaceBtn.textContent = hasGreetingSources
        ? t('weather.changeMySkyPlace', 'Change My Sky city')
        : t('weather.chooseMySkyPlace', 'Choose a city for My Sky');
      greetingPlaceBtn.title = greetingPlaceBtn.textContent;
      if (hasGreetingSources) greetingPlaceBtn.setAttribute('aria-haspopup', 'dialog');
      else greetingPlaceBtn.removeAttribute('aria-haspopup');
    }
    scheduleGreetingBoundary(timeZone, parts, pack);
  }

  function refreshListsFromCache(opts) {
    opts = opts || {};
    // Block mid-load repaints (this was the multi-refresh flicker)
    if (listPaintLocked && !opts.force) return;

    if (!myLocationCity) myLocationCity = loadMyLocation();
    if (!selectedGreetingCity) selectedGreetingCity = loadGreetingCity();
    const favs = loadFavorites();
    const favKeys = new Set(favs.map(cityKey));
    if (!weatherModeExplicit) {
      const savedMode = readWeatherModePreference();
      if (savedMode) {
        weatherMode = savedMode;
        weatherModeExplicit = true;
      } else {
        weatherMode = (myLocationCity || selectedGreetingCity || favs.length) ? 'my-sky' : 'horizon';
      }
    }
    const showMySky = weatherMode === 'my-sky';
    const homeCity = myLocationCity || selectedGreetingCity;
    const homeKey = homeCity ? cityKey(homeCity) : null;

    const myPacks = homeCity
      ? [(function () {
          const p = pendingCityKeys.has(homeKey)
            ? { city: homeCity, pending: true, fetchedAt: 0 }
            : (cache.get(homeKey) || { city: homeCity, pending: true, fetchedAt: 0 });
          // The location badge and timestamp belong only to an explicit device fix.
          if (myLocationCity && p.city) {
            p.city = Object.assign({}, p.city, {
              isMyLocation: true,
              locatedAt: myLocationCity.locatedAt || p.city.locatedAt || 0
            });
          } else {
            p.city = Object.assign({}, homeCity, { isMyLocation: false });
          }
          return p;
        })()]
      : [];
    // The current personal place is shown above; other saved places follow it.
    const favPacks = favs
      .filter((c) => !homeKey || cityKey(c) !== homeKey)
      .map((c) => pendingCityKeys.has(cityKey(c))
        ? { city: c, pending: true, fetchedAt: 0 }
        : (cache.get(cityKey(c)) || { city: c, pending: true, fetchedAt: 0 }));
    const majorPacks = MAJOR
      .filter((c) => !showMySky || (!favKeys.has(cityKey(c)) && (!homeKey || cityKey(c) !== homeKey)))
      .map((c) => pendingCityKeys.has(cityKey(c))
        ? { city: c, pending: true, fetchedAt: 0 }
        : (cache.get(cityKey(c)) || { city: c, pending: true, fetchedAt: 0 }));

    if (myLocBlock) myLocBlock.hidden = !showMySky || !homeCity;
    if (myLocBlock) {
      const label = myLocBlock.querySelector('.weather-section-label');
      if (label) label.textContent = myLocationCity
        ? t('weather.myLocation', 'My Location')
        : t('weather.selectedPlace', 'Chosen place');
    }
    if (favBlock) favBlock.hidden = !showMySky || favPacks.length === 0;
    if (majorsBlock) majorsBlock.hidden = showMySky;
    if (mySkyEmptyEl) mySkyEmptyEl.hidden = !showMySky || !!homeCity || favPacks.length > 0;
    modeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-weather-mode') === weatherMode ? 'true' : 'false');
    });
    renderCityList(myLocListEl, myPacks);
    renderCityList(favListEl, favPacks);
    if (listEl) listEl.hidden = false;
    renderCityList(listEl, majorPacks);

    let latest = 0;
    [...myPacks, ...favPacks, ...majorPacks].forEach((p) => { latest = Math.max(latest, p.fetchedAt || 0); });
    if (latest) setUpdated(latest);
    updateGreeting();
    if (!opts.skipAmbient) applyAmbientPageSky();
    // List is interactive again — clear any stuck full-screen PE lock
    if (!isDetailVisible()) ensureListTappable();
  }

  /** Page is foreground-active (auto-refresh only runs then). */
  function isPageActive() {
    try {
      return document.visibilityState === 'visible';
    } catch (e) {
      return true;
    }
  }

  /** Manual Refresh must always stay clickable; busy is visual only. */
  function setRefreshBusy(busy) {
    [refreshBtn, detailRefresh].forEach(function (btn) {
      if (!btn) return;
      // Never leave the control disabled — user can always re-trigger.
      btn.disabled = false;
      if (busy) {
        btn.setAttribute('aria-busy', 'true');
        btn.classList.add('is-busy');
      } else {
        btn.removeAttribute('aria-busy');
        btn.classList.remove('is-busy');
      }
    });
  }

  function clearAutoRefresh() {
    if (autoRefreshTimer) {
      try { clearInterval(autoRefreshTimer); } catch (e) {}
      autoRefreshTimer = null;
    }
  }

  /**
   * Auto-refresh every REFRESH_MS while the page is active.
   * Fully paused (timer cleared) when tab is hidden / inactive.
   * Rescheduling after a successful load resets the 10-minute clock.
   */
  function scheduleAutoRefresh() {
    clearAutoRefresh();
    if (!isPageActive()) return;
    autoRefreshTimer = setInterval(function () {
      if (!isPageActive()) return;
      // Don't stack on an in-flight manual/auto load
      if (refreshInflight) return;
      refresh(true, { quiet: true, reason: 'auto' });
    }, REFRESH_MS);
  }

  function onPageActivityChange() {
    if (isPageActive()) {
      finishGreetingTyping();
      scheduleAutoRefresh();
      // If data is stale after being away, quiet-refresh immediately
      const stale = !lastListFetch || (Date.now() - lastListFetch >= REFRESH_MS);
      if (stale && !refreshInflight) {
        refresh(true, { quiet: true, reason: 'resume' });
      }
    } else {
      finishGreetingTyping();
      clearAutoRefresh();
    }
  }

  /**
   * @param {boolean} force  Re-fetch from NWS + Open-Meteo (not cache-only paint)
   * @param {{ quiet?: boolean, reason?: string }} [opts]
   *   quiet: background refresh (auto/resume) — keep list visible, no progress lock
   */
  async function refresh(force, opts) {
    opts = opts || {};
    const quiet = !!opts.quiet;
    if (opts.reason === 'manual' || opts.reason === 'manual-detail') {
      greetingVisitSeed = null;
      updateGreeting();
    }
    const gen = ++refreshGen;

    // Forced reload: ensure NWS + OM re-fetch
    if (force) {
      if (!quiet) {
        // Manual refresh invalidates weather values; visible cards stay in place.
        cache.clear();
        dataApi.clearAllNwsPointsCache();
      } else {
        // Quiet auto: keep showing last good list; invalidate NWS grid + forceFetch
        dataApi.clearAllNwsPointsCache();
      }
      alertsPrefetchGen++; // cancel any in-flight alert prefetch
      if (dataApi && typeof dataApi.abortListLoads === 'function') dataApi.abortListLoads();
    }

    showError('');
    // Manual always available — busy state only (re-click cancels prior gen)
    setRefreshBusy(true);
    // Only user-initiated loads are announced; the 10-minute auto refresh stays silent.
    if (!quiet && shellEl) shellEl.setAttribute('aria-busy', 'true');

    if (!myLocationCity) myLocationCity = loadMyLocation();
    if (!selectedGreetingCity) selectedGreetingCity = loadGreetingCity();
    const favs = loadFavorites();
    const cities = [];
    if (myLocationCity) cities.push(myLocationCity);
    favs.forEach((c) => {
      if (!myLocationCity || !sameCity(c, myLocationCity)) cities.push(c);
    });
    const seen = new Set(cities.map(cityKey));
    if (selectedGreetingCity && !seen.has(cityKey(selectedGreetingCity))) {
      cities.push(selectedGreetingCity);
      seen.add(cityKey(selectedGreetingCity));
    }
    MAJOR.forEach((c) => { if (!seen.has(cityKey(c))) cities.push(c); });
    cities.forEach((c) => {
      const k = cityKey(c);
      const hit = cache.get(k);
      if (!quiet || !hit || !hit.weather) pendingCityKeys.add(k);
    });
    if (!quiet) refreshListsFromCache({ force: true, skipAmbient: true });

    const run = (async () => {
      try {
        if (!quiet) {
          // Let the browser paint 0–3% before network work (avoids "starts at 85%")
          await new Promise(function (r) {
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(r);
            });
          });
        }
        if (gen !== refreshGen) return;

        await dataApi.loadMany(cities, {
          quiet: quiet,
          forceFetch: !!force
        });
        if (gen !== refreshGen) return;
        lastListFetch = Date.now();

        // NWS alerts are fetched for every U.S. city, including quiet startup.
        // Quiet mode only suppresses progress UI; it must not suppress safety data.
        // Alerts are fetched for every U.S. city, quiet or not: quiet mode only
        // suppresses chrome, never safety data.
        await alertsApi.prefetchAlertsForCache();
        if (gen !== refreshGen) return;

        // Cards have already been updated individually; do not rebuild the list.
        cities.forEach((c) => pendingCityKeys.delete(cityKey(c)));
        listPaintLocked = false;
        cancelPendingListPaints();
        if (!quiet) clearWeatherSkeleton();
        if (!cache.size) refreshListsFromCache({ force: true });

        let ok = 0;
        cache.forEach(function (p) { if (p && p.weather && !p.error) ok++; });
        if (ok) showError('');
        else if (!quiet) {
          showError(t('weather.error', 'Could not load weather data.'));
        }
      } catch (e) {
        if (e && e.name === 'AbortError') {
          // Superseded by a newer refresh — leave UI to the winner
          if (gen === refreshGen) {
            cities.forEach((c) => pendingCityKeys.delete(cityKey(c)));
            listPaintLocked = false;
            if (!quiet) clearWeatherSkeleton();
            if (cache.size) refreshListsFromCache({ force: true });
            else if (!quiet) showError(t('weather.error', 'Could not load weather data.'));
          }
          return;
        }
        if (gen !== refreshGen) return;
        listPaintLocked = false;
        cities.forEach((c) => pendingCityKeys.delete(cityKey(c)));
        if (!quiet) {
          showError(t('weather.error', 'Could not load weather data.'));
          clearWeatherSkeleton();
        }
        if (cache.size) refreshListsFromCache({ force: true });
        else if (!quiet && listEl) {
          listEl.innerHTML = '';
          listEl.hidden = false;
        }
      } finally {
        if (gen === refreshGen) {
          listPaintLocked = false;
          setRefreshBusy(false);
          if (shellEl) shellEl.removeAttribute('aria-busy');
          // Reset 10-minute auto clock after every completed cycle (while active)
          if (isPageActive()) scheduleAutoRefresh();
          if (pendingUiRefresh) {
            pendingUiRefresh = false;
            try { window.refreshWeatherUi({ force: true }); } catch (e) { /* ignore */ }
          }
        }
      }
    })();
    refreshInflight = run;
    try {
      await run;
    } finally {
      if (refreshInflight === run) refreshInflight = null;
      // Belt-and-suspenders: never leave buttons disabled
      if (gen === refreshGen) setRefreshBusy(false);
      if (refreshBtn) refreshBtn.disabled = false;
      if (detailRefresh) detailRefresh.disabled = false;
    }
  }

  function syncDetailFav(c) {
    if (!detailFavBtn || !c) return;
    const fav = isFavorite(c);
    detailFavBtn.setAttribute('aria-pressed', fav ? 'true' : 'false');
    detailFavBtn.innerHTML = savedPlaceIcon(fav);
    detailFavBtn.setAttribute('aria-label', savedPlaceLabel(fav));
    detailFavBtn.title = savedPlaceLabel(fav);
  }

  /** Hoist fixed overlays to <body> once so viewport stacking is reliable. */
  function hoistOverlays() {
    if (overlaysHoisted) return;
    try {
      if (detailEl && detailEl.parentElement !== document.body) {
        document.body.appendChild(detailEl);
      }
      if (sheetEl && sheetEl.parentElement !== document.body) {
        document.body.appendChild(sheetEl);
      }
      // Sheet must paint after detail in DOM order
      if (detailEl && sheetEl && detailEl.parentElement === document.body) {
        document.body.appendChild(sheetEl);
      }
      overlaysHoisted = true;
    } catch (e) { /* keep in place */ }
  }

  function cancelDetailMotion() {
    detailMotionGen += 1;
    if (detailMotionTimer) {
      window.clearTimeout(detailMotionTimer);
      detailMotionTimer = 0;
    }
    if (detailEnterTimer) {
      window.clearTimeout(detailEnterTimer);
      detailEnterTimer = 0;
    }
    if (detailCloseListener && detailEl) {
      try { detailEl.removeEventListener('transitionend', detailCloseListener); } catch (e) {}
      detailCloseListener = null;
    }
    return detailMotionGen;
  }

  function lockDetailPage() {
    try {
      document.body.classList.add('weather-detail-open');
      document.documentElement.classList.add('weather-detail-open');
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } catch (e) {}
  }

  function isDetailVisible() {
    return !!(detailEl && detailEl.classList.contains('open') && !detailEl.classList.contains('is-closing'));
  }

  /**
   * True while the detail is showing OR still animating in. openCity is set synchronously by
   * openDetail, whereas `.open` is deliberately withheld for two frames by the enter
   * animation — so a background fetch that resolves inside that window must not read `.open`
   * to mean "the user has navigated away". Doing so discarded the fetched data.
   */
  function isDetailShowingOrOpening() {
    if (!detailEl || !openCity) return false;
    return !detailEl.classList.contains('is-closing');
  }

  // The detail surface is useful before the background city queue completes.
  // Open it immediately, then replace this loading state with the fetched pack.
  function openDetailLoading(city) {
    if (!detailEl || !city) return;
    openCity = { city: city, pending: true };
    if (detailHero) {
      detailHero.innerHTML = `<h2 id="weatherDetailTitle">${escapeHtml(displayCityName(city))}</h2><div class="weather-detail-loading" role="status" aria-live="polite"><span class="loader" aria-hidden="true"></span><span>${escapeHtml(t('weather.loadingForecast', 'Loading forecast…'))}</span></div>`;
    }
    if (detailMods) {
      detailMods.innerHTML = `<div class="weather-detail-loading-panel" role="status" aria-live="polite"><span class="loader" aria-hidden="true"></span><span>${escapeHtml(t('weather.loadingForecast', 'Loading forecast…'))}</span></div>`;
    }
    if (detailBack) {
      detailBack.hidden = false;
      detailBack.style.visibility = 'visible';
      detailBack.style.display = '';
    }
    markDetailInteractive();
    forceCloseSheet();
    lockDetailPage();
    cancelDetailMotion();
    detailEl.classList.remove('is-closing', 'wx-detail-enter');
    detailEl.classList.add('open');
    detailEl.style.opacity = '';
    detailEl.style.pointerEvents = '';
    if (detailScroll) detailScroll.scrollTop = 0;
    try { detailEl.setAttribute('aria-labelledby', 'weatherDetailTitle'); } catch (eLab) { /* ignore */ }
    try { detailBack.focus({ preventScroll: true }); } catch (e) {}
  }

  function openDetail(pack) {
    if (!detailEl || !pack || !pack.weather) return;
    const prevCity = openCity && openCity.city;
    const cityChanged = !!(prevCity && pack.city && !sameCity(prevCity, pack.city));
    // Preserve expanded warnings across enrich / unit / language re-renders
    const keepAlertOpen = !cityChanged && isDetailVisible() ? alertsApi.captureOpenAlertTitles() : [];
    // Preserve alerts already loaded when enrich replaces the pack object
    if (!cityChanged && openCity && Array.isArray(openCity.alerts) && pack.alerts == null) {
      pack.alerts = openCity.alerts;
    }
    openCity = pack;
    const c = pack.city;
    if (c && pack.weather) cache.set(cityKey(c), pack);
    updateGreeting();
    const cur = pack.weather.current;
    const daily = pack.weather.daily || {};
    const hourly = pack.weather.hourly || {};
    {
      const hour = localHourForPack(pack);
      const seed = Math.abs(Math.round((c.lat || 0) * 100) + Math.round((c.lon || 0) * 10));
      const skyOpts = {
        hour, seed, isRow: false,
        timeZone: cityTimeZone(pack, c),
        precipMm: cur.precipitation,
        windDeg: cur.wind_direction_10m,
        windMs: cur.wind_speed_10m,
        humidity: cur.relative_humidity_2m,
        visibility: cur.visibility,
        uv: uvNowValue(pack, daily, dailyTodayIndex(daily, cityTimeZone(pack, c)), hourly, cityTimeZone(pack, c))
      };
      // Gradient on shell; ornaments/rain only on sky layer (avoid double rain)
      applySky(detailEl, cur.weather_code, cur.time, Object.assign({}, skyOpts, { noOrnaments: true }));
      if (detailSky) {
        applySky(detailSky, cur.weather_code, cur.time, skyOpts);
        // Mirror mode class on shell so any host-scoped CSS still matches
        Array.from(detailEl.classList).forEach(function (cls) {
          if (cls.indexOf('wx-sky--') === 0) detailEl.classList.remove(cls);
        });
        detailSky.classList.forEach(function (cls) {
          if (cls.indexOf('wx-sky--') === 0) detailEl.classList.add(cls);
        });
        const base = detailSky.querySelector('.wx-layer-base');
        if (base) {
          base.style.background = 'linear-gradient(165deg, var(--wx-sky-1), var(--wx-sky-2))';
        }
      }
    }
    // Ensure back control is always interactive
    if (detailBack) {
      detailBack.hidden = false;
      detailBack.style.visibility = 'visible';
      detailBack.style.display = '';
    }

    const night = localHourForPack(pack) < 6 || localHourForPack(pack) >= 20;
    const dayIdx = dailyTodayIndex(daily, cityTimeZone(pack, c));
    const heroRange = dayHiLo(daily, dayIdx, cur.temperature_2m);
    detailHero.innerHTML = `
      <h2 id="weatherDetailTitle">${escapeHtml(displayCityName(c))}</h2>
      <div class="weather-detail-temp">${fmtTemp(cur.temperature_2m)}</div>
      <div class="weather-detail-cond">${condIcon(cur.weather_code, night)} ${escapeHtml(condLabel(cur.weather_code))}</div>
      <div class="weather-detail-hl">${t('weather.high', 'H')}:${fmtTemp(heroRange.hi)}  ${t('weather.low', 'L')}:${fmtTemp(heroRange.lo)}</div>
      <div class="weather-detail-updated" id="weatherDetailUpdated"></div>`;
    try { detailEl.setAttribute('aria-labelledby', 'weatherDetailTitle'); } catch (eLab2) { /* ignore */ }
    {
      const detUp = $('weatherDetailUpdated');
      if (detUp) {
        const parts = [];
        if (pack.fetchedAt) {
          parts.push(t('weather.updated', 'Updated') + ' ' + formatUpdatedStamp(pack.fetchedAt));
        }
        const locLab = locationLocatedLabel(c);
        if (locLab) parts.push(locLab);
        detUp.textContent = parts.join(' · ');
      }
    }
    syncDetailFav(c);

    // NWS severe weather / disaster alerts (Apple Weather–style banner stack)
    alertsApi.ensureNwsAlerts(pack);

    const aqi = pack.air && pack.air.current && pack.air.current.us_aqi;
    const mods = [];
    {
      const alertHtml = alertsApi.alertsBlockHtml(pack);
      if (alertHtml) mods.push(alertHtml);
    }
    mods.push(modHtml(
      'aqi', t('weather.aqi', 'Air Quality'),
      aqi != null ? String(Math.round(aqi)) : '—',
      aqiLabel(aqi) || '',
      true, false, aqiBarHtml(aqi, true)
    ));
    {
      const feels = cur.apparent_temperature;
      const delta = feels != null && cur.temperature_2m != null ? feels - cur.temperature_2m : null;
      let feelsSub = '';
      if (delta != null) {
        const abs = Math.abs(Math.round(delta));
        if (abs < 1) feelsSub = t('weather.feelsSimilar', 'Similar to actual');
        else if (delta > 0) feelsSub = t('weather.feelsWarmer', 'Warmer by {n}°').replace('{n}', String(abs));
        else feelsSub = t('weather.feelsCooler', 'Cooler by {n}°').replace('{n}', String(abs));
      }
      mods.push(modHtml('feels', t('weather.feelsLike', 'Feels like'), fmtTemp(feels), feelsSub, true));
    }
    {
      const rh = cur.relative_humidity_2m;
      mods.push(modHtml(
        'humidity', t('weather.humidity', 'Humidity'),
        rh != null && Number.isFinite(rh) ? Math.round(rh) + '%' : '—',
        '',
        true, false, humidityBarHtml(rh)
      ));
    }
    {
      const deg = cur.wind_direction_10m;
      const dirLab = degToCompass(deg) + (deg != null ? ' · ' + Math.round(deg) + '°' : '');
      mods.push(modHtml(
        'wind', t('weather.wind', 'Wind'),
        fmtWind(cur.wind_speed_10m),
        dirLab,
        true, false,
        chartsApi.windCompassMarkup(deg, 'mini')
      ));
    }
    {
      const uvv = uvNowValue(pack, daily, dayIdx, hourly, cityTimeZone(pack, c));
      const uvLab = uvLabelFor(uvv);
      mods.push(modHtml(
        'uv', t('weather.uv', 'UV Index'),
        uvv != null ? String(Math.round(uvv * 10) / 10) : '—',
        uvLab,
        true, false, uvBarHtml(uvv)
      ));
    }
    {
      const visSub = cur.visibility != null && cur.visibility < 5000
        ? t('weather.visReduced', 'Reduced visibility')
        : '';
      mods.push(modHtml('vis', t('weather.visibility', 'Visibility'), fmtVis(cur.visibility), visSub, true));
    }
    {
      // Simple pressure trend from hourly if available (city-local timestamps)
      let trend = '';
      try {
        const ht = hourly.time || [];
        const hp = hourly.surface_pressure || [];
        const tz = cityTimeZone(pack, c);
        const now = Date.now();
        let idx = 0;
        for (let i = 0; i < ht.length; i++) {
          const ms = stampToMs(ht[i], tz);
          if (Number.isFinite(ms) && ms >= now - 3600000) { idx = i; break; }
        }
        if (idx >= 3 && hp[idx] != null && hp[idx - 3] != null) {
          const d = hp[idx] - hp[idx - 3];
          if (d > 0.8) trend = t('weather.pressureRising', 'Rising');
          else if (d < -0.8) trend = t('weather.pressureFalling', 'Falling');
          else trend = t('weather.pressureSteady', 'Steady');
        }
      } catch (e) {}
      mods.push(modHtml('pressure', t('weather.pressure', 'Pressure'), fmtPress(cur.surface_pressure), trend, true));
    }
    {
      const dayPrecip = dailyFieldAt(daily, 'precipitation_sum', dayIdx);
      const sub = dayPrecip != null
        ? t('weather.todayPrecip', 'Today {n}').replace('{n}', fmtPrecip(dayPrecip))
        : '';
      mods.push(modHtml('precip', t('weather.precip', 'Precipitation'), fmtPrecip(cur.precipitation), sub, true));
    }

    const sr = dailyFieldAt(daily, 'sunrise', dayIdx);
    const ss = dailyFieldAt(daily, 'sunset', dayIdx);
    const sunTz = (pack.weather && pack.weather.timezone) || (c && c.tz) || undefined;
    const sunViz = chartsApi.sunArcSvg(sr, ss, true, sunTz);
    const sunTitle = (function () {
      try {
        if (chartsApi && typeof chartsApi.sunPathGeometry === 'function') {
          const g = chartsApi.sunPathGeometry(sr, ss, 100, 40, 0, 0, 0, 0, sunTz);
          if (g && g.isDay) return t('weather.sunset', 'Sunset');
        }
      } catch (eSun) { /* fall through */ }
      return t('weather.sunrise', 'Sunrise');
    })();
    mods.push(modHtml('sun', sunTitle, '', sunViz, true, true));

    // Hourly strip — Open-Meteo stamps are city wall-clock; do not Date.parse as the viewer zone.
    let hourlyHtml = '<div class="weather-hourly">';
    const times = hourly.time || [];
    const stripTz = cityTimeZone(pack, c);
    const nowMs = Date.now();
    let start = 0;
    for (let i = 0; i < times.length; i++) {
      const ms = stampToMs(times[i], stripTz);
      if (Number.isFinite(ms) && ms >= nowMs - 3600000) { start = i; break; }
    }
    for (let i = start; i < Math.min(start + 24, times.length); i++) {
      let lab = '';
      if (isBareWallClock(times[i])) {
        try {
          const h24 = wallHour(times[i], stripTz);
          const d = new Date(2000, 0, 1, h24, 0);
          lab = d.toLocaleTimeString(localeTag(), { hour: 'numeric' });
        } catch (e) { lab = ''; }
      } else {
        try {
          const opts = { hour: 'numeric' };
          if (stripTz) opts.timeZone = stripTz;
          lab = new Date(times[i]).toLocaleTimeString(localeTag(), opts);
        } catch (e) { lab = ''; }
      }
      const code = hourly.weather_code && hourly.weather_code[i];
      const h = wallHour(times[i], stripTz);
      const pop = hourly.precipitation_probability && hourly.precipitation_probability[i];
      hourlyHtml += `<div class="weather-hourly-item">
        <div>${escapeHtml(i === start ? t('weather.now', 'Now') : lab)}</div>
        <div class="ic">${condIcon(code || 0, h < 6 || h >= 20)}</div>
        <div class="t">${fmtTemp(hourly.temperature_2m && hourly.temperature_2m[i])}</div>
        ${pop != null ? `<div class="p">${Math.round(pop)}%</div>` : ''}
      </div>`;
    }
    hourlyHtml += '</div>';
    const hourlyTitle = t('weather.hourly', 'Hourly Forecast');
    mods.push(`<button type="button" class="weather-mod weather-mod-wide is-tappable" data-sheet="conditions" aria-label="${escapeHtml(hourlyTitle)}"><div class="weather-mod-label">${modLabelIcon('conditions')}<span>${escapeHtml(hourlyTitle)}</span></div>${hourlyHtml}</button>`);

    const dailyOpts = {
      currentTemp: cur && cur.temperature_2m != null ? cur.temperature_2m : null,
      timeZone: (pack.weather && pack.weather.timezone) || (c && c.tz) || undefined,
      hourly: hourly
    };
    const dailyN = chartsApi.dailySliceCount ? chartsApi.dailySliceCount(daily, dailyOpts) : 10;
    const dailyTitle = dailyN >= 10
      ? t('weather.daily', '10-Day Forecast')
      : dailyN === 7
        ? t('weather.daily7', '7-Day Forecast')
        : t('weather.dailyN', '{n}-Day Forecast').replace('{n}', String(dailyN));
    mods.push(`<div class="weather-mod weather-mod-wide"><div class="weather-mod-label">${escapeHtml(dailyTitle)}</div>${chartsApi.dailyBarsHtml(daily, dailyOpts)}</div>`);

    // Apple-style location attribution
    const placeBits = [displayCityName(c), displayAdmin1(c), c.country || ''].filter(Boolean);
    if (!c.country) {
      const catalog = MAJOR.find((m) => sameCity(m, c));
      if (catalog && catalog.country) placeBits.push(catalog.country);
    }
    const placeStr = placeBits.filter((x, i, a) => a.indexOf(x) === i).join(', ');
    const forLine = t('weather.forLocation', 'Weather for {place}').replace('{place}', placeStr);
    mods.push(`<p class="weather-detail-attrib">${escapeHtml(forLine)}</p>`);

    detailMods.innerHTML = mods.join('');
    // Restore any expanded alerts the user had open before this re-render
    if (keepAlertOpen && keepAlertOpen.length) alertsApi.restoreOpenAlertTitles(keepAlertOpen);
    alertsApi.bindAlertCollapseAnimation(detailMods);
    // Clicks use delegated handler on detailMods (bound once) — survives re-renders

    const isClosing = detailEl.classList.contains('is-closing');
    const wasOpen = detailEl.classList.contains('open') && !isClosing;

    hoistOverlays();

    // Opening a city (or switching cities) must never leave a units/info sheet
    // trapping the full-screen pointer layer over the list or detail.
    if (!wasOpen || cityChanged) {
      forceCloseSheet();
    } else if (sheetEl && !sheetOpen) {
      /* Use the intent flag, not the class: while the sheet is animating in the class is
         deliberately absent, and reading it here called inertSheet() mid-open, leaving the
         sheet painted on top but inert/aria-hidden with pointer-events:none. */
      inertSheet();
    }

    // Un-hide + a11y before open animation (re-assert when .open is applied)
    markDetailInteractive();
    detailEl.style.transform = 'none';
    detailEl.style.animation = '';
    lockDetailPage();

    // Scroll reset only when opening/switching cities — not on unit re-render
    if ((!wasOpen || cityChanged) && detailScroll) {
      detailScroll.scrollTop = 0;
      try { detailScroll.scrollTo(0, 0); } catch (e) {}
    }

    const motionGen = cancelDetailMotion();
    detailEl.classList.remove('is-closing');

    // Enter motion only when coming from closed (or reversing a close).
    // Unit/refresh re-renders while already open skip enter to avoid flicker.
    if (!wasOpen) {
      const reversing = isClosing;
      if (!reversing) {
        // Keep .open absent only for the opacity prep frame — re-mark interactive after
        detailEl.classList.remove('open', 'wx-detail-enter');
        detailEl.style.transition = 'none';
        detailEl.style.opacity = '0';
        void detailEl.offsetWidth;
        detailEl.style.transition = '';
        detailEl.style.opacity = '';
      } else {
        detailEl.classList.remove('wx-detail-enter');
      }

      window.requestAnimationFrame(function () {
        if (motionGen !== detailMotionGen) return;
        window.requestAnimationFrame(function () {
          if (motionGen !== detailMotionGen) return;
          detailEl.classList.add('open', 'wx-detail-enter');
          // Re-assert after rAF window so list-paint races cannot leave inert/hidden open
          markDetailInteractive();
          if (detailEnterTimer) window.clearTimeout(detailEnterTimer);
          detailEnterTimer = window.setTimeout(function () {
            if (motionGen !== detailMotionGen) return;
            try { detailEl.classList.remove('wx-detail-enter'); } catch (e) {}
            detailEnterTimer = 0;
          }, 450);
        });
      });
    } else {
      detailEl.classList.add('open');
      detailEl.classList.remove('wx-detail-enter');
      markDetailInteractive();
    }

    if (!wasOpen && detailBack && typeof detailBack.focus === 'function') {
      try { detailBack.focus({ preventScroll: true }); } catch (e2) { detailBack.focus(); }
    }

    // Open-Meteo gap-fill after NWS list paint (humidity, UV, sunrise, AQI, …)
    // Re-enrich if hourly only has the remaining hours of “today” (stale index-merge
    // from older builds → 2-point humidity charts).
    if (!pack.needsEnrich && pack.weather && pack.weather.hourly && pack.city
        && (pack.source === 'nws' || pack.source === 'nws+om')) {
      try {
        const win = chartsApi.hourlyLocalDay(pack.weather.hourly, pack.weather.timezone || pack.city.tz);
        if ((win.end - win.start) < 12) pack.needsEnrich = true;
      } catch (eSparse) { /* ignore */ }
    }
    if (pack.needsEnrich && pack.city && !pack._enriching) {
      pack._enriching = true;
      const enrichKey = cityKey(pack.city);
      // Snapshot expanded alerts so enrich re-render can restore them
      const openTitlesBeforeEnrich = alertsApi.captureOpenAlertTitles();
      dataApi.loadCity(pack.city, null, { enrich: true }).then(function (fresh) {
        if (!fresh || !fresh.weather) return;
        fresh._enriching = false;
        // Keep alerts from pre-enrich pack (enrich path does not re-fetch them)
        if (Array.isArray(pack.alerts)) fresh.alerts = pack.alerts;
        else if (openCity && Array.isArray(openCity.alerts)) fresh.alerts = openCity.alerts;
        cache.set(enrichKey, fresh);
        // Gate on intent, not on `.open`: an instant Open-Meteo response can land while the
        // enter animation is still deferring that class, and skipping the re-render here left
        // the detail permanently without hourly / sunrise / UV data.
        if (openCity && openCity.city && sameCity(openCity.city, pack.city) && isDetailShowingOrOpening()) {
          // Stash titles for openDetail restore (also captured at openDetail entry)
          if (openTitlesBeforeEnrich.length && detailMods) {
            // openDetail will capture empty if we already rebuilt — set on pack for restore
            fresh._restoreAlertOpen = openTitlesBeforeEnrich;
          }
          openDetail(fresh);
          if (fresh._restoreAlertOpen) {
            alertsApi.restoreOpenAlertTitles(fresh._restoreAlertOpen);
            delete fresh._restoreAlertOpen;
          }
        }
      }).catch(function () {
        pack._enriching = false;
        pack.needsEnrich = false;
      });
    }
  }

  /**
   * Apple Weather-style module tile:
   * label (icon + title) → large value → subtitle → optional foot viz (bar / compass).
   * footHtml is always raw HTML (bars, compass), kept separate from sub text.
   */
  function modHtml(key, label, value, sub, tappable, subIsHtml, footHtml) {
    const tag = tappable ? 'button' : 'div';
    const type = tappable ? ' type="button"' : '';
    const ds = tappable ? ` data-sheet="${key}"` : '';
    const icon = modLabelIcon(key);
    const subBlock = !sub
      ? ''
      : (subIsHtml ? sub : `<div class="weather-mod-sub">${escapeHtml(sub)}</div>`);
    const valBlock = (value === '' || value == null)
      ? ''
      : `<div class="weather-mod-value">${escapeHtml(value)}</div>`;
    const foot = footHtml
      ? `<div class="weather-mod-foot" aria-hidden="true">${footHtml}</div>`
      : '';
    return `<${tag}${type} class="weather-mod${tappable ? ' is-tappable' : ''}"${ds}><div class="weather-mod-label">${icon}<span>${escapeHtml(label)}</span></div>${valBlock}${subBlock}${foot}</${tag}>`;
  }

  function countryLabelUS() {
    return t('weather.countryUS', 'United States');
  }

  function shortCountryName(name, code) {
    const n = String(name || '').trim();
    const cc = String(code || '').toUpperCase();
    if (cc === 'US' || /^united states( of america)?$/i.test(n)) return countryLabelUS();
    return n;
  }

  function regionWithoutCountry(raw, country) {
    let region = String(raw || '').trim();
    if (!region) return '';
    const countries = [country, 'United States of America', 'United States', countryLabelUS()]
      .map(function (x) { return String(x || '').trim(); })
      .filter(Boolean);
    countries.forEach(function (cName) {
      const suffix = ', ' + cName;
      if (region.length > suffix.length && region.slice(-suffix.length).toLowerCase() === suffix.toLowerCase()) {
        region = region.slice(0, -suffix.length).trim();
      }
    });
    return region;
  }

  /** Display name for a city (localized majors when available). */
  function displayCityName(c) {
    if (!c) return '';
    const L = lang();
    const key = cityKey(c);
    const staticNames = CITY_NAMES[key];
    // Locale-tagged search results can be returned in Simplified Chinese even
    // for zh-TW. Prefer a reviewed static name for known cities before using a
    // previously saved provider translation that may use the wrong script.
    if (L === 'zh-TW' && staticNames) {
      return staticNames['zh-TW'] || staticNames.en || (c.names && c.names.en) || c.name || '';
    }
    if (c.names && c.names[L]) return c.names[L];
    if (c.names && c.names.en && L === 'en') return c.names.en;
    // Static major-city map (instant, offline)
    if (staticNames) {
      const picked = pickLangMap(staticNames, '');
      if (picked) return picked;
    }
    // Geocode cache fallback (search results / sparse fills)
    const cached = nameCache.get(L + ':' + key);
    if (cached) return cached;
    return c.name || '';
  }

  /** Localized admin1 / state label when we have a mapping. */
  function displayAdmin1(c) {
    if (!c) return '';
    const raw = regionWithoutCountry(c.admin1 || '', c.country || '');
    if (!raw) return '';
    const L = lang();
    if (L === 'en') return raw;
    const hit = ADMIN1_NAMES[raw];
    if (hit && hit[L]) return hit[L];
    return raw;
  }

  // lang → "lat,lon" → localized name
  const nameCache = new Map();

  /** Seed nameCache from static CITY_NAMES for all languages (instant, offline). */
  function seedStaticCityNames() {
    MAJOR.forEach(function (c) {
      const key = cityKey(c);
      const sn = CITY_NAMES[key];
      if (!sn) return;
      ['en', 'es', 'zh', 'ja'].forEach(function (L) {
        if (sn[L]) nameCache.set(L + ':' + key, sn[L]);
      });
    });
  }

  function loadNameCacheFromSession() {
    seedStaticCityNames();
    // Optional: keep any search-result names previously cached
    ['es', 'zh', 'ja', 'en'].forEach((L) => {
      try {
        const raw = sessionStorage.getItem('duskline-wx-names-' + L);
        if (!raw) return;
        const obj = JSON.parse(raw);
        Object.keys(obj).forEach((k) => nameCache.set(k, obj[k]));
      } catch (e) {}
    });
  }



  function openSheet(kind, pack) {
    if (!sheetEl || !sheetBody || !pack || !pack.weather) return;
    if (kind === 'hourly' || kind === 'daily') return;
    try {
      openSheetInner(kind, pack);
      if (kind === 'aqi') {
        loadAqiDetail(pack).then(function (updated) {
          if (!updated || !sheetOpen || activeSheetKind !== 'aqi') return;
          if (!openCity || !openCity.city || !sameCity(openCity.city, updated.city)) return;
          const host = document.getElementById('wxAqiExtended');
          if (host) host.innerHTML = aqiExtendedHtml(updated.air);
        });
      }
    } catch (err) {
      try { console.error('[weather] openSheet failed for', kind, err); } catch (e) {}
      try {
        if (sheetBody) {
          sheetBody.innerHTML = '<p class="weather-empty">' +
            escapeHtml(t('weather.error', 'Could not load weather data.')) + '</p>';
        }
        setSheetTitle('<div class="wx-sheet-head" data-sheet-title><h3 class="wx-sheet-title">' +
          escapeHtml(t('weather.about', 'About')) + '</h3></div>');
        presentSheet();
      } catch (e2) { /* ignore */ }
    }
  }

  function openSheetInner(kind, pack) {
    activeSheetKind = kind;
    const cur = pack.weather.current || {};
    const hourly = pack.weather.hourly || {};
    const daily = pack.weather.daily || {};
    const titleMap = {
      humidity: t('weather.humidity', 'Humidity'),
      uv: t('weather.uv', 'UV Index'),
      aqi: t('weather.aqi', 'Air Quality'),
      wind: t('weather.wind', 'Wind'),
      pressure: t('weather.pressure', 'Pressure'),
      vis: t('weather.visibility', 'Visibility'),
      precip: t('weather.precip', 'Precipitation'),
      sun: t('weather.sunrise', 'Sunrise') + ' & ' + t('weather.sunset', 'Sunset'),
      feels: t('weather.feelsLike', 'Feels Like'),
      conditions: t('weather.hourly', 'Hourly Forecast')
    };

    const aboutTitle = t('weather.about', 'About');
    // Title row is rendered into the drag zone (grabber + icon + title) like about hub Preferences
    const sheetTitleHtml = `
      <div class="wx-sheet-head" data-sheet-title>
        <div class="wx-sheet-icon">${modLabelIcon(kind === 'conditions' ? 'conditions' : kind)}</div>
        <h3 class="wx-sheet-title">${escapeHtml(titleMap[kind] || t('weather.about', 'About'))}</h3>
      </div>`;
    let body = '';

    // City-local calendar day for charts (Apple Weather style 00–24)
    const chartTz = (pack.weather && pack.weather.timezone)
      || (pack.city && pack.city.tz)
      || undefined;

    function unitsPickerHtml(id, pairs, current) {
      let html = `<p class="weather-mod-label" id="${id}-label">${escapeHtml(t('weather.units', 'Units'))}</p><div class="weather-units-row" id="${id}" role="radiogroup" aria-labelledby="${id}-label"><span class="wx-units-pill" aria-hidden="true"></span>`;
      pairs.forEach(function (pair) {
        const on = current === pair[0];
        html += `<button type="button" role="radio" aria-checked="${on ? 'true' : 'false'}" tabindex="${on ? '0' : '-1'}" data-u="${pair[0]}" class="${on ? 'active' : ''}">${escapeHtml(pair[1])}</button>`;
      });
      html += '</div>';
      return html;
    }

    // Chart sheets: Apple pattern = title → large live value lives in chart readout → scrub chart → about
    if (kind === 'conditions') {
      // Chart owns the big readout (scrub updates it). Secondary context line above.
      body += `<p class="wx-sheet-context">${escapeHtml(condLabel(cur.weather_code))}</p>`;
      body += chartsApi.buildTempChart(hourly, 'temperature_2m', (v) => fmtTemp(v), chartTz);
      body += `<p class="weather-mod-label" style="margin-top:16px">${escapeHtml(t('weather.feelsLike', 'Feels Like'))}</p>`;
      body += chartsApi.buildTempChart(hourly, 'apparent_temperature', (v) => fmtTemp(v), chartTz);
      body += unitsPickerHtml('wxTempUnitsSheet', [['c', '°C'], ['f', '°F']], useF() ? 'f' : 'c');
    } else if (kind === 'feels') {
      body += `<p class="wx-sheet-context">${escapeHtml(condLabel(cur.weather_code))}</p>`;
      body += chartsApi.buildTempChart(hourly, 'apparent_temperature', (v) => fmtTemp(v), chartTz);
      body += unitsPickerHtml('wxTempUnitsSheet', [['c', '°C'], ['f', '°F']], useF() ? 'f' : 'c');
    } else if (kind === 'humidity') {
      body += chartsApi.buildTempChart(hourly, 'relative_humidity_2m', (v) => Math.round(v) + '%', chartTz);
    } else if (kind === 'wind') {
      // Direction as context; speed is the scrub readout
      body += `<p class="wx-sheet-context">${escapeHtml(degToCompass(cur.wind_direction_10m))}${cur.wind_direction_10m != null ? ' · ' + Math.round(cur.wind_direction_10m) + '°' : ''}</p>`;
      body += chartsApi.buildTempChart(hourly, 'wind_speed_10m', (v) => fmtWind(v), chartTz);
      body += `<div class="wx-sheet-compass-row">${chartsApi.windCompass(cur.wind_direction_10m)}</div>`;
      body += `<p class="weather-mod-label" id="wxWindUnitsLabel">${escapeHtml(t('weather.units', 'Units'))}</p><div class="weather-units-row" id="wxWindUnits" role="radiogroup" aria-labelledby="wxWindUnitsLabel"><span class="wx-units-pill" aria-hidden="true"></span>`;
      [['mph', 'mph'], ['kmh', 'km/h'], ['ms', 'm/s'], ['bft', 'bft'], ['kn', 'kn']].forEach(([u, lab]) => {
        const on = windUnit() === u;
        body += `<button type="button" role="radio" aria-checked="${on ? 'true' : 'false'}" tabindex="${on ? '0' : '-1'}" data-u="${u}" class="${on ? 'active' : ''}">${lab}</button>`;
      });
      body += '</div>';
    } else if (kind === 'pressure') {
      body += chartsApi.buildTempChart(hourly, 'surface_pressure', (v) => fmtPress(v), chartTz);
      body += `<p class="weather-mod-label" id="wxPressUnitsLabel">${escapeHtml(t('weather.units', 'Units'))}</p><div class="weather-units-row" id="wxPressUnits" role="radiogroup" aria-labelledby="wxPressUnitsLabel"><span class="wx-units-pill" aria-hidden="true"></span>`;
      ['hPa', 'mbar', 'inHg', 'mmHg', 'kPa'].forEach((u) => {
        const on = pressUnit() === u;
        body += `<button type="button" role="radio" aria-checked="${on ? 'true' : 'false'}" tabindex="${on ? '0' : '-1'}" data-u="${u}" class="${on ? 'active' : ''}">${u}</button>`;
      });
      body += '</div>';
    } else if (kind === 'uv') {
      const uvIdx = dailyTodayIndex(daily, chartTz);
      const uvNow = uvNowValue(pack, daily, uvIdx, hourly, chartTz);
      const uvMax = dailyFieldAt(daily, 'uv_index_max', uvIdx);
      if (hourly.uv_index) {
        body += chartsApi.buildTempChart(hourly, 'uv_index', (v) => String(Math.round(v * 10) / 10), chartTz);
      } else {
        body += `<div class="wx-sheet-hero"><div class="weather-chart-readout">${uvNow != null ? Math.round(uvNow * 10) / 10 : '—'}</div></div>`;
      }
      body += chartsApi.uvGauge(uvNow);
      if (uvMax != null && uvNow != null && Math.abs(uvMax - uvNow) >= 0.5) {
        body += `<p class="wx-sheet-context">${escapeHtml(t('weather.uvMax', 'Today’s max'))} ${Math.round(uvMax * 10) / 10}</p>`;
      }
    } else if (kind === 'aqi') {
      const aqi = pack.air && pack.air.current && pack.air.current.us_aqi;
      body += `<div class="wx-sheet-hero">
        <div class="weather-chart-readout" style="color:${aqiColor(aqi)}">${aqi != null ? Math.round(aqi) : '—'}</div>
        <div class="weather-chart-sub">${escapeHtml(aqiLabel(aqi) || t('weather.aqi', 'Air Quality'))}${aqi != null ? ' · ' + escapeHtml(aqiRange(aqi)) : ''}</div>
      </div>`;
      body += aqiBarHtml(aqi, false);
      const description = aqiDescription(aqi);
      if (description) body += `<p class="wx-sheet-context wx-sheet-aqi-description">${escapeHtml(description)}</p>`;
      if (pack.air && pack.air.current) {
        const pm = pack.air.current.pm2_5;
        const pm10 = pack.air.current.pm10;
        body += `<div class="wx-sheet-stats">
          <div class="wx-sheet-stat"><span class="wx-sheet-stat-lab">PM2.5</span><span class="wx-sheet-stat-val">${pm != null ? pm.toFixed(1) : '—'} µg/m³</span></div>
          <div class="wx-sheet-stat"><span class="wx-sheet-stat-lab">PM10</span><span class="wx-sheet-stat-val">${pm10 != null ? pm10.toFixed(1) : '—'} µg/m³</span></div>
        </div>`;
      }
      body += `<div id="wxAqiExtended">${aqiExtendedHtml(pack.air)}</div>`;
    } else if (kind === 'precip') {
      if (hourly.precipitation) body += chartsApi.buildTempChart(hourly, 'precipitation', (v) => fmtPrecip(v), chartTz);
      else {
        body += `<div class="wx-sheet-hero"><div class="weather-chart-readout">${escapeHtml(fmtPrecip(cur.precipitation))}</div></div>`;
      }
      body += `<p class="weather-mod-label" id="wxPrecipUnitsLabel">${escapeHtml(t('weather.units', 'Units'))}</p><div class="weather-units-row" id="wxPrecipUnits" role="radiogroup" aria-labelledby="wxPrecipUnitsLabel"><span class="wx-units-pill" aria-hidden="true"></span>`;
      [['in', 'in'], ['mm', 'mm'], ['cm', 'cm']].forEach(([u, lab]) => {
        const on = precipUnit() === u;
        body += `<button type="button" role="radio" aria-checked="${on ? 'true' : 'false'}" tabindex="${on ? '0' : '-1'}" data-u="${u}" class="${on ? 'active' : ''}">${lab}</button>`;
      });
      body += '</div>';
    } else if (kind === 'sun') {
      const sunIdx = dailyTodayIndex(daily, chartTz);
      const sr = dailyFieldAt(daily, 'sunrise', sunIdx);
      const ss = dailyFieldAt(daily, 'sunset', sunIdx);
      body += chartsApi.buildSunDaySheet(sr, ss, chartTz);
    } else if (kind === 'vis') {
      body += `<div class="wx-sheet-hero">
        <div class="weather-chart-readout">${escapeHtml(fmtVis(cur.visibility))}</div>
        <div class="weather-chart-sub">${escapeHtml(t('weather.visibility', 'Visibility'))}</div>
      </div>`;
      body += unitsPickerHtml('wxVisUnits', [['km', 'km'], ['mi', 'mi']], useMi() ? 'mi' : 'km');
    }

    const aboutText = t('weather.about.' + kind, '');
    if (aboutText) {
      const contextText = sheetContextText(kind, pack, chartTz);
      if (contextText) body += `<p class="wx-sheet-context wx-sheet-intelligence">${escapeHtml(contextText)}</p>`;
      const aboutHead = titleMap[kind]
        ? aboutTitle + ' ' + titleMap[kind]
        : aboutTitle;
      body += `<div class="wx-sheet-about">
        <div class="wx-sheet-about-title">${escapeHtml(aboutHead)}</div>
        <p>${escapeHtml(aboutText)}</p>
      </div>`;
    }

    sheetBody.innerHTML = body;
    setSheetTitle(sheetTitleHtml);
    chartsApi.bindCharts(sheetBody);

    const bind = (id, setter) => {
      const row = document.getElementById(id);
      if (!row) return;
      requestAnimationFrame(function () {
        slideUnitsPill(row, row.querySelector('button.active') || row.querySelector('button'));
      });
      row.querySelectorAll('button').forEach((b) => {
        b.addEventListener('click', () => {
          if (b.classList.contains('active')) return;
          row.querySelectorAll('button').forEach((x) => {
            x.classList.toggle('active', x === b);
            x.setAttribute('aria-checked', x === b ? 'true' : 'false');
            x.tabIndex = x === b ? 0 : -1;
          });
          slideUnitsPill(row, b);
          setter(b.getAttribute('data-u'));
          window.clearTimeout(bind._rebuild);
          bind._rebuild = window.setTimeout(function () {
            const pack = openCity && openCity.city
              ? (cache.get(cityKey(openCity.city)) || openCity)
              : openCity;
            if (pack && pack.weather) {
              openDetail(pack);
              openSheet(kind, pack);
            }
          }, 380);
        });
      });
      enableUnitRadioKeys(row);
    };
    bind('wxWindUnits', setWindUnit);
    bind('wxPrecipUnits', setPrecipUnit);
    bind('wxPressUnits', setPressUnit);
    bind('wxTempUnitsSheet', function (u) {
      if (typeof window.setTempUnitPreference === 'function') window.setTempUnitPreference(u);
    });
    bind('wxVisUnits', function (u) {
      if (typeof window.setDistUnitPreference === 'function') window.setDistUnitPreference(u);
    });

    presentSheet();
  }

  function slideUnitsPill(row, btn) {
    if (!row) return;
    let pill = row.querySelector('.wx-units-pill');
    if (!pill) {
      pill = document.createElement('span');
      pill.className = 'wx-units-pill';
      pill.setAttribute('aria-hidden', 'true');
      row.insertBefore(pill, row.firstChild);
    }
    const target = btn || row.querySelector('button.active') || row.querySelector('button');
    if (!target) return;
    const left = target.offsetLeft;
    const width = target.offsetWidth;
    if (!width) return;
    const first = !pill.getAttribute('data-ready');
    if (first) pill.style.transition = 'none';
    pill.style.left = left + 'px';
    pill.style.width = width + 'px';
    if (first) {
      pill.setAttribute('data-ready', '1');
      requestAnimationFrame(function () { pill.style.transition = ''; });
    }
  }

  function enableUnitRadioKeys(row) {
    if (!row) return;
    const buttons = Array.from(row.querySelectorAll('[role="radio"]'));
    buttons.forEach(function (button, index) {
      button.addEventListener('keydown', function (event) {
        const direction = getComputedStyle(row).direction;
        let next = index;
        if (event.key === 'ArrowRight') next = direction === 'rtl' ? index - 1 : index + 1;
        else if (event.key === 'ArrowLeft') next = direction === 'rtl' ? index + 1 : index - 1;
        else if (event.key === 'ArrowDown') next = index + 1;
        else if (event.key === 'ArrowUp') next = index - 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else return;
        event.preventDefault();
        next = (next + buttons.length) % buttons.length;
        buttons[next].focus();
        buttons[next].click();
      });
    });
  }

  /* ── Bottom sheet presentation (iOS-style pop + drag dismiss) ──
     Pattern adapted from the about hub Preferences sheet. */
  const sheetPanel = $('weatherSheetPanel') || (sheetEl && sheetEl.querySelector('.weather-sheet-panel'));
  let sheetY = 0;
  let sheetGen = 0;
  let sheetSpringRaf = 0;
  let sheetOpen = false;
  /* What the sheet is *supposed* to be. `sheetOpen` tracks intent; the `.open` class is
     briefly absent while the enter animation is deferred, so it must never be read as
     "the sheet is closed" — that is what tore a mid-open sheet down. */
  let sheetIntentOpen = false;

  function sheetReduceMotion() {
    return motionLevel() === 'off' || motionLevel() === 'reduced'
      || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function sheetCentered() {
    try {
      return !!(window.matchMedia && window.matchMedia('(min-width: 720px)').matches);
    } catch (e) { return false; }
  }

  function sheetHiddenTransform() {
    /* Mobile drag-to-dismiss still uses a Y translate. Desktop open/close is CSS. */
    return 'translate3d(0, 100%, 0)';
  }

  function sheetHeight() {
    return (sheetPanel && sheetPanel.getBoundingClientRect().height) || 420;
  }

  function cancelSheetSpring() {
    if (sheetSpringRaf) {
      window.cancelAnimationFrame(sheetSpringRaf);
      sheetSpringRaf = 0;
    }
  }

  function applySheetY(y) {
    if (!sheetPanel) return;
    if (Math.abs(y) < 0.15) y = 0;
    sheetY = y;
    if (y === 0) sheetPanel.style.transform = '';
    else sheetPanel.style.transform = 'translate3d(0,' + y + 'px,0)';
  }

  function resetSheetInline() {
    cancelSheetSpring();
    sheetY = 0;
    if (!sheetPanel) return;
    sheetPanel.style.transform = '';
    sheetPanel.style.transition = '';
    sheetPanel.classList.remove('is-dragging');
    if (sheetEl) sheetEl.style.opacity = '';
  }

  /** Instantly inert sheet — no animation. Use when opening detail or recovering stuck UI. */
  function setDetailBehindSheet(behind) {
    if (!detailEl) return;
    try { detailEl.inert = !!behind; } catch (e) { /* older browsers */ }
    if (behind) detailEl.style.pointerEvents = 'none';
    else detailEl.style.pointerEvents = '';
  }

  function inertSheet() {
    sheetIntentOpen = false;
    if (!sheetEl) return;
    sheetEl.classList.remove('open', 'is-raised', 'is-leaving');
    sheetEl.setAttribute('aria-hidden', 'true');
    sheetEl.style.pointerEvents = 'none';
    sheetEl.style.opacity = '';
    try { sheetEl.inert = true; } catch (e) { /* older browsers */ }
    setDetailBehindSheet(false);
    try { document.documentElement.classList.remove('wx-sheet-open'); } catch (eCls) { /* ignore */ }
    resetSheetInline();
  }

  function forceCloseSheet() {
    sheetGen += 1;
    sheetOpen = false;
    inertSheet();
  }

  function isSheetOpen() {
    return !!(sheetEl && (sheetOpen || sheetEl.classList.contains('open')));
  }

  function setSheetTitle(html) {
    if (!sheetPanel) return;
    const dragZone = sheetPanel.querySelector('[data-sheet-grab]');
    if (!dragZone) return;
    let titleHost = dragZone.querySelector('[data-sheet-title-host]');
    if (!titleHost) {
      titleHost = document.createElement('div');
      titleHost.setAttribute('data-sheet-title-host', '');
      titleHost.className = 'wx-sheet-title-host';
      dragZone.appendChild(titleHost);
    }
    titleHost.innerHTML = html || '';
  }

  function presentSheet() {
    if (!sheetEl || !sheetPanel) return;
    closeSuggest();
    hoistOverlays();
    const alreadyOpen = sheetEl.classList.contains('open') && !sheetEl.classList.contains('is-leaving');
    sheetGen += 1;
    const gen = sheetGen;
    sheetOpen = true;
    sheetIntentOpen = true;
    try { sheetEl.inert = false; } catch (e) { /* older browsers */ }
    sheetEl.setAttribute('aria-hidden', 'false');
    sheetEl.style.pointerEvents = 'auto';
    setDetailBehindSheet(true);
    try { document.documentElement.classList.add('wx-sheet-open'); } catch (eOpen) { /* ignore */ }
    sheetEl.classList.toggle('wx-sheet-light', !!(detailEl && detailEl.classList.contains('wx-mods-light')));
    sheetEl.classList.toggle('wx-sheet-centered', sheetCentered());
    try {
      sheetEl.style.removeProperty('--wx-sheet-backdrop');
      sheetEl.style.opacity = '';
      sheetEl.style.visibility = '';
      sheetEl.style.background = '';
    } catch (eBg) { /* ignore */ }
    try {
      if (sheetBody) sheetBody.scrollTop = 0;
    } catch (eScr) { /* ignore */ }
    if (alreadyOpen) {
      sheetEl.classList.add('open', 'is-raised');
      sheetEl.classList.remove('is-leaving');
      try {
        const title = sheetPanel.querySelector('.wx-sheet-title');
        if (title) {
          title.setAttribute('id', 'weatherSheetTitle');
          sheetPanel.setAttribute('aria-labelledby', 'weatherSheetTitle');
        }
        if (sheetClose) sheetClose.focus({ preventScroll: true });
      } catch (eFocus) { /* ignore */ }
      return;
    }
    resetSheetInline();
    sheetEl.classList.remove('open', 'is-raised', 'is-leaving');
    const reduce = sheetReduceMotion();
    if (reduce) {
      sheetEl.classList.add('open', 'is-raised');
      try {
        const titleR = sheetPanel.querySelector('.wx-sheet-title');
        if (titleR) {
          titleR.setAttribute('id', 'weatherSheetTitle');
          sheetPanel.setAttribute('aria-labelledby', 'weatherSheetTitle');
        }
        if (sheetClose) sheetClose.focus({ preventScroll: true });
      } catch (eRed) { /* ignore */ }
      return;
    }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (gen !== sheetGen) return;
        // A reset may have been requested while these frames were pending. Land on a fully
        // inert sheet instead of applying `.open` on top of it — half-applied state is what
        // produced an on-screen sheet that ignored taps.
        if (!sheetIntentOpen) { inertSheet(); return; }
        sheetEl.classList.add('open', 'is-raised');
        try {
          const title = sheetPanel.querySelector('.wx-sheet-title');
          if (title) {
            title.setAttribute('id', 'weatherSheetTitle');
            sheetPanel.setAttribute('aria-labelledby', 'weatherSheetTitle');
          }
          if (sheetClose) sheetClose.focus({ preventScroll: true });
        } catch (eFocus2) { /* ignore */ }
      });
    });
  }

  function closeSheet() {
    if (!sheetEl || !sheetPanel) return;
    if (!isSheetOpen()) {
      inertSheet();
      sheetOpen = false;
      return;
    }
    sheetGen += 1;
    const gen = sheetGen;
    sheetOpen = false;
    sheetIntentOpen = false;
    sheetPanel.classList.remove('is-dragging');
    const reduce = sheetReduceMotion();
    const centered = sheetCentered();
    const closeMs = reduce ? 0 : (centered ? 320 : 380);

    sheetEl.classList.add('open', 'is-leaving');
    sheetEl.classList.remove('is-raised');
    sheetEl.style.pointerEvents = 'none';
    if (reduce) {
      inertSheet();
      return;
    }
    window.setTimeout(function () {
      if (gen !== sheetGen) return;
      inertSheet();
    }, closeMs);
  }

  function finishDragClose() {
    forceCloseSheet();
  }

  function initSheetDrag() {
    if (!sheetEl || !sheetPanel) return;
    const grab = sheetPanel.querySelector('[data-sheet-grab]');
    if (!grab) return;

    const drag = { active: false, fingerStart: 0, yAtGrab: 0, samples: [] };

    function clientY(e) {
      if (e.touches && e.touches[0]) return e.touches[0].clientY;
      if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientY;
      return e.clientY;
    }
    function rubberband(overshoot, dimension, constant) {
      const c = constant == null ? 0.55 : constant;
      const d = Math.max(1, dimension);
      return (overshoot * d * c) / (d + c * Math.abs(overshoot));
    }
    function mapDragY(desired, reduce) {
      if (desired >= 0) return desired;
      if (reduce) return 0;
      const h = sheetHeight();
      return -rubberband(-desired, Math.max(120, h * 0.45), 0.55);
    }
    function recordSample(y) {
      const t = performance.now();
      drag.samples.push({ t: t, y: y });
      if (drag.samples.length > 6) drag.samples.shift();
    }
    function sampleVelocity() {
      if (drag.samples.length < 2) return 0;
      const a = drag.samples[0];
      const b = drag.samples[drag.samples.length - 1];
      const dt = b.t - a.t;
      if (dt < 8) return 0;
      return (b.y - a.y) / dt;
    }
    function updateBackdropForY(y) {
      if (!sheetEl) return;
      if (y <= 0) {
        sheetEl.style.opacity = '';
        return;
      }
      /* keep sheet chrome visible; dim backdrop via CSS variable */
      const o = Math.max(0.2, 1 - y / 320);
      sheetEl.style.setProperty('--wx-sheet-backdrop', String(o));
    }
    function springSheetTo(target, velocityPxMs, opts) {
      opts = opts || {};
      cancelSheetSpring();
      sheetPanel.style.transition = 'none';
      sheetPanel.classList.remove('is-dragging');
      const reduce = sheetReduceMotion();
      const gen = sheetGen;
      let pos = sheetY;
      let vel = velocityPxMs || 0;
      let lastT = performance.now();
      const response = reduce ? 0.22 : (opts.response != null ? opts.response : 0.32);
      const dampingRatio = reduce ? 1 : (opts.dampingRatio != null ? opts.dampingRatio : 0.86);
      const omega = (2 * Math.PI) / Math.max(0.12, response);
      const maxMs = opts.maxMs || 900;
      const startT = lastT;
      if (reduce) {
        applySheetY(target);
        updateBackdropForY(target);
        return;
      }
      function frame(now) {
        if (gen !== sheetGen) { sheetSpringRaf = 0; return; }
        const dt = Math.min(0.032, Math.max(0.001, (now - lastT) / 1000));
        lastT = now;
        const x = pos - target;
        const accel = -omega * omega * x - 2 * dampingRatio * omega * vel;
        vel += accel * dt;
        pos += vel * dt;
        applySheetY(pos);
        updateBackdropForY(pos);
        if (Math.abs(pos - target) < 0.4 && Math.abs(vel) < 0.05) {
          sheetSpringRaf = 0;
          applySheetY(target);
          updateBackdropForY(target);
          sheetPanel.style.transition = '';
          sheetEl.style.removeProperty('--wx-sheet-backdrop');
          return;
        }
        if (now - startT > maxMs) {
          sheetSpringRaf = 0;
          applySheetY(target);
          updateBackdropForY(target);
          sheetPanel.style.transition = '';
          return;
        }
        sheetSpringRaf = window.requestAnimationFrame(frame);
      }
      sheetSpringRaf = window.requestAnimationFrame(frame);
    }

    function onDragStart(e) {
      if (!sheetOpen || !sheetEl.classList.contains('open')) return;
      if (sheetCentered()) return;
      cancelSheetSpring();
      sheetPanel.style.transition = 'none';
      sheetPanel.classList.add('is-dragging');
      drag.active = true;
      drag.fingerStart = clientY(e);
      drag.yAtGrab = sheetY;
      drag.samples = [];
      recordSample(sheetY);
      if (e.pointerId != null && grab.setPointerCapture) {
        try { grab.setPointerCapture(e.pointerId); } catch (_) {}
      }
      if (e.cancelable) e.preventDefault();
    }
    function onDragMove(e) {
      if (!drag.active) return;
      const reduce = sheetReduceMotion();
      const raw = clientY(e) - drag.fingerStart;
      const y = mapDragY(drag.yAtGrab + raw, reduce);
      applySheetY(y);
      recordSample(y);
      updateBackdropForY(y);
      if (e.cancelable) e.preventDefault();
    }
    function onDragEnd() {
      if (!drag.active) return;
      drag.active = false;
      sheetPanel.classList.remove('is-dragging');
      const y = sheetY;
      const v = sampleVelocity();
      const h = sheetHeight();
      const reduce = sheetReduceMotion();
      const vPxS = v * 1000;
      const projected = y + (vPxS / 1000) * (0.998 / (1 - 0.998));
      const shouldClose =
        y > Math.min(120, h * 0.28)
        || (y > 40 && v > 0.45)
        || projected > Math.min(160, h * 0.38);

      if (shouldClose && y > 8) {
        cancelSheetSpring();
        sheetPanel.classList.remove('is-dragging');
        sheetPanel.style.transition = 'none';
        const gen = sheetGen;
        let pos = y;
        let vel = Math.max(v, reduce ? 1.2 : 0.55);
        let lastT = performance.now();
        const startT = lastT;
        function dismissFrame(now) {
          if (gen !== sheetGen) { sheetSpringRaf = 0; return; }
          const dt = Math.min(32, Math.max(1, now - lastT));
          lastT = now;
          if (!reduce) vel += 0.0028 * dt;
          pos += vel * dt;
          applySheetY(pos);
          updateBackdropForY(pos);
          if (pos >= h || now - startT > 700) {
            sheetSpringRaf = 0;
            finishDragClose();
            return;
          }
          sheetSpringRaf = window.requestAnimationFrame(dismissFrame);
        }
        sheetSpringRaf = window.requestAnimationFrame(dismissFrame);
      } else {
        const hasMomentum = Math.abs(v) > 0.12 || y < -6;
        springSheetTo(0, v, {
          dampingRatio: reduce ? 1 : hasMomentum ? 0.78 : 0.9,
          response: reduce ? 0.2 : hasMomentum ? 0.28 : 0.34,
          maxMs: 900
        });
      }
      drag.samples = [];
    }

    if (window.PointerEvent) {
      grab.addEventListener('pointerdown', onDragStart);
      grab.addEventListener('pointermove', onDragMove);
      grab.addEventListener('pointerup', onDragEnd);
      grab.addEventListener('pointercancel', onDragEnd);
    } else {
      grab.addEventListener('touchstart', onDragStart, { passive: false });
      grab.addEventListener('touchmove', onDragMove, { passive: false });
      grab.addEventListener('touchend', onDragEnd);
      grab.addEventListener('touchcancel', onDragEnd);
    }
  }
  initSheetDrag();
  function unlockDetailPage() {
    try {
      document.body.classList.remove('weather-detail-open');
      document.documentElement.classList.remove('weather-detail-open');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    } catch (e) {}
  }

  /**
   * Ensure list is tappable: clear stuck body lock + ghost detail/sheet PE.
   * Call when list is shown and detail is not open (boot, after close, list paint).
   * IMPORTANT: never clobber mid-open — openDetail sets openCity before .open lands
   * (enter uses double rAF). Racing list paints used to leave .open + aria-hidden=true + inert.
   */
  function ensureListTappable() {
    // Detail open, opening, or closing — leave it alone
    if (isDetailVisible()) return;
    if (openCity && detailEl && !detailEl.classList.contains('is-closing')) return;
    if (detailEl && detailEl.classList.contains('is-closing')) return;

    // Stuck body lock without a visible detail = list dead to taps
    if (document.body.classList.contains('weather-detail-open')) {
      unlockDetailPage();
    }
    try {
      if (detailEl) {
        detailEl.classList.remove('open', 'wx-detail-enter');
        detailEl.setAttribute('aria-hidden', 'true');
        detailEl.style.pointerEvents = 'none';
        try { detailEl.inert = true; } catch (eInert) { /* older browsers */ }
      }
    } catch (e) { /* ignore */ }
    unlockDetailPage();
    if (!isSheetOpen()) {
      try { inertSheet(); } catch (e2) { /* ignore */ }
    }
  }

  /** Apply interactive a11y state for an open detail (idempotent). */
  function markDetailInteractive() {
    if (!detailEl) return;
    try { detailEl.hidden = false; } catch (eHid) { /* ignore */ }
    try { detailEl.inert = false; } catch (eInert) { /* older browsers */ }
    detailEl.setAttribute('aria-hidden', 'false');
    detailEl.style.pointerEvents = '';
  }

  function finishDetailClose() {
    if (!detailEl) return;
    detailEl.classList.remove('open', 'wx-detail-enter', 'is-closing');
    detailEl.setAttribute('aria-hidden', 'true');
    detailEl.style.transform = 'none';
    detailEl.style.animation = '';
    detailEl.style.opacity = '';
    detailEl.style.transition = '';
    detailEl.style.pointerEvents = 'none';
    try { detailEl.inert = true; } catch (eInert) { /* older browsers */ }
    try { detailEl.hidden = true; } catch (eHid) { /* ignore */ }
    unlockDetailPage();
    openCity = null;
    forceCloseSheet();
    ensureListTappable();
  }

  function closeDetail() {
    if (!detailEl) return;
    const motionGen = cancelDetailMotion();
    const isOpen = detailEl.classList.contains('open') || detailEl.classList.contains('is-closing');

    detailEl.classList.remove('wx-detail-enter');
    detailEl.style.animation = '';
    detailEl.style.transform = 'none';
    detailEl.setAttribute('aria-hidden', 'true');
    openCity = null;
    forceCloseSheet();

    // Restore city list immediately — no solid-sky void under the fade.
    unlockDetailPage();

    if (!isOpen) {
      finishDetailClose();
      return;
    }

    detailEl.classList.add('is-closing');
    detailEl.classList.remove('open');

    const done = function () {
      if (motionGen !== detailMotionGen) return;
      if (detailCloseListener) {
        try { detailEl.removeEventListener('transitionend', detailCloseListener); } catch (e) {}
        detailCloseListener = null;
      }
      if (detailMotionTimer) {
        window.clearTimeout(detailMotionTimer);
        detailMotionTimer = 0;
      }
      finishDetailClose();
    };

    detailCloseListener = function (e) {
      if (e.target !== detailEl) return;
      if (e.propertyName && e.propertyName !== 'opacity') return;
      done();
    };
    detailEl.addEventListener('transitionend', detailCloseListener);
    detailMotionTimer = window.setTimeout(done, 220);
  }
  window.closeWeatherDetail = closeDetail;

  let suggestIndex = -1;
  function closeSuggest() {
    if (!suggestEl || !searchEl) return;
    suggestEl.classList.remove('open');
    suggestEl.hidden = true;
    suggestEl.innerHTML = '';
    searchEl.setAttribute('aria-expanded', 'false');
    searchEl.removeAttribute('aria-activedescendant');
    suggestIndex = -1;
  }
  function suggestOptions() {
    return suggestEl ? Array.prototype.slice.call(suggestEl.querySelectorAll('button[role="option"]')) : [];
  }
  function highlightSuggest(next) {
    const opts = suggestOptions();
    if (!opts.length) return;
    suggestIndex = (next + opts.length) % opts.length;
    opts.forEach(function (btn, i) {
      const on = i === suggestIndex;
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.classList.toggle('is-active', on);
      if (on) {
        if (!btn.id) btn.id = 'wx-suggest-' + i;
        searchEl.setAttribute('aria-activedescendant', btn.id);
        try { btn.scrollIntoView({ block: 'nearest' }); } catch (e) {}
      }
    });
  }
  function openSuggest() {
    if (!suggestEl || !searchEl) return;
    suggestEl.hidden = false;
    suggestEl.classList.add('open');
    searchEl.setAttribute('aria-expanded', 'true');
  }

  async function searchSuggest(q) {
    if (!suggestEl) return;
    if (!q || q.length < 2) {
      searchGen += 1;
      closeSuggest();
      return;
    }
    const gen = ++searchGen;
    try {
      const langParam = geocodeLangParam();
      const data = await dataApi.fetchJson(`${GEOCODE}?name=${encodeURIComponent(q)}&count=8&language=${encodeURIComponent(langParam)}&format=json`);
      if (gen !== searchGen) return;
      const results = data.results || [];
      suggestEl.innerHTML = '';
      if (!results.length) {
        suggestEl.innerHTML = `<li role="presentation"><div role="option" aria-disabled="true" class="s-empty">${escapeHtml(t('weather.emptySearch', 'No cities found.'))}</div></li>`;
        openSuggest();
        return;
      }
      results.forEach((r) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('role', 'option');
        btn.setAttribute('aria-selected', 'false');
        btn.id = 'wx-suggest-' + suggestEl.children.length;
        const admin = [r.admin1, r.country].filter(Boolean).join(', ');
        btn.innerHTML = `<div class="s-name">${escapeHtml(r.name)}</div><div class="s-meta">${escapeHtml(admin)}</div>`;
        btn.addEventListener('click', async () => {
          const L = lang();
          const city = {
            name: r.name,
            names: {},
            admin1: r.admin1 || r.country || '',
            lat: r.latitude,
            lon: r.longitude,
            tz: r.timezone,
            country: r.country || '',
            country_code: r.country_code || ''
          };
          city.names[L] = r.name;
          city.names.en = r.name;
          try { nameCache.set(L + ':' + cityKey(city), r.name); } catch (e2) {}
          const chooseAsMySkyPlace = selectingGreetingPlace;
          selectingGreetingPlace = false;
          if (chooseAsMySkyPlace) {
            saveGreetingCity(city);
            saveGreetingSource('city:' + cityKey(city));
            setWeatherMode('my-sky', true);
          }
          closeSuggest();
          if (searchEl) searchEl.value = r.name;
          if (searchClear) {
            searchClear.hidden = false;
            searchClear.classList.add('show');
          }
          try {
            const pack = await dataApi.loadCity(city);
            if (chooseAsMySkyPlace && pack && pack.weather) {
              cache.set(cityKey(city), pack);
              refreshListsFromCache();
            }
            openDetail(pack);
          } catch (e) {
            showError(t('weather.error', 'Could not load weather data.'));
          }
        });
        li.appendChild(btn);
        suggestEl.appendChild(li);
      });
      openSuggest();
    } catch (e) {
      if (gen !== searchGen) return;
      suggestEl.innerHTML = `<li role="presentation"><div role="option" aria-disabled="true" class="s-empty">${escapeHtml(t('weather.error', 'Could not load weather data.'))}</div></li>`;
      openSuggest();
    }
  }

  function openUnitsSheet() {
    if (!sheetEl || !sheetBody) return;
    closeSuggest();
    hoistOverlays();
    setSheetTitle(`
      <div class="wx-sheet-head" data-sheet-title>
        <div class="wx-sheet-icon">${modLabelIcon('conditions')}</div>
        <h3 class="wx-sheet-title">${escapeHtml(t('weather.units', 'Units'))}</h3>
      </div>`);
    const tempPref = (typeof window.getTempUnitPreference === 'function')
      ? window.getTempUnitPreference()
      : 'auto';
    const distPref = (typeof window.getDistUnitPreference === 'function')
      ? window.getDistUnitPreference()
      : 'auto';
    const autoLab = t('settings.auto', 'Auto');
    const tempLab = t('settings.temperature', 'Temperature');
    const distLab = t('settings.distance', 'Distance');
    const miLab = t('settings.miles', 'Miles');
    const kmLab = t('settings.km', 'Kilometers');
    const resolvedHint =
      (useF() ? '°F' : '°C') + ' · ' + (useMi() ? 'mi' : 'km');

    sheetBody.innerHTML =
      `<p class="weather-mod-label">${escapeHtml(tempLab)}</p>` +
      `<div class="weather-units-row" id="wxTempUnits"></div>` +
      `<p class="weather-mod-label">${escapeHtml(distLab)}</p>` +
      `<div class="weather-units-row" id="wxDistUnits"></div>` +
      `<p class="wx-sheet-context" id="wxUnitsResolvedHint">${escapeHtml(
        t('weather.usingUnits', 'Using {hint}').replace('{hint}', resolvedHint)
      )}</p>` +
      `<p class="weather-mod-label">${escapeHtml(t('weather.wind', 'Wind'))}</p>` +
      `<div class="weather-units-row" id="wxWindUnits2"></div>` +
      `<p class="weather-mod-label">${escapeHtml(t('weather.precip', 'Precipitation'))}</p>` +
      `<div class="weather-units-row" id="wxPrecipUnits2"></div>` +
      `<p class="weather-mod-label">${escapeHtml(t('weather.pressure', 'Pressure'))}</p>` +
      `<div class="weather-units-row" id="wxPressUnits2"></div>`;

    const updateResolvedHint = function () {
      const el = document.getElementById('wxUnitsResolvedHint');
      if (!el) return;
      const tip = (useF() ? '°F' : '°C') + ' · ' + (useMi() ? 'mi' : 'km');
      el.textContent = t('weather.usingUnits', 'Using {hint}').replace('{hint}', tip);
    };

    const fill = function (id, units, current, onPick) {
      const row = document.getElementById(id);
      if (!row) return;
      row.setAttribute('role', 'radiogroup');
      const heading = row.previousElementSibling;
      if (heading) {
        if (!heading.id) heading.id = id + 'Label';
        row.setAttribute('aria-labelledby', heading.id);
      }
      const pill = document.createElement('span');
      pill.className = 'wx-units-pill';
      pill.setAttribute('aria-hidden', 'true');
      row.appendChild(pill);
      const selected = units.some(function (pair) { return pair[0] === current; }) ? current : units[0][0];
      units.forEach(function (pair) {
        const u = pair[0];
        const lab = pair[1];
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = lab;
        b.setAttribute('data-unit', u);
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', selected === u ? 'true' : 'false');
        b.tabIndex = selected === u ? 0 : -1;
        if (selected === u) b.classList.add('active');
        b.addEventListener('click', function () {
          if (b.classList.contains('active')) return;
          onPick(u);
          row.querySelectorAll('button').forEach(function (x) {
            x.classList.toggle('active', x === b);
            x.setAttribute('aria-checked', x === b ? 'true' : 'false');
            x.tabIndex = x === b ? 0 : -1;
          });
          slideUnitsPill(row, b);
        });
        row.appendChild(b);
      });
      enableUnitRadioKeys(row);
      requestAnimationFrame(function () {
        slideUnitsPill(row, row.querySelector('button.active') || row.querySelector('button'));
      });
    };

    // Temp / distance share Settings prefs (same localStorage + live repaint)
    fill('wxTempUnits', [
      ['auto', autoLab],
      ['f', '°F'],
      ['c', '°C']
    ], tempPref, function (u) {
      if (typeof window.setTempUnitPreference === 'function') {
        window.setTempUnitPreference(u);
      }
      updateResolvedHint();
      // Keep sheet open; runtime already force-refreshes weather numbers
    });
    fill('wxDistUnits', [
      ['auto', autoLab],
      ['mi', miLab],
      ['km', kmLab]
    ], distPref, function (u) {
      if (typeof window.setDistUnitPreference === 'function') {
        window.setDistUnitPreference(u);
      }
      updateResolvedHint();
    });

    fill('wxWindUnits2', [
      ['mph', 'mph'], ['kmh', 'km/h'], ['ms', 'm/s'], ['bft', 'bft'], ['kn', 'kn']
    ], windUnit(), function (u) {
      setWindUnit(u);
      refreshListsFromCache();
      if (openCity && openCity.weather && openCity.city) {
        const fresh = cache.get(cityKey(openCity.city)) || openCity;
        openDetail(fresh);
      }
    });
    fill('wxPrecipUnits2', [
      ['in', 'in'], ['mm', 'mm'], ['cm', 'cm']
    ], precipUnit(), function (u) {
      setPrecipUnit(u);
      refreshListsFromCache();
      if (openCity && openCity.weather && openCity.city) {
        const fresh = cache.get(cityKey(openCity.city)) || openCity;
        openDetail(fresh);
      }
    });
    fill('wxPressUnits2', [
      ['hPa', 'hPa'], ['mbar', 'mbar'], ['inHg', 'inHg'], ['mmHg', 'mmHg'], ['kPa', 'kPa']
    ], pressUnit(), function (u) {
      setPressUnit(u);
      refreshListsFromCache();
      if (openCity && openCity.weather && openCity.city) {
        const fresh = cache.get(cityKey(openCity.city)) || openCity;
        openDetail(fresh);
      }
    });
    presentSheet();
  }

  function openGreetingLocationSheet() {
    if (!sheetEl || !sheetBody || weatherMode !== 'my-sky') return;
    closeSuggest();
    hoistOverlays();
    const title = t('weather.greetingLocationTitle', 'Greeting location');
    setSheetTitle(`
      <div class="wx-sheet-head" data-sheet-title>
        <div class="wx-sheet-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></div>
        <h3 class="wx-sheet-title">${escapeHtml(title)}</h3>
      </div>`);

    const options = greetingSourceOptions();
    const selectedId = getGreetingSourceId();
    sheetBody.innerHTML = `<p class="wx-sheet-context">${escapeHtml(t('weather.greetingLocationHelp', 'Choose which place informs your My Sky greeting.'))}</p>`;
    if (!options.length) {
      const empty = document.createElement('p');
      empty.className = 'weather-greeting-source-empty';
      empty.textContent = t('weather.greetingLocationEmpty', 'Choose a city or use your location to personalize the greeting.');
      sheetBody.appendChild(empty);
      const choose = document.createElement('button');
      choose.type = 'button';
      choose.className = 'weather-detail-btn';
      choose.textContent = t('weather.chooseMySkyPlace', 'Choose a city for My Sky');
      choose.addEventListener('click', function () {
        closeSheet();
        startGreetingPlaceSelection();
      });
      sheetBody.appendChild(choose);
      presentSheet();
      return;
    }

    const group = document.createElement('div');
    group.className = 'weather-greeting-source-list';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', title);
    options.forEach(function (option) {
      const city = option.city;
      const active = option.id === selectedId;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'weather-greeting-source' + (active ? ' active' : '');
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', active ? 'true' : 'false');
      button.tabIndex = active ? 0 : -1;
      const name = displayCityName(city);
      const qualifier = option.kind === 'location'
        ? t('weather.myLocation', 'My location')
        : option.kind === 'chosen'
          ? t('weather.selectedPlace', 'Chosen place')
          : [city.admin1, city.country].filter(Boolean).join(', ') || t('weather.favorites', 'Favorites');
      button.setAttribute('aria-label', name + ', ' + qualifier);
      const titleEl = document.createElement('span');
      titleEl.className = 'weather-greeting-source-name';
      titleEl.textContent = name;
      const metaEl = document.createElement('span');
      metaEl.className = 'weather-greeting-source-meta';
      metaEl.textContent = qualifier;
      const copy = document.createElement('span');
      copy.className = 'weather-greeting-source-copy';
      copy.append(titleEl, metaEl);
      const check = document.createElement('span');
      check.className = 'weather-greeting-source-check';
      check.setAttribute('aria-hidden', 'true');
      check.textContent = active ? '✓' : '';
      button.append(copy, check);
      button.addEventListener('click', function () {
        if (!saveGreetingSource(option.id)) return;
        group.querySelectorAll('[role="radio"]').forEach(function (radio) {
          const checked = radio === button;
          radio.setAttribute('aria-checked', checked ? 'true' : 'false');
          radio.tabIndex = checked ? 0 : -1;
          radio.classList.toggle('active', checked);
          const mark = radio.querySelector('.weather-greeting-source-check');
          if (mark) mark.textContent = checked ? '✓' : '';
        });
        updateGreeting();
        closeSheet();
      });
      button.addEventListener('keydown', function (event) {
        const radios = Array.from(group.querySelectorAll('[role="radio"]'));
        const index = radios.indexOf(button);
        if (!radios.length || index < 0) return;
        let next = index;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % radios.length;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + radios.length) % radios.length;
        else return;
        event.preventDefault();
        radios[next].focus();
        radios[next].click();
      });
      group.appendChild(button);
    });
    sheetBody.appendChild(group);
    const searchCity = document.createElement('button');
    searchCity.type = 'button';
    searchCity.className = 'weather-greeting-source-search';
    searchCity.textContent = t('weather.chooseMySkyPlace', 'Choose a city for My Sky');
    searchCity.addEventListener('click', function () {
      closeSheet();
      startGreetingPlaceSelection();
    });
    sheetBody.appendChild(searchCity);
    presentSheet();
  }

  // Wire UI — manual refresh always works (re-click cancels prior load via refreshGen)
  if (refreshBtn) {
    refreshBtn.disabled = false;
    refreshBtn.addEventListener('click', function () {
      refresh(true, { quiet: false, reason: 'manual' });
    });
  }
  if (detailRefresh) {
    detailRefresh.disabled = false;
    detailRefresh.addEventListener('click', function () {
      // Always force NWS + Open-Meteo re-fetch. Quiet keeps detail open without
      // blanking the list under the overlay; re-click cancels prior load.
      refresh(true, { quiet: true, reason: 'manual-detail' });
    });
  }
  if (detailBack) detailBack.addEventListener('click', closeDetail);

  // Delegated module taps — stable across openDetail re-renders and node hoist
  if (detailMods && !detailMods._wxSheetBound) {
    detailMods._wxSheetBound = true;
    let sheetPtr = null;
    detailMods.addEventListener('pointerdown', function (e) {
      sheetPtr = { x: e.clientX, y: e.clientY };
    });
    detailMods.addEventListener('click', function (e) {
      const btn = e.target && e.target.closest ? e.target.closest('[data-sheet]') : null;
      if (!btn || !detailMods.contains(btn)) return;
      const kind = btn.getAttribute('data-sheet');
      if (!kind || !openCity) return;
      if (sheetPtr && e.target.closest && e.target.closest('.weather-hourly')) {
        if (Math.abs(e.clientX - sheetPtr.x) > 12 || Math.abs(e.clientY - sheetPtr.y) > 12) return;
      }
      e.preventDefault();
      openSheet(kind, openCity);
    });
  }

  // Sheet must never intercept when closed (init safety)
  hoistOverlays();
  forceCloseSheet();
  if (detailFavBtn) {
    detailFavBtn.addEventListener('click', () => {
      if (!openCity || !openCity.city) return;
      toggleFavorite(openCity.city);
      syncDetailFav(openCity.city);
      refreshListsFromCache();
    });
  }
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);
  if (sheetEl) sheetEl.addEventListener('click', (e) => { if (e.target === sheetEl) closeSheet(); });
  if (unitsBtn) unitsBtn.addEventListener('click', openUnitsSheet);
  modeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setWeatherMode(button.getAttribute('data-weather-mode'), true);
    });
  });
  function focusCitySearch() {
    if (!searchEl) return;
    try { searchEl.scrollIntoView({ behavior: motionFull() ? 'smooth' : 'auto', block: 'center' }); } catch (e) {}
    try { searchEl.focus({ preventScroll: true }); } catch (e2) { searchEl.focus(); }
  }
  function startGreetingPlaceSelection() {
    selectingGreetingPlace = true;
    setWeatherMode('my-sky', true);
    focusCitySearch();
  }
  if (greetingPlaceBtn) greetingPlaceBtn.addEventListener('click', function () {
    if (greetingSourceOptions().length) openGreetingLocationSheet();
    else startGreetingPlaceSelection();
  });
  if (mySkySearchBtn) mySkySearchBtn.addEventListener('click', startGreetingPlaceSelection);
  if (mySkyLocateBtn && locateBtn) mySkyLocateBtn.addEventListener('click', function () { locateBtn.click(); });

  if (locateBtn) {
    locateBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showError(t('weather.geoUnsupported', 'This browser does not support location.'));
        return;
      }
      locateBtn.disabled = true;
      locateBtn.setAttribute('aria-busy', 'true');
      const prevTitle = locateBtn.getAttribute('title') || '';
      locateBtn.setAttribute('title', t('weather.locating', 'Getting location…'));
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          // Round to ~1 km (2 decimal degrees ≈ 1.1 km) — enough for weather grids; better privacy
          const lat = Math.round(pos.coords.latitude * 100) / 100;
          const lon = Math.round(pos.coords.longitude * 100) / 100;
          const place = await reverseGeocode(lat, lon);
          const city = {
            name: place.name,
            admin1: place.admin1 || '',
            lat, lon,
            tz: undefined,
            country: place.country || '',
            country_code: place.country_code || '',
            isMyLocation: true,
            locatedAt: Date.now()
          };
          // Always refresh locatedAt — user asked for a new fix
          saveMyLocation(city, { refreshLocatedAt: true });
          // A successful opt-in should visibly land in the personal forecast, even
          // when the user had previously chosen Horizon explicitly.
          setWeatherMode('my-sky', true);
          const locatedPack = await dataApi.loadCity(city);
          if (locatedPack && locatedPack.weather) cache.set(cityKey(city), locatedPack);
          refreshListsFromCache();
          // Card only — do not open detail
          if (myLocBlock) {
            try { myLocBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
          }
        } catch (e) {
          showError(t('weather.error', 'Could not load weather data.'));
        } finally {
          locateBtn.disabled = false;
          locateBtn.removeAttribute('aria-busy');
          locateBtn.setAttribute('title', prevTitle || t('weather.useLocation', 'Use my location'));
        }
      }, (err) => {
        locateBtn.disabled = false;
        locateBtn.removeAttribute('aria-busy');
        locateBtn.setAttribute('title', prevTitle || t('weather.useLocation', 'Use my location'));
        const code = err && err.code;
        const msg = code === 1
          ? t('weather.geoDenied', 'Location permission was denied.')
          : code === 3
            ? t('weather.geoTimeout', 'Location request timed out.')
            : t('weather.error', 'Could not load weather data.');
        showError(msg);
      }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
    });
  }

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.trim();
      if (searchClear) {
        searchClear.hidden = !q;
        searchClear.classList.toggle('show', !!q);
      }
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => searchSuggest(q), 280);
    });
    searchEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        selectingGreetingPlace = false;
        closeSuggest();
        searchEl.blur();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightSuggest(suggestIndex + 1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightSuggest(suggestIndex <= 0 ? suggestOptions().length - 1 : suggestIndex - 1);
        return;
      }
      if (e.key === 'Enter') {
        const opts = suggestOptions();
        if (suggestIndex >= 0 && opts[suggestIndex]) {
          e.preventDefault();
          opts[suggestIndex].click();
        }
      }
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      selectingGreetingPlace = false;
      if (searchEl) searchEl.value = '';
      searchClear.hidden = true;
      searchClear.classList.remove('show');
      closeSuggest();
      searchEl && searchEl.focus();
    });
  }
  document.addEventListener('click', (e) => {
    if (!suggestEl || !searchEl) return;
    if (suggestEl.contains(e.target) || searchEl.contains(e.target) || (searchClear && searchClear.contains(e.target))) return;
    // Starting a My Sky city selection focuses Search and sets a one-shot flag.
    // Let that initiating click bubble without clearing the flag; the next
    // suggestion click consumes it, while unrelated clicks still cancel it.
    if ((greetingPlaceBtn && greetingPlaceBtn.contains(e.target))
        || (mySkySearchBtn && mySkySearchBtn.contains(e.target))) return;
    selectingGreetingPlace = false;
    closeSuggest();
  });

  function focusables(root) {
    if (!root) return [];
    return Array.prototype.filter.call(
      root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (el) { return !el.disabled && el.offsetParent !== null && !el.hidden; }
    );
  }
  function trapTab(container, e) {
    const list = focusables(container);
    if (list.length < 2) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (isSheetOpen() && sheetEl) trapTab(sheetEl, e);
      else if (isDetailVisible() && detailEl) trapTab(detailEl, e);
      return;
    }
    if (e.key !== 'Escape') return;
    if (suggestEl && !suggestEl.hidden && suggestEl.classList.contains('open')) {
      closeSuggest();
      e.preventDefault();
      return;
    }
    if (isSheetOpen()) {
      closeSheet();
      e.preventDefault();
      return;
    }
    if (isDetailVisible() || (detailEl && detailEl.classList.contains('is-closing'))) {
      closeDetail();
      e.preventDefault();
    }
  });

  // Pause auto-refresh when tab/page is not active; resume (+ stale refresh) when active
  document.addEventListener('visibilitychange', onPageActivityChange);
  window.addEventListener('pageshow', function (e) {
    if (e && e.persisted) onPageActivityChange();
  });
  window.addEventListener('focus', function () {
    // Window focus while still "visible" — ensure timer is running
    finishGreetingTyping();
    if (isPageActive() && !autoRefreshTimer) scheduleAutoRefresh();
  });
  window.addEventListener('blur', function () {
    // Do not clear on blur alone (user may be in another app on same desktop
    // while the tab remains visible). Visibility API owns pause.
  });

  var pendingUiRefresh = false;

  window.refreshWeatherUi = function refreshWeatherUi(opts) {
    opts = opts || {};
    // force: true — unit/language changes must repaint even mid-load
    var force = !!(opts && opts.force);
    applyAmbientPageSky();
    // Never interrupt bootstrap list-lock / inflight load unless forced
    if (!force && (listPaintLocked || refreshInflight)) {
      pendingUiRefresh = true;
      return;
    }
    pendingUiRefresh = false;
    if (cache.size) {
      refreshListsFromCache();
    } else if (!listPaintLocked && !refreshInflight) {
      refresh(true, { quiet: false, reason: 'lang' });
    }
    if (isDetailVisible() && openCity && openCity.weather) {
      const fresh = (openCity.city && cache.get(cityKey(openCity.city))) || openCity;
      // Preserve open alerts across unit repaint
      const keepAlerts = alertsApi.captureOpenAlertTitles();
      openDetail(fresh);
      if (keepAlerts && keepAlerts.length) alertsApi.restoreOpenAlertTitles(keepAlerts);
    }
  };

  var lastWxTemp = (typeof currentTempUnit === 'string') ? currentTempUnit : null;
  var lastWxDist = (typeof currentDistUnit === 'string') ? currentDistUnit : null;
  document.addEventListener('duskline:prefs', function (e) {
    var type = e && e.detail && e.detail.type;
    if (type === 'lang') {
      window.refreshWeatherUi({ force: false });
      return;
    }
    if (type === 'motion') {
      if (motionLevel() !== 'full' && greetingTypeTimer) {
        finishGreetingTyping();
      }
      return;
    }
    if (type !== 'units') return;
    var temp = e.detail && e.detail.temp;
    var dist = e.detail && e.detail.dist;
    var changed = temp !== lastWxTemp || dist !== lastWxDist;
    lastWxTemp = temp;
    lastWxDist = dist;
    window.refreshWeatherUi({ force: changed });
  });

  /** Deep link from homepage cards / shared URLs: ?city=nyc | ?lat=&lon= */
  function cityFromQuery() {
    try {
      var p = new URLSearchParams(location.search || '');
      var slug = (p.get('city') || p.get('dest') || '').toLowerCase().trim();
      var lat = parseFloat(p.get('lat'));
      var lon = parseFloat(p.get('lon'));
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        return {
          name: p.get('name') || 'Location',
          admin1: p.get('admin1') || '',
          lat: lat,
          lon: lon,
          tz: p.get('tz') || undefined,
          country: p.get('country') || '',
          country_code: p.get('country_code') || p.get('cc') || '',
          tryNws: !(p.get('country_code') || p.get('cc') || p.get('country'))
        };
      }
      if (slug && typeof DEST_WEATHER_CITIES !== 'undefined' && DEST_WEATHER_CITIES[slug]) {
        return DEST_WEATHER_CITIES[slug];
      }
      if (slug) {
        var hit = MAJOR.find(function (m) {
          var n = String(m.name).toLowerCase().replace(/\s+/g, '');
          var s = slug.replace(/\s+/g, '');
          return n === s || n.indexOf(s) === 0;
        });
        if (hit) return hit;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  /** Fetch only the query city and open detail — do not wait for majors. */
  async function openDeepLinkFirst(city) {
    if (!city) return false;
    try {
      var pack = await dataApi.loadCity(city, null, { enrich: true, forceFetch: true });
      if (!pack || !pack.weather) return false;
      cache.set(cityKey(city), pack);
      listPaintLocked = false;
      try { clearWeatherSkeleton(); } catch (e) { /* ignore */ }
      openDetail(pack);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Kick off — paint the complete static catalog immediately, then refresh it quietly.
  myLocationCity = loadMyLocation();
  loadNameCacheFromSession();
  ensureListTappable();
  forceCloseSheet();
  if (detailEl) {
    try { detailEl.inert = true; } catch (e) { /* older browsers */ }
    try { detailEl.hidden = true; } catch (e2) { /* ignore */ }
  }
  applyAmbientPageSky();
  seedStaticCityNames();
  refreshListsFromCache({ force: true, skipAmbient: true });
  var bootCity = cityFromQuery();
  if (bootCity) {
    openDeepLinkFirst(bootCity).then(function (opened) {
      // List fills in behind detail. Do not force-refetch the city we just opened.
      refresh(opened ? false : true, {
        quiet: !!opened,
        reason: opened ? 'boot-after-deeplink' : 'boot'
      });
    });
  } else {
    refresh(true, { quiet: true, reason: 'boot' });
  }
  scheduleAutoRefresh();
  // Keep ambient sky in sync with clock / theme
  setInterval(() => { if (isPageActive()) applyAmbientPageSky(); }, 5 * 60 * 1000);
  // bfcache / back-forward: never leave a stuck detail lock
  window.addEventListener('pageshow', function () {
    if (!isDetailVisible()) {
      ensureListTappable();
      forceCloseSheet();
    }
  });
})();
