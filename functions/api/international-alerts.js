'use strict';

const ALERT_HUB_GRAPHQL = 'https://alerthub-api.ifrc.org/graphql/';
const PAGE_SIZE = 100;
const MAX_CATALOG_PAGES = 10;
const MAX_ALERT_PAGES = 2;
const MAX_ADMIN1_ALERT_PAGES = 5;
const MAX_CATALOG_ITEMS = PAGE_SIZE * MAX_CATALOG_PAGES;
const COUNTRY_CACHE_SECONDS = 24 * 60 * 60;
const FEED_CACHE_SECONDS = 6 * 60 * 60;
const ALERT_CACHE_SECONDS = 180;
const SUPPORTED_LANGUAGES = {
  en: 'en', es: 'es', fr: 'fr', de: 'de', it: 'it', 'pt-br': 'pt-BR', 'pt-pt': 'pt-PT',
  nl: 'nl', da: 'da', sv: 'sv', nb: 'nb', fi: 'fi', pl: 'pl', cs: 'cs', hu: 'hu',
  ro: 'ro', el: 'el', tr: 'tr', ru: 'ru', uk: 'uk', ar: 'ar', he: 'he', hi: 'hi',
  th: 'th', vi: 'vi', id: 'id', ja: 'ja', ko: 'ko', zh: 'zh', 'zh-tw': 'zh-TW'
};

const COUNTRY_ALIASES = {
  BN: ['Brunei Darussalam'],
  BO: ['Bolivia (Plurinational State of)'],
  CD: ['Democratic Republic of the Congo', 'Congo, the Democratic Republic of the'],
  CG: ['Congo', 'Republic of the Congo'],
  CI: ["Côte d'Ivoire", 'Ivory Coast'],
  CV: ['Cabo Verde', 'Cape Verde'],
  CZ: ['Czechia', 'Czech Republic'],
  EL: ['Greece'],
  GB: ['United Kingdom', 'United Kingdom of Great Britain and Northern Ireland'],
  HK: ['Hong Kong', 'Hong Kong, China', 'Hong Kong SAR China'],
  IR: ['Iran', 'Iran (Islamic Republic of)'],
  KP: ["Democratic People's Republic of Korea", 'North Korea'],
  KR: ['Republic of Korea', 'South Korea'],
  LA: ["Lao People's Democratic Republic", 'Laos'],
  MD: ['Republic of Moldova', 'Moldova'],
  MM: ['Myanmar', 'Burma'],
  MK: ['North Macedonia', 'Republic of North Macedonia'],
  NL: ['Netherlands', 'Netherlands (Kingdom of the)'],
  PS: ['Palestine', 'State of Palestine'],
  RU: ['Russian Federation', 'Russia'],
  SY: ['Syrian Arab Republic', 'Syria'],
  TZ: ['United Republic of Tanzania', 'Tanzania'],
  TR: ['Türkiye', 'Turkey'],
  US: ['United States', 'United States of America'],
  UK: ['United Kingdom', 'United Kingdom of Great Britain and Northern Ireland'],
  VE: ['Venezuela', 'Venezuela (Bolivarian Republic of)'],
  VN: ['Viet Nam', 'Vietnam'],
  XK: ['Kosovo', 'Republic of Kosovo']
};

const COUNTRIES_QUERY = `query($page: OffsetPaginationInput) {
  public {
    countries(pagination: $page) {
      count
      items { id iso3 name }
    }
  }
}`;

const FEEDS_QUERY = `query($page: OffsetPaginationInput) {
  public {
    feeds(pagination: $page) {
      count
      items { official enableRebroadcast status country { iso3 } }
    }
  }
}`;

const ALERTS_QUERY = `query($filter: AlertFilter, $page: OffsetPaginationInput) {
  public {
    alerts(filters: $filter, order: { sent: DESC }, pagination: $page) {
      count
      items {
        id sent url identifier sender source scope status msgType references
        country { iso3 name }
        feed { official enableRebroadcast authorName }
        admin1s { name }
        infos {
          language event senderName headline description instruction web
          category categoryDisplay responseType urgency severity certainty
          effective onset expires
          areas {
            areaDesc
            polygons { value valuePolygon }
            circles { value }
            geocodes { valueName value }
          }
        }
      }
    }
  }
}`;

