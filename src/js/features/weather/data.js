'use strict';
/* Duskline — weather/data.js */
(function (global) {
  var W = global.DusklineWeather;
  if (!W || !W.active) return;

  W.factories.data = function createDataModule(deps) {
    deps = deps || {};
    var cache = deps.cache;
    var MAJOR = deps.MAJOR || [];
    function cityKey(c) { return typeof deps.cityKey === 'function' ? deps.cityKey(c) : ''; }
    function sameCity(a, b) { return typeof deps.sameCity === 'function' ? deps.sameCity(a, b) : false; }
    // Optional hooks (alerts integration) — resolved at call time from deps
    function loadNwsAlerts() {
      if (typeof deps.loadNwsAlerts === 'function') return deps.loadNwsAlerts.apply(null, arguments);
    }
    function applyAlertsToPack() {
      if (typeof deps.applyAlertsToPack === 'function') return deps.applyAlertsToPack.apply(null, arguments);
    }
    function ensureNwsAlerts() {
      if (typeof deps.ensureNwsAlerts === 'function') return deps.ensureNwsAlerts.apply(null, arguments);
    }
    var FORECAST = deps.FORECAST;
    var GEOCODE = deps.GEOCODE;
    var AIR = deps.AIR;
    var FORECAST_Q = deps.FORECAST_Q;
    var REFRESH_MS = deps.REFRESH_MS || (10 * 60 * 1000);

    const FETCH_MS = (deps && deps.FETCH_MS) || 14000;

    /** Merge caller signal with a timeout so hung Open-Meteo requests cannot freeze the list forever. */
    function withTimeoutSignal(outer, ms) {
      if (typeof AbortController !== 'function') return { signal: outer, cancel: function () {} };
      const ctl = new AbortController();
      let timer = 0;
      const abortFromOuter = function () {
        try { ctl.abort(); } catch (e) {}
      };
      if (outer) {
        if (outer.aborted) abortFromOuter();
        else outer.addEventListener('abort', abortFromOuter, { once: true });
      }
      timer = window.setTimeout(abortFromOuter, ms || FETCH_MS);
      return {
        signal: ctl.signal,
        cancel: function () {
          if (timer) window.clearTimeout(timer);
          timer = 0;
          if (outer) {
            try { outer.removeEventListener('abort', abortFromOuter); } catch (e) {}
          }
        }
      };
    }

    async function fetchJson(url, signal) {
      const wrap = withTimeoutSignal(signal, FETCH_MS);
      try {
        const res = await fetch(url, { signal: wrap.signal });
        if (res.status === 429) {
          const err = new Error('HTTP 429');
          err.name = 'RateLimitError';
          throw err;
        }
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        // Open-Meteo sometimes returns 200 + { error: true, reason: "..." }
        if (data && data.error) {
          const reason = String(data.reason || data.error || 'API error');
          const err = new Error(reason);
          err.name = /limit|429|rate/i.test(reason) ? 'RateLimitError' : 'ApiError';
          throw err;
        }
        return data;
      } finally {
        wrap.cancel();
      }
    }

    // ── Hybrid providers: NWS (US primary) + Open-Meteo (global / enrich / fallback) ──
    const NWS_BASE = 'https://api.weather.gov';
    const NWS_POINTS_LS = 'duskline-nws-points-v1';
    const NWS_POINTS_TTL = 7 * 24 * 60 * 60 * 1000;
    const nwsPointsMem = new Map();

    function roundCoord(n) {
      return Math.round(Number(n) * 10000) / 10000;
    }

    function isLikelyUs(c) {
      if (!c || c.lat == null || c.lon == null) return false;
      if (c.country && /united states|^usa$|^us$|u\.s\./i.test(String(c.country))) return true;
      try {
        if (MAJOR.some(function (m) { return sameCity(m, c); })) return true;
      } catch (e) {}
      const lat = Number(c.lat);
      const lon = Number(c.lon);
      if (!(lat === lat) || !(lon === lon)) return false;
      // Contiguous US
      if (lat >= 24.4 && lat <= 49.5 && lon >= -125.0 && lon <= -66.8) return true;
      // Alaska
      if (lat >= 51 && lat <= 72 && lon >= -170 && lon <= -129) return true;
      // Hawaii
      if (lat >= 18.8 && lat <= 22.4 && lon >= -160.5 && lon <= -154.7) return true;
      // Puerto Rico / USVI (rough)
      if (lat >= 17.6 && lat <= 18.6 && lon >= -67.5 && lon <= -64.5) return true;
      return false;
    }

    function getCachedNwsPoints(lat, lon) {
      const k = roundCoord(lat) + ',' + roundCoord(lon);
      if (nwsPointsMem.has(k)) return nwsPointsMem.get(k);
      try {
        const raw = localStorage.getItem(NWS_POINTS_LS);
        const all = raw ? JSON.parse(raw) : {};
        const hit = all[k];
        if (hit && hit.data && Date.now() - (hit.ts || 0) < NWS_POINTS_TTL) {
          nwsPointsMem.set(k, hit.data);
          return hit.data;
        }
      } catch (e) {}
      return null;
    }

    function setCachedNwsPoints(lat, lon, data) {
      const k = roundCoord(lat) + ',' + roundCoord(lon);
      nwsPointsMem.set(k, data);
      try {
        const raw = localStorage.getItem(NWS_POINTS_LS);
        const all = raw ? JSON.parse(raw) : {};
        all[k] = { ts: Date.now(), data: data };
        const keys = Object.keys(all);
        if (keys.length > 100) {
          keys.sort(function (a, b) { return (all[a].ts || 0) - (all[b].ts || 0); });
          keys.slice(0, keys.length - 70).forEach(function (x) { delete all[x]; });
        }
        localStorage.setItem(NWS_POINTS_LS, JSON.stringify(all));
      } catch (e) {}
    }

    function clearCachedNwsPoints(lat, lon) {
      const k = roundCoord(lat) + ',' + roundCoord(lon);
      nwsPointsMem.delete(k);
      try {
        const raw = localStorage.getItem(NWS_POINTS_LS);
        const all = raw ? JSON.parse(raw) : {};
        delete all[k];
        localStorage.setItem(NWS_POINTS_LS, JSON.stringify(all));
      } catch (e) {}
    }

    /** Full clear — used by Refresh so NWS grid points are re-fetched too */
    function clearAllNwsPointsCache() {
      nwsPointsMem.clear();
      try { localStorage.removeItem(NWS_POINTS_LS); } catch (e) {}
    }

    function shortForecastToCode(text, isNight) {
      const s = String(text || '').toLowerCase();
      if (/thunder|t-?storm|lightning/.test(s)) return 95;
      if (/blizzard|heavy snow|snow shower|flurries|snow|wintry/.test(s)) return 73;
      if (/sleet|ice pellet|freezing rain|freezing drizzle/.test(s)) return 66;
      if (/heavy rain|torrential/.test(s)) return 65;
      if (/rain shower|showers|rain|drizzle/.test(s)) return 63;
      if (/fog|mist|haze/.test(s)) return 45;
      if (/overcast/.test(s)) return 3;
      if (/mostly cloudy|partly cloudy|partly sunny|mostly sunny|partly clear/.test(s)) return 2;
      if (/cloud/.test(s)) return 3;
      if (/clear|sunny|fair|hot|cold/.test(s)) return 0;
      return isNight ? 1 : 2;
    }

    function parseWindMphToMs(str) {
      if (str == null) return null;
      if (typeof str === 'number' && Number.isFinite(str)) return str * 0.44704;
      const m = String(str).match(/(\d+)(?:\s*to\s*(\d+))?/i);
      if (!m) return null;
      const a = Number(m[1]);
      const b = m[2] != null ? Number(m[2]) : a;
      return ((a + b) / 2) * 0.44704;
    }

    function parseWindDir(str) {
      if (str == null) return null;
      if (typeof str === 'number' && Number.isFinite(str)) return str;
      const dirs = {
        N: 0, NNE: 22, NE: 45, ENE: 67, E: 90, ESE: 112, SE: 135, SSE: 157,
        S: 180, SSW: 202, SW: 225, WSW: 247, W: 270, WNW: 292, NW: 315, NNW: 337
      };
      const s = String(str).trim().toUpperCase();
      if (dirs[s] != null) return dirs[s];
      const n = parseInt(s, 10);
      return Number.isFinite(n) ? n : null;
    }

    function nwsTempToC(temp, unit) {
      if (temp == null || !Number.isFinite(Number(temp))) return null;
      const u = String(unit || 'F').toUpperCase();
      const t = Number(temp);
      return u === 'C' ? t : (t - 32) * 5 / 9;
    }

    function normalizeNws(city, points, forecast, hourlyDoc) {
      const periods = (forecast && forecast.properties && forecast.properties.periods) || [];
      const hPeriods = (hourlyDoc && hourlyDoc.properties && hourlyDoc.properties.periods) || [];
      const now = Date.now();
      let curP = null;
      for (let i = 0; i < hPeriods.length; i++) {
        const t0 = new Date(hPeriods[i].startTime).getTime();
        const t1 = hPeriods[i].endTime ? new Date(hPeriods[i].endTime).getTime() : t0 + 3600000;
        if (now >= t0 - 600000 && now < t1 + 600000) { curP = hPeriods[i]; break; }
        if (t0 > now) { curP = hPeriods[Math.max(0, i - 1)] || hPeriods[i]; break; }
      }
      if (!curP) curP = hPeriods[0] || periods[0] || null;
      const isNight = !!(curP && curP.isDaytime === false);
      const code = shortForecastToCode(curP && curP.shortForecast, isNight);
      const tempC = curP ? nwsTempToC(curP.temperature, curP.temperatureUnit) : null;

      const current = {
        time: curP && curP.startTime,
        temperature_2m: tempC,
        weather_code: code,
        wind_speed_10m: parseWindMphToMs(curP && curP.windSpeed),
        wind_direction_10m: parseWindDir(curP && curP.windDirection)
      };

      const hTime = [];
      const hTemp = [];
      const hCode = [];
      const hPop = [];
      const hWind = [];
      const hDir = [];
      hPeriods.slice(0, 72).forEach(function (p) {
        hTime.push(p.startTime);
        hTemp.push(nwsTempToC(p.temperature, p.temperatureUnit));
        hCode.push(shortForecastToCode(p.shortForecast, p.isDaytime === false));
        const pop = p.probabilityOfPrecipitation && p.probabilityOfPrecipitation.value;
        hPop.push(pop != null ? pop : null);
        hWind.push(parseWindMphToMs(p.windSpeed));
        hDir.push(parseWindDir(p.windDirection));
      });

      const byDay = {};
      periods.forEach(function (p) {
        const day = String(p.startTime || '').slice(0, 10);
        if (!day) return;
        if (!byDay[day]) byDay[day] = { max: -Infinity, min: Infinity, code: 2 };
        const c = nwsTempToC(p.temperature, p.temperatureUnit);
        if (c != null) {
          byDay[day].max = Math.max(byDay[day].max, c);
          byDay[day].min = Math.min(byDay[day].min, c);
        }
        if (p.isDaytime) byDay[day].code = shortForecastToCode(p.shortForecast, false);
      });
      const days = Object.keys(byDay).sort().slice(0, 10);
      const daily = {
        time: days,
        temperature_2m_max: days.map(function (d) {
          return Number.isFinite(byDay[d].max) ? byDay[d].max : null;
        }),
        temperature_2m_min: days.map(function (d) {
          return Number.isFinite(byDay[d].min) && byDay[d].min !== Infinity ? byDay[d].min : null;
        }),
        weather_code: days.map(function (d) { return byDay[d].code; })
      };

      const tz = points && points.properties && points.properties.timeZone;
      const weather = {
        timezone: tz,
        current: current,
        hourly: {
          time: hTime,
          temperature_2m: hTemp,
          weather_code: hCode,
          precipitation_probability: hPop,
          wind_speed_10m: hWind,
          wind_direction_10m: hDir
        },
        daily: daily
      };

      return {
        city: city,
        weather: weather,
        air: null,
        fetchedAt: Date.now(),
        source: 'nws',
        needsEnrich: true,
        nwsGrid: points && points.properties ? {
          office: points.properties.gridId,
          gridX: points.properties.gridX,
          gridY: points.properties.gridY,
          forecast: points.properties.forecast,
          forecastHourly: points.properties.forecastHourly
        } : null
      };
    }

    async function nwsFetchJson(url, signal) {
      const wrap = withTimeoutSignal(signal, FETCH_MS);
      try {
        const res = await fetch(url, {
          signal: wrap.signal,
          headers: { 'Accept': 'application/geo+json' }
        });
        if (res.status === 403) {
          const err = new Error('NWS 403');
          err.name = 'NwsForbidden';
          throw err;
        }
        if (res.status === 404) {
          const err = new Error('NWS 404');
          err.name = 'NwsNotFound';
          throw err;
        }
        if (!res.ok) throw new Error('NWS HTTP ' + res.status);
        return await res.json();
      } finally {
        wrap.cancel();
      }
    }

    async function loadNwsCity(c, signal) {
      const lat = roundCoord(c.lat);
      const lon = roundCoord(c.lon);
      let points = getCachedNwsPoints(lat, lon);
      if (!points) {
        points = await nwsFetchJson(NWS_BASE + '/points/' + lat + ',' + lon, signal);
        setCachedNwsPoints(lat, lon, points);
      }
      const props = points.properties || {};
      if (!props.forecast) throw new Error('NWS missing forecast URL');

      async function loadForecasts(pt) {
        const p = pt.properties || {};
        const pair = await Promise.all([
          nwsFetchJson(p.forecast, signal),
          p.forecastHourly
            ? nwsFetchJson(p.forecastHourly, signal).catch(function () { return null; })
            : Promise.resolve(null)
        ]);
        return { forecast: pair[0], hourly: pair[1], points: pt };
      }

      let result;
      try {
        result = await loadForecasts(points);
      } catch (e) {
        if (e && e.name === 'NwsNotFound') {
          clearCachedNwsPoints(lat, lon);
          points = await nwsFetchJson(NWS_BASE + '/points/' + lat + ',' + lon, signal);
          setCachedNwsPoints(lat, lon, points);
          result = await loadForecasts(points);
        } else {
          throw e;
        }
      }
      // Alerts loaded on detail open (not list) to avoid N× alert requests.
      const pack = normalizeNws(c, result.points, result.forecast, result.hourly);
      pack.alerts = null; // pending — filled by ensureNwsAlerts
      return pack;
    }

    async function loadOpenMeteoCity(c, signal) {
      const wUrl = FORECAST + '?latitude=' + c.lat + '&longitude=' + c.lon + '&' + FORECAST_Q;
      const aUrl = AIR + '?latitude=' + c.lat + '&longitude=' + c.lon + '&current=us_aqi,pm2_5,pm10,european_aqi&timezone=auto';

      async function once() {
        const pair = await Promise.all([
          fetchJson(wUrl, signal),
          fetchJson(aUrl, signal).catch(function () { return null; })
        ]);
        return {
          weather: pair[0],
          air: pair[1],
          fetchedAt: Date.now(),
          city: c,
          source: 'open-meteo',
          needsEnrich: false
        };
      }

      try {
        let packed;
        try {
          packed = await once();
        } catch (e) {
          if (e && (e.name === 'RateLimitError' || (e.message && e.message.indexOf('429') >= 0))) {
            await new Promise(function (r) { window.setTimeout(r, 650); });
            if (signal && signal.aborted) throw e;
            packed = await once();
          } else {
            throw e;
          }
        }
        if (!packed.weather || !packed.weather.current) {
          return { error: true, city: c, fetchedAt: Date.now() };
        }
        return packed;
      } catch (e) {
        if (e && e.name === 'AbortError') throw e;
        return { error: true, city: c, fetchedAt: Date.now() };
      }
    }

    async function enrichWithOpenMeteo(pack, signal) {
      if (!pack || !pack.weather || !pack.city || pack.error) return pack;
      try {
        const om = await loadOpenMeteoCity(pack.city, signal);
        if (!om || !om.weather || !om.weather.current) {
          pack.needsEnrich = false;
          return pack;
        }
        const cur = pack.weather.current || {};
        const ocur = om.weather.current || {};
        ['relative_humidity_2m', 'apparent_temperature', 'surface_pressure', 'visibility', 'precipitation'].forEach(function (k) {
          if (cur[k] == null && ocur[k] != null) cur[k] = ocur[k];
        });
        pack.weather.current = cur;

        const d = pack.weather.daily || {};
        const od = om.weather.daily || {};
        if (!d.sunrise && od.sunrise) d.sunrise = od.sunrise;
        if (!d.sunset && od.sunset) d.sunset = od.sunset;
        if (!d.uv_index_max && od.uv_index_max) d.uv_index_max = od.uv_index_max;
        if (!d.precipitation_sum && od.precipitation_sum) d.precipitation_sum = od.precipitation_sum;
        pack.weather.daily = d;

        const h = pack.weather.hourly || {};
        const oh = om.weather.hourly || {};
        /*
         * NWS hourly is forward-looking from “now”, so late evening only has ~1–3
         * hours left in the local calendar day — charts looked broken (2 dots).
         * Open-Meteo (with past_days=1) spans a full local day 00–23. Prefer the
         * OM hourly grid for detail charts while keeping NWS-derived current fields.
         */
        if (oh.time && oh.time.length >= 12) {
          const merged = {
            time: oh.time.slice(),
            temperature_2m: oh.temperature_2m || h.temperature_2m || null,
            apparent_temperature: oh.apparent_temperature || h.apparent_temperature || null,
            weather_code: oh.weather_code || h.weather_code || null,
            relative_humidity_2m: oh.relative_humidity_2m || h.relative_humidity_2m || null,
            surface_pressure: oh.surface_pressure || h.surface_pressure || null,
            precipitation: oh.precipitation || h.precipitation || null,
            precipitation_probability: oh.precipitation_probability || h.precipitation_probability || null,
            wind_speed_10m: oh.wind_speed_10m || h.wind_speed_10m || null,
            wind_direction_10m: oh.wind_direction_10m || h.wind_direction_10m || null,
            uv_index: oh.uv_index || h.uv_index || null
          };
          pack.weather.hourly = merged;
          if (om.weather.timezone && !pack.weather.timezone) {
            pack.weather.timezone = om.weather.timezone;
          }
        } else {
          ['relative_humidity_2m', 'apparent_temperature', 'surface_pressure', 'uv_index', 'precipitation', 'precipitation_probability'].forEach(function (k) {
            if ((h[k] == null || !h[k].length) && oh[k] && oh[k].length) h[k] = oh[k];
          });
          if ((!h.time || !h.time.length) && oh.time) {
            h.time = oh.time;
            if (oh.temperature_2m) h.temperature_2m = oh.temperature_2m;
            if (oh.weather_code) h.weather_code = oh.weather_code;
          }
          pack.weather.hourly = h;
        }

        if (!pack.air && om.air) pack.air = om.air;
        pack.source = pack.source === 'nws' || pack.source === 'nws+om' ? 'nws+om' : pack.source;
        pack.needsEnrich = false;
        pack.enrichedAt = Date.now();
      } catch (e) {
        pack.needsEnrich = false;
      }
      return pack;
    }

    /**
     * Load one city.
     * US: NWS + Open-Meteo enrichment → Open-Meteo fallback
     * Non-US: Open-Meteo only
     * opts.enrich: Open-Meteo gap-fill after NWS (detail open only)
     * opts.forceFetch: bypass TTL cache (manual/auto refresh)
     */
    async function loadCity(c, signal, opts) {
      opts = opts || {};
      const key = cityKey(c);
      const hit = cache.get(key);
      if (!opts.forceFetch && hit && hit.weather && Date.now() - hit.fetchedAt < REFRESH_MS - 5000) {
        if (opts.enrich && hit.needsEnrich) {
          const en = await enrichWithOpenMeteo(hit, signal);
          cache.set(key, en);
          return en;
        }
        return hit;
      }

      let pack = null;
      if (isLikelyUs(c)) {
        try {
          pack = await loadNwsCity(c, signal);
        } catch (e) {
          if (e && e.name === 'AbortError') throw e;
          pack = null;
        }
      }

      if (!pack || pack.error || !pack.weather) {
        pack = await loadOpenMeteoCity(c, signal);
      }

      // Every U.S. card uses both providers: NWS supplies the official
      // forecast path, while Open-Meteo fills the richer global fields and air
      // quality used by Duskline's detail view. Keep the NWS pack if OM fails.
      if (pack && pack.weather && !pack.error && isLikelyUs(c) && pack.source === 'nws') {
        pack = await enrichWithOpenMeteo(pack, signal);
      }

      if (pack && pack.weather && opts.enrich && pack.needsEnrich) {
        pack = await enrichWithOpenMeteo(pack, signal);
      }

      if (pack) cache.set(key, pack);
      return pack || { error: true, city: c, fetchedAt: Date.now() };
    }

    var listAbortCtl = null;
    function abortListLoads() {
      if (listAbortCtl) {
        try { listAbortCtl.abort(); } catch (e) {}
        listAbortCtl = null;
      }
    }

    async function loadCityBatchOm(cities, signal) {
      if (!cities.length) return [];
      const lats = cities.map(function (c) { return c.lat; }).join(',');
      const lons = cities.map(function (c) { return c.lon; }).join(',');
      const wUrl = FORECAST + '?latitude=' + lats + '&longitude=' + lons + '&' + FORECAST_Q;
      const aUrl = AIR + '?latitude=' + lats + '&longitude=' + lons + '&current=us_aqi,pm2_5,pm10,european_aqi&timezone=auto';
      const pair = await Promise.all([
        fetchJson(wUrl, signal),
        fetchJson(aUrl, signal).catch(function () { return null; })
      ]);
      const weatherRaw = pair[0];
      const airRaw = pair[1];
      const weatherList = Array.isArray(weatherRaw) ? weatherRaw : [weatherRaw];
      const airList = airRaw == null ? [] : (Array.isArray(airRaw) ? airRaw : [airRaw]);
      const now = Date.now();
      return cities.map(function (c, i) {
        const weather = weatherList[i];
        if (!weather || !weather.current) {
          return { error: true, city: c, fetchedAt: now };
        }
        return {
          weather: weather,
          air: airList[i] || null,
          fetchedAt: now,
          city: c,
          source: 'open-meteo',
          needsEnrich: false
        };
      });
    }

    async function loadMany(cities, opts) {
      opts = opts || {};
      const quiet = !!opts.quiet;
      const forceFetch = !!opts.forceFetch;
      const onProgress = typeof deps.onLoadProgress === 'function' ? deps.onLoadProgress : function () {};
      const onCityLoaded = typeof deps.onCityLoaded === 'function' ? deps.onCityLoaded : function () {};
      function tMsg(key, fallback) {
        return typeof deps.t === 'function' ? deps.t(key, fallback) : fallback;
      }
      abortListLoads();
      listAbortCtl = typeof AbortController === 'function' ? new AbortController() : null;
      const myCtl = listAbortCtl;
      const signal = listAbortCtl ? listAbortCtl.signal : undefined;
      const total = cities.length;
      const out = new Array(total);
      if (!quiet) onProgress(5, tMsg('weather.loadingForecasts', 'Loading forecasts…'));

      const usIdx = [];
      for (let i = 0; i < cities.length; i++) {
        if (isLikelyUs(cities[i])) usIdx.push(i);
      }

      let done = 0;
      function bump() {
        done++;
        if (signal && signal.aborted) return;
        if (quiet) return;
        const pct = 5 + Math.round((done / Math.max(1, total)) * 57);
        onProgress(Math.min(62, pct), tMsg('weather.loadingForecasts', 'Loading forecasts…')
          + ' (' + Math.min(done, total) + '/' + total + ')');
      }

      async function nwsWorker(queue) {
        while (queue.length) {
          if (signal && signal.aborted) return;
          const idx = queue.shift();
          try {
            out[idx] = await loadCity(cities[idx], signal, { enrich: false, forceFetch: forceFetch });
          } catch (e) {
            if (e && e.name === 'AbortError') return;
            out[idx] = { error: true, city: cities[idx], fetchedAt: Date.now() };
          }
          cache.set(cityKey(cities[idx]), out[idx]);
          onCityLoaded(cities[idx], out[idx]);
          bump();
        }
      }

      const usQueue = usIdx.slice();
      await Promise.all([nwsWorker(usQueue), nwsWorker(usQueue), nwsWorker(usQueue)]);

      const needOm = [];
      for (let i = 0; i < cities.length; i++) {
        if (!out[i] || out[i].error || !out[i].weather) needOm.push(i);
      }
      const omCities = needOm.map(function (i) { return cities[i]; });
      if (omCities.length && !(signal && signal.aborted)) {
        const CHUNK = 20;
        try {
          for (let start = 0; start < omCities.length; start += CHUNK) {
            if (signal && signal.aborted) break;
            const slice = omCities.slice(start, start + CHUNK);
            const sliceIdx = needOm.slice(start, start + CHUNK);
            let packs;
            try {
              packs = await loadCityBatchOm(slice, signal);
            } catch (e) {
              if (e && e.name === 'AbortError') throw e;
              if (e && e.name === 'RateLimitError') {
                await new Promise(function (r) { window.setTimeout(r, 900); });
                packs = await loadCityBatchOm(slice, signal);
              } else {
                packs = [];
                for (let j = 0; j < slice.length; j++) {
                  packs.push(await loadOpenMeteoCity(slice[j], signal));
                }
              }
            }
            for (let j = 0; j < packs.length; j++) {
              const idx = sliceIdx[j];
              if (out[idx] && out[idx].weather && !out[idx].error) continue;
              out[idx] = packs[j];
              cache.set(cityKey(cities[idx]), packs[j]);
              onCityLoaded(cities[idx], packs[j]);
              bump();
            }
          }
        } catch (e) {
          if (e && e.name === 'AbortError') throw e;
          for (let k = 0; k < needOm.length; k++) {
            const idx = needOm[k];
            if (out[idx] && out[idx].weather) continue;
            out[idx] = { error: true, city: cities[idx], fetchedAt: Date.now() };
            cache.set(cityKey(cities[idx]), out[idx]);
            onCityLoaded(cities[idx], out[idx]);
            bump();
          }
        }
      }

      for (let i = 0; i < total; i++) {
        if (!out[i]) {
          out[i] = { error: true, city: cities[i], fetchedAt: Date.now() };
          cache.set(cityKey(cities[i]), out[i]);
          onCityLoaded(cities[i], out[i]);
        }
      }

      if (signal && signal.aborted) {
        const err = new Error('Aborted');
        err.name = 'AbortError';
        throw err;
      }
      if (myCtl && listAbortCtl !== myCtl) {
        const err = new Error('Aborted');
        err.name = 'AbortError';
        throw err;
      }
      return out;
    }

    return {
      withTimeoutSignal: withTimeoutSignal,
      fetchJson: fetchJson,
      getCachedNwsPoints: getCachedNwsPoints,
      setCachedNwsPoints: setCachedNwsPoints,
      clearCachedNwsPoints: clearCachedNwsPoints,
      clearAllNwsPointsCache: clearAllNwsPointsCache,
      normalizeNws: normalizeNws,
      nwsFetchJson: nwsFetchJson,
      loadNwsCity: loadNwsCity,
      loadOpenMeteoCity: loadOpenMeteoCity,
      enrichWithOpenMeteo: enrichWithOpenMeteo,
      loadCity: loadCity,
      loadCityBatchOm: loadCityBatchOm,
      loadMany: loadMany,
      abortListLoads: abortListLoads,
      isLikelyUs: isLikelyUs
    };
  };
})(window);
