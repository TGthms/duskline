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

  const MAJOR = (window.WEATHER_CITIES && window.WEATHER_CITIES.length)
    ? window.WEATHER_CITIES
    : [];

  /**
   * Localized major-city display names (static — no network).
   * Keys match cityKey() = lat.toFixed(3)+','+lon.toFixed(3)
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
    61: { en: 'Light rain', es: 'Lluvia ligera', zh: '小雨', ja: '弱い雨' },
    63: { en: 'Rain', es: 'Lluvia', zh: '雨', ja: '雨' },
    65: { en: 'Heavy rain', es: 'Lluvia intensa', zh: '大雨', ja: '強い雨' },
    66: { en: 'Freezing rain', es: 'Lluvia helada', zh: '冻雨', ja: '着氷性の雨' },
    67: { en: 'Heavy freezing rain', es: 'Lluvia helada intensa', zh: '强冻雨', ja: '強い着氷性の雨' },
    71: { en: 'Light snow', es: 'Nieve ligera', zh: '小雪', ja: '弱い雪' },
    73: { en: 'Snow', es: 'Nieve', zh: '雪', ja: '雪' },
    75: { en: 'Heavy snow', es: 'Nieve intensa', zh: '大雪', ja: '大雪' },
    80: { en: 'Rain showers', es: 'Chubascos', zh: '阵雨', ja: 'にわか雨' },
    81: { en: 'Rain showers', es: 'Chubascos', zh: '阵雨', ja: 'にわか雨' },
    82: { en: 'Violent rain showers', es: 'Chubascos fuertes', zh: '强阵雨', ja: '激しいにわか雨' },
    95: { en: 'Thunderstorm', es: 'Tormenta', zh: '雷暴', ja: '雷雨' },
    96: { en: 'Thunderstorm with hail', es: 'Tormenta con granizo', zh: '雷暴伴冰雹', ja: '雷雨（ひょう）' },
    99: { en: 'Thunderstorm with hail', es: 'Tormenta con granizo', zh: '雷暴伴冰雹', ja: '雷雨（ひょう）' }
  };

  const $ = (id) => document.getElementById(id);
  const listEl = $('weatherList');
  const favListEl = $('weatherFavoritesList');
  const favBlock = $('weatherFavoritesBlock');
  const myLocListEl = $('weatherMyLocationList');
  const myLocBlock = $('weatherMyLocationBlock');
  const majorsBlock = $('weatherMajorsBlock');
  const shellEl = $('weatherShell');
  const loadingEl = $('weatherLoading');
  const errorEl = $('weatherError');
  const updatedEl = $('weatherUpdated');
  const searchEl = $('weatherSearch');
  const searchClear = $('weatherSearchClear');
  const suggestEl = $('weatherSuggest');
  const refreshBtn = $('weatherRefresh');
  const locateBtn = $('weatherLocate');
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

  let cache = new Map();
  let autoRefreshTimer = null;
  let searchTimer = 0;
  let openCity = null;

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
  function t(key, fallback) {
    const dict = typeof getI18nDict === 'function' ? getI18nDict(lang()) : null;
    if (dict && dict[key]) return dict[key];
    return fallback || key;
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
    try { return localStorage.getItem(WIND_KEY) || (useMi() ? 'mph' : 'kmh'); }
    catch (e) { return useMi() ? 'mph' : 'kmh'; }
  }
  function precipUnit() {
    try { return localStorage.getItem(PRECIP_KEY) || (useMi() ? 'in' : 'mm'); }
    catch (e) { return useMi() ? 'in' : 'mm'; }
  }
  function pressUnit() {
    try { return localStorage.getItem(PRESS_KEY) || 'hPa'; }
    catch (e) { return 'hPa'; }
  }
  function setWindUnit(u) { try { localStorage.setItem(WIND_KEY, u); } catch (e) {} }
  function setPrecipUnit(u) { try { localStorage.setItem(PRECIP_KEY, u); } catch (e) {} }
  function setPressUnit(u) { try { localStorage.setItem(PRESS_KEY, u); } catch (e) {} }


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
      REFRESH_MS: REFRESH_MS,
      t: t,
      onLoadProgress: setLoadProgress,
      onCityLoaded: function (city, pack) {
        pendingCityKeys.delete(cityKey(city));
        if (pack && pack.fetchedAt) setUpdated(pack.fetchedAt);
        if (pack && pack.city && pack.city.isMyLocation) applyAmbientPageSky(pack);
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
      isDetailVisible: isDetailVisible,
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
    if (v >= 11) return lang() === 'zh' ? '极高' : lang() === 'ja' ? '極端' : lang() === 'es' ? 'Extremo' : 'Extreme';
    if (v >= 8) return lang() === 'zh' ? '很高' : lang() === 'ja' ? '非常に高い' : lang() === 'es' ? 'Muy alto' : 'Very High';
    if (v >= 6) return lang() === 'zh' ? '高' : lang() === 'ja' ? '高い' : lang() === 'es' ? 'Alto' : 'High';
    if (v >= 3) return lang() === 'zh' ? '中等' : lang() === 'ja' ? '中' : lang() === 'es' ? 'Moderado' : 'Moderate';
    return lang() === 'zh' ? '低' : lang() === 'ja' ? '低い' : lang() === 'es' ? 'Bajo' : 'Low';
  }

  /** Current UV when hourly exists; at night do not fall back to the daily max. */
  function uvNowValue(pack, daily, dayIdx, hourly, timeZone) {
    const nowUv = hourlyNowValue(hourly, 'uv_index', timeZone);
    if (nowUv != null) return nowUv;
    const hour = localHourForPack(pack);
    if (hour < 6 || hour >= 20) return 0;
    return dailyFieldAt(daily, 'uv_index_max', dayIdx);
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
    if (isBareWallClock(s)) {
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
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
      return arr.filter((c) => c && typeof c.lat === 'number' && typeof c.lon === 'number' && c.name)
        .map((c) => ({
          name: c.name,
          admin1: c.admin1 || '',
          lat: c.lat,
          lon: c.lon,
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
      if (!c || typeof c.lat !== 'number' || typeof c.lon !== 'number' || !c.name) return null;
      const locatedAt = (typeof c.locatedAt === 'number' && c.locatedAt > 0) ? c.locatedAt : 0;
      return {
        name: c.name, admin1: c.admin1 || '', lat: c.lat, lon: c.lon, tz: c.tz,
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

  async function reverseGeocode(lat, lon) {
    const langParam = lang() === 'zh' ? 'zh' : lang() === 'ja' ? 'ja' : lang() === 'es' ? 'es' : 'en';
    // BigDataCloud client reverse geocode (browser-safe, no API key)
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${langParam}`;
      const data = await dataApi.fetchJson(url);
      const name = data.city || data.locality || data.principalSubdivision || data.countryName;
      if (name) {
        const admin = [data.principalSubdivision, data.countryName].filter(Boolean).join(', ');
        return {
          name, admin1: admin, lat, lon,
          country: data.countryName || '',
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
        const admin = [a.state, a.country].filter(Boolean).join(', ');
        return {
          name, admin1: admin, lat, lon,
          country: a.country || '',
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
    const row = WMO[code] || WMO[3];
    return row[lang()] || row.en;
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

  function starIcon(filled) {
    return filled ? sfIcon('star.fill', 'weather-star-sf') : sfIcon('star', 'weather-star-sf');
  }

  function locBadgeHtml() {
    return `<span class="weather-row-loc" aria-hidden="true">${sfIcon('location.fill', 'weather-loc-sf')}</span>`;
  }

  function fmtTemp(c) {
    if (window.Duskline && typeof window.Duskline.formatTempFromC === 'function') {
      return window.Duskline.formatTempFromC(c, { unit: useF() ? 'f' : 'c' });
    }
    if (c == null || Number.isNaN(c)) return '—';
    if (useF()) return Math.round(c * 9 / 5 + 32) + '°';
    return Math.round(c) + '°';
  }
  function windMsTo(unit, ms) {
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
    const v = windMsTo(u, ms);
    if (v == null) return '—';
    if (u === 'bft') return v + ' bft';
    if (u === 'mph') return Math.round(v) + ' mph';
    if (u === 'kmh') return Math.round(v) + ' km/h';
    if (u === 'kn') return Math.round(v) + ' kn';
    return Number(v).toFixed(1) + ' m/s';
  }
  function fmtVis(m) {
    if (m == null) return '—';
    if (useMi()) return (m / 1609.34).toFixed(1) + ' mi';
    return (m / 1000).toFixed(1) + ' km';
  }
  function fmtPrecip(mm) {
    if (mm == null) return '—';
    const u = precipUnit();
    if (u === 'in') return (mm / 25.4).toFixed(2) + ' in';
    if (u === 'cm') return (mm / 10).toFixed(1) + ' cm';
    return mm.toFixed(1) + ' mm';
  }
  function fmtPress(hpa) {
    if (hpa == null) return '—';
    const u = pressUnit();
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
    if (v == null) return '';
    if (v <= 50) return lang() === 'zh' ? '优' : lang() === 'ja' ? '良好' : lang() === 'es' ? 'Buena' : 'Good';
    if (v <= 100) return lang() === 'zh' ? '良' : lang() === 'ja' ? '普通' : lang() === 'es' ? 'Moderada' : 'Moderate';
    if (v <= 150) return lang() === 'zh' ? '轻度污染' : lang() === 'ja' ? '敏感者に有害' : lang() === 'es' ? 'Dañina (SG)' : 'Unhealthy (SG)';
    if (v <= 200) return lang() === 'zh' ? '中度污染' : lang() === 'ja' ? '有害' : lang() === 'es' ? 'Dañina' : 'Unhealthy';
    if (v <= 300) return lang() === 'zh' ? '重度污染' : lang() === 'ja' ? '非常に有害' : lang() === 'es' ? 'Muy dañina' : 'Very unhealthy';
    return lang() === 'zh' ? '严重污染' : lang() === 'ja' ? '危険' : lang() === 'es' ? 'Peligrosa' : 'Hazardous';
  }
  function aqiColor(v) {
    if (v == null) return '#8e8e93';
    if (v <= 50) return '#34c759';
    if (v <= 100) return '#ffd60a';
    if (v <= 150) return '#ff9f0a';
    if (v <= 200) return '#ff453a';
    if (v <= 300) return '#bf5af2';
    return '#9b2335';
  }
  function aqiPct(v) {
    if (v == null) return 0;
    return Math.max(0, Math.min(100, (v / 300) * 100));
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
    return String(s || '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  /** Local clock hour (0–23) for a city pack, using its timezone when available. */
  function localHourForPack(pack) {
    try {
      const tz = (pack && pack.weather && pack.weather.timezone)
        || (pack && pack.city && pack.city.tz);
      if (tz) {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: tz, hour: 'numeric', hour12: false, hourCycle: 'h23'
        }).formatToParts(new Date());
        const h = parts.find((p) => p.type === 'hour');
        if (h) return parseInt(h.value, 10) % 24;
      }
      const cur = pack && pack.weather && pack.weather.current;
      // Open-Meteo local times are often "YYYY-MM-DDTHH:mm" without offset — parse hour digit
      if (cur && cur.time && typeof cur.time === 'string') {
        const m = cur.time.match(/T(\d{2})/);
        if (m) return parseInt(m[1], 10);
      }
    } catch (e) {}
    return new Date().getHours();
  }

  /** Sun (or moon) position on a day arc from local hour. Returns CSS % left/top + size. */


  // Smooth progress: never jump straight to ~85% — always ease from low values
  var progDisplay = 0;
  var progTarget = 0;
  var progRaf = 0;
  var progLabel = '';

  function paintProgressNow() {
    const fill = document.getElementById('weatherLoadFill');
    const pctEl = document.getElementById('weatherLoadPct');
    const label = document.getElementById('weatherLoadLabel');
    const bar = document.getElementById('weatherLoadBar');
    const p = Math.max(0, Math.min(100, Math.round(progDisplay)));
    if (fill) fill.style.width = p + '%';
    if (pctEl) pctEl.textContent = p + '%';
    if (bar) bar.setAttribute('aria-valuenow', String(p));
    if (label && progLabel) label.textContent = progLabel;
  }

  function tickProgressAnim() {
    progRaf = 0;
    const diff = progTarget - progDisplay;
    if (Math.abs(diff) < 0.4) {
      progDisplay = progTarget;
      paintProgressNow();
      return;
    }
    // Ease toward target (readable climb from 0, no instant 85%)
    const step = Math.max(0.55, Math.abs(diff) * 0.13);
    progDisplay += diff > 0 ? step : -step;
    if ((diff > 0 && progDisplay > progTarget) || (diff < 0 && progDisplay < progTarget)) {
      progDisplay = progTarget;
    }
    paintProgressNow();
    progRaf = window.requestAnimationFrame(tickProgressAnim);
  }

  function setLoadProgress(pct, labelText) {
    progTarget = Math.max(0, Math.min(100, Number(pct) || 0));
    if (labelText) progLabel = labelText;
    if (!progRaf) progRaf = window.requestAnimationFrame(tickProgressAnim);
    // Also update label immediately for snappy copy
    const label = document.getElementById('weatherLoadLabel');
    if (label && progLabel) label.textContent = progLabel;
  }

  function resetLoadProgress() {
    if (progRaf) {
      try { window.cancelAnimationFrame(progRaf); } catch (e) {}
      progRaf = 0;
    }
    progDisplay = 0;
    progTarget = 0;
    progLabel = t('weather.loadingForecasts', 'Loading forecasts…');
    paintProgressNow();
  }

  function showWeatherLoadingUI() {
    listPaintLocked = true;
    cancelPendingListPaints();
    if (loadingEl) {
      loadingEl.hidden = false;
      loadingEl.className = 'weather-load-panel weather-load-panel--hero';
      loadingEl.innerHTML =
        '<div class="weather-load-card">' +
          '<div class="weather-load-orb" aria-hidden="true"></div>' +
          '<div class="weather-load-status">' +
            '<span id="weatherLoadLabel">' + escapeHtml(t('weather.loadingForecasts', 'Loading forecasts…')) + '</span>' +
            '<span class="weather-load-pct" id="weatherLoadPct">0%</span>' +
          '</div>' +
          '<div class="weather-load-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="weatherLoadBar" aria-label="Loading">' +
            '<div class="weather-load-fill" id="weatherLoadFill"></div>' +
          '</div>' +
          '<p class="weather-load-hint" id="weatherLoadHint">' +
            escapeHtml(t('weather.loadingHint', 'Fetching cities & alerts…')) +
          '</p>' +
        '</div>';
      resetLoadProgress();
      // Start gently at a few percent so the bar is visibly "alive"
      setLoadProgress(3, t('weather.loadingForecasts', 'Loading forecasts…'));
    }
    // Hide lists entirely until the single final paint — no skeleton thrash
    if (listEl) {
      listEl.innerHTML = '';
      listEl.hidden = true;
      listEl.classList.remove('weather-skeleton-list');
    }
    if (favListEl) { favListEl.innerHTML = ''; }
    if (myLocListEl) { myLocListEl.innerHTML = ''; }
    if (favBlock) favBlock.hidden = true;
    if (myLocBlock) myLocBlock.hidden = true;
    if (majorsBlock) majorsBlock.hidden = false;
    if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }
  }

  wireRemainingModules();

  function clearWeatherSkeleton() {
    if (loadingEl) {
      loadingEl.hidden = true;
      loadingEl.className = 'weather-load-panel';
      loadingEl.innerHTML = '';
    }
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
      row.innerHTML = `<div class="weather-row-main"><div class="weather-row-city">${escapeHtml(displayCityName(c) || c.name || '?')}</div><div class="weather-row-meta">${escapeHtml(displayAdmin1(c) || c.admin1 || '')}</div><div class="weather-row-updated">${escapeHtml(t('weather.loadingForecast', 'Loading forecast…'))}</div></div><div class="weather-row-temps"><div class="weather-row-temp weather-row-temp--loading" aria-hidden="true">--</div></div>`;
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
      row.innerHTML = `<div class="weather-row-main"><div class="weather-row-city">${escapeHtml(displayCityName(c) || c.name || '?')}</div><div class="weather-row-meta">${escapeHtml(displayAdmin1(c) || c.admin1 || '')}</div><div class="weather-row-updated weather-row-updated--fail">${escapeHtml(failLines)}</div></div><div class="weather-row-temps"><div class="weather-row-temp">—</div></div>`;
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
      precipMm: cur.precipitation,
      windDeg: cur.wind_direction_10m
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
        <div class="weather-row-city">${escapeHtml(displayCityName(c))}</div>
        <div class="weather-row-meta">${escapeHtml(localTime)}${c.admin1 ? ' · ' + escapeHtml(displayAdmin1(c)) : ''}</div>
        ${statusLine}
        ${stampLine ? '<div class="weather-row-updated">' + escapeHtml(stampLine) + '</div>' : ''}`;

    const temps = document.createElement('div');
    temps.className = 'weather-row-temps';
    temps.innerHTML = `
        <div class="weather-row-temp">${fmtTemp(cur.temperature_2m)}</div>
        <div class="weather-row-hl">${t('weather.high', 'H')}:${fmtTemp(hi)}  ${t('weather.low', 'L')}:${fmtTemp(lo)}</div>`;

    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'weather-row-star';
    if (c.isMyLocation) {
      star.setAttribute('aria-pressed', 'true');
      star.setAttribute('aria-label', t('weather.clearLocation', 'Remove my location'));
      star.title = t('weather.clearLocation', 'Remove my location');
      star.innerHTML = starIcon(true);
      star.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveMyLocation(null);
        refreshListsFromCache();
      });
    } else {
      star.setAttribute('aria-pressed', fav ? 'true' : 'false');
      star.setAttribute('aria-label', fav ? t('weather.unfavorite', 'Remove favorite') : t('weather.favorite', 'Favorite'));
      star.innerHTML = starIcon(fav);
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

  function refreshListsFromCache(opts) {
    opts = opts || {};
    // Block mid-load repaints (this was the multi-refresh flicker)
    if (listPaintLocked && !opts.force) return;

    if (!myLocationCity) myLocationCity = loadMyLocation();
    const favs = loadFavorites();
    const favKeys = new Set(favs.map(cityKey));
    const myKey = myLocationCity ? cityKey(myLocationCity) : null;

    const myPacks = myLocationCity
      ? [(function () {
          const p = pendingCityKeys.has(myKey)
            ? { city: myLocationCity, pending: true, fetchedAt: 0 }
            : (cache.get(myKey) || { city: myLocationCity, pending: true, fetchedAt: 0 });
          // Always surface the stored geolocation stamp on the pin
          if (p.city) {
            p.city = Object.assign({}, p.city, {
              isMyLocation: true,
              locatedAt: myLocationCity.locatedAt || p.city.locatedAt || 0
            });
          } else {
            p.city = myLocationCity;
          }
          return p;
        })()]
      : [];
    // Favorites exclude my-location pin (shown above)
    const favPacks = favs
      .filter((c) => !myKey || cityKey(c) !== myKey)
      .map((c) => pendingCityKeys.has(cityKey(c))
        ? { city: c, pending: true, fetchedAt: 0 }
        : (cache.get(cityKey(c)) || { city: c, pending: true, fetchedAt: 0 }));
    const majorPacks = MAJOR
      .filter((c) => !favKeys.has(cityKey(c)) && (!myKey || cityKey(c) !== myKey))
      .map((c) => pendingCityKeys.has(cityKey(c))
        ? { city: c, pending: true, fetchedAt: 0 }
        : (cache.get(cityKey(c)) || { city: c, pending: true, fetchedAt: 0 }));

    if (myLocBlock) myLocBlock.hidden = !myLocationCity;
    if (favBlock) favBlock.hidden = favPacks.length === 0;
    renderCityList(myLocListEl, myPacks);
    renderCityList(favListEl, favPacks);
    if (listEl) listEl.hidden = false;
    renderCityList(listEl, majorPacks);
    if (loadingEl) {
      loadingEl.hidden = true;
      loadingEl.className = 'weather-load-panel';
      loadingEl.innerHTML = '';
    }

    let latest = 0;
    [...myPacks, ...favPacks, ...majorPacks].forEach((p) => { latest = Math.max(latest, p.fetchedAt || 0); });
    if (latest) setUpdated(latest);
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
      scheduleAutoRefresh();
      // If data is stale after being away, quiet-refresh immediately
      const stale = !lastListFetch || (Date.now() - lastListFetch >= REFRESH_MS);
      if (stale && !refreshInflight) {
        refresh(true, { quiet: true, reason: 'resume' });
      }
    } else {
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

    if (!myLocationCity) myLocationCity = loadMyLocation();
    const favs = loadFavorites();
    const cities = [];
    if (myLocationCity) cities.push(myLocationCity);
    favs.forEach((c) => {
      if (!myLocationCity || !sameCity(c, myLocationCity)) cities.push(c);
    });
    const seen = new Set(cities.map(cityKey));
    MAJOR.forEach((c) => { if (!seen.has(cityKey(c))) cities.push(c); });
    cities.forEach((c) => pendingCityKeys.add(cityKey(c)));
    refreshListsFromCache({ force: true, skipAmbient: true });

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
        if (!quiet) setLoadProgress(64, t('weather.loadingAlerts', 'Checking weather alerts…'));
        await alertsApi.prefetchAlertsForCache(function (done, total) {
          if (gen !== refreshGen || quiet) return;
          const pct = 64 + Math.round((done / Math.max(1, total)) * 32);
          setLoadProgress(Math.min(96, pct), t('weather.loadingAlerts', 'Checking weather alerts…')
            + ' (' + done + '/' + total + ')');
        });
        if (gen !== refreshGen) return;

        if (!quiet) {
          setLoadProgress(100, t('weather.loadingDone', 'Ready'));
          // Brief beat so the bar can ease to 100% before the list appears
          await new Promise(function (r) { window.setTimeout(r, 180); });
          if (gen !== refreshGen) return;
        }

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
    detailFavBtn.innerHTML = starIcon(fav);
    detailFavBtn.setAttribute('aria-label', fav ? t('weather.unfavorite', 'Remove favorite') : t('weather.favorite', 'Favorite'));
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

  // The detail surface is useful before the background city queue completes.
  // Open it immediately, then replace this loading state with the fetched pack.
  function openDetailLoading(city) {
    if (!detailEl || !city) return;
    openCity = { city: city, pending: true };
    if (detailHero) {
      detailHero.innerHTML = `<h2>${escapeHtml(displayCityName(city))}</h2><div class="weather-detail-loading" role="status" aria-live="polite">${escapeHtml(t('weather.loadingForecast', 'Loading forecast…'))}</div>`;
    }
    if (detailMods) {
      detailMods.innerHTML = `<div class="weather-detail-loading-panel" role="status" aria-live="polite"><span class="weather-detail-spinner" aria-hidden="true"></span><span>${escapeHtml(t('weather.loadingForecast', 'Loading forecast…'))}</span></div>`;
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
    const cur = pack.weather.current;
    const daily = pack.weather.daily || {};
    const hourly = pack.weather.hourly || {};
    {
      const hour = localHourForPack(pack);
      const seed = Math.abs(Math.round((c.lat || 0) * 100) + Math.round((c.lon || 0) * 10));
      const skyOpts = {
        hour, seed, isRow: false,
        precipMm: cur.precipitation,
        windDeg: cur.wind_direction_10m
      };
      // Gradient on shell; ornaments/rain only on sky layer (avoid double rain)
      applySky(detailEl, cur.weather_code, cur.time, Object.assign({}, skyOpts, { noOrnaments: true }));
      if (detailSky) {
        applySky(detailSky, cur.weather_code, cur.time, skyOpts);
        // Mirror mode class on shell so any host-scoped CSS still matches
        detailSky.classList.forEach((cls) => {
          if (cls.indexOf('wx-sky--') === 0) {
            detailEl.classList.remove('wx-sky--day', 'wx-sky--night', 'wx-sky--cloud', 'wx-sky--rain', 'wx-sky--storm', 'wx-sky--snow');
            detailEl.classList.add(cls);
          }
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
      <h2>${escapeHtml(displayCityName(c))}</h2>
      <div class="weather-detail-temp">${fmtTemp(cur.temperature_2m)}</div>
      <div class="weather-detail-cond">${condIcon(cur.weather_code, night)} ${escapeHtml(condLabel(cur.weather_code))}</div>
      <div class="weather-detail-hl">${t('weather.high', 'H')}:${fmtTemp(heroRange.hi)}  ${t('weather.low', 'L')}:${fmtTemp(heroRange.lo)}</div>
      <div class="weather-detail-updated" id="weatherDetailUpdated"></div>`;
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
        if (abs < 1) feelsSub = lang() === 'zh' ? '与气温相近' : lang() === 'ja' ? '気温に近い' : lang() === 'es' ? 'Similar a la temperatura' : 'Similar to actual';
        else if (delta > 0) feelsSub = (lang() === 'zh' ? '比气温高 ' : lang() === 'ja' ? '気温より ' : lang() === 'es' ? 'Más cálido ' : 'Warmer by ') + abs + '°';
        else feelsSub = (lang() === 'zh' ? '比气温低 ' : lang() === 'ja' ? '気温より ' : lang() === 'es' ? 'Más fresco ' : 'Cooler by ') + abs + '°';
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
        ? (lang() === 'zh' ? '能见度偏低' : lang() === 'ja' ? '視程が低い' : lang() === 'es' ? 'Visibilidad reducida' : 'Reduced visibility')
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
          if (d > 0.8) trend = lang() === 'zh' ? '上升' : lang() === 'ja' ? '上昇' : lang() === 'es' ? 'Subiendo' : 'Rising';
          else if (d < -0.8) trend = lang() === 'zh' ? '下降' : lang() === 'ja' ? '低下' : lang() === 'es' ? 'Bajando' : 'Falling';
          else trend = lang() === 'zh' ? '稳定' : lang() === 'ja' ? '安定' : lang() === 'es' ? 'Estable' : 'Steady';
        }
      } catch (e) {}
      mods.push(modHtml('pressure', t('weather.pressure', 'Pressure'), fmtPress(cur.surface_pressure), trend, true));
    }
    {
      const dayPrecip = dailyFieldAt(daily, 'precipitation_sum', dayIdx);
      const sub = dayPrecip != null
        ? (lang() === 'zh' ? '今日累计 ' : lang() === 'ja' ? '今日 ' : lang() === 'es' ? 'Hoy ' : 'Today ') + fmtPrecip(dayPrecip)
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
    mods.push(`<button type="button" class="weather-mod weather-mod-wide is-tappable" data-sheet="conditions"><div class="weather-mod-label">${modLabelIcon('conditions')}<span>${escapeHtml(t('weather.hourly', 'Hourly Forecast'))}</span></div>${hourlyHtml}</button>`);

    mods.push(`<div class="weather-mod weather-mod-wide"><div class="weather-mod-label">${escapeHtml(t('weather.daily', '10-Day Forecast'))}</div>${chartsApi.dailyBarsHtml(daily, {
      currentTemp: cur && cur.temperature_2m != null ? cur.temperature_2m : null,
      timeZone: (pack.weather && pack.weather.timezone) || (c && c.tz) || undefined,
      hourly: hourly
    })}</div>`);

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
    } else if (sheetEl && !sheetEl.classList.contains('open')) {
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
        if (openCity && openCity.city && sameCity(openCity.city, pack.city) && isDetailVisible()) {
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
    if (lang() === 'zh') return '美国';
    if (lang() === 'ja') return 'アメリカ合衆国';
    if (lang() === 'es') return 'Estados Unidos';
    return 'United States';
  }

  /** Display name for a city (localized majors when available). */
  function displayCityName(c) {
    if (!c) return '';
    const L = lang();
    if (c.names && c.names[L]) return c.names[L];
    if (c.names && c.names.en && L === 'en') return c.names.en;
    // Static major-city map (instant, offline)
    const key = cityKey(c);
    const staticNames = CITY_NAMES[key];
    if (staticNames) {
      if (staticNames[L]) return staticNames[L];
      if (staticNames.en) return staticNames.en;
    }
    // Geocode cache fallback (search results / sparse fills)
    const cached = nameCache.get(L + ':' + key);
    if (cached) return cached;
    return c.name || '';
  }

  /** Localized admin1 / state label when we have a mapping. */
  function displayAdmin1(c) {
    if (!c) return '';
    const raw = c.admin1 || '';
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
    const cur = pack.weather.current || {};
    const hourly = pack.weather.hourly || {};
    const daily = pack.weather.daily || {};
    const about = {
      humidity: {
        en: 'The relative humidity is the amount of moisture in the air compared to the maximum the air can hold at that temperature. High humidity can make warm air feel stickier and cooler air feel colder.',
        es: 'La humedad relativa es el vapor de agua en el aire respecto al máximo a esa temperatura. Una humedad alta hace que el calor se sienta más sofocante.',
        zh: '相对湿度是空气中水汽含量相对于当前温度下最大可容纳量的比例。湿度高时，炎热更闷、寒冷更刺骨。',
        ja: '相対湿度は、その気温で空気が保持できる最大の水蒸気量に対する実際の量の割合です。高いと蒸し暑く感じやすくなります。'
      },
      uv: {
        en: 'The UV Index measures the strength of ultraviolet radiation from the sun. 0–2 low, 3–5 moderate, 6–7 high, 8–10 very high, 11+ extreme. Use sun protection when the index is 3 or higher.',
        es: 'El índice UV mide la radiación ultravioleta. 0–2 bajo, 3–5 moderado, 6–7 alto, 8–10 muy alto, 11+ extremo. Usa protección solar a partir de 3.',
        zh: '紫外线指数衡量太阳紫外线强度。0–2 低，3–5 中等，6–7 高，8–10 很高，11+ 极高。指数≥3 时请注意防晒。',
        ja: 'UV指数は紫外線の強さの目安です。0–2低、3–5中、6–7高、8–10非常に高い、11+極端。3以上では対策を。'
      },
      aqi: {
        en: 'The U.S. Air Quality Index (AQI) is a measure of air pollution. Lower values are healthier. Sensitive groups should take care when AQI is above 100, and everyone when it is above 150.',
        es: 'El AQI de EE. UU. resume la contaminación del aire. Valores más bajos son mejores. Grupos sensibles deben cuidar por encima de 100.',
        zh: '美国空气质量指数（AQI）综合反映污染水平。数值越低越好。超过 100 时敏感人群需注意，超过 150 时所有人都应减少户外活动。',
        ja: '米国AQIは大気汚染の目安です。低いほど健康的です。100超で敏感な方は注意、150超では屋外活動を控えましょう。'
      },
      wind: {
        en: 'Wind speed and direction describe how air is moving. Direction is where the wind comes from. Gusts can be significantly stronger than sustained wind.',
        es: 'La velocidad y dirección del viento describen el movimiento del aire. La dirección indica de dónde sopla. Las rachas pueden ser mucho más fuertes.',
        zh: '风速与风向描述空气如何流动。风向指风的来向。阵风可能明显高于平均风速。',
        ja: '風速と風向は空気の流れを示します。風向は風の吹いてくる方向です。突風は平均よりかなり強くなることがあります。'
      },
      pressure: {
        en: 'Atmospheric pressure is the weight of air above you. Significant, rapid changes often precede weather shifts — falling pressure can mean rain is on the way; rising pressure often means clearing skies.',
        es: 'La presión atmosférica es el peso del aire. Cambios rápidos predicen el tiempo: bajar suele anticipar lluvia; subir, mejoría.',
        zh: '气压是头顶空气柱的重量。快速变化常预示天气转折：下降可能带来降雨，上升常表示转晴。',
        ja: '気圧は上空の空気の重さです。急変は天気の転換を示しやすく、低下は雨、上昇は回復の兆しになりがちです。'
      },
      vis: {
        en: 'Visibility is the distance at which objects can be clearly seen. Fog, heavy rain, snow, dust, and smoke reduce it — especially important when driving.',
        es: 'La visibilidad es la distancia a la que se ven objetos con claridad. Niebla, lluvia o humo la reducen — importante al conducir.',
        zh: '能见度是肉眼能清晰看见物体的距离。雾、大雨、雪、沙尘和烟雾都会降低能见度，驾车时尤其要注意。',
        ja: '視程は物体をはっきり見られる距離です。霧・大雨・雪・煙で低下し、運転時に特に重要です。'
      },
      precip: {
        en: 'Precipitation is any form of water — rain, snow, sleet, or hail — falling from clouds. Amounts may be shown for the current hour and totals for the day.',
        es: 'La precipitación es agua líquida o congelada que cae de las nubes. Puede mostrarse por hora y el total del día.',
        zh: '降水指从云中落下的雨、雪、霰或冰雹等。可查看当前小时降水量与全天累计。',
        ja: '降水は雲から降る雨・雪・みぞれ・ひょうなどの水です。時間ごとの量と日合計で示されます。'
      },
      sun: {
        en: 'Sunrise and sunset times depend on your location and the date. Day length changes through the seasons; the sun is highest near solar noon.',
        es: 'La salida y puesta del sol dependen de la ubicación y la fecha. La duración del día cambia con las estaciones.',
        zh: '日出日落时间取决于地点和日期。昼长随季节变化，太阳通常在正午前后最高。',
        ja: '日の出・日の入りは場所と日付で変わります。日照時間は季節で変化し、太陽は南中頃に最も高くなります。'
      },
      feels: {
        en: 'Feels Like accounts for humidity, wind, and sunlight so you know how the temperature will actually feel outdoors.',
        es: 'La sensación térmica tiene en cuenta humedad, viento y sol para indicar cómo se siente realmente la temperatura.',
        zh: '体感温度综合了湿度、风和日照，更贴近你在户外实际感受到的冷暖。',
        ja: '体感温度は湿度・風・日差しを加味し、屋外で実際にどう感じるかを示します。'
      },
      conditions: {
        en: 'Temperature through the day. Drag the chart to inspect any hour.',
        es: 'Temperatura a lo largo del día. Arrastra el gráfico para ver cada hora.',
        zh: '全天气温变化。拖动图表可查看任意时刻。',
        ja: '一日の気温の推移。グラフをなぞると各時刻を確認できます。'
      }
    };
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

    const aboutTitle = lang() === 'zh' ? '说明' : lang() === 'ja' ? '説明' : lang() === 'es' ? 'Acerca de' : 'About';
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

    // Chart sheets: Apple pattern = title → large live value lives in chart readout → scrub chart → about
    if (kind === 'conditions') {
      // Chart owns the big readout (scrub updates it). Secondary context line above.
      body += `<p class="wx-sheet-context">${escapeHtml(condLabel(cur.weather_code))}</p>`;
      body += chartsApi.buildTempChart(hourly, 'temperature_2m', (v) => fmtTemp(v), chartTz);
      body += `<p class="weather-mod-label" style="margin-top:16px">${escapeHtml(t('weather.feelsLike', 'Feels Like'))}</p>`;
      body += chartsApi.buildTempChart(hourly, 'apparent_temperature', (v) => fmtTemp(v), chartTz);
    } else if (kind === 'feels') {
      body += `<p class="wx-sheet-context">${escapeHtml(condLabel(cur.weather_code))}</p>`;
      body += chartsApi.buildTempChart(hourly, 'apparent_temperature', (v) => fmtTemp(v), chartTz);
    } else if (kind === 'humidity') {
      body += chartsApi.buildTempChart(hourly, 'relative_humidity_2m', (v) => Math.round(v) + '%', chartTz);
    } else if (kind === 'wind') {
      // Direction as context; speed is the scrub readout
      body += `<p class="wx-sheet-context">${escapeHtml(degToCompass(cur.wind_direction_10m))}${cur.wind_direction_10m != null ? ' · ' + Math.round(cur.wind_direction_10m) + '°' : ''}</p>`;
      body += chartsApi.buildTempChart(hourly, 'wind_speed_10m', (v) => fmtWind(v), chartTz);
      body += `<div class="wx-sheet-compass-row">${chartsApi.windCompass(cur.wind_direction_10m)}</div>`;
      body += `<p class="weather-mod-label">${escapeHtml(t('weather.units', 'Units'))}</p><div class="weather-units-row" id="wxWindUnits">`;
      [['mph', 'mph'], ['kmh', 'km/h'], ['ms', 'm/s'], ['bft', 'bft'], ['kn', 'kn']].forEach(([u, lab]) => {
        body += `<button type="button" data-u="${u}" class="${windUnit() === u ? 'active' : ''}">${lab}</button>`;
      });
      body += '</div>';
    } else if (kind === 'pressure') {
      body += chartsApi.buildTempChart(hourly, 'surface_pressure', (v) => fmtPress(v), chartTz);
      body += `<div class="weather-units-row" id="wxPressUnits">`;
      ['hPa', 'mbar', 'inHg', 'mmHg', 'kPa'].forEach((u) => {
        body += `<button type="button" data-u="${u}" class="${pressUnit() === u ? 'active' : ''}">${u}</button>`;
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
        <div class="weather-chart-sub">${escapeHtml(aqiLabel(aqi) || t('weather.aqi', 'Air Quality'))}</div>
      </div>`;
      body += aqiBarHtml(aqi, false);
      if (pack.air && pack.air.current) {
        const pm = pack.air.current.pm2_5;
        const pm10 = pack.air.current.pm10;
        body += `<div class="wx-sheet-stats">
          <div class="wx-sheet-stat"><span class="wx-sheet-stat-lab">PM2.5</span><span class="wx-sheet-stat-val">${pm != null ? pm.toFixed(1) : '—'} µg/m³</span></div>
          <div class="wx-sheet-stat"><span class="wx-sheet-stat-lab">PM10</span><span class="wx-sheet-stat-val">${pm10 != null ? pm10.toFixed(1) : '—'} µg/m³</span></div>
        </div>`;
      }
    } else if (kind === 'precip') {
      if (hourly.precipitation) body += chartsApi.buildTempChart(hourly, 'precipitation', (v) => fmtPrecip(v), chartTz);
      else {
        body += `<div class="wx-sheet-hero"><div class="weather-chart-readout">${escapeHtml(fmtPrecip(cur.precipitation))}</div></div>`;
      }
      body += `<div class="weather-units-row" id="wxPrecipUnits">`;
      [['in', 'in'], ['mm', 'mm'], ['cm', 'cm']].forEach(([u, lab]) => {
        body += `<button type="button" data-u="${u}" class="${precipUnit() === u ? 'active' : ''}">${lab}</button>`;
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
    }

    const blurb = about[kind];
    if (blurb) {
      body += `<div class="wx-sheet-about">
        <div class="wx-sheet-about-title">${escapeHtml(aboutTitle)} ${escapeHtml(titleMap[kind] || '')}</div>
        <p>${escapeHtml(blurb[lang()] || blurb.en)}</p>
      </div>`;
    }

    sheetBody.innerHTML = body;
    setSheetTitle(sheetTitleHtml);
    chartsApi.bindCharts(sheetBody);

    const bind = (id, setter) => {
      const row = document.getElementById(id);
      if (!row) return;
      row.querySelectorAll('button').forEach((b) => {
        b.addEventListener('click', () => {
          setter(b.getAttribute('data-u'));
          const pack = openCity && openCity.city
            ? (cache.get(cityKey(openCity.city)) || openCity)
            : openCity;
          if (pack && pack.weather) {
            openDetail(pack);
            openSheet(kind, pack);
          }
        });
      });
    };
    bind('wxWindUnits', setWindUnit);
    bind('wxPrecipUnits', setPrecipUnit);
    bind('wxPressUnits', setPressUnit);

    presentSheet();
  }

  /* ── Bottom sheet presentation (iOS-style pop + drag dismiss) ──
     Pattern adapted from the about hub Preferences sheet. */
  const sheetPanel = $('weatherSheetPanel') || (sheetEl && sheetEl.querySelector('.weather-sheet-panel'));
  let sheetY = 0;
  let sheetGen = 0;
  let sheetSpringRaf = 0;
  let sheetOpen = false;

  function sheetReduceMotion() {
    return motionLevel() === 'off' || motionLevel() === 'reduced'
      || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
  function inertSheet() {
    if (!sheetEl) return;
    sheetEl.classList.remove('open', 'is-raised');
    sheetEl.setAttribute('aria-hidden', 'true');
    sheetEl.style.pointerEvents = 'none';
    sheetEl.style.opacity = '';
    try { sheetEl.inert = true; } catch (e) { /* older browsers */ }
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
    sheetGen += 1;
    const gen = sheetGen;
    sheetOpen = true;
    resetSheetInline();
    sheetEl.classList.remove('open', 'is-raised');
    try { sheetEl.inert = false; } catch (e) { /* older browsers */ }
    sheetEl.setAttribute('aria-hidden', 'false');
    sheetEl.style.pointerEvents = 'auto';
    // Always full dim when opening (drag may have left --wx-sheet-backdrop at 0)
    try {
      sheetEl.style.removeProperty('--wx-sheet-backdrop');
      sheetEl.style.opacity = '';
      sheetEl.style.visibility = '';
      sheetEl.style.background = '';
    } catch (eBg) { /* ignore */ }
    // Force start below, then pop up next frames (snappy open)
    sheetPanel.style.transition = 'none';
    sheetPanel.style.transform = 'translate3d(0,100%,0)';
    sheetEl.classList.add('open');
    // Scroll body to top so About section isn’t half-hidden from a prior sheet
    try {
      if (sheetBody) sheetBody.scrollTop = 0;
    } catch (eScr) { /* ignore */ }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (gen !== sheetGen) return;
        // Re-assert open + dim (mobile WebKit can drop opacity mid-frame)
        sheetEl.classList.add('open');
        try { sheetEl.style.removeProperty('--wx-sheet-backdrop'); } catch (e2) { /* ignore */ }
        const reduce = sheetReduceMotion();
        if (reduce) {
          sheetPanel.style.transition = '';
          sheetPanel.style.transform = '';
          sheetEl.classList.add('is-raised');
          return;
        }
        sheetPanel.style.transition = 'transform .38s cubic-bezier(0.32, 0.72, 0, 1)';
        sheetPanel.style.transform = 'translate3d(0,0,0)';
        sheetEl.classList.add('is-raised');
        window.setTimeout(function () {
          if (gen !== sheetGen) return;
          sheetPanel.style.transition = '';
          sheetPanel.style.transform = '';
        }, 400);
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
    sheetPanel.classList.remove('is-dragging');
    const reduce = sheetReduceMotion();
    const closeMs = reduce ? 0 : 280;

    if (!reduce) {
      sheetPanel.style.transition = 'transform ' + closeMs + 'ms cubic-bezier(0.32, 0.72, 0, 1)';
      sheetPanel.style.transform = 'translate3d(0,100%,0)';
    }
    sheetEl.classList.remove('is-raised');
    // Drop backdrop immediately so modules/list stay tappable even if
    // the panel slide-out is still finishing.
    sheetEl.style.pointerEvents = 'none';
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
    if (typeof ensureBodyScrollUnlocked === 'function') ensureBodyScrollUnlocked();
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
      const langParam = lang() === 'zh' ? 'zh' : lang() === 'ja' ? 'ja' : lang() === 'es' ? 'es' : 'en';
      const data = await dataApi.fetchJson(`${GEOCODE}?name=${encodeURIComponent(q)}&count=8&language=${langParam}&format=json`);
      if (gen !== searchGen) return;
      const results = data.results || [];
      suggestEl.innerHTML = '';
      if (!results.length) {
        suggestEl.innerHTML = `<li class="s-empty">${escapeHtml(t('weather.emptySearch', 'No cities found.'))}</li>`;
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
          closeSuggest();
          if (searchEl) searchEl.value = r.name;
          if (searchClear) {
            searchClear.hidden = false;
            searchClear.classList.add('show');
          }
          try {
            const pack = await dataApi.loadCity(city);
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
      suggestEl.innerHTML = `<li class="s-empty">${escapeHtml(t('weather.error', 'Could not load weather data.'))}</li>`;
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
        (lang() === 'zh' ? '当前：' : lang() === 'ja' ? '現在：' : lang() === 'es' ? 'Ahora: ' : 'Using ') +
        resolvedHint
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
      el.textContent =
        (lang() === 'zh' ? '当前：' : lang() === 'ja' ? '現在：' : lang() === 'es' ? 'Ahora: ' : 'Using ') + tip;
    };

    const fill = function (id, units, current, onPick) {
      const row = document.getElementById(id);
      if (!row) return;
      units.forEach(function (pair) {
        const u = pair[0];
        const lab = pair[1];
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = lab;
        b.setAttribute('data-unit', u);
        if (current === u) b.classList.add('active');
        b.addEventListener('click', function () {
          onPick(u);
          row.querySelectorAll('button').forEach(function (x) {
            x.classList.toggle('active', x === b);
          });
        });
        row.appendChild(b);
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
    detailMods.addEventListener('click', function (e) {
      const btn = e.target && e.target.closest ? e.target.closest('[data-sheet]') : null;
      if (!btn || !detailMods.contains(btn)) return;
      const kind = btn.getAttribute('data-sheet');
      if (!kind || !openCity) return;
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
          await dataApi.loadCity(city);
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
          tz: p.get('tz') || undefined
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
  document.querySelectorAll('.weather-root .reveal, .tools-page .reveal').forEach((el) => el.classList.add('visible'));

})();