const COUNTRY_ADMIN1_QUERY = `query($pk: ID!) {
  public {
    country(pk: $pk) {
      admin1s { id name }
    }
  }
}`;

function jsonResponse(body, status, cacheSeconds) {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': cacheSeconds
      ? 'public, max-age=0, s-maxage=' + cacheSeconds
      : 'no-store'
  });
  return new Response(JSON.stringify(body), { status: status || 200, headers: headers });
}

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeAdmin1Name(value) {
  const normalized = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  const simplified = normalized
    .replace(/\b(state|province|prefecture|metropolis|metropolitan|region|county|district|department|governorate|oblast|territory|municipality|autonomous|community|national capital|shi|sheng|zizhiqu)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^of\s+/, '');
  return simplified || normalized;
}

function countryNameCandidates(code) {
  const candidates = [];
  const cc = String(code || '').toUpperCase();
  if (cc && typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
    try { candidates.push(new Intl.DisplayNames(['en'], { type: 'region' }).of(cc)); } catch (e) {}
  }
  if (COUNTRY_ALIASES[cc]) candidates.push.apply(candidates, COUNTRY_ALIASES[cc]);
  return new Set(candidates.map(normalizeName).filter(Boolean));
}

function findCountry(countries, code, name) {
  const normalizedName = normalizeName(name);
  const wanted = countryNameCandidates(code);
  if (!code && normalizedName) {
    wanted.add(normalizedName);
    Object.keys(COUNTRY_ALIASES).forEach(function (aliasCode) {
      const names = countryNameCandidates(aliasCode);
      if (names.has(normalizedName)) names.forEach(function (candidate) { wanted.add(candidate); });
    });
  }
  if (!wanted.size) return null;
  return countries.find(function (country) {
    return wanted.has(normalizeName(country.name));
  }) || null;
}

function getCache(context) {
  if (context.env && context.env.CAP_CACHE) return context.env.CAP_CACHE;
  try { return globalThis.caches && globalThis.caches.default; } catch (e) { return null; }
}

function cacheKey(context, pathname) {
  const origin = new URL(context.request.url).origin;
  return new Request(origin + '/__duskline-cache/' + pathname, { method: 'GET' });
}

async function readCached(cache, key) {
  if (!cache) return null;
  try {
    const response = await cache.match(key);
    if (!response || !response.ok) return null;
    return await response.json();
  } catch (e) { return null; }
}

async function writeCached(context, cache, key, value, ttl) {
  if (!cache) return;
  const response = jsonResponse(value, 200, ttl);
  try {
    const write = cache.put(key, response);
    if (typeof context.waitUntil === 'function') context.waitUntil(write);
    else await write;
  } catch (e) { /* Cache is an optimization; the response remains usable. */ }
}

async function graphQL(context, query, variables) {
  const fetcher = context.env && context.env.CAP_FETCH
    ? context.env.CAP_FETCH
    : globalThis.fetch;
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, 12000);
  try {
    const response = await fetcher(ALERT_HUB_GRAPHQL, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query, variables: variables }),
      signal: controller.signal
    });
    if (!response || !response.ok) throw new Error('Alert Hub HTTP error');
    const payload = await response.json();
    if (payload.errors && payload.errors.length) throw new Error('Alert Hub query error');
    if (!payload.data || !payload.data.public) throw new Error('Alert Hub response missing data');
    return payload.data.public;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchCollection(context, query, keyName, ttl) {
  const cache = getCache(context);
  const key = cacheKey(context, 'cap/catalog-' + keyName + '-v1');
  const cached = await readCached(cache, key);
  if (cached) return cached;

  const items = [];
  let total = null;
  let truncated = false;
  for (let page = 0; page < MAX_CATALOG_PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const data = await graphQL(context, query, { page: { limit: PAGE_SIZE, offset: offset } });
    const collection = data[keyName];
    if (!collection || !Array.isArray(collection.items)) throw new Error('Alert Hub catalog is invalid');
    if (total == null) total = Number(collection.count) || collection.items.length;
    items.push.apply(items, collection.items);
    if (items.length >= total) break;
    if (collection.items.length < PAGE_SIZE) {
      truncated = true;
      break;
    }
    if (page === MAX_CATALOG_PAGES - 1) truncated = true;
  }
  const value = { items: items.slice(0, MAX_CATALOG_ITEMS), count: total || items.length, truncated: truncated };
  if (!truncated) await writeCached(context, cache, key, value, ttl);
  return value;
}

