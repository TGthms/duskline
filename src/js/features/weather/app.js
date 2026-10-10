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
  const HORIZON_PREVIEW_SLUGS = new Set(['nyc', 'london', 'cairo', 'tokyo', 'singapore', 'sydney']);

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
  const startEl = $('weatherStart');
  const startSearchBtn = $('weatherStartSearch');
  const startLocateBtn = $('weatherStartLocate');
  const moreBtn = $('weatherMore');
  const shellEl = $('weatherShell');
  const errorEl = $('weatherError');
  const updatedEl = $('weatherUpdated');
  const searchEl = $('weatherSearch');
  const searchClear = $('weatherSearchClear');
  const suggestEl = $('weatherSuggest');
  const refreshBtn = $('weatherRefresh');
  const mapOpenBtn = $('weatherMapOpen');
  const locateBtn = $('weatherLocate');
  const mySkyLocateBtn = $('weatherMySkyLocate');
  const mySkySearchBtn = $('weatherMySkySearch');
  const greetingTitleEl = $('weatherGreeting');
  const greetingTextEl = $('weatherGreetingText');
  const greetingSizerEl = $('weatherGreetingSizer');
  const greetingPlaceBtn = $('weatherGreetingPlace');
  const weatherModeSwitchEl = $('weatherModeSwitch');
  const modeButtons = Array.from(document.querySelectorAll('[data-weather-mode]'));
  const unitsBtn = $('weatherUnitsBtn');
  const detailEl = $('weatherDetail');
  const detailHero = $('weatherDetailHero');
  const detailMods = $('weatherModules');
  const detailScroll = $('weatherDetailScroll');
  const detailBack = $('weatherDetailBack');
  const detailRefresh = $('weatherDetailRefresh');
  const detailFavBtn = $('weatherDetailFav');
  const detailShareBtn = $('weatherDetailShare');
  const detailSky = $('weatherDetailSky');
  const detailFx = $('weatherDetailFx');
  const sheetEl = $('weatherSheet');
  const sheetBody = $('weatherSheetBody');
  const sheetClose = $('weatherSheetClose');

  const CACHE_SOFT_MAX = 200;
  const cacheStore = new Map();
  const snapshotApi = W.factories.snapshots({
    cityKey: cityKey, sameCity: sameCity,
    schedule: function (write) {if(window.requestIdleCallback) window.requestIdleCallback(write,{timeout:750});else window.setTimeout(write,150);},
    storage: {
      getItem: function (key) { return localStorage.getItem(key); },
      setItem: function (key, value) { localStorage.setItem(key, value); }
    }
  });
  const savedSnapshots = snapshotApi.all;
  window.addEventListener('pagehide',snapshotApi.flush);
  document.addEventListener('visibilitychange',function () {if(document.visibilityState === 'hidden') snapshotApi.flush();});
  function persistSnapshot(pack) {
    if (!pack || !pack.weather || !pack.city || pack.error) return;
    const c = pack.city;
    const isPersonal = (myLocationCity && sameCity(c, myLocationCity))
      || (selectedGreetingCity && sameCity(c, selectedGreetingCity))
      || (openCity && openCity.city && sameCity(c, openCity.city))
      || loadFavorites().some(function (fav) { return sameCity(c, fav); });
    if (isPersonal) snapshotApi.save(pack, {
      visited: !!(openCity && openCity.city && sameCity(c, openCity.city))
    });
  }
  function savedSnapshotFor(city) { return snapshotApi.find(city); }
  function forgetSnapshotFor(city) {
    if (!city) return;
    snapshotApi.forget(city);
    cacheStore.delete(cityKey(city));
  }
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
      persistSnapshot(v);
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
  let bootPending = true;
  let weatherModeExplicit = false;
  let horizonExpanded = (function () {try{return localStorage.getItem('duskline-horizon-expanded')==='true';}catch(error){return false;}})();
  const modeScroll = {horizon:0,'my-sky':0};
  let greetingAnimated = false;
  let selectedGreetingCity = null;
  let selectingGreetingPlace = false;
  let greetingBoundaryTimer = 0;
  let lastGreetingText = '';
  let greetingTypeTimer = 0;
  let greetingTypeGeneration = 0;
  let detailInsightTimer = 0;
  let detailInsightGeneration = 0;
  let lastDetailInsightKey = '';
  let greetingVisitSeed = null;
  var aqiCurrentValue, aqiScaleLabel, aqiLabel, aqiBandKey, aqiDescription, aqiGreetingDescription, aqiRange, airValueText, aqiExtendedHtml, loadAqiDetail, aqiOutlookHtml, aqiColor, aqiLightColor, aqiPct, aqiBarHtml;
  let cityRefreshApi = null;
  let forecastSheetApi = null;
  let activeSheetKind = null;
  let notificationSettingsReturnScroll = 0;
  let toastTimer = 0;
  const toastEl = $('weatherToast');
  function notify(message, kind, undo) {
    if (!message || !toastEl) return;
    window.clearTimeout(toastTimer);
    if(sheetIntentOpen && sheetBody) {
      toastEl.classList.remove('is-visible');toastEl.replaceChildren();
      sheetBody.querySelector('.weather-inline-notice')?.remove();
      const notice=document.createElement('div');notice.className='weather-inline-notice';notice.setAttribute('role',kind === 'error' ? 'alert' : 'status');notice.textContent=message;
      if(undo) {
        const action=document.createElement('button');action.type='button';action.textContent=t('weather.undo','Undo');
        action.addEventListener('click',function () {action.disabled=true;undo();notify(t('weather.notice.restored','Restored to My Sky'));});
        notice.append(action);sheetBody.append(notice);action.focus({preventScroll:true});
      } else sheetBody.append(notice);
      return;
    }
    toastEl.textContent = message;
    if (undo) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = t('weather.undo', 'Undo');
      button.addEventListener('click', function () {
        undo();
        // Acknowledge the undo so the toast reflects the restored state.
        notify(t('weather.notice.restored', 'Restored to My Sky'));
      });
      toastEl.append(button);
    }
    toastEl.dataset.kind = kind === 'error' ? 'error' : 'success';
    toastEl.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    toastEl.classList.add('is-visible');
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-visible'); }, undo ? 7000 : 2800);
  }
  let detailReturnFocus = null;
  let detailReturnKey = null;
  // City that opened the current detail from the map. When set, closing the
  // detail returns to the map centered on this city instead of the main screen.
  let detailReturnToMap = null;
  let sheetReturnFocus = null;
  let sheetReturnKind = null;
  let sheetReturnDate = null;
  let sheetReturnHour = null;

  function restoreFocus(target, fallback) {
    const next = target && target !== document.body && target !== document.documentElement && target.isConnected && !target.closest('[inert]') ? target : fallback;
    if (!next || typeof next.focus !== 'function') return;
    try { next.focus({ preventScroll: true }); } catch (e) { next.focus(); }
  }

  let lastListFetch = 0;
  let myLocationCity = null;
  let refreshGen = 0;       // supersede stale refresh() completions
  let viewBusySince = 0;
  let finishViewLoading = null;
  let viewBusyTimer = 0;
  let refreshInflight = null; // Promise of current refresh, if any
  let alertsPrefetchGen = 0; // cancel in-flight alert prefetch (module-owned gen also exists)
  /** Detail open/close motion — generation counters cancel stale rAF/timeouts. */
  let detailMotionGen = 0;
  let detailMotionTimer = 0;
  let detailEnterTimer = 0;
  let detailCloseListener = null;
  let searchGen = 0;
  let searchAbort = null;
  let placeChoiceGen = 0;
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
  function aqiScale(city) {
    return window.DusklineAqiMath.defaultScale(city);
  }

  var skyApi = (W.factories.sky && W.factories.sky({
    motionLevel: motionLevel,
    primary: function () { const city=weatherMode === 'my-sky' && getGreetingSourceCity();return city ? {timeZone:city.tz || cityTimeZone(cache.get(cityKey(city)),city)} : null; },
    staticListFx: typeof WEATHER_STATIC_LIST_FX !== 'undefined' ? WEATHER_STATIC_LIST_FX : true
  })) || {};
  var applySky = skyApi.applySky;
  var applyAmbientPageSky = skyApi.applyAmbientPageSky;

  var chartsApi = null;
  var alertsApi = null;
  var dataApi = null;
  var mapApi = null;
  var mapMySkyRefreshPending = false;

  let productApi = null;
  let navigationApi = null;
  let mapNavigationSuspended = false;
  function wireRemainingModules() {
    if (!W.factories.charts || !W.factories.alerts || !W.factories.data) {
      console.error('[weather] missing factories', Object.keys(W.factories || {}));
      return;
    }
    chartsApi = W.factories.charts({
      t: t, escapeHtml: escapeHtml, lang: lang, localeTag: localeTag,
      fmtTemp: fmtTemp, fmtWind: fmtWind, fmtPress: fmtPress, fmtPrecip: fmtPrecip,
      degToCompass: degToCompass, condLabel: condLabel,
      motionLevel: motionLevel, formatClock: formatClock, formatChartAxisHour: formatChartAxisHour,
      useF: useF, condIcon: condIcon
    });
    const aqiApi=W.factories.aqi({t,escapeHtml,localeTag,aqiScale,cityKey,cache,stampToMs,formatClock,AIR,refreshMs:REFRESH_MS,fetchJson:function (url) {return dataApi.fetchJson(url);}});
    aqiCurrentValue=aqiApi.aqiCurrentValue;
    aqiScaleLabel=aqiApi.aqiScaleLabel;
    aqiLabel=aqiApi.aqiLabel;
    aqiBandKey=aqiApi.aqiBandKey;
    aqiDescription=aqiApi.aqiDescription;
    aqiGreetingDescription=aqiApi.aqiGreetingDescription;
    aqiRange=aqiApi.aqiRange;
    airValueText=aqiApi.airValueText;
    aqiExtendedHtml=aqiApi.aqiExtendedHtml;
    loadAqiDetail=aqiApi.loadAqiDetail;
    aqiOutlookHtml=aqiApi.aqiOutlookHtml;
    aqiColor=aqiApi.aqiColor;
    aqiLightColor=aqiApi.aqiLightColor;
    aqiPct=aqiApi.aqiPct;
    aqiBarHtml=aqiApi.aqiBarHtml;
    forecastSheetApi = W.factories.forecastSheet({charts:chartsApi,t,escapeHtml,condIcon,condLabel,fmtTemp,fmtPrecip,formatClock,dailyFieldAt,useF});
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
        if (productApi) productApi.render();
        if ((!pack || !pack.weather) && savedSnapshotFor(city)) {
          pack = savedSnapshotFor(city);
          cache.set(cityKey(city), pack);
        }
        if (pack && pack.weather && pack.fetchedAt) {
          if (pack.stored && updatedEl) updatedEl.textContent = rowUpdatedLabel(pack);
          else setUpdated(pack.fetchedAt);
        }
        if (pack && pack.weather && !pack.light && openCity && sameCity(openCity.city, city) && isDetailShowingOrOpening()) openDetail(pack);
        if (mapApi && mapApi.isOpen()) mapApi.updatePlaces(getMapPlaces());
        if (pack && pack.city && pack.city.isMyLocation && isPageActive()) applyAmbientPageSky();
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
      ensureAlerts: function () { return alertsApi.ensureAlerts.apply(null, arguments); }
    });
    alertsApi = W.factories.alerts({
      t: t, escapeHtml: escapeHtml, lang: lang, formatClock: formatClock, motionLevel: motionLevel,
      weatherIcon: weatherIcon,
      roundCoord: roundCoord, isLikelyUs: function (c) { return dataApi.isLikelyUs(c); }, sameCity: sameCity,
      NWS_BASE: NWS_BASE,
      nwsFetchJson: function (url, signal, options) { return dataApi.nwsFetchJson(url, signal, false, options); },
      cityKey: cityKey, cache: cache,
      getDetailMods: function () { return detailMods; },
      isDetailVisible: isDetailShowingOrOpening,
      getOpenCity: function () { return openCity; },
      scheduleListPaintFromAlerts: function (pack) {
        if (typeof scheduleListPaintFromAlerts === 'function') scheduleListPaintFromAlerts(pack);
      }
    });
    cityRefreshApi = W.factories.cityRefresh({
      cityKey: cityKey,
      load: function () { return dataApi.loadCity.apply(null, arguments); },
      alerts: function () { return alertsApi.ensureAlerts.apply(null, arguments); },
      paint: function (pack) {
        if (productApi) productApi.render();
        replaceCityCard(pack.city, pack);
        updateGreeting();
        if (openCity && sameCity(openCity.city, pack.city) && isDetailShowingOrOpening()) {
          const options = history.state && history.state.duskline && history.state.duskline.sheet;
          openDetail(pack);
          if (sheetIntentOpen && options && !['units','primary','places','install','notifications'].includes(options.kind)) openSheet(options.kind, pack, Object.assign({}, options.options, {keepScroll:true}));
        }
      },
      failed: function () {
        if(productApi) productApi.render();
        refreshListsFromCache({force:true,skipAmbient:true});
        notify(t('weather.refreshToRetry','Refresh to try again'), 'error');
      }
    });
    if (W.factories.map) {
      mapApi = W.factories.map({
        t: t,
        localeTag: localeTag,
        useF: useF,
        motionLevel: motionLevel,
        fmtTemp: fmtTemp,
        fmtWind: fmtWind,
        getPlaces: getMapPlaces,
        isFavorite: isFavorite,
        onSelectCity: openMapCity,
        resolveCity: reverseGeocode,
        onResolveCity: function (city) {
          const favorites = loadFavorites();
          const index = favorites.findIndex(function (favorite) { return sameCity(favorite,city) && !favorite.country && (favorite.name === 'Pinned place' || /°/.test(favorite.admin1 || '') || /°/.test(favorite.name || '')); });
          if (index < 0 || city.name === favorites[index].name) return;
          favorites[index] = Object.assign({},favorites[index],city);
          saveFavorites(favorites);
          nameCache.set(lang()+':'+cityKey(city),city.name);
          refreshListsFromCache({force:true,skipAmbient:true});
          if (mapApi) mapApi.updatePlaces(getMapPlaces());
        },
        onAddCity: function (city) {
          if (!city || isFavorite(city)) return false;
          toggleFavorite(city);
          if (!isFavorite(city)) return false;
          refreshListsFromCache({ force: true, skipAmbient: true });
          if (mapApi && mapApi.isOpen()) mapApi.updatePlaces(getMapPlaces());
          if (weatherMode === 'my-sky') mapMySkyRefreshPending = true;
          return true;
        },
        onOpen: function () {
          if (navigationApi && !mapNavigationSuspended) navigationApi.map();
          clearAutoRefresh();
          if (skyApi.pauseStormFx) skyApi.pauseStormFx(detailFx);
        },
        onClose: function () {
          if (navigationApi && !mapNavigationSuspended) navigationApi.close('map');
          if (isDetailShowingOrOpening() && skyApi.resumeStormFx) skyApi.resumeStormFx(detailFx);
          if (mapMySkyRefreshPending && weatherMode === 'my-sky') {
            mapMySkyRefreshPending = false;
            refresh(false, { quiet: true, reason: 'view' });
          } else {
            mapMySkyRefreshPending = false;
            if (isPageActive()) scheduleAutoRefresh();
          }
        }
      });
    }
  }


  // Shared Open-Meteo query (also used inside data module)
  // past_days=1 so hourly includes earlier hours of the local calendar day (Apple-style 00–24 charts)
  const FORECAST_Q =
    'current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure,visibility,precipitation,is_day'
    + '&hourly=temperature_2m,apparent_temperature,weather_code,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m,wind_direction_10m,relative_humidity_2m,surface_pressure,uv_index'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max'
    + '&temperature_unit=celsius&wind_speed_unit=ms&timezone=auto&forecast_days=10&past_days=1';
  /**
   * List rows show only current conditions plus today's H/L, so the list load asks
   * Open-Meteo for exactly that: no hourly series and no daily fields beyond the three it
   * renders. That is ~94% smaller per city than the full query (measured: 19,017 -> 1,171
   * bytes), and packs built from it are marked `needsEnrich` so opening a city upgrades it
   * to FORECAST_Q. Detail, sheets and enrichment always use the full FORECAST_Q.
   */
  const FORECAST_Q_LIST =
    'current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,precipitation,is_day'
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
    return !!(a && b && cityKey(a) === cityKey(b));
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

  function sheetContextText(kind, pack, timeZone, options) {
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
      options = options || {};
      const today = chartsApi.localDateKey(Date.now(), timeZone);
      const date = options.dayKey || today;
      const found = (daily.time || []).findIndex(value => String(value).slice(0,10) === date);
      const index = found >= 0 ? found : dailyTodayIndex(daily, timeZone);
      let high = dailyFieldAt(daily, 'temperature_2m_max', index);
      let low = dailyFieldAt(daily, 'temperature_2m_min', index);
      if (options.tempMode === 'feels') {
        const window = chartsApi.hourlyDateWindow(hourly, timeZone, date);
        const values = (hourly.apparent_temperature || []).slice(window.start,window.end)
          .filter(value => value != null && Number.isFinite(Number(value))).map(Number);
        if (!values.length) return '';
        high = Math.max.apply(null,values); low = Math.min.apply(null,values);
      }
      if (high == null || low == null || !Number.isFinite(Number(high)) || !Number.isFinite(Number(low))) return '';
      if (date !== today || options.tempMode === 'feels') {
        return t('weather.dailyRange', 'Daily range') + ' · ' + fmtTemp(low) + ' – ' + fmtTemp(high);
      }
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
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (e) {}
    if(pushApi)pushApi.placesChanged();
  }
  function isFavorite(c) {
    return loadFavorites().some((f) => sameCity(f, c));
  }
  function toggleFavorite(c) {
    let list = loadFavorites();
    const previous = list.slice();
    const previousPack = cache.get(cityKey(c));
    const removing = list.some((f) => sameCity(f, c));
    if (!removing && list.length >= 24) {
      notify(t('weather.savedPlacesLimit', 'My Sky holds 24 saved places. Remove a place before adding another.'), 'error');
      return list;
    }
    if (removing) {
      list = list.filter((f) => !sameCity(f, c));
    } else {
      list = [{
        name: c.name, admin1: c.admin1 || '', lat: c.lat, lon: c.lon, tz: c.tz,
        country: c.country || '', country_code: c.country_code || ''
      }, ...list.filter((f) => !sameCity(f, c))];
    }
    saveFavorites(list);
    if (!removing) {
      const savedPack = cache.get(cityKey(c));
      if (!savedPack || !savedPack.weather || savedPack.stored || Date.now()-savedPack.fetchedAt >= REFRESH_MS) {
        dataApi.loadCity(c,null,{enrich:false}).then(function () {
          if (isFavorite(c)) refreshListsFromCache({force:true});
        }).catch(function () { if (isFavorite(c)) refreshListsFromCache({force:true}); });
      }
    }
    notify(t(removing ? 'weather.notice.removed' : 'weather.notice.added',
      removing ? 'Removed from My Sky' : 'Added to My Sky'), null, removing ? function () {
      const current = loadFavorites().filter(city => !sameCity(city,c));
      const index = previous.findIndex(city => sameCity(city,c));
      current.splice(Math.min(index,current.length),0,c);
      saveFavorites(current);
      if (previousPack) cache.set(cityKey(c),previousPack);
      refreshListsFromCache({force:true});
      if (openCity && sameCity(openCity.city,c)) syncDetailFav(c);
      if(sheetIntentOpen && activeSheetKind === 'places') openPlacesSheet();
    } : null);
    const snapshot = removing ? savedSnapshotFor(c) : null;
    if (removing && !sameCity(c, myLocationCity) && !sameCity(c, selectedGreetingCity)
        && !(snapshot && snapshot.visited)) forgetSnapshotFor(c);
    return list;
  }

  function getMapPlaces() {
    const favorites = loadFavorites();
    const candidates = [myLocationCity, selectedGreetingCity].concat(favorites, MAJOR,
      savedSnapshots.map(function (pack) { return pack && pack.city; }));
    const seen = new Set();
    const places = [];
    candidates.forEach(function (city, index) {
      if (!city || !Number.isFinite(Number(city.lat)) || !Number.isFinite(Number(city.lon))) return;
      const key = cityKey(city);
      if (!key || seen.has(key)) return;
      seen.add(key);
      const pack = cache.get(key) || savedSnapshotFor(city);
      const current = pack && pack.weather && pack.weather.current || {};
      places.push({
        city: city,
        name: displayCityName(city),
        temperature: current.temperature_2m,
        weatherCode: current.weather_code,
        saved: !!((myLocationCity && sameCity(city, myLocationCity)) || favorites.some(function (fav) { return sameCity(city, fav); })),
        featured: index < (2 + favorites.length + 18)
      });
    });
    return places.slice(0, 120);
  }

  function openMapCity(city) {
    if (!city) return;
    const existing = cache.get(cityKey(city)) || savedSnapshotFor(city);
    // Selecting a place from the map starts its detail fetch; don't also trigger the
    // deferred My Sky refresh queued by a preceding Add action.
    mapMySkyRefreshPending = false;
    // A detail opened from the map returns to the map on close, not the main screen.
    if (mapApi && mapApi.isOpen()) detailReturnToMap = city;
    mapNavigationSuspended = true;
    if (mapApi) mapApi.close();
    mapNavigationSuspended = false;
    if (existing && existing.weather) {
      existing.city = Object.assign({},existing.city,city);
      openDetail(existing);
      return;
    }
    openDetailLoading(city);
    dataApi.loadCity(city, null, { enrich: true }).then(function (pack) {
      if (!pack || !pack.weather) {
        if (openCity && sameCity(openCity.city, city)) closeDetail();
        showError(t('weather.error', 'Could not load weather data.'));
        return;
      }
      cache.set(cityKey(city), pack);
      if (openCity && sameCity(openCity.city, city)) openDetail(pack);
    }).catch(function () {
      if (openCity && sameCity(openCity.city, city)) closeDetail();
      showError(t('weather.error', 'Could not load weather data.'));
    });
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
    if(pushApi)pushApi.placesChanged();
    opts = opts || {};
    if (!c) {
      const oldLocation = myLocationCity || loadMyLocation();
      try { localStorage.removeItem(MYLOC_KEY); } catch (e) {}
      myLocationCity = null;
      if (oldLocation && !isFavorite(oldLocation) && !sameCity(oldLocation, selectedGreetingCity)) forgetSnapshotFor(oldLocation);
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
    if(pushApi)pushApi.placesChanged();
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
    if(pushApi)pushApi.placesChanged();
    return true;
  }
  function readWeatherModePreference() {
    try {
      const mode = localStorage.getItem(MODE_KEY);
      return mode === 'horizon' || mode === 'my-sky' ? mode : null;
    } catch (e) { return null; }
  }
  function setWeatherMode(mode, remember, skipLoad) {
    if (mode !== 'horizon' && mode !== 'my-sky') return;
    const changed = weatherMode !== mode;
    if (weatherMode !== mode) greetingVisitSeed = null;
    if(changed && weatherMode) modeScroll[weatherMode]=window.scrollY;
    weatherMode = mode;
    document.body.dataset.weatherView = mode;
    if (remember) {
      weatherModeExplicit = true;
      try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
    }
    if (changed && !skipLoad) setViewLoading(true);
    refreshListsFromCache({ force: true });
    if(changed) requestAnimationFrame(function () {window.scrollTo({top:modeScroll[mode] || 0,behavior:'auto'});});
    if (!skipLoad) refresh(false, { quiet: true, reason: 'view' });
    else if (changed) setViewLoading(false);
  }

  function rememberHorizon() {
    try {localStorage.setItem('duskline-horizon-expanded',String(horizonExpanded));}catch(error){}
  }
  function requestWeatherMode(mode) {
    if (mode !== 'horizon' && mode !== 'my-sky' || mode === weatherMode) return;
    if (finishViewLoading) { finishViewLoading();finishViewLoading = null; }
    setViewLoading(true);
    setWeatherMode(mode,true);
  }

  async function reverseGeocode(lat, lon, signal) {
    const langParam = geocodeLangParam();
    // BigDataCloud client reverse geocode (browser-safe, no API key)
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${langParam}`;
      const data = await dataApi.fetchJson(url,signal);
      const name = data.city || data.locality || data.principalSubdivision || data.countryName;
      if (name) {
        return {
          name,
          admin1: data.principalSubdivision || '',
          lat, lon,
          country: shortCountryName(data.countryName, data.countryCode),
          country_code: String(data.countryCode || '').trim().toUpperCase()
        };
      }
    } catch (e) { /* fall through */ }
    // Nominatim fallback
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${langParam}`;
      const data = await dataApi.fetchJson(url,signal);
      const a = data.address || {};
      const name = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || data.name;
      if (name) {
        return {
          name,
          admin1: a.state || a.county || '',
          lat, lon,
          country: shortCountryName(a.country, a.country_code),
          country_code: String(a.country_code || '').trim().toUpperCase()
        };
      }
    } catch (e) { /* fall through */ }
    return {
      name: lat.toFixed(2) + '°, ' + lon.toFixed(2) + '°',
      admin1: signal ? '' : t('weather.myLocation', 'My Location'),
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

  /* Lucide SVG sprite aliases keep weather, action, and navigation glyphs consistent. */
  /* Lucide icon sprite is bundled locally; no third-party font or icon request. */
  function weatherIcon(name, cls) {
    const aliases = {
      'sun.max': 'sun', 'moon.stars': 'moon-star', 'cloud.sun': 'cloud-sun',
      'cloud.moon': 'cloud-moon', 'cloud.rain': 'cloud-rain', 'cloud.drizzle': 'cloud-drizzle',
      'cloud.heavyrain': 'duskline-cloud-rain-heavy', 'cloud.snow': 'cloud-snow', 'cloud.bolt': 'cloud-lightning',
      'cloud.fog': 'cloud-fog', drop: 'droplets', barometer: 'gauge', location: 'map-pin',
      'location.fill': 'map-pin', 'star.fill': 'star', checkmark: 'check', xmark: 'x',
      'arrow.clockwise': 'refresh-cw'
    };
    const glyph = aliases[name] || name || 'cloud';
    const className = cls || 'weather-icon';
    const href = glyph.indexOf('duskline-') === 0 ? '#' + glyph : '#lucide-' + glyph;
    return `<svg class="${escapeHtml(className)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="${href}" xlink:href="${href}"/></svg>`;
  }

  function condIcon(code, night, cls) {
    const c = cls || 'weather-row-icon';
    if(code == null || code === '' || !Number.isFinite(Number(code))) return weatherIcon('cloud',c);
    if (code >= 95) return weatherIcon('cloud.bolt', c);
    if (code >= 71 && code < 80) return weatherIcon('cloud.snow', c);
    if (code >= 85 && code < 90) return weatherIcon('cloud.snow', c);
    if (code === 82 || code === 65) return weatherIcon('cloud.heavyrain', c);
    if (code === 80 || code === 61) return weatherIcon('cloud.drizzle', c);
    if ((code >= 81 && code <= 82) || code === 63) return weatherIcon('cloud.rain', c);
    if (code === 66 || code === 67 || code === 56 || code === 57) return weatherIcon('duskline-freezing-rain', c);
    if (code === 55) return weatherIcon('cloud.rain', c);
    if (code >= 51 && code < 60) return weatherIcon('cloud.drizzle', c);
    if (code === 45 || code === 48) return weatherIcon('cloud.fog', c);
    if (code === 3) return weatherIcon('cloud', c);
    if (code === 2) return weatherIcon(night ? 'cloud.moon' : 'cloud.sun', c);
    if (code === 1) return weatherIcon(night ? 'moon.stars' : 'cloud.sun', c);
    return weatherIcon(night ? 'moon.stars' : 'sun.max', c);
  }

  function modLabelIcon(key) {
    const map = {
      aqi: 'duskline-aqi', feels: 'thermometer', humidity: 'drop', wind: 'wind',
      uv: 'sun.max', vis: 'eye', pressure: 'barometer', precip: 'umbrella',
      sun: 'sunrise', conditions: 'cloud.sun'
    };
    return weatherIcon(map[key] || 'cloud', 'weather-mod-icon');
  }

  function savedPlaceIcon(saved) {
    return weatherIcon(saved ? 'checkmark' : 'plus', 'weather-save-icon');
  }
  function removeLocationIcon() {
    return weatherIcon('xmark', 'weather-save-icon');
  }
  function savedPlaceLabel(saved) {
    return t(saved ? 'weather.removeFromMySky' : 'weather.addToMySky', saved ? 'Remove from My Sky' : 'Add to My Sky');
  }

  function locBadgeHtml() {
    return `<span class="weather-row-loc" aria-hidden="true">${weatherIcon('location.fill', 'weather-loc-icon')}</span>`;
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
  function isNightForPack(pack, time) {
    const current = pack.weather && pack.weather.current || {};
    if (!time && current.is_day != null) return !Number(current.is_day);
    const tz = cityTimeZone(pack, pack.city);
    const daily = pack.weather && pack.weather.daily || {};
    const targetDate = time ? chartsApi.localDateKey(stampToMs(time,tz),tz) : chartsApi.localDateKey(Date.now(),tz);
    const index = (daily.time || []).findIndex(value => String(value).slice(0,10) === targetDate);
    const rise = stampToMs(dailyFieldAt(daily, 'sunrise', index), tz);
    const set = stampToMs(dailyFieldAt(daily, 'sunset', index), tz);
    const now = time ? stampToMs(time, tz) : Date.now();
    if (Number.isFinite(rise) && Number.isFinite(set)) return now < rise || now >= set;
    const hour = time ? wallHour(time, tz) : localHourForPack(pack);
    return hour < 6 || hour >= 20;
  }

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
  if (W.factories.product) productApi = W.factories.product({
    t: t, escapeHtml: escapeHtml, cityKey: cityKey, sameCity: sameCity, cache: cache,
    cities: MAJOR, fmtTemp: fmtTemp, condLabel: condLabel, cityName: displayCityName,
    localHour: localHourForPack, mode: function () { return weatherMode; },
    getPrimary: getGreetingSourceCity,
    updated: function (pack) { return [rowUpdatedLabel(pack), locationLocatedLabel(pack.city)].filter(Boolean).join(' · '); }, insight: detailWeatherInsight, night: isNightForPack,
    range: function (pack) { return dayHiLo(pack.weather.daily || {}, dailyTodayIndex(pack.weather.daily || {},cityTimeZone(pack,pack.city)),pack.weather.current.temperature_2m); },
    stamp: function (time, pack) { return stampToMs(time, cityTimeZone(pack,pack.city)); },
    clock: function (time, pack) { return formatClock(time, cityTimeZone(pack,pack.city)); },
    shortClock: function (time,pack) { const zone = cityTimeZone(pack,pack.city); try { return new Intl.DateTimeFormat(localeTag(),{hour:'numeric',timeZone:zone}).format(new Date(stampToMs(time,zone))); } catch (error) { return formatClock(time,zone); } },
    palette: function (element, pack) {
      const night = isNightForPack(pack);
      const hour = localHourForPack(pack);
      const palette = skyApi.primaryPalette(pack.weather.current.weather_code,night,hour);
      element.style.setProperty('--wx-sky-1',palette.top);
      element.style.setProperty('--wx-sky-2',palette.bottom);
      element.dataset.weatherPalette = palette.name;
    },
    plan: function (pack) {
      const zone=cityTimeZone(pack,pack.city),rain=W.planning.rainWindow(pack.weather.hourly || {},time=>stampToMs(time,zone),Date.now());
      if(!rain) return '';
      const clock=new Intl.DateTimeFormat(localeTag(),{weekday:'short',hour:'numeric',minute:'2-digit',timeZone:zone});
      return '<span>'+escapeHtml(t('weather.chanceOfPrecipitation','Chance of precipitation'))+'</span><strong>'+Math.round(rain.peak)+'% · '+escapeHtml(clock.format(rain.start))+' – '+escapeHtml(clock.format(rain.end))+'</strong>'+(rain.amount == null?'':'<small>'+escapeHtml(fmtPrecip(rain.amount))+'</small>');
    },
    dailyPreview: function (pack) { return chartsApi.dailyBarsHtml(pack.weather.daily || {}, {
      timeZone:cityTimeZone(pack,pack.city), hourly:pack.weather.hourly, limit:5, skipToday:true
    }); },
    dateKey: function (time,pack) { const zone=cityTimeZone(pack,pack.city); return chartsApi.localDateKey(stampToMs(time,zone),zone); },
    openDay: async function (city, date, hourIndex) {
      const cached = cache.get(cityKey(city));
      if (!cached || !cached.weather) return;
      openDetail(cached);
      const pack = cached.needsEnrich && !cached.stored ? await dataApi.loadCity(city,null,{enrich:true}).catch(function () { return null; }) : cached;
      if (!pack || !pack.weather || !openCity || !sameCity(openCity.city,city) || sheetIntentOpen) return;
      openSheet('day',pack,{dayKey:date,hourIndex:hourIndex});
    },
    bindHourly: chartsApi.bindHourlyList,
    icon: condIcon, repaint: function () { horizonExpanded = true; rememberHorizon(); refreshListsFromCache({force:true}); refresh(false,{quiet:true,reason:'view'}); },
    expanded: function () { return horizonExpanded; },
    collapseHorizon: function () { horizonExpanded = false; rememberHorizon(); refreshListsFromCache({force:true}); },
    enrich: function (city) { return dataApi.loadCity(city,null,{enrich:true}); },
    open: openMapCity
  });
  if (W.factories.navigation) navigationApi = W.factories.navigation({
    mapOpen: function () { return mapApi && mapApi.isOpen(); },
    dismissMap: function () { if(mapApi) mapApi.close(); },
    openMap: function () {
      if (openCity) {detailReturnToMap=openCity.city;return;}
      if (detailReturnToMap && detailEl.classList.contains('is-closing')) return;
      if(mapApi) mapApi.open({places:getMapPlaces(),returnFocus:mapOpenBtn});
    },
    sameCity: sameCity, dismissSheet: closeSheet, dismissDetail: closeDetail,
    currentCity: function () { return openCity && openCity.city; }, sheetOpen: function () { return sheetIntentOpen; },
    openCity: function (city) {
      const pack = cache.get(cityKey(city));
      if (pack && pack.weather) openDetail(pack);
      else { openDetailLoading(city); dataApi.loadCity(city,null,{enrich:true}).then(function (fresh) {
        if (fresh && fresh.weather && openCity && sameCity(openCity.city,city)) openDetail(fresh);
      }).catch(function () { closeDetail(); }); }
    },
    openSheet: function (kind, options) {
      if (kind === 'install') openInstallHelp();
      else if (kind === 'places') openPlacesSheet();
      else if (kind === 'units') openUnitsSheet();
      else if (kind === 'notifications') openNotificationSettings();
      else if (kind === 'primary') openGreetingLocationSheet();
      else if (openCity && openCity.weather) openSheet(kind,openCity,options);
    }
  });

  var pushApi=W.factories.pushNotifications({t,locale:localeTag,cityName:displayCityName,primary:getGreetingSourceCity,places:function(){return greetingSourceOptions().map(option=>option.city);}});
  W.pushNotifications=pushApi;

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
    target.textContent = t('weather.checked', 'Checked') + ' ' + formatUpdatedStamp(ts);
  }
  /** Short stamp for list rows (and offline/unavailable state). */
  function rowUpdatedLabel(pack) {
    if (!pack) return '';
    if (pack.error) return t('weather.unavailable', 'Unavailable');
    if (pack.stored && pack.fetchedAt) {
      return t('weather.savedForecast', 'Saved forecast') + ' · ' + formatUpdatedStamp(pack.fetchedAt);
    }
    if (pack.fetchedAt) {
      return t('weather.checked', 'Checked') + ' ' + formatUpdatedStamp(pack.fetchedAt);
    }
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
    notify(msg, 'error');
  }

  function buildRowButton(pack, favoriteKeys) {
    const c = pack.city || {};
    const li = document.createElement('li');
    const fav = favoriteKeys ? favoriteKeys.has(cityKey(c)) : isFavorite(c);

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
          if (fresh && fresh.weather && openCity && openCity.city && sameCity(openCity.city, c)) openDetail(fresh);
          else if (!fresh || !fresh.weather) {
            if (isDetailVisible() && openCity && openCity.city && sameCity(openCity.city, c)) closeDetail();
            showError(t('weather.error', 'Could not load weather data.'));
          }
          replaceCityCard(c, fresh);
        } catch (e) {
          if (isDetailVisible() && openCity && openCity.city && sameCity(openCity.city, c)) closeDetail();
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
          if (!fresh || !fresh.weather) {
            showError(t('weather.error', 'Could not load weather data.'));
            return;
          }
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
    const night = isNightForPack(pack);
    const seed = Math.abs(Math.round((c.lat || 0) * 100) + Math.round((c.lon || 0) * 10));

    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'weather-row';
    applySky(row, code, cur.time, {
      hour, seed, isRow: true, night: isNightForPack(pack),
      noOrnaments: true,
      timeZone: cityTimeZone(pack, c),
      precipMm: cur.precipitation,
      windDeg: cur.wind_direction_10m,
      windMs: cur.wind_speed_10m,
      humidity: cur.relative_humidity_2m,
      visibility: cur.visibility
    });

    const rowAlerts = alertsApi.currentAlerts(pack.alerts);
    const alert = rowAlerts[0] || null;
    const alertSev = alert ? String(alert.severity || '').toLowerCase() : '';
    const alertTone = alertSev === 'extreme' || alertSev === 'severe'
      ? 'weather-row-alert--severe'
      : (alertSev === 'moderate' ? 'weather-row-alert--moderate' : 'weather-row-alert--minor');
    const alertRowLabel = rowAlerts.length > 1
      ? t('weather.alertsCount', '{count} alerts').replace('{count}', String(rowAlerts.length))
      : (alert ? String(alert.event || t('weather.alert', 'Alert')) : '');
    const rowInsight = rowWeatherInsight(pack);
    // Keep the weather condition visible and give warnings their own count badge.
    const statusLine = `<div class="weather-row-status">
        <div class="weather-row-cond">${condIcon(code, night)}<span>${escapeHtml(condLabel(code))}</span></div>
        ${alert ? `<span class="weather-row-alert ${alertTone}" aria-label="${escapeHtml(alertRowLabel)}">${weatherIcon('duskline-alert-triangle', 'weather-row-alert-icon')}<span>${escapeHtml(alertRowLabel)}</span></span>` : ''}
      </div>`;

    const main = document.createElement('div');
    const stamp = rowUpdatedLabel(pack);
    const locStamp = locationLocatedLabel(c);
    const stampLine = [stamp, locStamp].filter(Boolean).join(' · ');
    main.className = 'weather-row-main';
    main.innerHTML = `
        <div class="weather-row-city"><span class="weather-row-city-name">${escapeHtml(displayCityName(c))}</span></div>
        <div class="weather-row-meta">${escapeHtml(localTime)}${[displayAdmin1(c),c.country].filter((part,index,all)=>part && part.toLowerCase() !== displayCityName(c).toLowerCase() && all.indexOf(part)===index).map(part=>' · '+escapeHtml(part)).join('')}</div>
        ${statusLine}
        ${rowInsight ? '<div class="weather-row-insight">' + escapeHtml(rowInsight) + '</div>' : ''}
        ${stampLine ? '<div class="weather-row-updated">' + escapeHtml(stampLine) + '</div>' : ''}`;

    const temps = document.createElement('div');
    temps.className = 'weather-row-temps';
    temps.innerHTML = `
        <div class="weather-row-temp">${fmtTemp(cur.temperature_2m)}</div>
        <div class="weather-row-hl">${t('weather.high', 'H')}:${fmtTemp(hi)}  ${t('weather.low', 'L')}:${fmtTemp(lo)}</div>`;

    const cityLab = displayCityName(c) || c.name || '';
    const tempLab = fmtTemp(cur.temperature_2m);
    row.setAttribute('aria-label', [cityLab, tempLab, condLabel(code), alertRowLabel,
      t('weather.high', 'H') + ' ' + fmtTemp(hi),
      t('weather.low', 'L') + ' ' + fmtTemp(lo), rowInsight || stampLine].filter(Boolean).join(', '));

    const open = () => {
      restoreFocus(row);
      openDetail(pack);
    };
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
    // Saving and removing places belongs in search and city details, keeping lists quiet.
    return li;
  }

  let pressedCityRow = null;
  let cityPointerGeneration = 0;
  const heldCityPaints = new Map();
  document.addEventListener('pointerdown', function (event) {
    if (event.isPrimary === false) return;
    const row = event.target.closest && event.target.closest('.weather-row');
    if (!row) return;
    pressedCityRow = row;
    cityPointerGeneration++;
  },true);
  function releaseCityPaints() {
    const generation = cityPointerGeneration;
    // Click dispatch follows pointerup; keep its original target connected.
    requestAnimationFrame(function () {
      if (generation !== cityPointerGeneration) return;
      pressedCityRow = null;
      const paints = Array.from(heldCityPaints.values());
      heldCityPaints.clear();
      paints.forEach(function (paint) { paint(); });
    });
  }
  document.addEventListener('pointerup',releaseCityPaints,true);
  document.addEventListener('pointercancel',releaseCityPaints,true);
  window.addEventListener('blur',releaseCityPaints);

  function renderCityList(ul, packs, opts) {
    if (!ul) return;
    if (pressedCityRow && ul.contains(pressedCityRow)) {
      heldCityPaints.set('list:'+ul.id,function () { refreshListsFromCache({force:true,skipAmbient:true}); });
      return;
    }
    opts = opts || {};
    ul.innerHTML = '';
    let region = '';
    packs.forEach((pack) => {
      const nextRegion = pack && pack.city && pack.city.region;
      if (opts.regions !== false && nextRegion && nextRegion !== region) {
        const heading = document.createElement('li');
        heading.className = 'weather-region-heading';
        heading.setAttribute('role', 'presentation');
        heading.textContent = t('region.' + nextRegion, nextRegion);
        ul.appendChild(heading);
        region = nextRegion;
      }
      const item = buildRowButton(pack, opts.favoriteKeys);
      item.dataset.cityKey = cityKey(pack.city || {});
      ul.appendChild(item);
    });
  }

  function replaceCityCard(city, pack) {
    const key = cityKey(city || (pack && pack.city) || {});
    const favoriteKeys = new Set(loadFavorites().map(cityKey));
    const lists = [myLocListEl, favListEl, listEl];
    for (const list of lists) {
      if (!list || list.closest('[hidden]')) continue;
      const current = list.querySelector('li[data-city-key="' + CSS.escape(key) + '"]');
      if (!current) continue;
      if (pressedCityRow && current.contains(pressedCityRow)) {
        heldCityPaints.set(key,function () { replaceCityCard(city,cache.get(key) || pack); });
        return true;
      }
      const focused = current.contains(document.activeElement) ? document.activeElement : null;
      const focusSave = focused && focused.classList.contains('weather-row-save');
      const next = buildRowButton(pack, favoriteKeys);
      next.dataset.cityKey = key;
      current.replaceWith(next);
      if (focused) restoreFocus(next.querySelector(focusSave ? '.weather-row-save' : '.weather-row'));
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
  function forecastWindGustInsight(pack, timeZone) {
    const weather = pack && pack.weather || {};
    const current = weather.current || {};
    const hourly = weather.hourly || {};
    const times = hourly.time || [];
    const gusts = hourly.wind_gusts_10m || [];
    const now = Date.now();
    let peak = null;
    for (let i = 0; i < times.length; i++) {
      const at = stampToMs(times[i], timeZone);
      const gust = Number(gusts[i]);
      if (!Number.isFinite(at) || at < now - 30 * 60 * 1000 || at > now + 18 * 60 * 60 * 1000
          || !Number.isFinite(gust)) continue;
      if (!peak || gust > peak.value) peak = { value: gust, time: times[i] };
    }
    if ((!peak || current.wind_gusts_10m != null && Number(current.wind_gusts_10m) > peak.value)
        && current.wind_gusts_10m != null && Number.isFinite(Number(current.wind_gusts_10m))) {
      peak = { value: Number(current.wind_gusts_10m), time: current.time };
    }
    if (!peak || peak.value < 18) return '';
    const time = peak.time ? formatClock(peak.time, timeZone) : '';
    return t('weather.context.wind.gusts', 'Wind gusts may reach {value} around {time}; exposed areas can feel much windier.')
      .replace('{value}', fmtWind(peak.value))
      .replace('{time}', time || t('weather.today', 'today'));
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
    if (pack.stored) return rowUpdatedLabel(pack);
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

    const selectedScale = aqiScale(pack.city);
    const airRaw = aqiCurrentValue(pack.air && pack.air.current, selectedScale);
    const airValue = Number(airRaw);
    if (airRaw != null && airRaw !== '' && Number.isFinite(airValue)) {
      const description = aqiGreetingDescription(airValue, selectedScale);
      const band = aqiBandKey(airValue, selectedScale);
      // Satisfactory air quality is useful in the detail sheet, but adds little
      // to a personal hello. Keep the greeting focused on timely conditions.
      const score = selectedScale === 'eu'
        ? ({ Moderate: 25, Poor: 76, VeryPoor: 90, ExtremelyPoor: 96 })[band]
        : ({ Moderate: 25, UnhealthySG: 76, Unhealthy: 84, VeryUnhealthy: 90, Hazardous: 96 })[band];
      add(score, description);
    }
    add(78, forecastWindGustInsight(pack, timeZone));

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
  function detailWeatherInsight(pack) {
    if (pack.stored) return "";
    if (!pack || !pack.weather) return '';
    const tz = cityTimeZone(pack, pack.city);
    const parts = localDateTimeParts(tz);
    const current = pack.weather.current || {};
    const hourly = pack.weather.hourly || {};
    const daily = pack.weather.daily || {};
    const precipScore = greetingPrecipitationScore(pack, tz);
    const precip = sheetContextText('precip', pack, tz);
    const tomorrow = greetingTomorrowInsight(pack, tz);
    const wind = Number(current.wind_speed_10m);
    const windText = current.wind_speed_10m != null && Number.isFinite(wind)
      ? t('weather.wind', 'Wind') + ': ' + fmtWind(wind) + '.' : '';
    const scale = aqiScale(pack.city);
    const aqi = Number(aqiCurrentValue(pack.air && pack.air.current, scale));
    const aqiText = Number.isFinite(aqi) && pack.air && pack.air.current
      ? aqiGreetingDescription(aqi, scale) : '';
    const aqiBand = aqiBandKey(aqi, scale);
    const poorAir = scale === 'eu'
      ? ['Poor', 'VeryPoor', 'ExtremelyPoor'].indexOf(aqiBand) >= 0
      : aqi >= 101;
    const gustText = forecastWindGustInsight(pack, tz);
    const dayIndex = dailyTodayIndex(daily, tz);
    const uvMax = Number(dailyFieldAt(daily, 'uv_index_max', dayIndex));
    const uvNow = hourlyNowValue(hourly, 'uv_index', tz);
    const uv = Math.max(Number.isFinite(uvMax) ? uvMax : 0, Number.isFinite(uvNow) ? uvNow : 0);
    const uvText = greetingIsDaylight(daily, tz, parts, uvNow) && uv >= 3
      ? sheetContextText('uv', pack, tz) : '';
    if (precipScore >= 62 && precip) return precip;
    if (poorAir && aqiText) return aqiText;
    if (gustText) return gustText;
    if (wind >= 14 && windText) return windText;
    if (uv >= 6 && uvText) return uvText;
    if ((parts.hour >= 20 || parts.hour < 5) && tomorrow) return tomorrow;
    if (precipScore >= 48 && precip) return precip;
    if (wind >= 8 && windText) return windText;
    if (uvText) return uvText;
    if (scale === 'us' && aqi >= 51 && aqiText) return aqiText;
    return tomorrow || '';
  }

  /** Compact, actionable context for the saved-city list. Keep routine weather quiet. */
  function rowWeatherInsight(pack) {
    if (pack.stored) return "";
    if (!pack || !pack.weather || !pack.weather.current) return '';
    const tz = cityTimeZone(pack, pack.city);
    const current = pack.weather.current || {};
    const hourly = pack.weather.hourly || {};
    const daily = pack.weather.daily || {};
    const precipScore = greetingPrecipitationScore(pack, tz);
    if (precipScore >= 62) {
      const precipitation = sheetContextText('precip', pack, tz);
      if (precipitation) return precipitation;
    }

    const scale = aqiScale(pack.city);
    const aqiRaw = aqiCurrentValue(pack.air && pack.air.current, scale);
    const aqi = Number(aqiRaw);
    const band = aqiBandKey(aqi, scale);
    const poorAir = scale === 'eu'
      ? ['Poor', 'VeryPoor', 'ExtremelyPoor'].indexOf(band) >= 0
      : Number.isFinite(aqi) && aqi >= 101;
    if (poorAir && aqiRaw != null) return aqiGreetingDescription(aqi, scale);

    const gusts = forecastWindGustInsight(pack, tz);
    if (gusts) return gusts;

    const wind = Number(current.wind_speed_10m);
    if (current.wind_speed_10m != null && Number.isFinite(wind) && wind >= 14) {
      const windInsight = sheetContextText('wind', pack, tz);
      if (windInsight) return windInsight;
    }

    const dayIndex = dailyTodayIndex(daily, tz);
    const uvNow = hourlyNowValue(hourly, 'uv_index', tz);
    const uvMax = dailyFieldAt(daily, 'uv_index_max', dayIndex);
    const uvPeak = uvMax != null && uvMax !== '' && Number.isFinite(Number(uvMax))
      ? Number(uvMax) : uvNow;
    const uv = Math.max(Number.isFinite(Number(uvPeak)) ? Number(uvPeak) : 0,
      Number.isFinite(Number(uvNow)) ? Number(uvNow) : 0);
    const parts = localDateTimeParts(tz);
    if (uv >= 6 && greetingIsDaylight(daily, tz, parts, uvNow)) {
      return sheetContextText('uv', pack, tz);
    }
    return '';
  }
  function finishGreetingTyping(text) {
    window.clearTimeout(greetingTypeTimer);
    greetingTypeGeneration++;
    const finalText = text == null ? lastGreetingText : String(text);
    if (finalText) {
      lastGreetingText = finalText;
      if (greetingTitleEl) greetingTitleEl.setAttribute('aria-label', finalText);
      if (greetingSizerEl) greetingSizerEl.textContent = finalText;
      if (greetingTextEl) greetingTextEl.textContent = finalText;
      if (greetingTitleEl) {
        greetingTitleEl.removeAttribute('data-typing');
        greetingTitleEl.removeAttribute('data-font-preparing');
      }
    }
  }
  function prepareTypewriter(element, fullText, direction) {
    const style = getComputedStyle(element);
    const ink = style.color;
    const shadow = style.textShadow;
    const segmenter = typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter(lang(), { granularity: 'grapheme' }) : null;
    const wordSegmenter = typeof Intl.Segmenter === 'function'
      ? new Intl.Segmenter(lang(), { granularity: 'word' }) : null;
    const splitGraphemes = function (text) {
      return segmenter
        ? Array.from(segmenter.segment(text), part => part.segment)
        : Array.from(text);
    };
    const runs = [];
    let prefix = '';
    const tokens = wordSegmenter
      ? Array.from(wordSegmenter.segment(fullText))
      : (fullText.match(/\s+|\S+/gu) || []).map(function (text) {
          return { segment: text, isWordLike: !/^\s+$/u.test(text) };
        });
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const text = token.segment;
      if (/^\s+$/u.test(text)) {
        runs.push({ text, whitespace: true });
        continue;
      }
      if (token.isWordLike === false) {
        const previous = runs[runs.length - 1];
        const next = tokens[i + 1];
        const hasSpaceBefore = previous && previous.whitespace;
        const hasSpaceAfter = next && /^\s+$/u.test(next.segment);
        // Keep spaced punctuation (em dashes, middle dots, and similar separators)
        // between its original spaces. Folding it into the next word moves the mark
        // and drops the space after it in the typewriter DOM.
        if (hasSpaceBefore && hasSpaceAfter) {
          runs.push({ text, whitespace: false });
          continue;
        }
        if (previous && !previous.whitespace) previous.text += text;
        else prefix += text;
        continue;
      }
      const cjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(text);
      const pieces = cjk ? splitGraphemes(text) : [text];
      if (prefix && pieces.length) {
        pieces[0] = prefix + pieces[0];
        prefix = '';
      }
      pieces.forEach(piece => runs.push({ text: piece, whitespace: false }));
    }
    if (prefix) {
      const previous = runs[runs.length - 1];
      if (previous && !previous.whitespace) previous.text += prefix;
      else runs.push({ text: prefix, whitespace: false });
    }
    const glyphs = [];
    const measurements = [];
    const fragment = document.createDocumentFragment();
    for (const run of runs) {
      const chars = splitGraphemes(run.text);
      if (run.whitespace) {
        fragment.appendChild(document.createTextNode(run.text));
        chars.forEach(() => glyphs.push(null));
        continue;
      }
      const word = document.createElement('span');
      word.className = 'weather-typewriter-word';
      word.setAttribute('aria-hidden', 'true');
      word.dataset.text = run.text;
      word.style.setProperty('--wx-typewriter-ink', ink);
      word.style.setProperty('--wx-typewriter-shadow', shadow);
      word.style.setProperty('--wx-typewriter-clip', direction === 'rtl'
        ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)');
      word.textContent = run.text;
      fragment.appendChild(word);
      const textNode = word.firstChild;
      let offset = 0;
      for (const char of chars) {
        offset += char.length;
        glyphs.push(null);
        measurements.push({ index: glyphs.length - 1, word, textNode, offset });
      }
    }
    element.replaceChildren(fragment);
    const wordRects = new Map();
    measurements.forEach(function (measurement) {
      const range = document.createRange();
      range.setStart(measurement.textNode, 0);
      range.setEnd(measurement.textNode, measurement.offset);
      const rangeRect = range.getBoundingClientRect();
      let wordRect = wordRects.get(measurement.word);
      if (!wordRect) {
        wordRect = measurement.word.getBoundingClientRect();
        wordRects.set(measurement.word, wordRect);
      }
      const width = direction === 'rtl'
        ? Math.max(0, wordRect.right - rangeRect.left)
        : Math.max(0, rangeRect.right - wordRect.left);
      glyphs[measurement.index] = { word: measurement.word, width, direction };
    });
    return glyphs;
  }
  function revealTypewriterGlyph(glyph) {
    if (!glyph) return null;
    const width = glyph.width.toFixed(2) + 'px';
    glyph.word.style.setProperty('--wx-typewriter-clip', glyph.direction === 'rtl'
      ? `inset(0 0 0 calc(100% - ${width}))`
      : `inset(0 calc(100% - ${width}) 0 0)`);
    return { rect: glyph.word.getBoundingClientRect(), width: glyph.width, direction: glyph.direction };
  }
  function waitForGreetingFont(element, text) {
    if (!document.fonts || typeof document.fonts.load !== 'function') return null;
    const style = getComputedStyle(element);
    const font = style.font || [style.fontStyle, style.fontWeight, style.fontSize, style.fontFamily].join(' ');
    let loading;
    try {
      loading = typeof window.__dusklineLoadGreetingFont === 'function'
        ? window.__dusklineLoadGreetingFont(font, text)
        : document.fonts.load(font, text);
    } catch (error) {
      return Promise.resolve(false);
    }
    let timeout;
    const expired = new Promise(function (resolve) {
      timeout = window.setTimeout(function () { resolve(false); }, 1200);
    });
    return Promise.race([
      Promise.resolve(loading).then(function () { return true; }, function () { return false; }),
      expired
    ]).then(function (ready) {
      window.clearTimeout(timeout);
      return ready;
    });
  }
  function typeGreeting(fullText, animate) {
    if (animate) {animate = !greetingAnimated;greetingAnimated=true;}
    if (!greetingTitleEl || !greetingTextEl) return;
    if (fullText === lastGreetingText) return;
    const wasTyping = greetingTitleEl.hasAttribute('data-typing');
    window.clearTimeout(greetingTypeTimer);
    const generation = ++greetingTypeGeneration;
    lastGreetingText = fullText;
    greetingTitleEl.setAttribute('aria-label', fullText);
    if (greetingSizerEl) greetingSizerEl.textContent = fullText;
    // Forecast data can arrive in stages. If it changes during a reveal, replace
    // the copy in one frame rather than restarting the typewriter at a new line.
    if (!animate || !motionFull() || wasTyping) {
      greetingTextEl.textContent = fullText;
      greetingTitleEl.removeAttribute('data-typing');
      greetingTitleEl.removeAttribute('data-font-preparing');
      return;
    }
    const beginTypewriter = function () {
      if (generation !== greetingTypeGeneration) return;
      const chars = typeof Intl.Segmenter === 'function'
        ? Array.from(new Intl.Segmenter(lang(), { granularity: 'grapheme' }).segment(fullText), part => part.segment)
        : Array.from(fullText);
      let shown = 0;
      const interval = Math.min(1400, Math.max(380, chars.length * 26)) / Math.max(1, chars.length);
      const direction = getComputedStyle(greetingTextEl).direction;
      const glyphs = prepareTypewriter(greetingTextEl, fullText, direction);
      greetingTitleEl.style.setProperty('--wx-greeting-caret-x', '0px');
      greetingTitleEl.style.setProperty('--wx-greeting-caret-y', '0px');
      greetingTitleEl.setAttribute('data-typing', 'true');
      greetingTitleEl.removeAttribute('data-font-preparing');
      const tick = function () {
        if (generation !== greetingTypeGeneration) return;
        shown++;
        const glyphRect = revealTypewriterGlyph(glyphs[shown - 1]);
        const titleRect = greetingTitleEl.getBoundingClientRect();
        if (glyphRect) {
          const caretX = glyphRect.direction === 'rtl'
            ? glyphRect.rect.right - glyphRect.width - titleRect.left - 2
            : glyphRect.rect.left + glyphRect.width - titleRect.left + 2;
          greetingTitleEl.style.setProperty('--wx-greeting-caret-x', Math.max(0, Math.min(caretX, titleRect.width - 2)) + 'px');
          greetingTitleEl.style.setProperty('--wx-greeting-caret-y', glyphRect.rect.top - titleRect.top + 2 + 'px');
        }
        if (shown < chars.length) greetingTypeTimer = window.setTimeout(tick, interval);
        else { greetingTextEl.textContent = fullText; greetingTitleEl.removeAttribute('data-typing'); }
      };
      greetingTypeTimer = window.setTimeout(tick, interval);
    };
    const fontReady = waitForGreetingFont(greetingTextEl, fullText);
    if (!fontReady) {
      beginTypewriter();
      return;
    }
    // Keep the sentence in layout while its web font settles. Measure glyph widths only
    // after the font is ready, avoiding first-visit jumps when the fallback is replaced.
    greetingTextEl.textContent = fullText;
    greetingTitleEl.setAttribute('data-font-preparing', 'true');
    fontReady.then(function (ready) {
      if (generation !== greetingTypeGeneration) return;
      greetingTitleEl.removeAttribute('data-font-preparing');
      if (ready) beginTypewriter();
      else {
        greetingTextEl.textContent = fullText;
        greetingTitleEl.removeAttribute('data-typing');
      }
    });
  }
  function typeDetailInsight(element, text, city) {
    if (!element) return;
    window.clearTimeout(detailInsightTimer);
    const generation = ++detailInsightGeneration;
    const key = cityKey(city) + ':' + text;
    const shouldAnimate = motionFull() && key !== lastDetailInsightKey;
    lastDetailInsightKey = key;
    element.setAttribute('aria-label', text);
    if (!shouldAnimate || !text) {
      element.textContent = text;
      element.removeAttribute('data-typing');
      return;
    }
    element.textContent = text;
    element.classList.add('wx-insight-reveal');
    detailInsightTimer=window.setTimeout(function () {element.classList.remove('wx-insight-reveal');},180);
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
    let animateGreeting = weatherMode === 'horizon';
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
      } else if (pack.stored) {
        fullText = t('weather.greeting.saved', '{greeting} — saved forecast for {place}, checked {time}.').replace('{greeting}', greet).replace('{place}', displayCityName(selectedCity)).replace('{time}', formatUpdatedStamp(pack.fetchedAt));
      } else if (cur.temperature_2m == null || cur.temperature_2m === '' || !Number.isFinite(Number(cur.temperature_2m))
          || greetingWeatherCode(cur.weather_code) == null) {
        fullText = t('weather.greeting.currentUnavailable', '{greeting} — current conditions are unavailable in {place}.')
          .replace('{greeting}', greet).replace('{place}', displayCityName(selectedCity));
      } else {
        animateGreeting = true;
        fullText = greet+' · '+displayCityName(selectedCity);
      }
    } else {
      const horizonFallbacks = [
        'explore the weather unfolding around the world.',
        'see how conditions change from city to city.',
        'follow the day’s skies across the globe.',
        'discover forecasts from cities near and far.',
        'from sunshine to showers, see what the day brings.',
        'take a closer look at weather around the world.',
        'a world of weather is waiting to be explored.',
        'see where clouds are gathering and skies are clearing.',
        'check in on forecasts from near and far.',
        'each city has its own forecast. See what today brings.',
        'follow the sunshine, showers, and changing skies.',
        'explore current conditions in cities around the world.',
        'look beyond the horizon to see what the forecast holds.',
        'watch the forecast shift as the day moves along.',
        'see what the weather has in store across the map.'
      ];
      fullText = greet + t('weather.greeting.separator', '. ')
        + t('weather.greeting.horizon' + choice, horizonFallbacks[choice]);
    }
    typeGreeting(fullText, animateGreeting);
    const manage=document.getElementById('weatherManagePlaces');
    if(manage) manage.hidden=weatherMode !== 'my-sky' || !greetingSourceOptions().length;
    if (greetingPlaceBtn) {
      greetingPlaceBtn.removeAttribute('data-i18n');
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
    // Block mid-load repaints to avoid flicker during concurrent refreshes
    if (listPaintLocked && !opts.force) return;
    const focusedRow = document.activeElement && document.activeElement.closest
      ? document.activeElement.closest('li[data-city-key]') : null;
    const focusKey = focusedRow && focusedRow.dataset.cityKey;
    const focusSave = document.activeElement && document.activeElement.classList
      && document.activeElement.classList.contains('weather-row-save');

    if (!myLocationCity) myLocationCity = loadMyLocation();
    if (!selectedGreetingCity) selectedGreetingCity = loadGreetingCity();
    const favs = loadFavorites();
    const favKeys = new Set(favs.map(cityKey));
    if (!weatherModeExplicit && !weatherMode) {
      const savedMode = readWeatherModePreference();
      if (savedMode) {
        weatherMode = savedMode;
        weatherModeExplicit = true;
      } else {
        weatherMode = (myLocationCity || selectedGreetingCity || favs.length) ? 'my-sky' : 'horizon';
      }
    }
    document.body.dataset.weatherView = weatherMode;
    const showMySky = weatherMode === 'my-sky';
    const showStart = !showMySky && !myLocationCity && !selectedGreetingCity && !favs.length;
    const featured = horizonExpanded ? MAJOR : MAJOR.filter((c) => HORIZON_PREVIEW_SLUGS.has(c.slug));
    const homeCity = getGreetingSourceCity() || myLocationCity || selectedGreetingCity;
    const homeKey = homeCity ? cityKey(homeCity) : null;

    const myPacks = homeCity
      ? [(function () {
          const p = pendingCityKeys.has(homeKey)
            ? { city: homeCity, pending: true, fetchedAt: 0 }
            : (cache.get(homeKey) || { city: homeCity, pending: true, fetchedAt: 0 });
          // The location badge and timestamp belong only to an explicit device fix.
          if (myLocationCity && sameCity(homeCity, myLocationCity) && p.city) {
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
    const visibleFeatured = productApi ? productApi.filter(featured) : featured;
    const majorPacks = visibleFeatured
      .filter((c) => !showMySky || (!favKeys.has(cityKey(c)) && (!homeKey || cityKey(c) !== homeKey)))
      .map((c) => pendingCityKeys.has(cityKey(c))
        ? { city: c, pending: true, fetchedAt: 0 }
        : (cache.get(cityKey(c)) || { city: c, pending: true, fetchedAt: 0 }));

    const personalCities = [];
    [myLocationCity, selectedGreetingCity, ...favs].filter(Boolean).forEach(function (city) {
      if (!personalCities.some(item => sameCity(item,city)) && cityKey(city) !== homeKey) personalCities.push(city);
    });
    const personalPacks = personalCities.map(city => cache.get(cityKey(city)) || {city:city,pending:true});
    if (myLocBlock) myLocBlock.hidden = !showMySky || personalPacks.length === 0;
    if (favBlock) favBlock.hidden = true;
    if (majorsBlock) majorsBlock.hidden = showMySky;
    if (majorsBlock) majorsBlock.classList.toggle('is-preview', !horizonExpanded);
    if (startEl) startEl.hidden = !showStart;
    if (moreBtn) moreBtn.hidden = showMySky || horizonExpanded;
    if (mySkyEmptyEl) mySkyEmptyEl.hidden = !showMySky || !!homeCity || favPacks.length > 0;
    modeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-weather-mode') === weatherMode ? 'true' : 'false');
    });
    if (showMySky) {
      renderCityList(myLocListEl, personalPacks, { regions: false, favoriteKeys: favKeys });
      if (favListEl) favListEl.replaceChildren();
    } else {
      if (listEl) listEl.hidden = false;
      renderCityList(listEl, majorPacks, { regions: horizonExpanded && (!document.getElementById('weatherSort') || document.getElementById('weatherSort').value === 'featured'), favoriteKeys: favKeys });
    }
    if (focusKey) {
      const next = [myLocListEl, favListEl, listEl]
        .map(function (list) { return list && list.querySelector('li[data-city-key="' + CSS.escape(focusKey) + '"]'); })
        .find(function (item) { return item && item.offsetParent !== null; });
      if (next) restoreFocus(next.querySelector(focusSave ? '.weather-row-save' : '.weather-row'));
    }

    let latestPack = null;
    (showMySky ? [...myPacks, ...favPacks] : majorPacks).forEach((p) => {
      if (p && p.weather && !p.error && (!latestPack || p.fetchedAt > latestPack.fetchedAt)) latestPack = p;
    });
    if (latestPack && latestPack.stored && updatedEl) updatedEl.textContent = rowUpdatedLabel(latestPack);
    else if (latestPack) setUpdated(latestPack.fetchedAt);
    else if (updatedEl) updatedEl.textContent = '';
    updateGreeting();
    if (productApi) productApi.render();
    if (!opts.skipAmbient && isPageActive()) applyAmbientPageSky();
    // List is interactive again — clear any stuck full-screen PE lock
    if (!isDetailVisible()) ensureListTappable();
  }

  /** Page is foreground-active (auto-refresh only runs then). */
  function isPageActive() {
    try {
      return document.visibilityState === 'visible'
        && !document.documentElement.classList.contains('weather-map-open');
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

  function setViewLoading(busy) {
    window.clearTimeout(viewBusyTimer);
    if (!busy && Date.now() - viewBusySince < 450) {
      viewBusyTimer = window.setTimeout(function () { setViewLoading(false); }, 450 - (Date.now() - viewBusySince));
      return;
    }
    if (busy && !finishViewLoading) viewBusySince = Date.now();
    if (window.DusklineLoading) {
      if (busy && !finishViewLoading) finishViewLoading = window.DusklineLoading.begin();
      else if (!busy && finishViewLoading) { finishViewLoading(); finishViewLoading = null; }
    }
    if (weatherModeSwitchEl) {
      if (busy) weatherModeSwitchEl.setAttribute('aria-busy', 'true');
      else weatherModeSwitchEl.removeAttribute('aria-busy');
    }
    if (shellEl) {
      if (busy) shellEl.setAttribute('aria-busy', 'true');
      else shellEl.removeAttribute('aria-busy');
    }
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
      if (openCity && openCity.weather && isDetailShowingOrOpening()
          && skyApi.resumeStormFx) skyApi.resumeStormFx(detailFx);
      scheduleAutoRefresh();
      // If data is stale after being away, quiet-refresh immediately
      const stale = !lastListFetch || (Date.now() - lastListFetch >= REFRESH_MS);
      if (stale && !refreshInflight) {
        refresh(true, { quiet: true, reason: 'resume' });
      }
    } else {
      finishGreetingTyping();
      clearAutoRefresh();
      if (skyApi.pauseStormFx) skyApi.pauseStormFx(detailFx);
    }
  }

  /**
   * @param {boolean} force  Re-fetch weather and refresh public alerts (not cache-only paint)
   * @param {{ quiet?: boolean, reason?: string }} [opts]
   *   quiet: background refresh (auto/resume) — keep list visible, no progress lock
   */
  async function refresh(force, opts) {
    opts = opts || {};
    const quiet = !!opts.quiet;
    const viewLoad = opts.reason === 'view';
    if (viewLoad) setViewLoading(true);
    if (opts.reason === 'manual-detail' && openCity && openCity.city) {
      const city = openCity.city;
      setRefreshBusy(true);
      try { return await cityRefreshApi.refresh(city); }
      finally { setRefreshBusy(false); }
    }
    const gen = ++refreshGen;

    // A refresh keeps the last valid forecast visible while a new one loads.
    if (force || opts.reason === 'view' || opts.reason === 'expand') {
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
    if (weatherMode === 'my-sky' && myLocationCity) cities.push(myLocationCity);
    if (weatherMode === 'my-sky') favs.forEach((c) => {
      if (!myLocationCity || !sameCity(c, myLocationCity)) cities.push(c);
    });
    const seen = new Set(cities.map(cityKey));
    if (weatherMode === 'my-sky' && selectedGreetingCity && !seen.has(cityKey(selectedGreetingCity))) {
      cities.push(selectedGreetingCity);
      seen.add(cityKey(selectedGreetingCity));
    }
    if (weatherMode !== 'my-sky') {
      const featured = horizonExpanded ? MAJOR : MAJOR.filter((c) => HORIZON_PREVIEW_SLUGS.has(c.slug));
      featured.forEach((c) => { if (!seen.has(cityKey(c))) cities.push(c); });
    }
    const visibleCity = openCity && openCity.city || (weatherMode === 'my-sky' && getGreetingSourceCity());
    const cityWork = force && visibleCity ? cityRefreshApi.refresh(visibleCity) : Promise.resolve(null);
    if (force && visibleCity) {
      const index = cities.findIndex(function (city) { return sameCity(city, visibleCity); });
      if (index >= 0) cities.splice(index, 1);
    }
    // Mode changes and boot only request places without a usable recent forecast.
    if (!force) {
      for (let i = cities.length - 1; i >= 0; i--) {
        const hit = cache.get(cityKey(cities[i]));
        if (hit && hit.weather && Date.now() - (hit.fetchedAt || 0) < REFRESH_MS) cities.splice(i, 1);
      }
    }
    if (!cities.length) {
      await cityWork;
      setRefreshBusy(false);
      if (shellEl) shellEl.removeAttribute('aria-busy');
      if (viewLoad) setViewLoading(false);
      return;
    }
    cities.forEach((c) => {
      const k = cityKey(c);
      const hit = cache.get(k);
      if (!hit || !hit.weather) pendingCityKeys.add(k);
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
        await cityWork;
        if (gen !== refreshGen) return;
        lastListFetch = Date.now();
        const sort = document.getElementById('weatherSort');
        if (weatherMode === 'horizon' && sort && sort.value !== 'featured') refreshListsFromCache({force:true,skipAmbient:true});

        // Keep active places' alerts fresh without polling hidden history.
        alertsApi.prefetchAlertsForCache(null, new Set(cities.map(cityKey))).catch(function () {});
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
          setViewLoading(false);
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
    const icon = document.createElement('template');
    icon.innerHTML = savedPlaceIcon(fav);
    const previous = detailFavBtn.querySelector('svg');
    if (previous) previous.replaceWith(icon.content.firstElementChild);
    else detailFavBtn.prepend(icon.content.firstElementChild);
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
    if (navigationApi) navigationApi.detail(city);
    if (!detailEl || !city) return;
    if (!isDetailShowingOrOpening()) {
      detailReturnFocus = document.activeElement;
      const item = detailReturnFocus && detailReturnFocus.closest && detailReturnFocus.closest('li[data-city-key]');
      detailReturnKey = item && item.dataset.cityKey;
    }
    openCity = { city: city, pending: true };
    syncDetailFav(city);
    if (detailHero) {
      detailHero.innerHTML = `<h2 id="weatherDetailTitle">${escapeHtml(displayCityName(city))}</h2>`;
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
    restoreFocus(detailBack);
    detailEl.style.pointerEvents = '';
    if (detailScroll) detailScroll.scrollTop = 0;
    try { detailEl.setAttribute('aria-labelledby', 'weatherDetailTitle'); } catch (eLab) { /* ignore */ }
    try { detailBack.focus({ preventScroll: true }); } catch (e) {}
  }

  function openDetail(pack) {
    if (!detailEl || !pack || !pack.weather) return;
    if (navigationApi) navigationApi.detail(pack.city);
    if (!isDetailShowingOrOpening()) {
      detailReturnFocus = document.activeElement;
      const item = detailReturnFocus && detailReturnFocus.closest && detailReturnFocus.closest('li[data-city-key]');
      detailReturnKey = item && item.dataset.cityKey;
    }
    const enteringDetail = !isDetailShowingOrOpening() || !!(openCity && openCity.pending);
    const prevCity = openCity && openCity.city;
    const cityChanged = !!(prevCity && pack.city && !sameCity(prevCity, pack.city));
    const sameOpenCity = !!(prevCity && pack.city && sameCity(prevCity, pack.city));
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
        hour, seed, isRow: false, night: isNightForPack(pack),
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

    const night = isNightForPack(pack);
    const dayIdx = dailyTodayIndex(daily, cityTimeZone(pack, c));
    const heroRange = dayHiLo(daily, dayIdx, cur.temperature_2m);
    const insightText = detailWeatherInsight(pack);
    const nextHoursInsight = insightText
      ? `<p class="weather-detail-insight">${escapeHtml(insightText)}</p>` : '';
    detailHero.innerHTML = `
      <h2 id="weatherDetailTitle">${escapeHtml(displayCityName(c))}</h2>
      <div class="weather-detail-temp">${fmtTemp(cur.temperature_2m)}</div>
      <div class="weather-detail-cond">${condIcon(cur.weather_code, night)} ${escapeHtml(condLabel(cur.weather_code))}</div>
      <div class="weather-detail-hl">${t('weather.high', 'H')}:${fmtTemp(heroRange.hi)}  ${t('weather.low', 'L')}:${fmtTemp(heroRange.lo)}</div>
      ${nextHoursInsight}
      <div class="weather-detail-updated" id="weatherDetailUpdated"></div>`;
    try { detailEl.setAttribute('aria-labelledby', 'weatherDetailTitle'); } catch (eLab2) { /* ignore */ }
    if (insightText) typeDetailInsight(detailHero.querySelector('.weather-detail-insight'), insightText, c);
    else {
      window.clearTimeout(detailInsightTimer);
      detailInsightGeneration++;
      lastDetailInsightKey = cityKey(c) + ':';
    }
    {
      const detUp = $('weatherDetailUpdated');
      if (detUp) {
        const parts = [];
        if (cur.time) {
          parts.push(t('weather.conditionsAt', 'Conditions at {time}')
            .replace('{time}', formatClock(cur.time, cityTimeZone(pack, c))));
        }
        if (pack.fetchedAt) parts.push(rowUpdatedLabel(pack));
        const locLab = locationLocatedLabel(c);
        if (locLab) parts.push(locLab);
        detUp.textContent = parts.join(' · ');
      }
    }
    syncDetailFav(c);

    // Public alerts: NWS in the U.S.; official, rebroadcastable CAP alerts elsewhere.
    alertsApi.ensureAlerts(pack, {retryFailed: enteringDetail || cityChanged});

    const selectedAqiScale = aqiScale(c);
    const aqi = aqiCurrentValue(pack.air && pack.air.current, selectedAqiScale);
    const mods = [];
    let hasAlertBlock = false;
    {
      const alertHtml = alertsApi.alertsBlockHtml(pack);
      if (alertHtml) { mods.push(alertHtml); hasAlertBlock = true; }
    }
    mods.push(modHtml(
      'aqi', t('weather.aqi', 'Air Quality'),
      aqi != null ? String(Math.round(aqi)) : '—',
      aqi != null ? aqiScaleLabel(selectedAqiScale) + ' · ' + aqiLabel(aqi, selectedAqiScale) : aqiScaleLabel(selectedAqiScale),
      true, false, aqiBarHtml(aqi, true, selectedAqiScale)
    ));
    {
      const feels = cur.apparent_temperature;
      const delta = feels != null && cur.temperature_2m != null ? feels - cur.temperature_2m : null;
      let feelsSub = '';
      if (delta != null) {
        const abs = Math.abs(Math.round(useF() ? delta * 9 / 5 : delta));
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
    let start = times.length;
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
      const hourLabel = [formatClock(times[i], stripTz),condLabel(code),fmtTemp(hourly.temperature_2m && hourly.temperature_2m[i]),pop == null ? '' : Math.round(pop)+'%'].filter(Boolean).join(', ');
      hourlyHtml += `<button type="button" class="weather-hourly-item" data-hour-index="${i}" data-hour-at="${stampToMs(times[i],stripTz)}" aria-label="${escapeHtml(hourLabel)}">
        <div>${escapeHtml(i === start && !pack.stored ? t('weather.now', 'Now') : lab)}</div>
        <div class="ic">${condIcon(code == null ? 0 : code, isNightForPack(pack, times[i]))}</div>
        <div class="t">${fmtTemp(hourly.temperature_2m && hourly.temperature_2m[i])}</div>
        ${pop != null ? `<div class="p">${Math.round(pop)}%</div>` : ''}
      </button>`;
    }
    hourlyHtml += '</div>';
    if (start >= times.length) {
      hourlyHtml = times.length || pack.enrichmentError || pack.stored
        ? `<div class="weather-hourly-loading" role="status"><span>${escapeHtml(t('weather.hourlyUnavailable', 'Hourly forecast unavailable'))}</span><span>${escapeHtml(t('weather.refreshToRetry', 'Refresh to try again'))}</span></div>`
        : `<div class="weather-hourly-loading" role="status" aria-live="polite"><span class="loader" aria-hidden="true"></span><span>${escapeHtml(t('weather.loadingForecast', 'Loading forecast…'))}</span></div>`;
    }
    const hourlyTitle = t('weather.hourly', 'Hourly Forecast');
    mods.push(`<div class="weather-mod weather-mod-wide weather-mod-hourly" data-sheet="conditions"><button type="button" class="weather-mod-label weather-hourly-open" aria-label="${escapeHtml(hourlyTitle)}">${modLabelIcon('conditions')}<span>${escapeHtml(hourlyTitle)}</span></button>${hourlyHtml}</div>`);

    const dailyOpts = {
      currentTemp: cur && cur.temperature_2m != null ? cur.temperature_2m : null,
      timeZone: (pack.weather && pack.weather.timezone) || (c && c.tz) || undefined,
      hourly: hourly
    };
    const dailyN = chartsApi.dailySliceCount ? chartsApi.dailySliceCount(daily, dailyOpts) : 10;
    const dailyTitle = dailyN === 0 ? t('weather.daily','10-Day Forecast') : dailyN >= 10
      ? t('weather.daily', '10-Day Forecast')
      : dailyN === 7
        ? t('weather.daily7', '7-Day Forecast')
        : t('weather.dailyN', '{n}-Day Forecast').replace('{n}', String(dailyN));
    mods.push(`<div class="weather-mod weather-mod-wide weather-mod-daily"><div class="weather-mod-label">${escapeHtml(dailyTitle)}</div>${dailyN ? chartsApi.dailyBarsHtml(daily, dailyOpts) : '<p class="weather-empty">'+escapeHtml(t('weather.unavailable','Unavailable'))+'</p>'}</div>`);
    // Put the forecast people check first ahead of the exploratory measurements.
    // The alert banner, when present, still leads the detail.
    const forecastModules = mods.splice(-2);
    mods.splice(hasAlertBlock ? 1 : 0, 0, ...forecastModules);
    const metricStart = hasAlertBlock ? 3 : 2;
    const metricModules = mods.splice(metricStart);
    // Stable positions make recurring checks predictable; contextual guidance lives in the hero.
    mods.push(...metricModules);

    // Apple-style location attribution
    const placeBits = [displayCityName(c), displayAdmin1(c), c.country || ''].filter(Boolean);
    if (!c.country) {
      const catalog = MAJOR.find((m) => sameCity(m, c));
      if (catalog && catalog.country) placeBits.push(catalog.country);
    }
    const placeStr = placeBits.filter((x, i, a) => a.indexOf(x) === i).join(', ');
    const forLine = t('weather.forLocation', 'Weather for {place}').replace('{place}', placeStr);
    const provider=pack.source === 'nws+om' ? 'NWS · Open-Meteo' : pack.source === 'nws' ? 'NWS' : 'Open-Meteo';
    mods.push(`<p class="weather-detail-attrib">${escapeHtml(forLine)} · ${provider}</p>`);

    const previousStrip = detailMods.querySelector('.weather-hourly');
    const stripScroll = sameOpenCity && previousStrip ? previousStrip.scrollLeft : 0;
    const focusedHour = sameOpenCity && detailMods.contains(document.activeElement) ? document.activeElement.dataset.hourIndex : null;
    detailMods.innerHTML = mods.join('');
    const newStrip = detailMods.querySelector('.weather-hourly');
    if (newStrip) {newStrip.scrollLeft=stripScroll;chartsApi.bindHourlyList(newStrip);}
    if (focusedHour != null) detailMods.querySelector('[data-hour-index="'+CSS.escape(focusedHour)+'"]')?.focus({preventScroll:true});
    // Restore any expanded alerts the user had open before this re-render
    if (keepAlertOpen && keepAlertOpen.length) alertsApi.restoreOpenAlertTitles(keepAlertOpen);
    alertsApi.bindAlertCollapseAnimation(detailMods);
    // Clicks use delegated handler on detailMods (bound once) — survives re-renders

    const isClosing = detailEl.classList.contains('is-closing');
    const wasOpen = detailEl.classList.contains('open') && !isClosing;

    hoistOverlays();

    // Opening a city (or switching cities) must never leave a units/info sheet
    // trapping the full-screen pointer layer over the list or detail.
    if (cityChanged || (!wasOpen && !sameOpenCity)) {
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
    if (pack.needsEnrich && pack.city && !pack._enriching && !pack.enrichmentError) {
      pack._enriching = true;
      const enrichKey = cityKey(pack.city);
      // Snapshot expanded alerts so enrich re-render can restore them
      const openTitlesBeforeEnrich = alertsApi.captureOpenAlertTitles();
      dataApi.loadCity(pack.city, null, { enrich: true }).then(function (fresh) {
        if (!fresh || !fresh.weather) return;
        fresh._enriching = false;
        // Keep alerts from pre-enrich pack (enrich path does not re-fetch them)
        if (Array.isArray(pack.alerts)) fresh.alerts = pack.alerts;
        else if (openCity && sameCity(openCity.city, pack.city) && Array.isArray(openCity.alerts)) fresh.alerts = openCity.alerts;
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
        pack.enrichmentError = true;
        if (openCity && sameCity(openCity.city, pack.city) && isDetailShowingOrOpening()) openDetail(pack);
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



  function openSheet(kind, pack, sheetOptions) {
    if (!sheetEl || !sheetBody || !pack || !pack.weather) return;
    if (['hourly','daily','conditions'].includes(kind)) kind = 'day';
    if (kind === 'feels') {
      kind = 'day';
      sheetOptions = Object.assign({}, sheetOptions || {}, { tempMode: 'feels' });
    }
    try {
      openSheetInner(kind, pack, sheetOptions || {});
      if (kind === 'aqi') {
        loadAqiDetail(pack).then(function (updated) {
          if (!sheetOpen || activeSheetKind !== 'aqi') return;
          const responseCity = updated && updated.city || pack.city;
          if (!openCity || !openCity.city || !sameCity(openCity.city, responseCity)) return;
          const host = document.getElementById('wxAqiExtended');
          const scale = aqiScale(responseCity);
          const data = updated || pack;
          if (host) host.innerHTML = aqiExtendedHtml(data && data.air, scale);
          const outlook = document.getElementById('wxAqiOutlook');
          if (outlook) outlook.outerHTML = aqiOutlookHtml(data && data.air, scale,
            cityTimeZone(data, data && data.city), false);
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

  function openSheetInner(kind, pack, sheetOptions) {
    sheetOptions = sheetOptions || {};
    if (navigationApi) navigationApi.sheet(kind, sheetOptions);
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

    const savedSheetScroll = sheetOptions.keepScroll ? {body:sheetBody.scrollTop,panel:sheetPanel.scrollTop,dates:sheetBody.querySelector('.wx-day-choices')?.scrollLeft || 0} : null;
    let body = '';

    // City-local calendar day for charts (Apple Weather style 00–24)
    const chartTz = (pack.weather && pack.weather.timezone)
      || (pack.city && pack.city.tz)
      || undefined;
    const dailyTimes = daily.time || [];
    const currentDateKey = chartsApi.localDateKey(Date.now(), chartTz);
    let firstDayIndex = dailyTimes.findIndex(function (value) {
      return String(value || '').slice(0, 10) >= currentDateKey;
    });
    if (firstDayIndex < 0) firstDayIndex = Math.max(0, dailyTodayIndex(daily, chartTz));
    const dayCount = chartsApi.dailySliceCount ? chartsApi.dailySliceCount(daily, {
      timeZone: chartTz, currentTemp: cur.temperature_2m, hourly: hourly
    }) : Math.min(10, Math.max(0, dailyTimes.length - firstDayIndex));
    const dayChoices = dailyTimes.slice(firstDayIndex, firstDayIndex + dayCount);
    let selectedDayKey = sheetOptions.dayKey || dailyTimes[dailyTodayIndex(daily, chartTz)] || dailyTimes[firstDayIndex] || '';
    if (dayChoices.length && dayChoices.indexOf(selectedDayKey) < 0) selectedDayKey = dayChoices[0];
    const foundDayIndex = dailyTimes.findIndex(function (value) {
      return String(value || '').slice(0, 10) === String(selectedDayKey || '').slice(0, 10);
    });
    const selectedDayIndex = foundDayIndex >= 0 ? foundDayIndex : dailyTodayIndex(daily, chartTz);
    const selectedDate = selectedDayKey ? new Date(String(selectedDayKey).slice(0, 10) + 'T12:00:00Z') : null;
    let selectedDateTitle = '';
    if (selectedDate && Number.isFinite(selectedDate.getTime())) {
      try {
        selectedDateTitle = new Intl.DateTimeFormat(localeTag(), {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
        }).format(selectedDate);
      } catch (e) { selectedDateTitle = String(selectedDayKey).slice(0, 10); }
    }
    if (kind === 'day' || kind === 'conditions') titleMap[kind] = selectedDateTitle || t('weather.hourly', 'Hourly Forecast');
    const selectedDayCode = dailyFieldAt(daily, 'weather_code', selectedDayIndex);

    const aboutTitle = t('weather.about', 'About');
    const dayMode = sheetOptions.tempMode === 'feels' ? 'feels' : 'actual';
    // Build after the selected day is known so the sheet title matches the date in the body.
    const sheetTitleHtml = `
      <div class="wx-sheet-head" data-sheet-title>
        <div class="wx-sheet-icon">${(kind === 'day' || kind === 'conditions') && selectedDayCode != null ? condIcon(selectedDayCode, false, 'weather-mod-icon') : modLabelIcon(kind === 'conditions' || kind === 'day' ? 'conditions' : kind)}</div>
        <h3 class="wx-sheet-title">${escapeHtml(titleMap[kind] || t('weather.about', 'About'))}</h3>
      </div>`;

    function unitsPickerHtml(id, pairs, current) {
      let html = `<p class="weather-mod-label" id="${id}-label">${escapeHtml(t('weather.units', 'Units'))}</p><div class="weather-units-row" id="${id}" role="radiogroup" aria-labelledby="${id}-label"><span class="wx-units-pill" aria-hidden="true"></span>`;
      pairs.forEach(function (pair) {
        const on = current === pair[0];
        html += `<button type="button" role="radio" aria-checked="${on ? 'true' : 'false'}" tabindex="${on ? '0' : '-1'}" data-u="${pair[0]}" class="${on ? 'active' : ''}">${escapeHtml(pair[1])}</button>`;
      });
      html += '</div>';
      return html;
    }

    function datePickerHtml() {
      return `<div class="wx-day-choices" role="group" aria-label="${escapeHtml(t('weather.daily','10-Day Forecast'))}">${dayChoices.map(function (date) {
        const day = new Date(date + 'T12:00:00Z');
        const weekday = date === currentDateKey ? t('weather.today','Today') : new Intl.DateTimeFormat(localeTag(),{weekday:'short',timeZone:'UTC'}).format(day);
        const number = new Intl.DateTimeFormat(localeTag(),{day:'numeric',timeZone:'UTC'}).format(day);
        return `<button type="button" data-hourly-date="${escapeHtml(date)}" aria-pressed="${date === selectedDayKey}"><span>${escapeHtml(weekday)}</span><strong>${escapeHtml(number)}</strong></button>`;
      }).join('')}</div>`;
    }
    // A selected forecast day opens a date-aware chart sheet, rather than a static row.
    if (kind === 'day') {
      body += datePickerHtml();
      body += forecastSheetApi.render({daily,hourly,chartTz,selectedDayKey,selectedDayIndex,selectedDayCode,dayMode,sheetOptions,currentDateKey,unitsPickerHtml});
    // Chart sheets: Apple pattern = title → large live value lives in chart readout → scrub chart → about
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
      const scale = aqiScale(pack.city);
      const aqi = aqiCurrentValue(pack.air && pack.air.current, scale);
      body += `<div class="wx-sheet-hero">
        <div class="weather-chart-readout wx-aqi-readout" style="--wx-aqi-color:${aqiColor(aqi, scale)};--wx-aqi-light:${aqiLightColor(aqi, scale)}">${aqi != null ? Math.round(aqi) : '—'}</div>
        <div class="weather-chart-sub">${escapeHtml(aqiLabel(aqi, scale) || t('weather.aqi', 'Air Quality'))}${aqi != null ? ' · ' + escapeHtml(aqiRange(aqi, scale)) : ''}</div>
      </div>`;
      body += aqiBarHtml(aqi, false, scale);
      const description = aqiDescription(aqi, scale);
      if (description) body += `<p class="wx-sheet-context wx-sheet-aqi-description">${escapeHtml(description)}</p>`;
      if (pack.air && pack.air.current) {
        const pm = pack.air.current.pm2_5;
        const pm10 = pack.air.current.pm10;
        body += `<div class="wx-sheet-stats">
          <div class="wx-sheet-stat"><span class="wx-sheet-stat-lab">PM2.5</span><span class="wx-sheet-stat-val">${pm != null ? pm.toFixed(1) : '—'} µg/m³</span></div>
          <div class="wx-sheet-stat"><span class="wx-sheet-stat-lab">PM10</span><span class="wx-sheet-stat-val">${pm10 != null ? pm10.toFixed(1) : '—'} µg/m³</span></div>
        </div>`;
      }
      body += `<div id="wxAqiExtended">${aqiExtendedHtml(pack.air, scale)}</div>`;
      body += aqiOutlookHtml(pack.air, scale, chartTz, !(pack.air && pack.air._detailFetchedAt));
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

    const aboutText = kind === 'day' ? t('weather.about.conditions','') : kind === 'aqi' && aqiScale(pack.city) === 'eu'
      ? t('weather.about.aqi.eu', '')
      : t('weather.about.' + kind, '');
    if (aboutText) {
      const contextText = sheetContextText(kind === 'day' ? 'conditions' : kind, pack, chartTz, {dayKey:String(selectedDayKey).slice(0,10),tempMode:dayMode});
      if (contextText) body += `<p class="wx-sheet-context wx-sheet-intelligence">${escapeHtml(contextText)}</p>`;
      const aboutHead = kind === 'conditions' || kind === 'day'
        ? aboutTitle + ' ' + t('weather.hourly', 'Hourly Forecast')
        : titleMap[kind] ? aboutTitle + ' ' + titleMap[kind] : aboutTitle;
      body += `<div class="wx-sheet-about">
        <div class="wx-sheet-about-title">${escapeHtml(aboutHead)}</div>
        <p>${escapeHtml(aboutText)}</p>
      </div>`;
    }

    sheetBody.innerHTML = body;
    setSheetTitle(sheetTitleHtml);
    chartsApi.bindCharts(sheetBody);
    sheetBody.querySelectorAll('[data-hourly-date]').forEach(function (button,index) {
      button.addEventListener('click', function () {
        const date = button.dataset.hourlyDate;
        openSheet(kind, pack, { dayKey: date, tempMode: dayMode });
        const next = sheetBody.querySelector('[data-hourly-date="' + CSS.escape(date) + '"]');
        if (next) {
          next.focus({ preventScroll: true });
          next.scrollIntoView({block:'nearest',inline:'center',behavior:motionFull() ? 'smooth' : 'auto'});
        }
      });
      button.addEventListener('keydown', function (event) {
        const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
        const nextIndex = event.key === 'ArrowRight' ? index+direction : event.key === 'ArrowLeft' ? index-direction : event.key === 'Home' ? 0 : event.key === 'End' ? dayChoices.length-1 : null;
        if (nextIndex == null || nextIndex < 0 || nextIndex >= dayChoices.length) return;
        event.preventDefault();
        sheetBody.querySelectorAll('[data-hourly-date]')[nextIndex].click();
      });
    });

    if (kind === 'day' || kind === 'conditions') {
      const focusDayControl = function (attribute, value) {
        requestAnimationFrame(function () {
          const controls = Array.from(sheetBody.querySelectorAll('[' + attribute + ']'));
          const target = controls.find(function (button) { return button.getAttribute(attribute) === value; });
          if (target && target.isConnected) target.focus({ preventScroll: true });
        });
      };
      sheetBody.querySelectorAll('[data-temp-mode]').forEach(function (button) {
        button.addEventListener('click', function () {
          const nextMode = button.getAttribute('data-temp-mode');
          if (!nextMode || nextMode === dayMode) return;
          const options = { tempMode: nextMode, keepScroll:true };
          options.dayKey = String(selectedDayKey).slice(0, 10);
          openSheet(kind, pack, options);
          focusDayControl('data-temp-mode', nextMode);
        });
      });
      const conditionHost = kind === 'day'
        ? sheetBody.querySelector('#wxDayCondition')
        : sheetBody.querySelector('#wxConditionsContext');
      if (conditionHost) {
        const initialCode = kind === 'day' || String(selectedDayKey).slice(0,10) !== currentDateKey ? selectedDayCode : cur.weather_code;
        const applyConditionCode = function (code, time) {
          if (code == null || !Number.isFinite(Number(code))) return;
          const hour = time ? wallHour(time, chartTz) : (kind === 'day' ? 12 : localHourForPack(pack));
          const night = isNightForPack(pack);
          conditionHost.innerHTML = condIcon(Number(code), time ? isNightForPack(pack,time) : night) + '<span>'
            + escapeHtml(condLabel(Number(code))) + '</span>';
        };
        sheetBody.querySelectorAll('.weather-chart-wrap').forEach(function (chart) {
          chart.addEventListener('weatherchartchange', function (event) {
            const detail = event.detail || {};
            applyConditionCode(detail.weatherCode, detail.time);
          });
          chart.addEventListener('weatherchartreset', function () { applyConditionCode(initialCode); });
        });
      }
    }

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
          const rebuildGeneration = sheetGen;
          const rebuildCity = openCity && openCity.city;
          bind._rebuild = window.setTimeout(function () {
            if (!sheetIntentOpen || sheetGen !== rebuildGeneration || activeSheetKind !== kind || !openCity || !sameCity(openCity.city,rebuildCity)) return;
            const pack = openCity && openCity.city
              ? (cache.get(cityKey(openCity.city)) || openCity)
              : openCity;
            if (pack && pack.weather) {
              openDetail(pack);
              openSheet(kind, pack, kind === 'day' ? {dayKey:selectedDayKey,tempMode:dayMode,keepScroll:true} : undefined);
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

    presentSheet(undefined,{keepScroll:!!sheetOptions.keepScroll});
    if (savedSheetScroll) {
      sheetBody.scrollTop = savedSheetScroll.body;
      sheetPanel.scrollTop = savedSheetScroll.panel;
      const choices = sheetBody.querySelector('.wx-day-choices');
      if (choices) choices.scrollLeft = savedSheetScroll.dates;
    }
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

  let sheetPageScrollSnapshot = null;
  function lockSheetPageScroll() {
    const root = document.documentElement;
    const body = document.body;
    if (!root || !body || sheetPageScrollSnapshot
      || root.classList.contains('weather-detail-open')
      || body.classList.contains('weather-detail-open')) return;

    const properties = ['position', 'top', 'left', 'right', 'bottom', 'width', 'overflow'];
    const bodyStyles = {};
    properties.forEach(function (property) {
      bodyStyles[property] = {
        value: body.style.getPropertyValue(property),
        priority: body.style.getPropertyPriority(property)
      };
    });
    const x = window.scrollX || window.pageXOffset || 0;
    const y = window.scrollY || window.pageYOffset || 0;
    const bodyWidth = body.getBoundingClientRect().width;
    sheetPageScrollSnapshot = {
      x: x,
      y: y,
      rootOverflow: {
        value: root.style.getPropertyValue('overflow'),
        priority: root.style.getPropertyPriority('overflow')
      },
      bodyStyles: bodyStyles
    };

    // Keep the body at its current viewport position while the sheet is open.
    // This also blocks touch scrolling on iOS, where overflow:hidden alone can
    // still allow the document underneath a fixed overlay to move.
    root.style.setProperty('overflow', 'hidden');
    body.style.setProperty('position', 'fixed');
    body.style.setProperty('top', (-y) + 'px');
    body.style.setProperty('left', (-x) + 'px');
    body.style.setProperty('right', 'auto');
    body.style.setProperty('bottom', 'auto');
    body.style.setProperty('width', bodyWidth + 'px');
    body.style.setProperty('overflow', 'hidden');
  }

  function unlockSheetPageScroll() {
    const snapshot = sheetPageScrollSnapshot;
    if (!snapshot) return;
    sheetPageScrollSnapshot = null;
    const root = document.documentElement;
    const body = document.body;
    function restore(style, property, saved) {
      if (!saved.value) style.removeProperty(property);
      else style.setProperty(property, saved.value, saved.priority);
    }
    restore(root.style, 'overflow', snapshot.rootOverflow);
    Object.keys(snapshot.bodyStyles).forEach(function (property) {
      restore(body.style, property, snapshot.bodyStyles[property]);
    });
    window.scrollTo(snapshot.x, snapshot.y);
  }

  function inertSheet() {
    sheetIntentOpen = false;
    unlockSheetPageScroll();
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
    sheetReturnFocus = null;
    sheetReturnKind = null;
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

  function presentSheet(initialFocus, options) {
    options = options || {};
    if (!sheetEl || !sheetPanel) return;
    const focusSheet = function () {
      const target = initialFocus && initialFocus.isConnected ? initialFocus : sheetClose;
      if (!target) return;
      target.focus({ preventScroll: true });
      if (target === initialFocus && typeof target.select === 'function') target.select();
    };
    if (!isSheetOpen()) {
      sheetReturnFocus = document.activeElement;
      sheetReturnHour = sheetReturnFocus && sheetReturnFocus.dataset.hourAt;
      const tile = sheetReturnFocus && sheetReturnFocus.closest && sheetReturnFocus.closest('[data-sheet]');
      sheetReturnKind = tile && tile.getAttribute('data-sheet');
      const dayRow = sheetReturnFocus && sheetReturnFocus.closest && sheetReturnFocus.closest('[data-day-date]');
      sheetReturnDate = dayRow && dayRow.dataset.dayDate;
    }
    closeSuggest();
    hoistOverlays();
    const alreadyOpen = sheetEl.classList.contains('open') && !sheetEl.classList.contains('is-leaving');
    sheetGen += 1;
    const gen = sheetGen;
    sheetOpen = true;
    sheetIntentOpen = true;
    lockSheetPageScroll();
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
      if (sheetBody && !options.keepScroll) sheetBody.scrollTop = 0;
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
        if (!options.keepScroll) focusSheet();
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
        focusSheet();
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
          focusSheet();
        } catch (eFocus2) { /* ignore */ }
      });
    });
  }

  function closeSheet(options) {
    if (navigationApi) navigationApi.close("sheet");
    if (!sheetEl || !sheetPanel) return;
    if (!isSheetOpen()) {
      inertSheet();
      sheetOpen = false;
      if (options && typeof options.afterClose === 'function') options.afterClose();
      return;
    }
    const returnFocus = sheetReturnFocus;
    const returnKind = sheetReturnKind;
    const returnDate = sheetReturnDate;
    const returnHour = sheetReturnHour;
    sheetReturnHour = null;
    sheetReturnDate = null;
    sheetReturnFocus = null;
    sheetReturnKind = null;
    const returnTile = returnKind && detailMods && detailMods.querySelector('[data-sheet="' + CSS.escape(returnKind) + '"]');
    function restoreSheetReturnFocus() {
      if (options && typeof options.afterClose === 'function') { options.afterClose(); return; }
      const day = returnDate && detailMods && detailMods.querySelector('[data-day-date="' + CSS.escape(returnDate) + '"]');
      const tile = returnKind && detailMods && detailMods.querySelector('[data-sheet="' + CSS.escape(returnKind) + '"]');
      const hour=returnHour && detailMods && detailMods.querySelector('[data-hour-at="'+CSS.escape(returnHour)+'"]');
      const control=tile && (tile.tagName==='BUTTON' ? tile : tile.querySelector('button'));
      restoreFocus(returnFocus,hour || day || control || (isDetailVisible()?detailBack:unitsBtn));
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
      restoreSheetReturnFocus();
      return;
    }
    window.setTimeout(function () {
      if (gen !== sheetGen) return;
      inertSheet();
      restoreSheetReturnFocus();
    }, closeMs);
  }

  function finishDragClose() {
    if (navigationApi) navigationApi.close("sheet");
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
      if (e.target && e.target.closest && e.target.closest('button,input,select,textarea,a')) return;
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
      if (mapApi && mapApi.isOpen()) return;
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
    if (document.documentElement.classList.contains('weather-map-open') || (mapApi && mapApi.isOpen())) return;
    // Detail open, opening, or closing — leave it alone
    if (isDetailVisible()) return;
    if (openCity && detailEl && !detailEl.classList.contains('is-closing')) return;
    if (detailEl && detailEl.classList.contains('is-closing')) return;

    // A refresh may repaint the list while an info sheet is open. Clean up a
    // stale detail state without removing the sheet's independent scroll lock.
    const sheetVisible = isSheetOpen();
    try {
      if (detailEl) {
        detailEl.classList.remove('open', 'wx-detail-enter');
        detailEl.setAttribute('aria-hidden', 'true');
        detailEl.style.pointerEvents = 'none';
        try { detailEl.inert = true; } catch (eInert) { /* older browsers */ }
      }
    } catch (e) { /* ignore */ }
    if (!sheetVisible) {
      unlockDetailPage();
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
    // closeDetail already dismissed its sheet. A list-level sheet may have opened
    // during this exit transition; do not close that newer interaction here.
    ensureListTappable();
    if (mapApi) mapApi.finishReturn();
  }

  function closeDetail(options) {
    if (options && options.returnToMap === false) detailReturnToMap = null;
    if (openCity && cityRefreshApi) cityRefreshApi.cancel(openCity.city);
    if (navigationApi) navigationApi.close("detail");
    if (!detailEl) return;
    const returnFocus = detailReturnFocus;
    const returnKey = detailReturnKey;
    detailReturnFocus = null;
    detailReturnKey = null;
    const motionGen = cancelDetailMotion();
    const isOpen = detailEl.classList.contains('open') || detailEl.classList.contains('is-closing');

    detailEl.classList.remove('wx-detail-enter');
    detailEl.style.animation = '';
    detailEl.style.transform = 'none';
    detailEl.setAttribute('aria-hidden', 'true');
    openCity = null;
    if (skyApi.pauseStormFx) skyApi.pauseStormFx(detailFx);
    forceCloseSheet();

    // Restore city list immediately — no solid-sky void under the fade.
    unlockDetailPage();
    const returnCity = detailReturnToMap;
    detailReturnToMap = null;
    if (returnCity && mapApi) {
      // Put the map beneath the exiting detail in the same frame. Its ready
      // renderer is reused, and no dashboard frame or history entry intervenes.
      mapNavigationSuspended = true;
      try { mapApi.open({initialCity:returnCity,places:getMapPlaces(),returnFocus:mapOpenBtn,immediate:true}); }
      finally { mapNavigationSuspended = false; }
    } else {
      const returnRow = returnKey && shellEl && shellEl.querySelector('li[data-city-key="' + CSS.escape(returnKey) + '"] .weather-row');
      restoreFocus(returnFocus && returnFocus.isConnected ? returnFocus : returnRow, searchEl);
    }

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
  function cancelSearch() {
    searchGen += 1;
    if (searchAbort) searchAbort.abort();
    searchAbort = null;
  }
  function closeSuggest() {
    clearTimeout(searchTimer);
    cancelSearch();
    if (!suggestEl || !searchEl) return;
    searchEl.removeAttribute('aria-busy');
    suggestEl.classList.remove('open');
    suggestEl.hidden = true;
    suggestEl.innerHTML = '';
    searchEl.setAttribute('aria-expanded', 'false');
    searchEl.removeAttribute('aria-activedescendant');
    suggestIndex = -1;
  }
  function suggestOptions() {
    return suggestEl ? Array.prototype.slice.call(suggestEl.querySelectorAll('button[data-place-choice]')) : [];
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

  function searchChoiceError(city, label, primary) {
    showError(t('weather.error', 'Could not load weather data.'));
    if (!errorEl) return;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'weather-inline-action';
    retry.textContent = t('weather.retry', 'Retry');
    retry.addEventListener('click', function () {
      showError(''); selectingGreetingPlace = primary; chooseSearchCity(city, label);
    });
    errorEl.append(retry);
  }
  async function chooseSearchCity(city, label) {
    const c = Object.assign({}, city, { isMyLocation: false });
    const chooseAsMySkyPlace = selectingGreetingPlace;
    selectingGreetingPlace = false;
    const choiceGen = ++placeChoiceGen;
    closeSuggest();
    if (searchEl) searchEl.value = label || displayCityName(c);
    if (searchClear) {
      searchClear.hidden = false;
      searchClear.classList.add('show');
    }
    const cached = cache.get(cityKey(c));
    if (cached && cached.weather) openDetail(cached);
    else openDetailLoading(c);
    try {
      const pack = await dataApi.loadCity(c, null, { enrich: true });
      if (choiceGen !== placeChoiceGen) return;
      if (!W.searchPlaces.validForecast(pack)) {
        if (isDetailVisible() && openCity && sameCity(openCity.city, c)) closeDetail();
        if (chooseAsMySkyPlace) setWeatherMode('my-sky', true, true);
        searchChoiceError(c, label, chooseAsMySkyPlace);
        return;
      }
      if (chooseAsMySkyPlace) {
        saveGreetingCity(c);
        saveGreetingSource('city:' + cityKey(c));
        setWeatherMode('my-sky', true);
      }
      if (openCity && sameCity(openCity.city, c)) openDetail(pack);
    } catch (e) {
      if (choiceGen !== placeChoiceGen) return;
      if (isDetailVisible() && openCity && sameCity(openCity.city, c)) closeDetail();
      if (chooseAsMySkyPlace) setWeatherMode('my-sky', true, true);
      searchChoiceError(c, label, chooseAsMySkyPlace);
    }
  }

  function renderRecentSuggestions() {
    if (!suggestEl) return;
    searchGen += 1;
    // Dedupe by city — the same place can have multiple snapshots.
    const seen = new Set();
    const recent = savedSnapshots.filter(function (pack) {
      if (!pack.visited) return false;
      const key = cityKey(pack.city);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 5);
    if (!recent.length) { closeSuggest(); return; }
    suggestEl.innerHTML = `<li role="presentation" class="s-group">${escapeHtml(t('weather.recentPlaces', 'Recent places'))}</li>`;
    recent.forEach(function (pack) {
      const city = pack.city;
      const name = displayCityName(city);
      appendSuggestion(city, name, [displayAdmin1(city), city.country].filter(Boolean).join(', '));
    });
    openSuggest();
  }
  function appendSuggestion(city, name, meta) {
    const li = document.createElement('li');
    li.className = 's-result';
    li.setAttribute('role', 'row');
    const option = document.createElement('button');
    option.type = 'button';
    option.setAttribute('role', 'gridcell');
    option.setAttribute('data-place-choice', '');
    option.setAttribute('data-haptic-important', '');
    option.tabIndex = -1;
    option.setAttribute('aria-selected', 'false');
    option.id = 'wx-suggest-' + suggestEl.querySelectorAll('[data-place-choice]').length;
    option.innerHTML = `<div class="s-name">${escapeHtml(name)}</div><div class="s-meta">${escapeHtml(meta)}</div>`;
    option.addEventListener('click', function () { chooseSearchCity(city, name); });
    const save = document.createElement('button');
    save.type = 'button';
    save.className = 's-add';
    save.setAttribute('data-haptic-important', '');
    const syncSave = function () {
      const saved = isFavorite(city);
      save.innerHTML = savedPlaceIcon(saved);
      save.setAttribute('aria-label', t(saved ? 'weather.removeFromMySky' : 'weather.addToMySky',
        saved ? 'Remove from My Sky' : 'Add to My Sky') + ': ' + name);
      save.title = save.getAttribute('aria-label');
      save.setAttribute('aria-pressed', saved ? 'true' : 'false');
    };
    syncSave();
    save.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft' || event.key === 'Escape') { event.preventDefault(); searchEl.focus(); if (event.key === 'Escape') closeSuggest(); }
    });
    save.addEventListener('click', function () {
      toggleFavorite(city);
      syncSave();
      closeSuggest();
      searchEl.focus({preventScroll:true});
      refreshListsFromCache({ force: true });
      if (weatherMode === 'my-sky') refresh(false, { quiet: true, reason: 'view' });
    });
    const saveCell = document.createElement('div'); saveCell.className = 's-save-cell'; saveCell.setAttribute('role','gridcell'); saveCell.append(save);
    li.append(option, saveCell);
    suggestEl.appendChild(li);
  }

  async function searchSuggest(q) {
    if (!suggestEl) return;
    if (!q || q.length < 2) {
      if (!q) renderRecentSuggestions();
      else { searchGen += 1; closeSuggest(); }
      return;
    }
    cancelSearch();
    const gen = searchGen;
    searchAbort = new AbortController();
    suggestEl.innerHTML = `<li class="s-loading" role="status"><span class="loader" aria-hidden="true"></span><span>${escapeHtml(t('weather.notice.searching', 'Searching places…'))}</span></li>`;
    searchEl.setAttribute('aria-busy', 'true');
    openSuggest();
    try {
      const langParam = geocodeLangParam();
      const data = await dataApi.fetchJson(`${GEOCODE}?name=${encodeURIComponent(q)}&count=8&language=${encodeURIComponent(langParam)}&format=json`, searchAbort.signal);
      if (gen !== searchGen) return;
      searchEl.removeAttribute('aria-busy');
      const results = W.searchPlaces.deduplicate(data.results || []);
      suggestEl.innerHTML = '';
      if (!results.length) {
        suggestEl.innerHTML = `<li role="presentation"><div role="option" aria-disabled="true" class="s-empty">${escapeHtml(t('weather.emptySearch', 'No cities found.'))}</div></li>`;
        openSuggest();
        return;
      }
      results.forEach((r) => {
        const admin = [r.admin1, r.country].filter(Boolean).join(', ');
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
        appendSuggestion(city, r.name, admin);
      });
      openSuggest();
    } catch (e) {
      if (gen !== searchGen) return;
      searchEl.removeAttribute('aria-busy');
      suggestEl.innerHTML = `<li role="presentation"><div role="option" aria-disabled="true" class="s-empty">${escapeHtml(t('weather.error', 'Could not load weather data.'))}</div></li>`;
      openSuggest();
    }
  }

  function openUnitsSheet(options) {
    const returningFromNotifications = activeSheetKind === 'notifications';
    const startedFromPage = !isSheetOpen();
    if (navigationApi && !(options && options.skipNavigation)) navigationApi.sheet("units");
    activeSheetKind = 'units';
    if (!sheetEl || !sheetBody) return;
    closeSuggest();
    hoistOverlays();
    setSheetTitle(`
      <div class="wx-sheet-head" data-sheet-title>
        <div class="wx-sheet-icon">${modLabelIcon('conditions')}</div>
        <h3 class="wx-sheet-title">${escapeHtml(t('weather.settings', 'Settings'))}</h3>
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
        b.setAttribute('data-haptic-important', '');
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
    const motionTitle = document.createElement('p'); motionTitle.className = 'weather-mod-label'; motionTitle.textContent = t('weather.motion', 'Motion');
    const motion = document.createElement('select'); motion.className = 'weather-motion-select'; motion.setAttribute('aria-label', motionTitle.textContent);
    [['auto', t('settings.auto','Automatic')], ['full',t('weather.motionFull','Full')], ['reduced',t('weather.motionReduced','Reduced')], ['off',t('weather.motionOff','Off')]].forEach(function (pair) {
      const option = document.createElement('option'); option.value = pair[0]; option.textContent = pair[1]; motion.append(option);
    });
    try { motion.value = localStorage.getItem('duskline-motion') || 'auto'; } catch (error) { motion.value = 'auto'; }
    motion.addEventListener('change', function () { if (typeof setMotionMode === 'function') setMotionMode(motion.value); });
    sheetBody.append(motionTitle, motion);
    const hapticTitle = document.createElement('p'); hapticTitle.className = 'weather-mod-label'; hapticTitle.textContent = t('weather.haptic', 'Haptics');
    const haptic = document.createElement('select'); haptic.className = 'weather-haptic-select'; haptic.setAttribute('aria-label', hapticTitle.textContent);
    [['full', t('weather.hapticFull','Full')], ['reduced', t('weather.hapticReduced','Reduced')], ['off', t('weather.hapticOff','Off')]].forEach(function (pair) {
      const option = document.createElement('option'); option.value = pair[0]; option.textContent = pair[1]; haptic.append(option);
    });
    try { haptic.value = localStorage.getItem('duskline-haptic') || 'full'; } catch (error) { haptic.value = 'full'; }
    haptic.addEventListener('change', function () {
      try { localStorage.setItem('duskline-haptic', haptic.value); } catch (error) {}
    });
    sheetBody.append(hapticTitle, haptic);
    const order = document.createElement('section'); order.className = 'weather-place-order';
    function paintOrder() {
      const places = loadFavorites();
      order.replaceChildren();
      if (!places.length && !myLocationCity) return;
      const title = document.createElement('p'); title.className = 'weather-mod-label'; title.textContent = t('weather.rearrange', 'Rearrange saved places'); order.append(title);
      places.forEach(function (city,index) {
        const row = document.createElement('div'); row.className = 'weather-place-order-row';
        const name = document.createElement('span'); name.textContent = displayCityName(city); row.append(name);
        [-1,1].forEach(function (direction) {
          const button = document.createElement('button'); button.type = 'button'; button.disabled = index+direction < 0 || index+direction >= places.length;
          button.innerHTML = weatherIcon(direction < 0 ? 'chevron-up' : 'chevron-down', 'weather-ui-icon');
          button.setAttribute('aria-label', t(direction < 0 ? 'weather.moveEarlier' : 'weather.moveLater', direction < 0 ? 'Move earlier' : 'Move later') + ': ' + displayCityName(city));
          button.addEventListener('click', function () {
            [places[index],places[index+direction]] = [places[index+direction],places[index]];
            saveFavorites(places); paintOrder(); refreshListsFromCache({force:true});
            const next = order.querySelectorAll('.weather-place-order-row')[index+direction];
            if (next) next.querySelector('button:not(:disabled)')?.focus();
          });
          row.append(button);
        });
        const remove=document.createElement('button');remove.type='button';remove.innerHTML=weatherIcon('x','weather-ui-icon');
        remove.setAttribute('aria-label',t('weather.removeFromMySky','Remove from My Sky')+': '+displayCityName(city));
        remove.addEventListener('click',function () {toggleFavorite(city);paintOrder();refreshListsFromCache({force:true});});
        row.append(remove);
        order.append(row);
      });
      if (myLocationCity) {
        const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'weather-place-clear'; clear.textContent = t('weather.clearLocation','Remove my location'); clear.setAttribute('data-haptic-important', '');
        clear.addEventListener('click', function () {
          const old = myLocationCity; const pack = cache.get(cityKey(old));
          saveMyLocation(null); paintOrder(); refreshListsFromCache({force:true});
          notify(t('weather.notice.removed','Removed from My Sky'),null,function () {
            saveMyLocation(old); if (pack) cache.set(cityKey(old),pack); paintOrder(); refreshListsFromCache({force:true});
          });
        });
        order.append(clear);
      }
    }
    paintOrder(); sheetBody.append(order);
    pushApi.mountSummary(sheetBody,openNotificationSettings);
    presentSheet();
    if (startedFromPage) sheetReturnFocus = unitsBtn;
    if (returningFromNotifications) {
      sheetBody.scrollTop = notificationSettingsReturnScroll;
      const summary = sheetBody.querySelector('.weather-push-summary');
      if (summary) summary.focus({preventScroll:true});
    }
  }

  function openNotificationSettings() {
    if (activeSheetKind === 'units') notificationSettingsReturnScroll = sheetBody.scrollTop;
    if(navigationApi)navigationApi.sheet('notifications',{parent:'units'});
    activeSheetKind='notifications';closeSuggest();hoistOverlays();
    setSheetTitle('<div class="wx-sheet-head" data-sheet-title><button type="button" class="weather-sheet-back" aria-label="'+escapeHtml(t('weather.settings','Settings'))+'">'+weatherIcon('arrow-left','weather-mod-icon')+'<span>'+escapeHtml(t('weather.settings','Settings'))+'</span></button><h3 class="wx-sheet-title">'+escapeHtml(t('weather.push.title','Notifications'))+'</h3></div>');
    const back = sheetPanel.querySelector('.weather-sheet-back');
    back.addEventListener('click',function () {
      if (!navigationApi || !navigationApi.backSheet()) openUnitsSheet({skipNavigation:true});
    });
    sheetBody.replaceChildren();pushApi.mountSettings(sheetBody);presentSheet(back);
  }

  function openPlacesSheet() {
    openUnitsSheet({skipNavigation:true});
    if(navigationApi) navigationApi.sheet('places');
    activeSheetKind='places';
    const manager=sheetBody.querySelector('.weather-place-order');
    sheetBody.replaceChildren();
    setSheetTitle('<div class="wx-sheet-head" data-sheet-title><div class="wx-sheet-icon">'+weatherIcon('map-pin','weather-mod-icon')+'</div><h3 class="wx-sheet-title">'+escapeHtml(t('weather.rearrange','Rearrange saved places'))+'</h3></div>');
    const primary=document.createElement('button');primary.type='button';primary.className='weather-place-clear';
    primary.textContent=t('weather.primaryLocationTitle','Primary city')+' · '+displayCityName(getGreetingSourceCity() || {});
    primary.addEventListener('click',openGreetingLocationSheet);sheetBody.append(primary);
    if(selectedGreetingCity && !isFavorite(selectedGreetingCity)) {
      const clear=document.createElement('button');clear.type='button';clear.className='weather-place-clear';
      const city=selectedGreetingCity;
      clear.textContent=t('weather.removeFromMySky','Remove from My Sky')+': '+displayCityName(city);
      clear.addEventListener('click',function () {
        selectedGreetingCity=null;try{localStorage.removeItem(SELECTED_CITY_KEY);localStorage.removeItem(GREETING_SOURCE_KEY);}catch(error){}
        refreshListsFromCache({force:true});openPlacesSheet();
        notify(t('weather.notice.removed','Removed from My Sky'),null,function () {saveGreetingCity(city);saveGreetingSource('city:'+cityKey(city));refreshListsFromCache({force:true});if(sheetIntentOpen && activeSheetKind==='places') openPlacesSheet();});
      });sheetBody.append(clear);
    }
    if(manager) sheetBody.append(manager);
    const choose=document.createElement('button');choose.type='button';choose.className='weather-place-clear';choose.textContent=t('weather.search','Search city');
    choose.addEventListener('click',function () {closeSheet({afterClose:startGreetingPlaceSelection});});sheetBody.append(choose);
  }
  function openInstallHelp() {
    if(navigationApi) navigationApi.sheet('install');
    activeSheetKind='install';
    setSheetTitle('<div class="wx-sheet-head" data-sheet-title><div class="wx-sheet-icon">'+weatherIcon('plus','weather-mod-icon')+'</div><h3 class="wx-sheet-title">'+escapeHtml(t('weather.install','Install duskline'))+'</h3></div>');
    sheetBody.innerHTML='<p class="wx-sheet-context">'+escapeHtml(t('weather.installHelp','Open your browser’s Share or menu, then choose Add to Home Screen or Install.'))+'</p>';
    presentSheet();
  }
  window.addEventListener('duskline:installhelp',openInstallHelp);
  const managePlaces=document.getElementById('weatherManagePlaces');
  if(managePlaces) managePlaces.addEventListener('click',openPlacesSheet);

  function openGreetingLocationSheet() {
    if (navigationApi) navigationApi.sheet("primary");
    if (!sheetEl || !sheetBody || weatherMode !== 'my-sky') return;
    closeSuggest();
    hoistOverlays();
    const title = t('weather.primaryLocationTitle', 'Primary city');
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
      choose.className = 'weather-detail-btn weather-greeting-source-search';
      choose.textContent = t('weather.chooseMySkyPlace', 'Choose a city for My Sky');
      choose.addEventListener('click', function () {
        closeSheet({ afterClose: startGreetingPlaceSelection });
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
        refreshListsFromCache({force:true});
        refresh(false,{quiet:true,reason:'view'});
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
      closeSheet({ afterClose: startGreetingPlaceSelection });
    });
    sheetBody.appendChild(searchCity);
    presentSheet();
  }

  const actionToolbar=document.querySelector('.weather-toolbar-actions');
  if(actionToolbar) actionToolbar.addEventListener('keydown',function (event) {
    const buttons=Array.from(actionToolbar.querySelectorAll('button:not([disabled])')).filter(button=>!button.closest('[hidden]'));
    const index=buttons.indexOf(document.activeElement);
    if(index<0 || event.altKey || event.ctrlKey || event.metaKey) return;
    const direction=document.documentElement.dir==='rtl'?-1:1;
    const step=event.key==='ArrowRight'?direction:event.key==='ArrowLeft'?-direction:0;
    const target=event.key==='Home'?0:event.key==='End'?buttons.length-1:step?(index+step+buttons.length)%buttons.length:null;
    if(target!=null) {event.preventDefault();buttons[target].focus({preventScroll:true});}
  });

  // Wire UI — manual refresh always works (re-click cancels prior load via refreshGen)
  if (mapOpenBtn && mapApi) {
    mapOpenBtn.addEventListener('click', function () {
      closeSuggest();
      const preferred = (openCity && openCity.city) || myLocationCity || selectedGreetingCity
        || loadFavorites()[0] || MAJOR[0] || null;
      mapApi.open({ initialCity: preferred, places: getMapPlaces(), returnFocus: mapOpenBtn });
    });
  }
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
      const day = e.target && e.target.closest ? e.target.closest('[data-day-date]') : null;
      if (day && detailMods.contains(day) && openCity) {
        e.preventDefault();
        restoreFocus(day);
        openSheet('day', openCity, { dayKey: day.getAttribute('data-day-date'), tempMode: 'actual' });
        return;
      }
      const btn = e.target && e.target.closest ? e.target.closest('[data-sheet]') : null;
      if (!btn || !detailMods.contains(btn)) return;
      const kind = btn.getAttribute('data-sheet');
      if (!kind || !openCity) return;
      if (sheetPtr && e.target.closest && e.target.closest('.weather-hourly')) {
        if (Math.abs(e.clientX - sheetPtr.x) > 12 || Math.abs(e.clientY - sheetPtr.y) > 12) return;
      }
      e.preventDefault();
      restoreFocus(btn);
      const hourButton = e.target.closest('[data-hour-index]');
      const hourIndex = hourButton ? Number(hourButton.dataset.hourIndex) : null;
      const hour = hourIndex != null && openCity.weather.hourly && openCity.weather.hourly.time[hourIndex];
      openSheet(kind, openCity, hour ? {dayKey:chartsApi.localDateKey(stampToMs(hour,cityTimeZone(openCity,openCity.city)),cityTimeZone(openCity,openCity.city)),hourIndex:hourIndex} : {});
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
  function openManualShareSheet(url) {
    setSheetTitle(`<div class="wx-sheet-head" data-sheet-title><div class="wx-sheet-icon">${modLabelIcon('conditions')}</div><h3 class="wx-sheet-title">${escapeHtml(t('weather.shareForecast', 'Share forecast'))}</h3></div>`);
    sheetBody.innerHTML = `<p class="wx-sheet-context">${escapeHtml(t('weather.notice.copyManually', 'Select this link to copy it:'))}</p><input id="wxShareLink" class="wx-share-link" type="text" readonly value="${escapeHtml(url)}" aria-label="${escapeHtml(t('weather.shareForecast', 'Share forecast'))}">`;
    const input = $('wxShareLink');
    presentSheet(input);
    const focusGeneration = sheetGen;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      const animations = typeof sheetPanel.getAnimations === 'function' ? sheetPanel.getAnimations().filter(animation=>animation.effect && animation.effect.getTiming().iterations !== Infinity) : [];
      Promise.all(animations.map(animation=>animation.finished.catch(function () {}))).then(function () {
        if (input && input.isConnected && sheetIntentOpen && sheetGen === focusGeneration) {
          input.focus({preventScroll:true}); input.select();
        }
      });
    }); });
  }
  async function copyShareLink(value) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (e) { /* browser policy may deny clipboard access */ }
    const priorFocus = document.activeElement;
    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (e) { /* unsupported */ }
    input.remove();
    restoreFocus(priorFocus, detailShareBtn);
    return copied;
  }
  if (detailShareBtn) detailShareBtn.addEventListener('click', async function () {
    if (!openCity || !openCity.city) return;
    const city = openCity.city;
    const url = new URL(location.pathname || '/', location.origin);
    const params = new URLSearchParams();
    params.set('lat', String(city.lat));
    params.set('lon', String(city.lon));
    params.set('name', city.name || displayCityName(city));
    if (city.admin1) params.set('admin1', city.admin1);
    if (city.tz) params.set('tz', city.tz);
    if (city.country_code) params.set('cc', city.country_code);
    if (city.country) params.set('country', city.country);
    url.search = params.toString();
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'duskline · ' + displayCityName(city), url: url.href });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    if (await copyShareLink(url.href)) notify(t('weather.linkCopied', 'Link copied'));
    else openManualShareSheet(url.href);
  });
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);
  if (sheetEl) sheetEl.addEventListener('click', (e) => { if (e.target === sheetEl) closeSheet(); });
  if (unitsBtn) unitsBtn.addEventListener('click', openUnitsSheet);
  // Rebuild the units sheet if open when language changes — its content is
  // built dynamically via t() and won't update through data-i18n attributes.
  document.addEventListener('duskline:prefs', function (e) {
    if (e.detail && e.detail.type === 'lang' && activeSheetKind === 'units' && sheetOpen) {
      openUnitsSheet();
    } else if(e.detail && e.detail.type==='lang' && activeSheetKind==='notifications' && sheetOpen)openNotificationSettings();
  });
  modeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      requestWeatherMode(button.getAttribute('data-weather-mode'));
    });
  });
  function focusCitySearch() {
    if (!searchEl) return;
    try { searchEl.scrollIntoView({ behavior: motionFull() ? 'smooth' : 'auto', block: 'center' }); } catch (e) {}
    try { searchEl.focus({ preventScroll: true }); } catch (e2) { searchEl.focus(); }
  }
  function startGreetingPlaceSelection() {
    selectingGreetingPlace = true;
    focusCitySearch();
  }
  if (greetingPlaceBtn) greetingPlaceBtn.addEventListener('click', function () {
    if (greetingSourceOptions().length) openGreetingLocationSheet();
    else startGreetingPlaceSelection();
  });
  if (mySkySearchBtn) mySkySearchBtn.addEventListener('click', startGreetingPlaceSelection);
  if (mySkyLocateBtn && locateBtn) mySkyLocateBtn.addEventListener('click', function () { locateBtn.click(); });
  if (startSearchBtn) startSearchBtn.addEventListener('click', startGreetingPlaceSelection);
  if (startLocateBtn && locateBtn) startLocateBtn.addEventListener('click', function () { locateBtn.click(); });
  if (moreBtn) moreBtn.addEventListener('click', function () {
    horizonExpanded = true; rememberHorizon();
    refreshListsFromCache({ force: true });
    refresh(false, { quiet: true, reason: 'expand' });
  });

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
      const finishLocating = window.DusklineLoading ? window.DusklineLoading.begin(t('weather.locating','Getting location…')) : function () {};
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
          saveGreetingSource('my-location');
          // A successful opt-in should visibly land in the personal forecast, even
          // when the user had previously chosen Horizon explicitly.
          setWeatherMode('my-sky', true, true);
          const locatedPack = await dataApi.loadCity(city);
          if (locatedPack && locatedPack.weather) cache.set(cityKey(city), locatedPack);
          refreshListsFromCache();
          notify(t('weather.notice.added', 'Added to My Sky'));
          // Card only — do not open detail
          if (myLocBlock) {
            try { myLocBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
          }
        } catch (e) {
          showError(t('weather.error', 'Could not load weather data.'));
        } finally {
          finishLocating();
          locateBtn.disabled = false;
          locateBtn.removeAttribute('aria-busy');
          locateBtn.setAttribute('title', prevTitle || t('weather.useLocation', 'Use my location'));
        }
      }, (err) => {
        finishLocating();
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
    searchEl.addEventListener('focus', function () {
      if (!searchEl.value.trim()) renderRecentSuggestions();
    });
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.trim();
      closeSuggest();
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
      if (e.key === 'ArrowRight' && suggestIndex >= 0) {
        const choice = suggestOptions()[suggestIndex];
        const save = choice && choice.closest('.s-result').querySelector('.s-add');
        if (save) { e.preventDefault(); save.focus(); }
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
      renderRecentSuggestions();
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
        || (mySkySearchBtn && mySkySearchBtn.contains(e.target))
        || (startSearchBtn && startSearchBtn.contains(e.target))
        || (e.target.closest && e.target.closest('.weather-greeting-source-search'))) return;
    selectingGreetingPlace = false;
    closeSuggest();
  });

  function focusables(root) {
    if (!root) return [];
    return Array.prototype.filter.call(
      root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (el) { return !el.disabled && el.tabIndex >= 0 && el.offsetParent !== null
        && !el.hidden && !el.closest('[inert], [aria-hidden="true"]'); }
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
  window.addEventListener('resize', function () { finishGreetingTyping(); });
  window.addEventListener('online', function () {
    if (isPageActive()) refresh(true, { quiet: true, reason: 'reconnect' });
  });
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
    if(bootPending && !cache.size) {refreshListsFromCache({force:true});return;}
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
      updateGreeting();
      window.refreshWeatherUi({ force: false });
      return;
    }
    if (type === 'motion') {
      finishGreetingTyping();
      applyAmbientPageSky();
      if (openCity && openCity.weather && isDetailVisible()) openDetail(openCity);
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
    const alertQuery=new URLSearchParams(location.search),alertId=alertQuery.get('alert'),alertEvent=alertQuery.get('alert_event');
    try {
      var pack = await dataApi.loadCity(city, null, { enrich: true, forceFetch: true });
      if (!pack || !pack.weather) return false;
      cache.set(cityKey(city), pack);
      listPaintLocked = false;
      try { clearWeatherSkeleton(); } catch (e) { /* ignore */ }
      const alertCheck=alertId?alertsApi.ensureAlerts(pack,{force:true,retryFailed:true}):null;
      openDetail(pack);
      if(alertId)Promise.resolve(alertCheck).then(function () {
        if(!openCity || !sameCity(openCity.city,city))return;
        openDetail(cache.get(cityKey(city)) || pack);
        const matches=pack.alerts && (pack.alerts.find(alert=>alert.id===alertId) || pack.alerts.find(alert=>alertEvent && alert.event===alertEvent));
        if(matches && openCity && sameCity(openCity.city,city)){
          alertsApi.restoreOpenAlertTitles([matches.event]);
          requestAnimationFrame(()=>{if(!openCity || !sameCity(openCity.city,city))return;const target=detailMods.querySelector('.weather-alert.is-open');if(target)target.scrollIntoView({block:'center',behavior:motionFull()?'smooth':'auto'});});
        }else notify(pack.alertsError?t('weather.push.providerError','The last check failed. Retrying automatically.'):t('weather.push.expired','This warning is no longer active. Showing current alerts.'));
      }).catch(function () { console.warn('weather_notification_navigation_failed'); });
      return true;
    } catch (e) {
      return false;
    }
  }

  // Controllers now own input. Replay an early tap without making haptics its owner.
  window.__dusklineWeatherReady=true;
  const pendingBootAction=window.__dusklinePendingWeatherAction;
  delete window.__dusklinePendingWeatherAction;
  document.querySelectorAll('[data-weather-mode],#weatherMapOpen,#weatherUnitsBtn,#weatherRefresh').forEach(function (button) {button.removeAttribute('aria-busy');});
  if(pendingBootAction && pendingBootAction.mode) {
    weatherMode=pendingBootAction.mode;weatherModeExplicit=true;
    try{localStorage.setItem(MODE_KEY,weatherMode);}catch(error){}
  }
  // Kick off — paint the complete static catalog immediately, then refresh it quietly.
  myLocationCity = loadMyLocation();
  selectedGreetingCity = loadGreetingCity();
  pushApi.init();
  savedSnapshots.forEach(function (pack) {
    cacheStore.set(cityKey(pack.city), Object.assign({}, pack, { stored: true }));
  });
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
      bootPending=false;
      // List fills in behind detail. Do not force-refetch the city we just opened.
      refresh(opened ? false : true, {
        quiet: !!opened,
        reason: opened ? 'boot-after-deeplink' : 'boot'
      });
    });
  } else {
    bootPending=false;
    refresh(true, { quiet: true, reason: 'boot' });
  }
  if(pendingBootAction && pendingBootAction.id) document.getElementById(pendingBootAction.id)?.click();
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
