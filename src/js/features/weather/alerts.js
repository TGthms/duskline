'use strict';
/* Duskline — weather/alerts.js */
(function (global) {
  var W = global.DusklineWeather;
  if (!W || !W.active) return;

  W.factories.alerts = function createAlertsModule(deps) {
    deps = deps || {};
    function t(k, f) { return typeof deps.t === 'function' ? deps.t(k, f) : (f || k); }
    function escapeHtml(s) { return typeof deps.escapeHtml === 'function' ? deps.escapeHtml(s) : String(s == null ? '' : s); }
    function lang() { return typeof deps.lang === 'function' ? deps.lang() : 'en'; }
    function formatClock(iso) { return typeof deps.formatClock === 'function' ? deps.formatClock(iso) : ''; }
    function motionLevel() { return typeof deps.motionLevel === 'function' ? deps.motionLevel() : 'full'; }
    function roundCoord(n) { return typeof deps.roundCoord === 'function' ? deps.roundCoord(n) : n; }
    function isLikelyUs(c) { return typeof deps.isLikelyUs === 'function' ? deps.isLikelyUs(c) : false; }
    function sameCity(a, b) { return typeof deps.sameCity === 'function' ? deps.sameCity(a, b) : false; }
    var NWS_BASE = deps.NWS_BASE || 'https://api.weather.gov';
    var nwsFetchJson = deps.nwsFetchJson;
    var cityKey = deps.cityKey;
    var cache = deps.cache;
    function getDetailMods() { return typeof deps.getDetailMods === 'function' ? deps.getDetailMods() : null; }
    function isDetailVisible() { return typeof deps.isDetailVisible === 'function' ? deps.isDetailVisible() : false; }
    function getOpenCity() { return typeof deps.getOpenCity === 'function' ? deps.getOpenCity() : null; }
    function scheduleListPaintFromAlerts() {
      if (typeof deps.scheduleListPaintFromAlerts === 'function') {
        deps.scheduleListPaintFromAlerts();
        return;
      }
      // fallback no-op
    }

    const SEVERITY_RANK = { extreme: 0, severe: 1, moderate: 2, minor: 3, unknown: 4 };

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
      for (var i = 0; i < list.length; i++) {
        var a = list[i];
        if (!a) continue;
        var id = a.id ? String(a.id) : '';
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
      return dedupeAlerts(out).slice(0, 5);
    }

    function topAlert(pack) {
      if (!pack || !Array.isArray(pack.alerts) || !pack.alerts.length) return null;
      return pack.alerts[0];
    }

    function applyAlertsToPack(pack, alerts) {
      if (!pack) return;
      pack.alerts = Array.isArray(alerts) ? alerts : [];
      pack._alertsLoading = false;
      const key = pack.city ? cityKey(pack.city) : null;
      if (key) {
        const cached = cache.get(key);
        if (cached && cached.city && pack.city && sameCity(cached.city, pack.city)) {
          cached.alerts = pack.alerts;
          cached._alertsLoading = false;
        }
      }
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
      var html = alertsBlockHtml(pack.alerts);
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

    function ensureNwsAlerts(pack) {
      if (!pack || !pack.city || pack.error) return;
      if (!isLikelyUs(pack.city)) {
        if (pack.alerts == null) pack.alerts = [];
        return;
      }
      if (Array.isArray(pack.alerts)) return;
      if (pack._alertsLoading) return;
      pack._alertsLoading = true;
      const city = pack.city;
      const lat = roundCoord(city.lat);
      const lon = roundCoord(city.lon);
      loadNwsAlerts(lat, lon, null).then(function (alerts) {
        applyAlertsToPack(pack, alerts || []);
        // Surgical DOM update only — full openDetail() was wiping open <details>
        patchDetailAlerts(pack);
        scheduleListPaintFromAlerts();
      }).catch(function () {
        applyAlertsToPack(pack, []);
        patchDetailAlerts(pack);
        scheduleListPaintFromAlerts();
      });
    }

    /**
     * Prefetch NWS alerts into cache. Returns a Promise — does NOT paint the list.
     * Cheap: 1 worker, skips when tab hidden, yield between cities (battery).
     */
    var alertsPrefetchGen = 0;
    function prefetchAlertsForCache(onProgress) {
      const gen = ++alertsPrefetchGen;
      const pending = [];
      cache.forEach(function (pack) {
        if (!pack || !pack.city || pack.error || !pack.weather) return;
        if (!isLikelyUs(pack.city)) return;
        if (Array.isArray(pack.alerts) || pack._alertsLoading) return;
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
                  if (document.visibilityState === 'visible') {
                    document.removeEventListener('visibilitychange', onVis);
                    r();
                  }
                }
                document.addEventListener('visibilitychange', onVis);
              });
              if (gen !== alertsPrefetchGen) { resolve(finished); return; }
            }
            const pack = pending[idx++];
            if (!pack || Array.isArray(pack.alerts) || pack._alertsLoading) {
              oneDone();
              continue;
            }
            pack._alertsLoading = true;
            try {
              const lat = roundCoord(pack.city.lat);
              const lon = roundCoord(pack.city.lon);
              const alerts = await loadNwsAlerts(lat, lon, null);
              if (gen !== alertsPrefetchGen) {
                resolve(finished);
                return;
              }
              applyAlertsToPack(pack, alerts || []);
              // Yield to UI between cities
              await new Promise(function (r) { window.setTimeout(r, 40); });
            } catch (e) {
              if (gen !== alertsPrefetchGen) {
                resolve(finished);
                return;
              }
              applyAlertsToPack(pack, []);
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

    function alertsBlockHtml(alerts) {
      if (!alerts || !alerts.length) return '';
      const title = t('weather.alerts', 'Weather Alerts');
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
                escapeHtml(lang() === 'zh' ? '应对建议' : lang() === 'ja' ? '対応' : lang() === 'es' ? 'Instrucciones' : 'What to do') +
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
        bodyParts.push('<p class="weather-alert-source">' +
          escapeHtml(t('weather.alertSource', 'National Weather Service')) +
          (a.senderName ? ' · ' + escapeHtml(a.senderName) : '') +
          '</p>');
        return (
          // Class-based accordion (not <details>) — pixel height animate open/close
          '<div class="weather-alert ' + sevClass + '">' +
            '<button type="button" class="weather-alert-summary" aria-expanded="false">' +
              '<span class="weather-alert-badge" aria-hidden="true">!</span>' +
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
      dedupeAlerts: dedupeAlerts,
      loadNwsAlerts: loadNwsAlerts,
      topAlert: topAlert,
      applyAlertsToPack: applyAlertsToPack,
      captureOpenAlertTitles: captureOpenAlertTitles,
      restoreOpenAlertTitles: restoreOpenAlertTitles,
      patchDetailAlerts: patchDetailAlerts,
      bindAlertCollapseAnimation: bindAlertCollapseAnimation,
      ensureNwsAlerts: ensureNwsAlerts,
      prefetchAlertsForCache: prefetchAlertsForCache,
      formatAlertDescHtml: formatAlertDescHtml,
      alertsBlockHtml: alertsBlockHtml,
      scheduleListPaintFromAlerts: scheduleListPaintFromAlerts
    };
  };
})(window);