async function getCountryCatalog(context) {
  const cache = getCache(context);
  const key = cacheKey(context, 'cap/countries-v1');
  const cached = await readCached(cache, key);
  if (cached) return cached;
  const result = await fetchCollection(context, COUNTRIES_QUERY, 'countries', COUNTRY_CACHE_SECONDS);
  if (result.truncated) throw new Error('Alert Hub country catalog is incomplete');
  const countries = result.items.filter(function (country) {
    return country && country.id && country.iso3 && country.name;
  });
  const value = { items: countries, count: result.count };
  await writeCached(context, cache, key, value, COUNTRY_CACHE_SECONDS);
  return value;
}

async function getFeedCatalog(context) {
  const cache = getCache(context);
  const key = cacheKey(context, 'cap/feeds-v1');
  const cached = await readCached(cache, key);
  if (cached) return cached;
  const result = await fetchCollection(context, FEEDS_QUERY, 'feeds', FEED_CACHE_SECONDS);
  if (result.truncated) throw new Error('Alert Hub feed catalog is incomplete');
  const countryCodes = Array.from(new Set(result.items.filter(function (feed) {
    return feed && feed.official && feed.enableRebroadcast
      && String(feed.status || '').toUpperCase() === 'ACTIVE'
      && feed.country && feed.country.iso3;
  }).map(function (feed) { return String(feed.country.iso3).toUpperCase(); })));
  const value = { countryCodes: countryCodes, count: result.count };
  await writeCached(context, cache, key, value, FEED_CACHE_SECONDS);
  return value;
}

async function getCountryAdmin1s(context, countryId) {
  const cache = getCache(context);
  const key = cacheKey(context, 'cap/admin1s/' + encodeURIComponent(String(countryId)) + '-v1');
  const cached = await readCached(cache, key);
  if (cached) return cached;
  const data = await graphQL(context, COUNTRY_ADMIN1_QUERY, { pk: String(countryId) });
  const country = data.country;
  if (!country || !Array.isArray(country.admin1s)) throw new Error('Alert Hub administrative regions are invalid');
  const value = { items: country.admin1s.filter(function (region) { return region && region.id && region.name; }) };
  await writeCached(context, cache, key, value, COUNTRY_CACHE_SECONDS);
  return value;
}

async function findAdmin1(context, countryId, name) {
  const wanted = normalizeAdmin1Name(name);
  if (!wanted) return null;
  const catalog = await getCountryAdmin1s(context, countryId);
  const matches = catalog.items.filter(function (region) {
    return normalizeAdmin1Name(region.name) === wanted;
  });
  return matches.length === 1 ? matches[0] : null;
}

function parseDate(value) {
  const result = Date.parse(value || '');
  return Number.isFinite(result) ? result : null;
}

function alertCacheSeconds(alerts, now) {
  const expiries = (alerts || []).map(function (alert) { return parseDate(alert.ends); }).filter(function (value) {
    return value != null && value > now;
  });
  if (!expiries.length) return ALERT_CACHE_SECONDS;
  const untilNextExpiry = Math.floor((Math.min.apply(null, expiries) - now) / 1000);
  return Math.max(1, Math.min(ALERT_CACHE_SECONDS, untilNextExpiry));
}

function splitReferences(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean);
}

function selectLanguageInfos(infos, language) {
  if (!Array.isArray(infos) || !infos.length) return [];
  const requested = String(language || 'en').replace(/_/g, '-').toLowerCase();
  const base = requested.split('-')[0];
  function score(info) {
    const current = String(info.language || '').replace(/_/g, '-').toLowerCase();
    if (!current) return 0;
    if (current === requested) return 4;
    if (current.split('-')[0] === base) return 3;
    if (current === 'en' || current.startsWith('en-')) return 2;
    return 1;
  }
  let best = -1;
  infos.forEach(function (info) { best = Math.max(best, score(info)); });
  if (best < 0) return [];
  return infos.filter(function (info) { return score(info) === best; });
}

