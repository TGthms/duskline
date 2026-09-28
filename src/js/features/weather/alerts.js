'use strict';
/* Duskline — weather/alerts.js */
(function (global) {
  var W = global.DusklineWeather;
  if (!W || !W.active) return;

  W.factories.alerts = function createAlertsModule(deps) {
    deps = deps || {};
    /* Formatters: app.js is canonical; deps.xxx is a pass-through, fallbacks are last resort. */
    function t(k, f) { return typeof deps.t === 'function' ? deps.t(k, f) : (f || k); }
    function escapeHtml(s) { return typeof deps.escapeHtml === 'function' ? deps.escapeHtml(s) : String(s == null ? '' : s); }
    function lang() { return typeof deps.lang === 'function' ? deps.lang() : 'en'; }
    function formatClock(iso) { return typeof deps.formatClock === 'function' ? deps.formatClock(iso) : ''; }
    function motionLevel() { return typeof deps.motionLevel === 'function' ? deps.motionLevel() : 'full'; }
    function weatherIcon(name, cls) { return typeof deps.weatherIcon === 'function' ? deps.weatherIcon(name, cls) : ''; }
    function roundCoord(n) { return typeof deps.roundCoord === 'function' ? deps.roundCoord(n) : n; }
    function isLikelyUs(c) { return typeof deps.isLikelyUs === 'function' ? deps.isLikelyUs(c) : false; }
    function sameCity(a, b) { return typeof deps.sameCity === 'function' ? deps.sameCity(a, b) : false; }
    var NWS_BASE = deps.NWS_BASE || 'https://api.weather.gov';
    var nwsFetchJson = deps.nwsFetchJson;
    var cityKey = deps.cityKey;
    var cache = deps.cache;
    const ALERTS_REFRESH_MS = 3 * 60 * 1000;
    const ALERTS_ERROR_RETRY_MS = 60 * 1000;
    function getDetailMods() { return typeof deps.getDetailMods === 'function' ? deps.getDetailMods() : null; }
    function isDetailVisible() { return typeof deps.isDetailVisible === 'function' ? deps.isDetailVisible() : false; }
    function getOpenCity() { return typeof deps.getOpenCity === 'function' ? deps.getOpenCity() : null; }
    function scheduleListPaintFromAlerts(pack) {
      if (typeof deps.scheduleListPaintFromAlerts === 'function') {
        deps.scheduleListPaintFromAlerts(pack);
        return;
      }
      // fallback no-op
    }

    const SEVERITY_RANK = { extreme: 0, severe: 1, moderate: 2, minor: 3, unknown: 4 };
    function normalizeAlertIdentity(value) {
      return String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function severityRank(s) {
      const k = String(s || 'unknown').toLowerCase();
      return SEVERITY_RANK[k] != null ? SEVERITY_RANK[k] : 4;
    }

    /**
     * NWS product text often has fixed-width hard wraps, and sometimes
     * pathological one-character-per-line blobs. Normalize for readable UI.
     */
    function normalizeNwsText(raw) {
      if (!raw) return '';
      var t = String(raw).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      var lines = t.split('\n');
      var nonEmpty = lines.filter(function (l) { return l.trim().length > 0; });
      var shortCount = 0;
      for (var i = 0; i < nonEmpty.length; i++) {
        if (nonEmpty[i].trim().length <= 2) shortCount++;
      }
      // Character-per-line garbage → rejoin into words
      if (nonEmpty.length >= 6 && shortCount >= nonEmpty.length * 0.5) {
        var allSingle = nonEmpty.every(function (l) { return l.trim().length === 1; });
        t = nonEmpty.map(function (l) { return l.trim(); }).join(allSingle ? '' : ' ');
        t = t.replace(/([.!?])([A-Z*])/g, '$1 $2');
        return t.replace(/  +/g, ' ').trim();
      }
      // Fixed-width wrap: single newlines → space; keep blank lines as paragraphs
      t = lines.map(function (l) { return l.replace(/[ \t]+$/g, ''); }).join('\n');
      t = t.replace(/\n{3,}/g, '\n\n');
      t = t.replace(/([^\n])\n(?!\n)/g, '$1 ');
      t = t.replace(/[ \t]{2,}/g, ' ');
      // Soft-wrap artifacts: space before punctuation
      t = t.replace(/ ([.,;:!?])/g, '$1');
      return t.trim();
    }

    function dedupeAlerts(list) {
      if (!list || !list.length) return [];
      var out = [];
      var seenId = new Set();
      var seenSoft = new Set();
      var seenCapContent = new Set();
      for (var i = 0; i < list.length; i++) {
        var a = list[i];
        if (!a) continue;
        var id = a.id ? String(a.id) : '';
        if (a.providerName === 'IFRC Alert Hub') {
          if (id && seenId.has(id)) continue;
          if (id) seenId.add(id);
          const parsedEnds = Date.parse(a.ends || '');
          const endsKey = Number.isFinite(parsedEnds) ? String(parsedEnds) : normalizeAlertIdentity(a.ends);
          const capContentKey = [
            a.senderName || a.sender,
            a.category,
            a.event,
            a.severity,
            a.headline || a.description,
            a.areaDesc,
            endsKey
          ].map(normalizeAlertIdentity).join('|');
          // CAP publishers may send the same bulletin under a new identifier
          // while preserving the warning content and affected area.
          if (seenCapContent.has(capContentKey)) continue;
          seenCapContent.add(capContentKey);
          out.push(a);
          continue;
        }
        // Same event + end time = same product (NWS often duplicates multi-geometry)
        var soft = String(a.event || '').toLowerCase() + '|' + String(a.ends || '');
        if (id && seenId.has(id)) continue;
        if (seenSoft.has(soft)) continue;
        if (id) seenId.add(id);
        seenSoft.add(soft);
        out.push(a);
      }
      out.sort(function (a, b) {
        return severityRank(a.severity) - severityRank(b.severity);
      });
      return out;
    }

    /** Active NWS watches/warnings/advisories for a lat/lon (US only). Best-effort. */
    async function loadNwsAlerts(lat, lon, signal) {
      const url = NWS_BASE + '/alerts/active?point=' + lat + ',' + lon;
      const doc = await nwsFetchJson(url, signal);
      const features = (doc && doc.features) || [];
      const out = [];
      for (let i = 0; i < features.length; i++) {
        const f = features[i];
        const p = (f && f.properties) || {};
        if (!p.event && !p.headline) continue;
        const mt = String(p.messageType || '').toLowerCase();
        if (mt === 'cancel') continue;
        const status = String(p.status || '').toLowerCase();
        if (status === 'test' || status === 'draft' || status === 'exercise') continue;
        out.push({
          id: p.id || (f && f.id) || ('alert-' + i),
          event: p.event || 'Alert',
          severity: p.severity || 'Unknown',
          urgency: p.urgency || '',
          certainty: p.certainty || '',
          headline: normalizeNwsText(p.headline || p.event || ''),
          description: normalizeNwsText(p.description || ''),
          instruction: normalizeNwsText(p.instruction || ''),
          ends: p.ends || p.expires || null,
          senderName: p.senderName || 'NWS',
          areaDesc: normalizeNwsText(p.areaDesc || '')
        });
      }
      return dedupeAlerts(out);
    }

    function topAlert(pack) {
      if (!pack || !Array.isArray(pack.alerts) || !pack.alerts.length) return null;
      const current = currentAlerts(pack.alerts);
      return current[0] || null;
    }

    function alertIsCurrent(alert) {
      const expires = Date.parse(alert && alert.ends || '');
      if (Number.isFinite(expires)) return expires > Date.now();
      if (alert && alert.providerName === 'IFRC Alert Hub') {
        const sent = Date.parse(alert.sent || '');
        return Number.isFinite(sent) && sent > Date.now() - 24 * 60 * 60 * 1000;
      }
      return true;
    }

    function currentAlerts(alerts) {
      if (!Array.isArray(alerts)) return [];
      return dedupeAlerts(alerts.filter(alertIsCurrent));
    }

    function applyAlertsToPack(pack, alerts, meta) {
      if (!pack) return;
      const failed = !!(meta && meta.error);
      pack.alertsError = failed;
      pack.alerts = failed ? null : (Array.isArray(alerts) ? alerts : []);
      pack.alertsFetchedAt = failed ? 0 : Date.now();
      pack.alertsErrorAt = failed ? Date.now() : 0;
      pack.alertsProvider = meta && meta.provider ? meta.provider : (isLikelyUs(pack.city) ? 'National Weather Service' : 'IFRC Alert Hub');
      pack.alertsUnavailableReason = failed && meta ? (meta.reason || '') : '';
      pack.alertsPartial = !failed && !!(meta && meta.partial);
      pack._alertsLoading = false;
      const key = pack.city ? cityKey(pack.city) : null;
      if (key) {
        const cached = cache.get(key);
        if (cached && cached.city && pack.city && sameCity(cached.city, pack.city)) {
          cached.alerts = pack.alerts;
          cached.alertsError = pack.alertsError;
          cached.alertsFetchedAt = pack.alertsFetchedAt;
          cached.alertsErrorAt = pack.alertsErrorAt;
          cached.alertsProvider = pack.alertsProvider;
          cached.alertsUnavailableReason = pack.alertsUnavailableReason;
          cached.alertsPartial = pack.alertsPartial;
          cached._alertsLoading = false;
        }
      }
    }

    function needsAlertFetch(pack) {
      if (!pack || pack._alertsLoading) return false;
      if (pack.alertsError) {
        const retryMs = pack.alertsUnavailableReason === 'partial' || pack.alertsUnavailableReason === 'unsupported'
          ? ALERTS_REFRESH_MS
          : ALERTS_ERROR_RETRY_MS;
        return Date.now() - (pack.alertsErrorAt || 0) >= retryMs;
      }
      return !Array.isArray(pack.alerts) || Date.now() - (pack.alertsFetchedAt || 0) >= ALERTS_REFRESH_MS;
    }

    function captureOpenAlertTitles() {
      if (!getDetailMods()) return [];
      var titles = [];
      getDetailMods().querySelectorAll('.weather-alert.is-open').forEach(function (d) {
        var tEl = d.querySelector('.weather-alert-title');
        var name = tEl ? String(tEl.textContent || '').trim() : '';
        if (name) titles.push(name);
      });
      return titles;
    }

    function restoreOpenAlertTitles(titles) {
      if (!getDetailMods() || !titles || !titles.length) return;
      var want = {};
      for (var i = 0; i < titles.length; i++) want[titles[i]] = true;
      getDetailMods().querySelectorAll('.weather-alert').forEach(function (d) {
        var tEl = d.querySelector('.weather-alert-title');
        var name = tEl ? String(tEl.textContent || '').trim() : '';
        if (!(name && want[name])) return;
        d.classList.add('is-open');
        var panel = d.querySelector('.weather-alert-collapse');
        var btn = d.querySelector('.weather-alert-summary');
        if (panel) panel.style.height = 'auto';
        if (btn) btn.setAttribute('aria-expanded', 'true');
      });
    }

    /**
     * Update only the alerts block in an open detail — never rebuild the whole
     * detail (that was collapsing expanded alerts mid-read).
     */
    function patchDetailAlerts(pack) {
      if (!pack || !pack.city || !getDetailMods() || !isDetailVisible()) return;
      if (!getOpenCity() || !getOpenCity().city || !sameCity(getOpenCity().city, pack.city)) return;
      var __ocA = getOpenCity(); if (__ocA) __ocA.alerts = pack.alerts;
      var openTitles = captureOpenAlertTitles();
      var existing = getDetailMods().querySelector('.weather-alerts');
      var html = alertsBlockHtml(pack);
      if (!html) {
        if (existing) existing.remove();
        return;
      }
      var wrap = document.createElement('div');
      wrap.innerHTML = html;
      var node = wrap.firstElementChild;
      if (!node) return;
      if (existing) existing.replaceWith(node);
      else getDetailMods().insertAdjacentElement('afterbegin', node);
      restoreOpenAlertTitles(openTitles);
      bindAlertCollapseAnimation(getDetailMods());
    }

    function pointOnSegment(px, py, ax, ay, bx, by) {
      const cross = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
      if (Math.abs(cross) > 1e-9) return false;
      const dot = (px - ax) * (bx - ax) + (py - ay) * (by - ay);
      const length = (bx - ax) * (bx - ax) + (by - ay) * (by - ay);
      if (length <= 1e-18) return Math.abs(px - ax) <= 1e-9 && Math.abs(py - ay) <= 1e-9;
      if (dot < -1e-9) return false;
      return dot <= length + 1e-9;
    }

    function pointInRing(lon, lat, ring) {
      if (!Array.isArray(ring) || ring.length < 3) return false;
      const unwrapped = [];
      let previousLon = null;
      for (let i = 0; i < ring.length; i++) {
        const point = ring[i];
        if (!Array.isArray(point)) continue;
        let pointLon = Number(point[0]);
        const pointLat = Number(point[1]);
        if (![pointLon, pointLat].every(Number.isFinite)) continue;
        if (previousLon != null) {
          while (pointLon - previousLon > 180) pointLon -= 360;
          while (pointLon - previousLon < -180) pointLon += 360;
        }
        unwrapped.push([pointLon, pointLat]);
        previousLon = pointLon;
      }
      if (unwrapped.length < 3) return false;
      const center = unwrapped.reduce(function (sum, point) { return sum + point[0]; }, 0) / unwrapped.length;
      const shift = 360 * Math.round((lon - center) / 360);
      const testLon = lon;
      let inside = false;
      for (let i = 0, j = unwrapped.length - 1; i < unwrapped.length; j = i++) {
        const a = unwrapped[j];
        const b = unwrapped[i];
        const ax = a[0] + shift; const ay = a[1];
        const bx = b[0] + shift; const by = b[1];
        if (pointOnSegment(testLon, lat, ax, ay, bx, by)) return true;
        const intersects = ((ay > lat) !== (by > lat))
          && (testLon < ((bx - ax) * (lat - ay)) / (by - ay) + ax);
        if (intersects) inside = !inside;
      }
      return inside;
    }

    function pointInPolygonCoordinates(lon, lat, rings) {
      if (!Array.isArray(rings) || !rings.length || !pointInRing(lon, lat, rings[0])) return false;
      for (let i = 1; i < rings.length; i++) {
        if (pointInRing(lon, lat, rings[i])) return false;
      }
      return true;
    }

    function parsedGeoJson(value) {
      if (!value) return null;
      if (typeof value === 'object') return value;
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch (e) { return null; }
      }
      return null;
    }

    function capPolygonContains(value, lon, lat) {
      const geometry = parsedGeoJson(value);
      if (!geometry || !Array.isArray(geometry.coordinates)) return null;
      if (geometry.type === 'Polygon') return pointInPolygonCoordinates(lon, lat, geometry.coordinates);
      if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.some(function (rings) { return pointInPolygonCoordinates(lon, lat, rings); });
      }
      return null;
    }

    function capPolygonValueContains(value, lon, lat) {
      const points = String(value || '').trim().split(/\s+/).map(function (pair) {
        const values = pair.split(',');
        if (values.length !== 2) return null;
        const latitude = Number(values[0]);
        const longitude = Number(values[1]);
        return Number.isFinite(latitude) && Number.isFinite(longitude) ? [longitude, latitude] : null;
      }).filter(Boolean);
      if (points.length < 3) return null;
      return pointInPolygonCoordinates(lon, lat, [points]);
    }

    function capCircleContains(raw, lon, lat) {
      const value = raw && typeof raw === 'object' ? raw.value : raw;
      const match = String(value || '').trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/);
      if (!match) return null;
      const centerLat = Number(match[1]);
      const centerLon = Number(match[2]);
      const radiusKm = Number(match[3]);
      if (![centerLat, centerLon, radiusKm].every(Number.isFinite)) return null;
      const rad = Math.PI / 180;
      const dLat = (lat - centerLat) * rad;
      const dLon = (lon - centerLon) * rad;
      const a = Math.sin(dLat / 2) ** 2
        + Math.cos(centerLat * rad) * Math.cos(lat * rad) * Math.sin(dLon / 2) ** 2;
      const distanceKm = 6371.0088 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return distanceKm <= radiusKm;
    }

    function normalizeAreaName(value) {
      return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\b(state|province|prefecture|metropolis|region|county|district|department|governorate|oblast|territory)\b/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
    }

    function capAlertMatchesCity(alert, city) {
      if (!alert || !city) return false;
      if (!alertIsCurrent(alert)) return false;
      const expires = Date.parse(alert.ends || '');
      const effective = Date.parse(alert.effective || '');
      if (Number.isFinite(effective) && effective > Date.now()) return false;
      if (city.lat == null || city.lon == null) return false;
      const lat = Number(city.lat);
      const lon = Number(city.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
      const areas = Array.isArray(alert.areas) ? alert.areas : [];
      let hasUsableGeometry = false;
      for (let i = 0; i < areas.length; i++) {
        const area = areas[i] || {};
        const polygons = Array.isArray(area.polygons) ? area.polygons : [];
        for (let p = 0; p < polygons.length; p++) {
          const polygon = polygons[p] || {};
          const geoMatch = capPolygonContains(polygon.valuePolygon, lon, lat);
          const match = geoMatch == null ? capPolygonValueContains(polygon.value, lon, lat) : geoMatch;
          if (match !== null) {
            hasUsableGeometry = true;
            if (match) return true;
          }
        }
        const circles = Array.isArray(area.circles) ? area.circles : [];
        for (let c = 0; c < circles.length; c++) {
          const match = capCircleContains(circles[c], lon, lat);
          if (match !== null) {
            hasUsableGeometry = true;
            if (match) return true;
          }
        }
      }
      // A valid CAP shape is definitive: never broaden it to an entire province.
      if (hasUsableGeometry) return false;

      const cityAreas = [city.admin1, city.admin2].filter(Boolean).map(normalizeAreaName);
      const alertAreas = Array.isArray(alert.admin1s) ? alert.admin1s.map(normalizeAreaName) : [];
      if (cityAreas.some(function (cityArea) {
        return cityArea && alertAreas.some(function (alertArea) { return alertArea === cityArea; });
      })) return true;

      const cityNames = [city.name, city.displayName].filter(Boolean).map(normalizeAreaName);
      const descriptions = areas.map(function (area) { return normalizeAreaName(area && area.areaDesc); }).filter(Boolean);
      return cityNames.some(function (cityName) {
        return cityName && descriptions.some(function (description) {
          return description === cityName || (' ' + description + ' ').includes(' ' + cityName + ' ');
        });
      });
    }

    const capCountryRequests = new Map();
    const CAP_CLIENT_CACHE_MS = 3 * 60 * 1000;
    const CAP_CLIENT_CACHE_MAX = 8;

    function rememberCapPayload(key, payload) {
      const now = Date.now();
      capCountryRequests.forEach(function (entry, entryKey) {
        if (entry && entry.data && now - entry.at >= CAP_CLIENT_CACHE_MS) capCountryRequests.delete(entryKey);
      });
      capCountryRequests.delete(key);
      capCountryRequests.set(key, { data: payload, at: now });
      while (capCountryRequests.size > CAP_CLIENT_CACHE_MAX) {
        const oldest = Array.from(capCountryRequests.entries()).find(function (entry) {
          return entry[1] && entry[1].data;
        });
        if (!oldest) break;
        capCountryRequests.delete(oldest[0]);
      }
    }

    function requestInternationalAlerts(city, admin1) {
      const code = String(city && city.country_code || '').trim().toUpperCase();
      const country = String(city && city.country || '').trim();
      if ((code && !/^[A-Z]{2}$/.test(code)) || !country) return Promise.reject(new Error('Missing international alert location'));
      const language = String(lang() || 'en');
      const region = String(admin1 || '').trim();
      const key = (code || ('name-' + normalizeAreaName(country))) + '|'
        + (region ? 'admin1:' + normalizeAreaName(region) + '|' : '') + language.toLowerCase();
      const hit = capCountryRequests.get(key);
      if (hit && hit.data && Date.now() - hit.at < CAP_CLIENT_CACHE_MS) return Promise.resolve(hit.data);
      if (hit && hit.data) capCountryRequests.delete(key);
      if (hit && hit.promise) return hit.promise;

      const params = new URLSearchParams({ country: country, lang: language });
      if (code) params.set('cc', code);
      if (region) params.set('admin1', region);
      const controller = new AbortController();
      const timer = global.setTimeout(function () { controller.abort(); }, 15000);
      const promise = global.fetch('/api/international-alerts?' + params.toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
        signal: controller.signal
      }).then(async function (response) {
        if (!response.ok) throw new Error('International alerts unavailable');
        const payload = await response.json();
        if (!payload || !Array.isArray(payload.alerts) || !payload.availability) {
          throw new Error('Invalid international alert response');
        }
        rememberCapPayload(key, payload);
        return payload;
      }).finally(function () {
        global.clearTimeout(timer);
        const current = capCountryRequests.get(key);
        if (current && current.promise === promise) capCountryRequests.delete(key);
      });
      capCountryRequests.set(key, { promise: promise, at: Date.now() });
      return promise;
    }

    function loadInternationalAlerts(city) {
      return requestInternationalAlerts(city, '').then(function (countryPayload) {
        const region = String(city && city.admin1 || '').trim();
        if (!countryPayload.truncated || !region) return countryPayload;
        // The country feed is capped to protect startup cost. When it is
        // incomplete, ask IFRC for this first-level region and combine results;
        // city coordinates remain local and still gate the final display.
        return requestInternationalAlerts(city, region).then(function (regionPayload) {
          if (!regionPayload || !regionPayload.scoped) return countryPayload;
          return Object.assign({}, regionPayload, {
            alerts: currentAlerts((countryPayload.alerts || []).concat(regionPayload.alerts || [])),
            truncated: !!regionPayload.truncated
          });
        }).catch(function () {
          // Retain any location-matched results from the country response if
          // the optional, narrower request is unavailable.
          return countryPayload;
        });
      });
    }

    function applyInternationalAlerts(pack, payload) {
      if (!payload || payload.availability !== 'available') {
        applyAlertsToPack(pack, null, { error: true, reason: 'unsupported', provider: 'IFRC Alert Hub' });
        return;
      }
      const cityAlerts = currentAlerts((payload.alerts || []).filter(function (alert) {
        return capAlertMatchesCity(alert, pack.city);
      }));
      // A capped feed is incomplete, but a miss is not useful UI. Keep the
      // matched alerts, if any, and silently omit unavailable coverage copy.
      applyAlertsToPack(pack, cityAlerts, { provider: 'IFRC Alert Hub', partial: payload.truncated });
    }

    /**
     * Smooth accordion — class + pixel height (no native <details>).
     * Expand: 0 → scrollHeight → auto. Collapse: auto → scrollHeight → 0.
     */
    function bindAlertCollapseAnimation(root) {
      if (!root) return;
      const DURATION = 280;
      const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

      root.querySelectorAll('.weather-alert').forEach(function (card) {
        if (card._wxCollapseBound) return;
        card._wxCollapseBound = true;
        const summary = card.querySelector('.weather-alert-summary');
        const panel = card.querySelector('.weather-alert-collapse');
        if (!summary || !panel) return;

        // Initial closed height (unless restored open)
        if (!card.classList.contains('is-open')) {
          panel.style.height = '0px';
          summary.setAttribute('aria-expanded', 'false');
        } else {
          panel.style.height = 'auto';
          summary.setAttribute('aria-expanded', 'true');
        }

        summary.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (card.classList.contains('is-animating')) return;

          const reduced = motionLevel() === 'off' || motionLevel() === 'reduced';
          const isOpen = card.classList.contains('is-open');

          if (isOpen) {
            // ── collapse ──
            if (reduced) {
              card.classList.remove('is-open');
              panel.style.height = '0px';
              summary.setAttribute('aria-expanded', 'false');
              return;
            }
            card.classList.add('is-animating');
            // lock current pixel height then animate to 0
            const h = panel.scrollHeight;
            panel.style.transition = 'none';
            panel.style.height = h + 'px';
            void panel.offsetHeight;
            panel.style.transition = 'height ' + DURATION + 'ms ' + EASE;
            panel.style.height = '0px';
            var finished = false;
            var finish = function (ev) {
              if (finished) return;
              if (ev && ev.target !== panel) return;
              if (ev && ev.propertyName && ev.propertyName !== 'height') return;
              finished = true;
              panel.removeEventListener('transitionend', finish);
              card.classList.remove('is-open', 'is-animating');
              summary.setAttribute('aria-expanded', 'false');
              panel.style.height = '0px';
            };
            panel.addEventListener('transitionend', finish);
            window.setTimeout(finish, DURATION + 60);
          } else {
            // ── expand ──
            if (reduced) {
              card.classList.add('is-open');
              panel.style.height = 'auto';
              summary.setAttribute('aria-expanded', 'true');
              return;
            }
            card.classList.add('is-open', 'is-animating');
            summary.setAttribute('aria-expanded', 'true');
            panel.style.transition = 'none';
            panel.style.height = '0px';
            void panel.offsetHeight;
            const h = panel.scrollHeight;
            panel.style.transition = 'height ' + DURATION + 'ms ' + EASE;
            panel.style.height = h + 'px';
            var finishedOpen = false;
            var finishOpen = function (ev) {
              if (finishedOpen) return;
              if (ev && ev.target !== panel) return;
              if (ev && ev.propertyName && ev.propertyName !== 'height') return;
              finishedOpen = true;
              panel.removeEventListener('transitionend', finishOpen);
              panel.style.height = 'auto';
              card.classList.remove('is-animating');
            };
            panel.addEventListener('transitionend', finishOpen);
            window.setTimeout(finishOpen, DURATION + 60);
          }
        });
      });
    }

    function ensureAlerts(pack) {
      if (!pack || !pack.city || pack.error) return;
      if (!isLikelyUs(pack.city)) {
        if (!needsAlertFetch(pack)) return;
        pack._alertsLoading = true;
        loadInternationalAlerts(pack.city).then(function (payload) {
          applyInternationalAlerts(pack, payload);
          patchDetailAlerts(pack);
          scheduleListPaintFromAlerts(pack);
        }).catch(function () {
          applyAlertsToPack(pack, null, { error: true, reason: 'upstream', provider: 'IFRC Alert Hub' });
          patchDetailAlerts(pack);
          scheduleListPaintFromAlerts(pack);
        });
        return;
      }
      if (!needsAlertFetch(pack)) return;
      pack._alertsLoading = true;
      const city = pack.city;
      const lat = roundCoord(city.lat);
      const lon = roundCoord(city.lon);
      loadNwsAlerts(lat, lon, null).then(function (alerts) {
        applyAlertsToPack(pack, alerts || []);
        // Surgical DOM update only — full openDetail() was wiping open <details>
        patchDetailAlerts(pack);
        scheduleListPaintFromAlerts(pack);
      }).catch(function () {
        applyAlertsToPack(pack, null, { error: true });
        patchDetailAlerts(pack);
        scheduleListPaintFromAlerts(pack);
      });
    }

    /**
     * Prefetch supported public alerts into cache. Returns a Promise — does NOT paint the list.
     * Cheap: 1 worker, skips when tab hidden, yield between cities (battery).
     */
    var alertsPrefetchGen = 0;
    function prefetchAlertsForCache(onProgress, allowedKeys) {
      const gen = ++alertsPrefetchGen;
      const pending = [];
      cache.forEach(function (pack) {
        if (!pack || !pack.city || pack.error || !pack.weather) return;
        if (allowedKeys && !allowedKeys.has(cityKey(pack.city))) return;
        if (!needsAlertFetch(pack)) return;
        pending.push(pack);
      });
      if (!pending.length) return Promise.resolve(0);

      let idx = 0;
      let finished = 0;
      const total = pending.length;
      // Single worker — was 2 concurrent × N cities thrashing main thread + radio
      const workers = 1;

      return new Promise(function (resolve) {
        function oneDone() {
          finished += 1;
          if (typeof onProgress === 'function') {
            try { onProgress(finished, total); } catch (e) {}
          }
          if (finished >= total) resolve(total);
        }

        async function worker() {
          while (idx < pending.length && gen === alertsPrefetchGen) {
            // Pause when backgrounded — resume when tab is visible again
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
              await new Promise(function (r) {
                function onVis() {
                  if (document.visibilityState === 'visible' || gen !== alertsPrefetchGen) {
                    document.removeEventListener('visibilitychange', onVis);
                    r();
                  }
                }
                document.addEventListener('visibilitychange', onVis);
                window.setTimeout(onVis, 30000);
              });
              if (gen !== alertsPrefetchGen) { resolve(finished); return; }
            }
            const pack = pending[idx++];
            if (!needsAlertFetch(pack)) {
              oneDone();
              continue;
            }
            pack._alertsLoading = true;
            try {
              let alerts;
              const isUs = isLikelyUs(pack.city);
              if (isUs) {
                const lat = roundCoord(pack.city.lat);
                const lon = roundCoord(pack.city.lon);
                alerts = await loadNwsAlerts(lat, lon, null);
              } else {
                const payload = await loadInternationalAlerts(pack.city);
                if (gen !== alertsPrefetchGen) {
                  resolve(finished);
                  return;
                }
                applyInternationalAlerts(pack, payload);
                patchDetailAlerts(pack);
                scheduleListPaintFromAlerts(pack);
                await new Promise(function (r) { window.setTimeout(r, 40); });
                oneDone();
                continue;
              }
              if (gen !== alertsPrefetchGen) {
                resolve(finished);
                return;
              }
              applyAlertsToPack(pack, alerts || [], { provider: 'National Weather Service' });
              scheduleListPaintFromAlerts(pack);
              await new Promise(function (r) { window.setTimeout(r, 40); });
            } catch (e) {
              if (gen !== alertsPrefetchGen) {
                resolve(finished);
                return;
              }
              applyAlertsToPack(pack, null, { error: true, provider: isLikelyUs(pack.city) ? 'National Weather Service' : 'IFRC Alert Hub' });
              patchDetailAlerts(pack);
              scheduleListPaintFromAlerts(pack);
            }
            oneDone();
          }
        }
        for (let w = 0; w < workers; w++) worker();
      });
    }

    /**
     * Turn NWS * WHAT... / * WHERE... blocks into scannable full-width sections.
     */
    function formatAlertDescHtml(raw) {
      var text = normalizeNwsText(raw || '');
      if (!text) return '';
      // Prefer NWS bullet sections
      var parts = text.split(/\s*\*\s+(?=(?:WHAT|WHERE|WHEN|IMPACTS|ADDITIONAL DETAILS)\.\.\.)/i);
      if (parts.length > 1) {
        var html = '<div class="weather-alert-sections">';
        for (var i = 0; i < parts.length; i++) {
          var chunk = parts[i].trim();
          if (!chunk) continue;
          var m = chunk.match(/^(WHAT|WHERE|WHEN|IMPACTS|ADDITIONAL DETAILS)\.\.\.\s*([\s\S]*)$/i);
          if (m) {
            var label = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
            if (label === 'Additional details') label = 'Details';
            var body = (m[2] || '').trim();
            if (body.length > 320) body = body.slice(0, 320).replace(/\s+\S*$/, '') + '…';
            html += '<div class="weather-alert-section">' +
              '<div class="weather-alert-section-label">' + escapeHtml(label) + '</div>' +
              '<p class="weather-alert-section-body">' + escapeHtml(body) + '</p>' +
              '</div>';
          } else {
            var free = chunk;
            if (free.length > 280) free = free.slice(0, 280).replace(/\s+\S*$/, '') + '…';
            html += '<p class="weather-alert-section-body">' + escapeHtml(free) + '</p>';
          }
        }
        html += '</div>';
        return html;
      }
      if (text.length > 520) text = text.slice(0, 520).replace(/\s+\S*$/, '') + '…';
      return '<p class="weather-alert-desc">' + escapeHtml(text) + '</p>';
    }

    function alertsBlockHtml(alertsOrPack) {
      var alerts = alertsOrPack;
      var failed = false;
      if (alertsOrPack && !Array.isArray(alertsOrPack)) {
        alerts = alertsOrPack.alerts;
        failed = !!alertsOrPack.alertsError;
      }
      if (Array.isArray(alerts)) alerts = currentAlerts(alerts);
      if (failed && !(alerts && alerts.length)) return '';
      if (!alerts || !alerts.length) return '';
      const title = t('weather.alerts', 'Public Alerts');
      const cards = alerts.map(function (a) {
        const sev = String(a.severity || 'Unknown').toLowerCase();
        const sevClass = sev === 'extreme' || sev === 'severe'
          ? 'weather-alert--severe'
          : (sev === 'moderate' ? 'weather-alert--moderate' : 'weather-alert--minor');
        const until = a.ends
          ? t('weather.alertUntil', 'Until {time}').replace('{time}', formatClock(a.ends) || String(a.ends).slice(0, 16))
          : '';
        const head = a.event || t('weather.alert', 'Alert');
        const bodyParts = [];
        // Compact headline only if it adds info beyond the event name
        if (a.headline && a.headline !== a.event && a.headline.indexOf(a.event) !== 0) {
          bodyParts.push('<p class="weather-alert-headline">' + escapeHtml(a.headline) + '</p>');
        }
        if (a.description) {
          bodyParts.push(formatAlertDescHtml(a.description));
        }
        if (a.instruction) {
          var inst = a.instruction;
          if (inst.length > 420) inst = inst.slice(0, 420).replace(/\s+\S*$/, '') + '…';
          bodyParts.push(
            '<div class="weather-alert-action">' +
              '<div class="weather-alert-action-label">' +
                escapeHtml(t('weather.alertWhatToDo', 'What to do')) +
              '</div>' +
              '<p class="weather-alert-instruction">' + escapeHtml(inst) + '</p>' +
            '</div>'
          );
        }
        if (a.areaDesc) {
          var area = a.areaDesc;
          if (area.length > 140) area = area.slice(0, 140).replace(/\s+\S*$/, '') + '…';
          bodyParts.push('<p class="weather-alert-area">' + escapeHtml(area) + '</p>');
        }
        const sourceName = a.providerName || t('weather.alertSource', 'National Weather Service');
        const sourceParts = [sourceName];
        if (a.senderName && String(a.senderName).toLowerCase() !== String(sourceName).toLowerCase()) sourceParts.push(a.senderName);
        if (a.categoryDisplay) sourceParts.push(a.categoryDisplay);
        const sourceText = sourceParts.map(escapeHtml).join(' · ');
        let sourceUrl = '';
        try {
          const candidate = new URL(String(a.sourceUrl || '').trim());
          if (candidate.protocol === 'https:' || candidate.protocol === 'http:') sourceUrl = candidate.href;
        } catch (e) {}
        bodyParts.push('<p class="weather-alert-source">' + (sourceUrl
          ? '<a href="' + escapeHtml(sourceUrl) + '" target="_blank" rel="noopener noreferrer">' + sourceText + '</a>'
          : sourceText) + '</p>');
        return (
          // Class-based accordion (not <details>) — pixel height animate open/close
          '<div class="weather-alert ' + sevClass + '">' +
            '<button type="button" class="weather-alert-summary" aria-expanded="false">' +
              '<span class="weather-alert-badge" aria-hidden="true">' + weatherIcon('alert-circle', 'weather-alert-icon') + '</span>' +
              '<span class="weather-alert-title">' + escapeHtml(head) + '</span>' +
              (until ? '<span class="weather-alert-until">' + escapeHtml(until) + '</span>' : '') +
              '<span class="weather-alert-chevron" aria-hidden="true"></span>' +
            '</button>' +
            '<div class="weather-alert-collapse" style="height:0px">' +
              '<div class="weather-alert-body">' + bodyParts.join('') + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');
      return (
        '<div class="weather-alerts" role="region" aria-label="' + escapeHtml(title) + '">' +
          '<div class="weather-alerts-label">' + escapeHtml(title) + '</div>' +
          cards +
        '</div>'
      );
    }

    return {
      severityRank: severityRank,
      normalizeNwsText: normalizeNwsText,
      capPolygonContains: capPolygonContains,
      capAlertMatchesCity: capAlertMatchesCity,
      currentAlerts: currentAlerts,
      dedupeAlerts: dedupeAlerts,
      loadNwsAlerts: loadNwsAlerts,
      topAlert: topAlert,
      applyAlertsToPack: applyAlertsToPack,
      captureOpenAlertTitles: captureOpenAlertTitles,
      restoreOpenAlertTitles: restoreOpenAlertTitles,
      patchDetailAlerts: patchDetailAlerts,
      bindAlertCollapseAnimation: bindAlertCollapseAnimation,
      ensureAlerts: ensureAlerts,
      ensureNwsAlerts: ensureAlerts,
      prefetchAlertsForCache: prefetchAlertsForCache,
      formatAlertDescHtml: formatAlertDescHtml,
      alertsBlockHtml: alertsBlockHtml,
      scheduleListPaintFromAlerts: scheduleListPaintFromAlerts
    };
  };
})(window);