function activeInfo(alert, info, now) {
  if (!info || !(info.event || info.headline)) return false;
  const sent = parseDate(alert.sent);
  const effective = parseDate(info.effective);
  const expires = parseDate(info.expires);
  if (effective != null && effective > now) return false;
  if (expires != null) return expires > now;
  // A missing expiry is malformed CAP. Keep only a very recent message rather
  // than allowing an undated public-safety alert to remain active indefinitely.
  return sent != null && sent > now - 24 * 60 * 60 * 1000;
}

function activeAlert(alert) {
  if (!alert || String(alert.status || '').toUpperCase() !== 'ACTUAL') return false;
  const scope = String(alert.scope || '').trim().toUpperCase();
  if (scope !== 'PUBLIC') return false;
  const type = String(alert.msgType || '').trim().toUpperCase();
  return type === 'ALERT' || type === 'UPDATE';
}

function alertReferenceKey(alert) {
  return [alert.sender || '', alert.identifier || '', alert.sent || ''].join(',');
}

function normaliseInfo(alert, info, index, countryName) {
  const eventName = info.event || info.headline || 'Public alert';
  return {
    id: String(alert.identifier || alert.id || 'cap-alert') + ':' + index,
    capIdentifier: String(alert.identifier || alert.id || ''),
    sender: String(alert.sender || ''),
    sent: alert.sent || null,
    references: alert.references || '',
    event: eventName,
    severity: info.severity || 'Unknown',
    urgency: info.urgency || '',
    certainty: info.certainty || '',
    headline: info.headline || '',
    description: info.description || '',
    instruction: info.instruction || '',
    ends: info.expires || null,
    effective: info.effective || null,
    onset: info.onset || null,
    language: info.language || '',
    category: info.category || '',
    categoryDisplay: info.categoryDisplay || '',
    responseType: info.responseType || '',
    areaDesc: (info.areas || []).map(function (area) { return area && area.areaDesc; }).filter(Boolean).join(' · '),
    areas: Array.isArray(info.areas) ? info.areas : [],
    admin1s: Array.isArray(alert.admin1s) ? alert.admin1s.map(function (a) { return a && a.name; }).filter(Boolean) : [],
    senderName: info.senderName || alert.source || alert.feed && alert.feed.authorName || countryName,
    providerName: 'IFRC Alert Hub',
    sourceUrl: info.web || alert.url || '',
    official: !!(alert.feed && alert.feed.official),
    rebroadcastable: !!(alert.feed && alert.feed.enableRebroadcast)
  };
}

async function fetchCountryAlerts(context, countryId, countryName, language, admin1Id) {
  const items = [];
  let total = null;
  let truncated = false;
  const maxPages = admin1Id ? MAX_ADMIN1_ALERT_PAGES : MAX_ALERT_PAGES;
  for (let page = 0; page < maxPages; page++) {
    const offset = page * PAGE_SIZE;
    const data = await graphQL(context, ALERTS_QUERY, {
      filter: Object.assign({ country: { pk: String(countryId) } }, admin1Id ? { admin1: String(admin1Id) } : {}),
      page: { limit: PAGE_SIZE, offset: offset }
    });
    const collection = data.alerts;
    if (!collection || !Array.isArray(collection.items)) throw new Error('Alert Hub alerts are invalid');
    if (total == null) total = Number(collection.count) || collection.items.length;
    items.push.apply(items, collection.items);
    if (items.length >= total) break;
    if (collection.items.length < PAGE_SIZE) {
      truncated = true;
      break;
    }
    if (page === maxPages - 1) truncated = true;
  }

  const superseded = new Set();
  items.forEach(function (alert) {
    const type = String(alert && alert.msgType || '').toUpperCase();
    if (type !== 'UPDATE' && type !== 'CANCEL') return;
    if (!activeAlert(Object.assign({}, alert, { msgType: 'UPDATE' }))) return;
    if (!alert.feed || !alert.feed.official || !alert.feed.enableRebroadcast) return;
    splitReferences(alert.references).forEach(function (reference) { superseded.add(reference); });
  });

  const now = Date.now();
  const normalized = [];
  items.forEach(function (alert) {
    if (!activeAlert(alert)) return;
    if (!alert.feed || !alert.feed.official || !alert.feed.enableRebroadcast) return;
    if (superseded.has(alertReferenceKey(alert))) return;
    const infos = selectLanguageInfos(alert.infos || [], language)
      .filter(function (info) { return activeInfo(alert, info, now); });
    infos.forEach(function (info, index) {
      normalized.push(normaliseInfo(alert, info, index, countryName));
    });
  });
  return { alerts: normalized, truncated: truncated, count: total || items.length };
}

async function onRequest(context) {
  if (context.request.method !== 'GET') {
    return jsonResponse({ error: 'method_not_allowed' }, 405, 0);
  }
  const url = new URL(context.request.url);
  const countryCode = String(url.searchParams.get('cc') || '').trim().toUpperCase();
  const countryName = String(url.searchParams.get('country') || '').trim().slice(0, 120);
  const admin1Name = String(url.searchParams.get('admin1') || '').trim().slice(0, 120);
  const requestedLanguage = String(url.searchParams.get('lang') || 'en').trim().slice(0, 24).toLowerCase();
  const language = SUPPORTED_LANGUAGES[requestedLanguage] || 'en';
  if ((countryCode && !/^[A-Z]{2}$/.test(countryCode)) || !countryName) {
    return jsonResponse({ error: 'invalid_location' }, 400, 0);
  }

  const responseCache = getCache(context);
  const locationKey = countryCode || ('name-' + normalizeName(countryName).replace(/[^a-z0-9]+/g, '-'));
  const regionKey = admin1Name ? '/admin1-' + encodeURIComponent(normalizeAdmin1Name(admin1Name).replace(/\s+/g, '-')) : '';
  const alertKey = cacheKey(context, 'cap/alerts/' + locationKey + regionKey + '/' + encodeURIComponent(language.toLowerCase()));
  const cachedAlerts = await readCached(responseCache, alertKey);
  if (cachedAlerts) {
    const cachedTtl = cachedAlerts.availability === 'available'
      ? alertCacheSeconds(cachedAlerts.alerts, Date.now())
      : ALERT_CACHE_SECONDS;
    return jsonResponse(cachedAlerts, 200, cachedTtl);
  }

  try {
    const [countries, feedCatalog] = await Promise.all([
      getCountryCatalog(context),
      getFeedCatalog(context)
    ]);
    const country = findCountry(countries.items, countryCode, countryName);
    if (!country || !feedCatalog.countryCodes.includes(String(country.iso3).toUpperCase())) {
      const body = {
        availability: 'unsupported',
        provider: 'IFRC Alert Hub',
        country: country ? country.name : countryName,
        alerts: [],
        truncated: false,
        fetchedAt: Date.now()
      };
      await writeCached(context, responseCache, alertKey, body, ALERT_CACHE_SECONDS);
      return jsonResponse(body, 200, ALERT_CACHE_SECONDS);
    }

    const matchedAdmin1 = admin1Name ? await findAdmin1(context, country.id, admin1Name) : null;
    const result = await fetchCountryAlerts(context, country.id, country.name, language, matchedAdmin1 && matchedAdmin1.id);
    const alertTtl = alertCacheSeconds(result.alerts, Date.now());
    const body = {
      availability: 'available',
      provider: 'IFRC Alert Hub',
      country: country.name,
      alerts: result.alerts,
      truncated: result.truncated,
      scoped: !!matchedAdmin1,
      fetchedAt: Date.now()
    };
    await writeCached(context, responseCache, alertKey, body, alertTtl);
    return jsonResponse(body, 200, alertTtl);
  } catch (error) {
    return jsonResponse({ error: 'upstream_unavailable', provider: 'IFRC Alert Hub' }, 502, 0);
  }
}

export { onRequest };
