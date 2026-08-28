'use strict';
/* Duskline — weather/charts.js */
(function (global) {
  var W = global.DusklineWeather;
  if (!W || !W.active) return;

  W.factories.charts = function createChartsModule(deps) {
    deps = deps || {};
    function t(k, f) { return typeof deps.t === 'function' ? deps.t(k, f) : (f || k); }
    function escapeHtml(s) { return typeof deps.escapeHtml === 'function' ? deps.escapeHtml(s) : String(s == null ? '' : s); }
    function fmtTemp(c) { return typeof deps.fmtTemp === 'function' ? deps.fmtTemp(c) : String(c); }
    function fmtWind(v) { return typeof deps.fmtWind === 'function' ? deps.fmtWind(v) : String(v == null ? '—' : v); }
    function fmtPress(v) { return typeof deps.fmtPress === 'function' ? deps.fmtPress(v) : String(v == null ? '—' : v); }
    function fmtPrecip(v) { return typeof deps.fmtPrecip === 'function' ? deps.fmtPrecip(v) : String(v == null ? '—' : v); }
    function degToCompass(d) { return typeof deps.degToCompass === 'function' ? deps.degToCompass(d) : ''; }
    function lang() { return typeof deps.lang === 'function' ? deps.lang() : 'en'; }
    function localeTag() { return typeof deps.localeTag === 'function' ? deps.localeTag() : 'en-US'; }
    function motionLevel() { return typeof deps.motionLevel === 'function' ? deps.motionLevel() : 'full'; }
    function formatClock(iso) { return typeof deps.formatClock === 'function' ? deps.formatClock(iso) : ''; }
    function formatChartAxisHour(iso) { return typeof deps.formatChartAxisHour === 'function' ? deps.formatChartAxisHour(iso) : ''; }
    function useF() { return typeof deps.useF === 'function' ? deps.useF() : false; }
    function condIcon(code, night, cls) { return typeof deps.condIcon === 'function' ? deps.condIcon(code, night, cls) : ''; }

    /**
     * Apple Weather–style temp → RGB (°C absolute). Cold blues → warm yellows → hot reds.
     * Independent of display unit; internal data is always Celsius.
     */
    function tempToBarColor(c) {
      if (c == null || !Number.isFinite(c)) return 'rgb(142,142,147)';
      const stops = [
        { t: -20, c: [110, 90, 210] },
        { t: -10, c: [80, 100, 230] },
        { t: 0, c: [70, 140, 255] },
        { t: 8, c: [70, 190, 235] },
        { t: 14, c: [100, 210, 160] },
        { t: 20, c: [180, 220, 90] },
        { t: 26, c: [255, 210, 60] },
        { t: 32, c: [255, 150, 45] },
        { t: 38, c: [255, 90, 45] },
        { t: 44, c: [220, 45, 40] }
      ];
      if (c <= stops[0].t) {
        return 'rgb(' + stops[0].c[0] + ',' + stops[0].c[1] + ',' + stops[0].c[2] + ')';
      }
      if (c >= stops[stops.length - 1].t) {
        const last = stops[stops.length - 1].c;
        return 'rgb(' + last[0] + ',' + last[1] + ',' + last[2] + ')';
      }
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (c >= a.t && c <= b.t) {
          const u = (c - a.t) / (b.t - a.t || 1);
          const r = Math.round(a.c[0] + (b.c[0] - a.c[0]) * u);
          const g = Math.round(a.c[1] + (b.c[1] - a.c[1]) * u);
          const bl = Math.round(a.c[2] + (b.c[2] - a.c[2]) * u);
          return 'rgb(' + r + ',' + g + ',' + bl + ')';
        }
      }
      return 'rgb(255,210,60)';
    }

    function dailyBarsHtml(daily, opts) {
      opts = opts || {};
      const highs = daily.temperature_2m_max || [];
      const lows = daily.temperature_2m_min || [];
      const codes = daily.weather_code || [];
      const times = daily.time || [];
      let pops = daily.precipitation_probability_max || daily.precipitation_probability || null;
      // NWS path often has no daily pop — derive max POP per calendar day from hourly
      if (!pops && opts.hourly && Array.isArray(opts.hourly.time) && opts.hourly.precipitation_probability) {
        const byDay = {};
        for (let hi = 0; hi < opts.hourly.time.length; hi++) {
          const dk = String(opts.hourly.time[hi] || '').slice(0, 10);
          if (!dk) continue;
          const p = opts.hourly.precipitation_probability[hi];
          if (p == null || !Number.isFinite(Number(p))) continue;
          if (byDay[dk] == null || Number(p) > byDay[dk]) byDay[dk] = Number(p);
        }
        pops = times.map(function (t) { return byDay[String(t || '').slice(0, 10)]; });
      }
      const n = Math.min(10, times.length, highs.length, lows.length);
      let weekMin = Infinity;
      let weekMax = -Infinity;
      for (let i = 0; i < n; i++) {
        if (lows[i] != null) weekMin = Math.min(weekMin, lows[i]);
        if (highs[i] != null) weekMax = Math.max(weekMax, highs[i]);
      }
      if (!Number.isFinite(weekMin) || !Number.isFinite(weekMax) || weekMax <= weekMin) {
        weekMin = 0; weekMax = 1;
      }
      // Small padding so edge bars aren't flush to the track ends
      const pad = Math.max(1, (weekMax - weekMin) * 0.04);
      weekMin -= pad;
      weekMax += pad;
      const span = weekMax - weekMin || 1;

      // Current temp for "Today" marker (optional, Apple-style white dot)
      let nowC = null;
      if (opts.currentTemp != null && Number.isFinite(opts.currentTemp)) {
        nowC = opts.currentTemp;
      }

      const todayKey = (function () {
        try {
          const tz = opts.timeZone || undefined;
          return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
        } catch (e) {
          return new Date().toISOString().slice(0, 10);
        }
      })();

      let html = '<div class="weather-daily">';
      for (let i = 0; i < n; i++) {
        const dayKey = String(times[i] || '').slice(0, 10);
        const isToday = dayKey === todayKey;
        let day = '';
        try {
          day = isToday
            ? t('weather.today', 'Today')
            : new Date(times[i] + 'T12:00:00').toLocaleDateString(localeTag(), { weekday: 'short' });
        } catch (e) { day = ''; }
        const lo = lows[i];
        const hi = highs[i];
        const left = Math.max(0, Math.min(92, ((lo - weekMin) / span) * 100));
        let width = Math.max(6, ((hi - lo) / span) * 100);
        if (left + width > 100) width = 100 - left;
        const c0 = tempToBarColor(lo);
        const c1 = tempToBarColor(hi);
        const barBg = 'linear-gradient(90deg,' + c0 + ',' + c1 + ')';
        const icon = condIcon(codes[i] || 0, false);

        // Precip % under icon when meaningful (Apple-style)
        let popHtml = '';
        if (pops && pops[i] != null && Number(pops[i]) >= 20) {
          popHtml = '<span class="weather-daily-pop">' + Math.round(Number(pops[i])) + '%</span>';
        }

        // Today: current-temp dot on the track
        let nowDot = '';
        if (isToday && nowC != null && hi != null && lo != null) {
          const nowLeft = Math.max(0, Math.min(100, ((nowC - weekMin) / span) * 100));
          nowDot = '<span class="weather-daily-now" style="left:' + nowLeft.toFixed(1) + '%" aria-hidden="true"></span>';
        }

        html += '<div class="weather-daily-row' + (isToday ? ' weather-daily-row--today' : '') + '">' +
          '<span class="weather-daily-day">' + escapeHtml(day) + '</span>' +
          '<span class="weather-daily-icon">' + icon + popHtml + '</span>' +
          '<span class="weather-daily-lo">' + escapeHtml(fmtTemp(lo)) + '</span>' +
          '<span class="weather-daily-track">' +
            '<span class="weather-daily-bar" style="left:' + left.toFixed(1) + '%;width:' + width.toFixed(1) + '%;background:' + barBg + '"></span>' +
            nowDot +
          '</span>' +
          '<span class="weather-daily-hi">' + escapeHtml(fmtTemp(hi)) + '</span>' +
        '</div>';
      }
      html += '</div>';
      return html;
    }

    /**
     * Rolling window of up to `hours` samples centered to include recent past + next hours.
     * When past_days is present, prefer ~now−6h through now+18h so the line isn’t “from now only”.
     */
    function hourlyWindow(hourly, hours) {
      const times = hourly.time || [];
      if (!times.length) return { start: 0, end: 0, times: times };
      const n = hours || 24;
      const now = Date.now();
      // Prefer starting ~6 hours before now so charts show history of the day
      const wantStartMs = now - 6 * 60 * 60 * 1000;
      let start = 0;
      for (let i = 0; i < times.length; i++) {
        let tMs;
        try { tMs = new Date(times[i]).getTime(); } catch (e) { continue; }
        if (tMs >= wantStartMs - 30 * 60 * 1000) { start = i; break; }
      }
      // If that would leave fewer than n points, slide start earlier
      if (times.length - start < n) {
        start = Math.max(0, times.length - n);
      }
      const end = Math.min(start + n, times.length);
      return { start: start, end: end, times: times };
    }

    /** YYYY-MM-DD in a timezone (en-CA is ISO-like). */
    function localDateKey(ms, timeZone) {
      try {
        return new Intl.DateTimeFormat('en-CA', {
          timeZone: timeZone || undefined,
          year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date(ms));
      } catch (e) {
        try { return new Date(ms).toISOString().slice(0, 10); } catch (e2) { return ''; }
      }
    }

    /**
     * Calendar date for an hourly stamp.
     * Open-Meteo with timezone=auto returns wall-clock ISO without offset
     * ("2026-08-07T14:00") already in the *location* zone — use the YYYY-MM-DD
     * prefix. NWS ISO with offset is converted via timeZone.
     */
    function stampDateKey(iso, timeZone) {
      const s = String(iso || '');
      // Bare local wall time from OM (no Z / no ±offset)
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s) && !/[zZ]$/.test(s) && !/[+-]\d{2}:\d{2}$/.test(s)) {
        return s.slice(0, 10);
      }
      try {
        const ms = new Date(s).getTime();
        if (Number.isFinite(ms)) return localDateKey(ms, timeZone);
      } catch (e) { /* ignore */ }
      return s.slice(0, 10);
    }

    /**
     * Full local calendar day (00–23) for charts — Apple Weather style.
     * Prefer a dense local day (≥12 hours). If the series only has the remaining
     * hours of “today” (NWS-style forward hourly), fall back to a 24h rolling window.
     */
    function hourlyLocalDay(hourly, timeZone) {
      const times = hourly.time || [];
      if (!times.length) return { start: 0, end: 0, times: times };
      const todayKey = localDateKey(Date.now(), timeZone);
      let start = -1;
      let end = -1;
      for (let i = 0; i < times.length; i++) {
        const key = stampDateKey(times[i], timeZone);
        if (!key) continue;
        if (key === todayKey) {
          if (start < 0) start = i;
          end = i + 1;
        } else if (start >= 0 && end > start) {
          // Contiguous block for today finished
          break;
        }
      }
      const dayLen = (start >= 0 && end > start) ? (end - start) : 0;
      // Sparse “today” (e.g. only 22:00–23:00 left) → prefer last 24 samples with data
      if (dayLen >= 12) return { start: start, end: end, times: times };
      return hourlyWindow(hourly, 24);
    }

    /**
     * Smooth open cubic path through points (Catmull–Rom → Bezier).
     * Avoids the jagged “connect the dots” look on hourly charts.
     */
    function smoothLinePath(pts) {
      if (!pts || pts.length < 2) return '';
      if (pts.length === 2) {
        return 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1)
          + ' L' + pts[1].x.toFixed(1) + ',' + pts[1].y.toFixed(1);
      }
      let d = 'M' + pts[0].x.toFixed(1) + ',' + pts[0].y.toFixed(1);
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? 0 : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        // Gentle tension (÷6) — smooth without overshooting too hard on weather series
        let c1x = p1.x + (p2.x - p0.x) / 6;
        let c1y = p1.y + (p2.y - p0.y) / 6;
        let c2x = p2.x - (p3.x - p1.x) / 6;
        let c2y = p2.y - (p3.y - p1.y) / 6;
        // Soft-clamp Y so curves don’t spike wildly past local min/max
        const yLo = Math.min(p1.y, p2.y) - 12;
        const yHi = Math.max(p1.y, p2.y) + 12;
        c1y = Math.max(yLo, Math.min(yHi, c1y));
        c2y = Math.max(yLo, Math.min(yHi, c2y));
        d += ' C' + c1x.toFixed(1) + ',' + c1y.toFixed(1)
          + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1)
          + ' ' + p2.x.toFixed(1) + ',' + p2.y.toFixed(1);
      }
      return d;
    }

    /** True for series that must never plot below zero (axis or data pad). */
    function isNonNegativeSeries(key) {
      return /precipitation|uv_index|relative_humidity|wind_speed|visibility/.test(String(key || ''));
    }

    /** Wall-clock hour + minute as decimal hours from OM local ISO (…T14:30). */
    function stampLocalHour(iso) {
      const m = String(iso || '').match(/T(\d{2}):(\d{2})/);
      if (m) return Number(m[1]) + Number(m[2]) / 60;
      try {
        const d = new Date(iso);
        if (!Number.isNaN(d.getTime())) return d.getHours() + d.getMinutes() / 60;
      } catch (e) { /* ignore */ }
      return 0;
    }

    /** Current hour (decimal) in a location IANA timezone. */
    function nowLocalHour(timeZone) {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: timeZone || undefined,
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23'
        }).formatToParts(new Date());
        var h = 0, mi = 0;
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].type === 'hour') h = Number(parts[i].value) % 24;
          if (parts[i].type === 'minute') mi = Number(parts[i].value);
        }
        return h + mi / 60;
      } catch (e) {
        const d = new Date();
        return d.getHours() + d.getMinutes() / 60;
      }
    }

    /** Compact Y-axis label (no long units that clip). */
    function axisTickLabel(v, key, unitFmt) {
      if (v == null || !Number.isFinite(v)) return '';
      if (key === 'relative_humidity_2m') return Math.round(v) + '%';
      if (key === 'uv_index') return String(Math.round(v * 10) / 10);
      if (key === 'precipitation') {
        try {
          return String(unitFmt(v)).replace(/\s*(in|mm|cm)\s*$/i, '').trim();
        } catch (e) {
          return String(Math.round(v * 10) / 10);
        }
      }
      if (key === 'surface_pressure') return String(Math.round(v));
      if (key === 'wind_speed_10m') {
        try {
          const s = unitFmt(v);
          return String(s).replace(/\s*(mph|km\/h|m\/s|kn|bft)\s*$/i, '').trim() || s;
        } catch (e2) {
          return String(Math.round(v));
        }
      }
      if (key === 'temperature_2m' || key === 'apparent_temperature') {
        try {
          return String(unitFmt(v)).replace(/°/g, '') + '°';
        } catch (e3) {
          return Math.round(v) + '°';
        }
      }
      try {
        const lab = unitFmt(v);
        if (lab && lab.length > 7) return String(Math.round(v * 10) / 10);
        return lab;
      } catch (e4) {
        return String(Math.round(v * 10) / 10);
      }
    }

    function pathThrough(pts) {
      return smoothLinePath(pts);
    }

    /** Apple-style scrub chart used by Wind, Hourly, Humidity, etc. */
    function buildTempChart(hourly, key, unitFmt, timeZone) {
      const tz = timeZone || hourly.timezone || undefined;
      const { start, end, times } = hourlyLocalDay(hourly, tz);
      const vals = [];
      for (let i = start; i < end; i++) {
        const v = hourly[key] && hourly[key][i];
        if (v == null || Number.isNaN(v)) continue;
        vals.push({ i, t: times[i], v: Number(v) });
      }
      if (vals.length < 2) return '<p class="weather-chart-sub">—</p>';

      const nonNeg = isNonNegativeSeries(key);
      let dataMin = Math.min.apply(null, vals.map(function (d) { return d.v; }));
      let dataMax = Math.max.apply(null, vals.map(function (d) { return d.v; }));
      if (nonNeg) {
        dataMin = Math.max(0, dataMin);
        dataMax = Math.max(0, dataMax);
      }
      // Never invent negative headroom for non-negative series (precip/UV/humidity/wind)
      let min = dataMin;
      let max = dataMax;
      const padAmt = (max - min) * 0.14 || (nonNeg ? Math.max(max * 0.15, key === 'uv_index' ? 1 : 0.5) : 1);
      if (nonNeg) {
        // Humidity: 0–100 scale (readable). Precip/UV/wind: floor 0, headroom above max only.
        if (key === 'relative_humidity_2m') {
          min = 0;
          max = 100;
        } else if (key === 'uv_index') {
          min = 0;
          max = Math.max(11, dataMax + padAmt, 1);
        } else {
          min = 0;
          max = Math.max(dataMax + padAmt, dataMax > 0 ? dataMax + padAmt : padAmt);
          if (max <= 0) max = key === 'precipitation' ? 1 : 1;
        }
      } else {
        min = dataMin - padAmt;
        max = dataMax + padAmt;
      }
      const span = (max - min) || 1;

      // Wide viewBox so the chart uses sheet width; padL fits compact Y labels
      const W = 400, H = 200, padL = 44, padR = 10, padT = 12, padB = 26;
      const plotW = W - padL - padR, plotH = H - padT - padB;
      const pts = vals.map(function (d, idx) {
        const x = padL + (idx / (vals.length - 1)) * plotW;
        const y = padT + (1 - (d.v - min) / span) * plotH;
        return { x: x, y: y, i: d.i, t: d.t, v: d.v };
      });

      // “Now” in the *location* timezone (wall-clock hours), not browser parse of bare ISO.
      // Prefer the latest sample at-or-before now — never wrap 23:00 → 00:00 on the right.
      const nowH = nowLocalHour(tz);
      const todayKey = localDateKey(Date.now(), tz);
      let midIdx = 0;
      let midBest = Infinity;
      let foundAtOrBefore = false;
      for (let mi = 0; mi < pts.length; mi++) {
        const day = stampDateKey(pts[mi].t, tz);
        const ph = stampLocalHour(pts[mi].t);
        // Wrong calendar day (e.g. next-day 00:00 left in the series) — heavy penalty
        const dayPenalty = (day && todayKey && day !== todayKey) ? 100 : 0;
        // Prefer at-or-before now so 23:00 wins over 00:00 when local time is 23:xx
        let d;
        if (ph <= nowH + 1 / 120) {
          d = nowH - ph; // smaller = closer from the past
          foundAtOrBefore = true;
        } else {
          d = (ph - nowH) + 0.25; // slight penalty for future hours
        }
        // Late evening: do not snap across midnight to 00:00
        if (nowH >= 18 && ph < 6) d += 50;
        // Early morning: do not snap back to yesterday evening
        if (nowH < 6 && ph > 18) d += 50;
        d += dayPenalty;
        if (d < midBest) { midBest = d; midIdx = mi; }
      }
      // If every sample is still “future” (clock skew), keep earliest
      if (!foundAtOrBefore && pts.length) midIdx = 0;
      const mid = pts[midIdx];

      // Split past / future at “now” (Apple: muted dashed past, solid future).
      // CRITICAL: never fall back to a full solid path when future is short (e.g. 11 PM) —
      // that painted over the dashed past and made the cursor look stuck at the right edge.
      const pastPts = pts.slice(0, midIdx + 1);
      const futurePts = pts.slice(midIdx);
      const pastLine = pastPts.length >= 2 ? pathThrough(pastPts) : '';
      const futureLine = futurePts.length >= 2 ? pathThrough(futurePts) : '';
      const fullLine = pathThrough(pts);
      const last = pts[pts.length - 1];
      const first = pts[0];
      // Soft fill under the whole day (muted); future gets a stronger fill when present
      const area = fullLine
        + ' L' + last.x.toFixed(1) + ',' + (H - padB).toFixed(1)
        + ' L' + first.x.toFixed(1) + ',' + (H - padB).toFixed(1)
        + ' Z';
      let futureArea = '';
      if (futurePts.length >= 2) {
        futureArea = pathThrough(futurePts)
          + ' L' + last.x.toFixed(1) + ',' + (H - padB).toFixed(1)
          + ' L' + mid.x.toFixed(1) + ',' + (H - padB).toFixed(1)
          + ' Z';
      } else if (pastPts.length >= 2) {
        // Evening: almost all day is past — fill under the dashed region lightly
        futureArea = '';
      }

      const id = 'wxChart' + Math.random().toString(36).slice(2, 8);
      const payload = pts.map(function (p) { return { x: p.x, y: p.y, v: p.v, t: p.t }; });

      let grids = '';
      for (let g = 0; g < 4; g++) {
        const gy = padT + (g / 3) * plotH;
        grids += '<line x1="' + padL + '" y1="' + gy.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + gy.toFixed(1) + '" stroke="rgba(255,255,255,.1)" stroke-width="1"/>';
      }

      let labels = '';
      const yTicks = [
        { v: max, y: padT + 4 },
        { v: (max + min) / 2, y: padT + plotH / 2 + 4 },
        { v: min, y: padT + plotH }
      ];
      yTicks.forEach(function (tick) {
        // Never draw negative tick labels for non-negative series
        var tv = tick.v;
        if (nonNeg && tv < 0) tv = 0;
        const lab = axisTickLabel(tv, key, unitFmt);
        if (!lab) return;
        labels += '<text class="wx-chart-axis wx-chart-axis-y" x="' + (padL - 8).toFixed(1) + '" y="' + tick.y.toFixed(1) + '" fill="rgba(255,255,255,.48)" font-size="10" font-weight="500" text-anchor="end" font-family="system-ui,-apple-system,BlinkMacSystemFont,sans-serif" font-variant-numeric="tabular-nums">' + escapeHtml(lab) + '</text>';
      });

      const axisPts = (function pickAxisPts() {
        const preferH = [0, 6, 12, 18];
        const byH = {};
        pts.forEach(function (p) {
          try {
            const m = String(p.t || '').match(/T(\d{2}):/);
            const h = m ? Number(m[1]) : Math.floor(stampLocalHour(p.t));
            if (preferH.indexOf(h) >= 0 && byH[h] == null) byH[h] = p;
          } catch (e) { /* ignore */ }
        });
        const picked = preferH.map(function (h) { return byH[h]; }).filter(Boolean);
        if (picked.length >= 3) return picked;
        const axisCount = Math.min(4, pts.length);
        const out = [];
        for (let k = 0; k < axisCount; k++) {
          const i = axisCount === 1 ? 0 : Math.round((k / (axisCount - 1)) * (pts.length - 1));
          if (pts[i]) out.push(pts[i]);
        }
        return out;
      })();
      axisPts.forEach(function (p, k) {
        if (!p) return;
        const lab = formatChartAxisHour(p.t);
        if (!lab) return;
        const anchor = k === 0 ? 'start' : (k === axisPts.length - 1 ? 'end' : 'middle');
        labels += '<text class="wx-chart-axis" x="' + p.x.toFixed(1) + '" y="' + (H - 8) + '" fill="rgba(255,255,255,.48)" font-size="11" font-weight="500" letter-spacing="0.02em" text-anchor="' + anchor + '" font-family="system-ui,-apple-system,BlinkMacSystemFont,sans-serif" font-variant-numeric="tabular-nums">' + escapeHtml(lab) + '</text>';
      });

      // Past = dashed (always when we have history). Future = solid only for remaining hours.
      // If now is the last sample (e.g. 11 PM), draw the whole day as dashed past — no solid overlay.
      const pastPath = pastLine
        ? '<path d="' + pastLine + '" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="5 5"/>'
        : '';
      let futurePath = '';
      if (futureLine) {
        futurePath = '<path d="' + futureLine + '" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
      } else if (!pastLine && fullLine) {
        // Only when we have no split at all (e.g. 2 points) draw a single solid line
        futurePath = '<path d="' + fullLine + '" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
      }
      // Fill: prefer whole-day soft fill when past dominates (evening); stronger future fill midday
      const fillPath = futureArea
        ? '<path d="' + futureArea + '" fill="url(#' + id + 'g)"/>' +
          (pastLine ? '<path d="' + pathThrough(pastPts) + ' L' + mid.x.toFixed(1) + ',' + (H - padB).toFixed(1) + ' L' + first.x.toFixed(1) + ',' + (H - padB).toFixed(1) + ' Z" fill="url(#' + id + 'gpast)"/>' : '')
        : '<path d="' + area + '" fill="url(#' + id + (pastLine && !futureLine ? 'gpast' : 'g') + ')"/>';

      return '<div class="weather-chart-wrap weather-chart-card" data-chart="' + id + '" data-pts=\'' + JSON.stringify(payload).replace(/'/g, '&#39;') + '\' data-kind="' + key + '" data-tz="' + escapeHtml(tz || '') + '" data-now-idx="' + midIdx + '" data-vw="' + W + '" data-vh="' + H + '" data-padt="' + padT + '" data-padb="' + padB + '" data-padl="' + padL + '">' +
        '<div class="weather-chart-readout" data-readout>' + escapeHtml(unitFmt(mid.v)) + '</div>' +
        '<div class="weather-chart-sub" data-sub>' + escapeHtml(formatClock(mid.t)) + '</div>' +
        // preserveAspectRatio=none: CSS size maps 1:1 to viewBox → scrub X/Y stay aligned
        '<svg class="weather-chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img">' +
          '<defs>' +
            '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.38"/>' +
              '<stop offset="40%" stop-color="#7ec8ff" stop-opacity="0.2"/>' +
              '<stop offset="100%" stop-color="#3a7ab8" stop-opacity="0.02"/>' +
            '</linearGradient>' +
            '<linearGradient id="' + id + 'gpast" x1="0" y1="0" x2="0" y2="1">' +
              '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>' +
              '<stop offset="100%" stop-color="#3a7ab8" stop-opacity="0.02"/>' +
            '</linearGradient>' +
          '</defs>' +
          grids +
          fillPath +
          pastPath +
          futurePath +
          '<line data-guide x1="' + mid.x + '" y1="' + padT + '" x2="' + mid.x + '" y2="' + (H - padB) + '" stroke="rgba(255,255,255,.75)" stroke-width="1.25" stroke-dasharray="4 4"/>' +
          '<circle data-dot cx="' + mid.x + '" cy="' + mid.y + '" r="6.5" fill="#fff" stroke="rgba(255,255,255,.35)" stroke-width="2"/>' +
          labels +
          '<rect data-hit x="0" y="0" width="' + W + '" height="' + H + '" fill="transparent"/>' +
        '</svg>' +
      '</div>';
    }

    function bindCharts(root) {
      if (!root) return;
      root.querySelectorAll('.weather-chart-wrap').forEach((wrap) => {
        let pts;
        try { pts = JSON.parse((wrap.getAttribute('data-pts') || '[]').replace(/&#39;/g, "'")); } catch (e) { return; }
        const kind = wrap.getAttribute('data-kind') || '';
        if (!pts.length) return;
        const svg = wrap.querySelector('svg');
        const guide = wrap.querySelector('[data-guide]');
        const dot = wrap.querySelector('[data-dot]');
        const readout = wrap.querySelector('[data-readout]');
        const sub = wrap.querySelector('[data-sub]');
        const hit = wrap.querySelector('[data-hit]');
        if (!svg || !hit) return;
        const vw = Number(wrap.getAttribute('data-vw')) || 400;
        const padT = Number(wrap.getAttribute('data-padt')) || 12;
        const padB = Number(wrap.getAttribute('data-padb')) || 26;
        const vh = Number(wrap.getAttribute('data-vh')) || 200;
        // Default = “now” in location TZ (same rules as buildTempChart — no wrap to 00:00)
        let idxNow = Number(wrap.getAttribute('data-now-idx'));
        if (!Number.isFinite(idxNow) || idxNow < 0 || idxNow >= pts.length) {
          const tz = wrap.getAttribute('data-tz') || undefined;
          const nowH = nowLocalHour(tz);
          idxNow = 0;
          let bestNow = Infinity;
          for (let i = 0; i < pts.length; i++) {
            const ph = stampLocalHour(pts[i].t);
            let d = ph <= nowH + 1 / 120 ? (nowH - ph) : (ph - nowH) + 0.25;
            if (nowH >= 18 && ph < 6) d += 50;
            if (nowH < 6 && ph > 18) d += 50;
            if (d < bestNow) { bestNow = d; idxNow = i; }
          }
        }
        const defaultPt = pts[idxNow];
        let curPt = defaultPt;
        const formatVal = (v) => {
          if (kind === 'temperature_2m' || kind === 'apparent_temperature') return fmtTemp(v);
          if (kind === 'surface_pressure') return fmtPress(v);
          if (kind === 'wind_speed_10m') return fmtWind(v);
          if (kind === 'relative_humidity_2m') return Math.round(v) + '%';
          if (kind === 'precipitation') return fmtPrecip(v);
          if (kind === 'uv_index') return String(Math.round(v * 10) / 10);
          return String(Math.round(v * 10) / 10);
        };
        let displayNum = defaultPt.v;
        let tweenRaf = 0;
        const animateReadoutTo = (toV) => {
          if (!readout) return;
          if (motionLevel() !== 'full') {
            readout.textContent = formatVal(toV);
            displayNum = toV;
            return;
          }
          if (tweenRaf) {
            try { cancelAnimationFrame(tweenRaf); } catch (e) {}
            tweenRaf = 0;
          }
          const fromV = displayNum;
          displayNum = toV;
          if (!Number.isFinite(fromV) || !Number.isFinite(toV) || fromV === toV) {
            readout.textContent = formatVal(toV);
            return;
          }
          const t0 = performance.now();
          const dur = 160;
          const step = (now) => {
            const u = Math.min(1, (now - t0) / dur);
            const e = 1 - Math.pow(1 - u, 3);
            const v = fromV + (toV - fromV) * e;
            readout.textContent = formatVal(v);
            if (u < 1) tweenRaf = requestAnimationFrame(step);
            else {
              tweenRaf = 0;
              readout.textContent = formatVal(toV);
            }
          };
          tweenRaf = requestAnimationFrame(step);
        };
        const paintImmediate = (x, y, pt, animateNum) => {
          if (guide) {
            guide.setAttribute('x1', x);
            guide.setAttribute('x2', x);
            guide.setAttribute('y1', padT);
            guide.setAttribute('y2', vh - padB);
          }
          if (dot) {
            dot.setAttribute('cx', x);
            dot.setAttribute('cy', y);
          }
          if (animateNum) animateReadoutTo(pt.v);
          else if (readout) {
            readout.textContent = formatVal(pt.v);
            displayNum = pt.v;
          }
          if (sub) sub.textContent = formatClock(pt.t);
          curPt = pt;
        };
        const resetToNow = () => {
          paintImmediate(defaultPt.x, defaultPt.y, defaultPt, true);
        };
        paintImmediate(defaultPt.x, defaultPt.y, defaultPt, false);

        /** Map pointer → SVG viewBox coords (handles CSS scale; requires none or CTM). */
        function clientToViewBox(clientX, clientY) {
          try {
            if (svg.createSVGPoint && svg.getScreenCTM) {
              const pt = svg.createSVGPoint();
              pt.x = clientX;
              pt.y = clientY;
              const ctm = svg.getScreenCTM();
              if (ctm) {
                const p = pt.matrixTransform(ctm.inverse());
                return { x: p.x, y: p.y };
              }
            }
          } catch (e) { /* fall through */ }
          const rect = svg.getBoundingClientRect();
          if (!rect.width || !rect.height) return null;
          return {
            x: ((clientX - rect.left) / rect.width) * vw,
            y: ((clientY - rect.top) / rect.height) * vh
          };
        }

        const padLHit = Number(wrap.getAttribute('data-padl')) || 44;
        const padRHit = 10;
        const scrub = (clientX, clientY) => {
          const vb = clientToViewBox(clientX, clientY == null ? 0 : clientY);
          if (!vb) return;
          // Clamp to plot band so hovering Y labels still targets first/last hour
          const x = Math.max(padLHit, Math.min(vw - padRHit, vb.x));
          let best = pts[0], bestD = Infinity;
          for (let i = 0; i < pts.length; i++) {
            const d = Math.abs(pts[i].x - x);
            if (d < bestD) { bestD = d; best = pts[i]; }
          }
          let i0 = 0;
          for (let i = 0; i < pts.length - 1; i++) {
            if (x >= pts[i].x && x <= pts[i + 1].x) { i0 = i; break; }
            if (x > pts[i].x) i0 = i;
          }
          const a = pts[i0], b = pts[Math.min(i0 + 1, pts.length - 1)];
          const sp = (b.x - a.x) || 1;
          const u = Math.max(0, Math.min(1, (x - a.x) / sp));
          // Snap cursor to the curve (X along pointer, Y on the line between samples)
          const px = a.x + (b.x - a.x) * u;
          const py = a.y + (b.y - a.y) * u;
          const hourChanged = !curPt || curPt.t !== best.t;
          paintImmediate(px, py, best, hourChanged);
        };
        // Immediate scrub (no rAF lag) so the guide stays under the pointer
        const onMove = (e) => {
          const cx = e.clientX != null ? e.clientX : (e.touches && e.touches[0] && e.touches[0].clientX);
          const cy = e.clientY != null ? e.clientY : (e.touches && e.touches[0] && e.touches[0].clientY);
          if (cx == null) return;
          if (e.cancelable) e.preventDefault();
          scrub(cx, cy);
        };
        hit.style.touchAction = 'none';
        hit.style.cursor = 'ew-resize';
        // Bind to SVG (not only hit rect) so axis padding still scrubs
        const target = svg;
        target.style.touchAction = 'none';
        target.style.cursor = 'ew-resize';
        target.addEventListener('pointerdown', (e) => {
          try { target.setPointerCapture && target.setPointerCapture(e.pointerId); } catch (err) {}
          onMove(e);
        });
        target.addEventListener('pointermove', onMove);
        target.addEventListener('pointerup', resetToNow);
        target.addEventListener('pointercancel', resetToNow);
        target.addEventListener('pointerleave', resetToNow);
        target.addEventListener('lostpointercapture', resetToNow);
        // Desktop hover scrub (no press required)
        target.addEventListener('mousemove', onMove);
        target.addEventListener('mouseleave', resetToNow);
      });
    }

    function uvGauge(v) {
      if (v == null) return '';
      const pct = Math.max(0, Math.min(100, (v / 12) * 100));
      let lab = 'Low';
      if (v >= 11) lab = 'Extreme';
      else if (v >= 8) lab = 'Very High';
      else if (v >= 6) lab = 'High';
      else if (v >= 3) lab = 'Moderate';
      return `<div class="weather-gauge"><span class="weather-gauge-dot" style="left:${pct.toFixed(1)}%"></span></div>
        <div class="weather-mod-sub">${escapeHtml(lab)}</div>`;
    }

    /**
     * Convert a wall-clock ISO (Open-Meteo local, no Z) to UTC ms in `timeZone`.
     * Offset-bearing strings use Date.parse.
     */
    function wallClockInZoneToUtcMs(iso, timeZone) {
      const s = String(iso || '');
      if (!s) return NaN;
      if (/[zZ]$/.test(s) || /[+-]\d{2}:\d{2}$/.test(s)) {
        const t = new Date(s).getTime();
        return Number.isFinite(t) ? t : NaN;
      }
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
      if (!m) {
        const t = new Date(s).getTime();
        return Number.isFinite(t) ? t : NaN;
      }
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      const h = Number(m[4]);
      const mi = Number(m[5]);
      const se = Number(m[6] || 0);
      const tz = timeZone || 'UTC';
      let guess = Date.UTC(y, mo - 1, d, h, mi, se);
      for (let iter = 0; iter < 4; iter++) {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23'
        }).formatToParts(new Date(guess));
        const get = function (type) {
          for (let i = 0; i < parts.length; i++) {
            if (parts[i].type === type) return Number(parts[i].value);
          }
          return 0;
        };
        let hh = get('hour');
        if (hh === 24) hh = 0;
        const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hh, get('minute'), get('second'));
        const want = Date.UTC(y, mo - 1, d, h, mi, se);
        guess += want - asUtc;
      }
      return guess;
    }

    /** UTC ms of 00:00 on the calendar day of `ms` in `timeZone`. */
    function startOfLocalDayUtcMs(ms, timeZone) {
      try {
        const parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: timeZone || undefined,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).formatToParts(new Date(ms));
        const get = function (type) {
          for (let i = 0; i < parts.length; i++) {
            if (parts[i].type === type) return parts[i].value;
          }
          return '01';
        };
        const ymd = get('year') + '-' + get('month') + '-' + get('day') + 'T00:00:00';
        return wallClockInZoneToUtcMs(ymd, timeZone);
      } catch (e) {
        const d = new Date(ms);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      }
    }

    /**
     * Apple Weather–style sun path: full day sine over horizon.
     * Dot tracks current elevation; curve peaks at solar noon.
     * `timeZone` = city IANA zone so rise/set wall-clock ISO map correctly.
     */
    function sunPathGeometry(sunriseIso, sunsetIso, W, H, padL, padR, padT, padB, timeZone) {
      const now = Date.now();
      const tz = timeZone || undefined;
      let rise = sunriseIso ? wallClockInZoneToUtcMs(sunriseIso, tz) : NaN;
      let set = sunsetIso ? wallClockInZoneToUtcMs(sunsetIso, tz) : NaN;
      if (!Number.isFinite(rise)) rise = now - 6 * 3600000;
      if (!Number.isFinite(set)) set = rise + 12 * 3600000;
      if (set <= rise) set = rise + 12 * 3600000;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      // Midnight (city-local) of the sunrise calendar day
      let day0 = startOfLocalDayUtcMs(rise, tz);
      if (!Number.isFinite(day0)) day0 = rise - 6 * 3600000;
      const dayMs = 24 * 3600000;
      // If "now" is after local midnight following this rise/set day, still plot that day
      // but clamp the sun marker to the day range for position.
      const elevAt = function (tms) {
        if (tms >= rise && tms <= set) {
          const u = (tms - rise) / (set - rise);
          return Math.sin(u * Math.PI); // 0→1→0 through day
        }
        // Night: gentle dip below horizon
        if (tms < rise) return -0.12 * Math.min(1, (rise - tms) / (4 * 3600000));
        return -0.12 * Math.min(1, (tms - set) / (4 * 3600000));
      };
      const elevToY = function (elev) {
        // elev -0.2 .. 1.0 maps to plot bottom..top
        return padT + (1 - (elev + 0.2) / 1.2) * plotH;
      };
      const pts = [];
      for (let i = 0; i <= 48; i++) {
        const tms = day0 + (i / 48) * dayMs;
        const elev = elevAt(tms);
        pts.push({
          x: padL + (i / 48) * plotW,
          y: elevToY(elev),
          tms: tms,
          elev: elev
        });
      }
      const horizonY = elevToY(0);
      // Position “now” on this civil day; if after midnight next day, use next day0
      let plotNow = now;
      let plotDay0 = day0;
      if (now >= day0 + dayMs) {
        // Past the sunrise’s civil day — advance day0 so evening/night still maps
        plotDay0 = startOfLocalDayUtcMs(now, tz);
        if (!Number.isFinite(plotDay0)) plotDay0 = day0 + dayMs;
      }
      // Rebuild path relative to plotDay0 when it differs (same shape shifted by solar times)
      // Keep rise/set absolute; x-axis is always 00–24 of plotDay0.
      const frac = Math.max(0, Math.min(1, (plotNow - plotDay0) / dayMs));
      const curX = padL + frac * plotW;
      // When day0 for path geometry is the rise day, map rise/set onto plotDay0 axis
      // If plotDay0 is a different day, recompute path for “today” using shifted solar times
      let pathDay0 = day0;
      let pathRise = rise;
      let pathSet = set;
      let elevForPath = elevAt;
      if (plotDay0 !== day0) {
        const shift = plotDay0 - day0;
        pathDay0 = plotDay0;
        pathRise = rise + shift;
        pathSet = set + shift;
        elevForPath = function (tms) {
          if (tms >= pathRise && tms <= pathSet) {
            const u = (tms - pathRise) / (pathSet - pathRise);
            return Math.sin(u * Math.PI);
          }
          if (tms < pathRise) return -0.12 * Math.min(1, (pathRise - tms) / (4 * 3600000));
          return -0.12 * Math.min(1, (tms - pathSet) / (4 * 3600000));
        };
        pts.length = 0;
        for (let i = 0; i <= 48; i++) {
          const tms = pathDay0 + (i / 48) * dayMs;
          const elev = elevForPath(tms);
          pts.push({
            x: padL + (i / 48) * plotW,
            y: elevToY(elev),
            tms: tms,
            elev: elev
          });
        }
      }
      const curElev = elevForPath(plotNow);
      const curY = elevToY(curElev);
      const line = smoothLinePath(pts);
      // Day fill between rise–set above horizon
      const riseX = padL + Math.max(0, Math.min(1, (pathRise - pathDay0) / dayMs)) * plotW;
      const setX = padL + Math.max(0, Math.min(1, (pathSet - pathDay0) / dayMs)) * plotW;
      let area = '';
      pts.forEach(function (p) {
        if (p.x < riseX - 0.5 || p.x > setX + 0.5) return;
        area += (area ? ' L' : 'M') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
      });
      if (area) {
        area += ' L' + setX.toFixed(1) + ',' + horizonY.toFixed(1)
          + ' L' + riseX.toFixed(1) + ',' + horizonY.toFixed(1) + ' Z';
      }
      const beforeRise = now < rise;
      const afterSet = now > set;
      const isDay = !beforeRise && !afterSet;
      // Next sunrise for “until sunrise” after set (handle overnight)
      let nextRise = rise;
      if (afterSet) nextRise = rise + dayMs;
      else if (beforeRise) nextRise = rise;
      return {
        now: now, rise: rise, set: set, nextRise: nextRise,
        day0: pathDay0, dayMs: dayMs,
        pts: pts, line: line, area: area, horizonY: horizonY,
        curX: curX, curY: curY, curElev: curElev,
        isDay: isDay, beforeRise: beforeRise, afterSet: afterSet,
        riseX: riseX, setX: setX, padL: padL, padR: padR, padT: padT, padB: padB, W: W, H: H
      };
    }

    /** Compact module tile — Apple style: hero next event + path + secondary time */
    function sunArcSvg(sunriseIso, sunsetIso, compact, timeZone) {
      const W = compact ? 300 : 320;
      const H = compact ? 72 : 100;
      const g = sunPathGeometry(sunriseIso, sunsetIso, W, H, 8, 8, 10, 8, timeZone);
      // Apple: during day emphasize SUNSET; at night emphasize SUNRISE
      const heroIsSunset = g.isDay;
      const heroIso = heroIsSunset ? sunsetIso : sunriseIso;
      const secondaryIso = heroIsSunset ? sunriseIso : sunsetIso;
      const heroLabel = heroIsSunset
        ? t('weather.sunset', 'Sunset')
        : t('weather.sunrise', 'Sunrise');
      const secondaryLabel = heroIsSunset
        ? t('weather.sunrise', 'Sunrise')
        : t('weather.sunset', 'Sunset');
      const hourLabs = [0, 0.25, 0.5, 0.75, 1].map(function (f, i) {
        const labs = ['00', '06', '12', '18', '24'];
        const x = 8 + f * (W - 16);
        return `<text x="${x.toFixed(1)}" y="${H - 1}" fill="rgba(255,255,255,.35)" font-size="8" text-anchor="middle" font-family="system-ui,sans-serif">${labs[i]}</text>`;
      }).join('');
      return (
        `<div class="wx-sun-mod-hero">` +
          `<div class="wx-sun-mod-hero-label">${escapeHtml(heroLabel)}</div>` +
          `<div class="wx-sun-mod-hero-time">${escapeHtml(formatClock(heroIso))}</div>` +
        `</div>` +
        `<svg class="weather-sun-arc${compact ? ' weather-sun-arc--compact' : ''}" viewBox="0 0 ${W} ${H}" aria-hidden="true">` +
          `<line x1="8" y1="${g.horizonY.toFixed(1)}" x2="${W - 8}" y2="${g.horizonY.toFixed(1)}" stroke="rgba(255,255,255,.28)" stroke-width="1"/>` +
          (g.area ? `<path d="${g.area}" fill="rgba(255,210,120,.14)"/>` : '') +
          `<path d="${g.line}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2" stroke-linejoin="round"/>` +
          `<circle cx="${g.curX.toFixed(1)}" cy="${g.curY.toFixed(1)}" r="5.5" fill="#fff" stroke="rgba(255,220,140,.9)" stroke-width="2"/>` +
          hourLabs +
        `</svg>` +
        `<div class="wx-sun-mod-secondary">${escapeHtml(secondaryLabel)}: ${escapeHtml(formatClock(secondaryIso))}</div>`
      );
    }

    function formatDurationMs(ms) {
      if (!Number.isFinite(ms) || ms < 0) ms = 0;
      const totalMin = Math.round(ms / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      if (lang() === 'zh') return h + ' 小时 ' + m + ' 分钟';
      if (lang() === 'ja') return h + '時間' + m + '分';
      if (lang() === 'es') return h + ' h ' + m + ' min';
      return h + ' hr ' + m + ' min';
    }

    /** Full-day sun path chart + metrics (Apple-inspired). No Y-axis — path is symbolic. */
    function buildSunDaySheet(sunriseIso, sunsetIso, timeZone) {
      const W = 340, H = 160, padL = 10, padR = 10, padT = 14, padB = 28;
      const g = sunPathGeometry(sunriseIso, sunsetIso, W, H, padL, padR, padT, padB, timeZone);
      const TW = 35 * 60 * 1000;
      const firstLight = g.rise - TW;
      const lastLight = g.set + TW;
      const daylight = g.set - g.rise;
      // Day → hero Sunset; Night → hero Sunrise
      const heroIsSunset = g.isDay;
      const heroIso = heroIsSunset ? sunsetIso : sunriseIso;
      const heroTitle = heroIsSunset
        ? t('weather.sunset', 'Sunset')
        : t('weather.sunrise', 'Sunrise');
      let remainLab = t('weather.daylightRemaining', 'Daylight remaining');
      let remainVal = formatDurationMs(Math.max(0, g.set - g.now));
      if (g.beforeRise) {
        remainLab = t('weather.untilSunrise', 'Until sunrise');
        remainVal = formatDurationMs(Math.max(0, g.rise - g.now));
      } else if (g.afterSet) {
        remainLab = t('weather.untilSunrise', 'Until sunrise');
        remainVal = formatDurationMs(Math.max(0, (g.nextRise || (g.rise + 24 * 3600000)) - g.now));
      } else {
        remainLab = t('weather.untilSunset', 'Until sunset');
        remainVal = formatDurationMs(Math.max(0, g.set - g.now));
      }
      const hourLabs = [
        { f: 0, lab: '00' }, { f: 0.25, lab: '06' }, { f: 0.5, lab: '12' }, { f: 0.75, lab: '18' }, { f: 1, lab: '24' }
      ].map(function (item) {
        const x = padL + item.f * (W - padL - padR);
        return `<text x="${x.toFixed(1)}" y="${H - 8}" fill="rgba(255,255,255,.45)" font-size="10" text-anchor="middle" font-family="system-ui,sans-serif">${item.lab}</text>`;
      }).join('');

      let html = `<div class="wx-sheet-hero">
        <div class="weather-mod-label">${escapeHtml(heroTitle)}</div>
        <div class="weather-chart-readout">${escapeHtml(formatClock(heroIso))}</div>
        <div class="weather-chart-sub">${escapeHtml(remainLab)}: ${escapeHtml(remainVal)}</div>
      </div>`;
      html += `<div class="weather-chart-card wx-sun-day-card">
        <svg class="weather-chart weather-sun-day" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
          <line x1="${padL}" y1="${g.horizonY.toFixed(1)}" x2="${W - padR}" y2="${g.horizonY.toFixed(1)}" stroke="rgba(255,255,255,.28)" stroke-width="1"/>
          ${g.area ? `<path d="${g.area}" fill="rgba(255,210,120,.16)"/>` : ''}
          <path d="${g.line}" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2.25" stroke-linejoin="round"/>
          <circle cx="${g.curX.toFixed(1)}" cy="${g.curY.toFixed(1)}" r="7" fill="#fff" stroke="rgba(255,220,140,.95)" stroke-width="2"/>
          ${hourLabs}
        </svg>
      </div>`;
      const fmtMs = (ms) => {
        try { return new Date(ms).toLocaleTimeString(localeTag(), { hour: 'numeric', minute: '2-digit' }); }
        catch (e) { return '—'; }
      };
      const rows = [
        [t('weather.firstLight', 'First Light'), fmtMs(firstLight)],
        [t('weather.sunrise', 'Sunrise'), formatClock(sunriseIso)],
        [t('weather.sunset', 'Sunset'), formatClock(sunsetIso)],
        [t('weather.lastLight', 'Last Light'), fmtMs(lastLight)],
        [t('weather.totalDaylight', 'Total Daylight'), formatDurationMs(daylight)]
      ];
      html += '<div class="wx-sun-metrics">';
      rows.forEach(([lab, val]) => {
        html += `<div class="wx-sun-metric"><span>${escapeHtml(lab)}</span><strong>${escapeHtml(val)}</strong></div>`;
      });
      html += '</div>';
      return html;
    }

    /**
     * Apple Weather-inspired wind compass (not a clock hand).
     * Arrow points where the wind is going TO (meteorological FROM + 180°).
     * size: 'mini' | 'full'
     */
    function windCompassMarkup(deg, size) {
      const from = deg == null ? 0 : Number(deg);
      const to = (from + 180) % 360;
      const cls = size === 'mini' ? 'weather-compass weather-compass--mini' : 'weather-compass weather-compass--full';
      return `<div class="${cls}" style="--wx-wind-from:${from}deg;--wx-wind-to:${to}deg" aria-hidden="true">
        <span class="wx-compass-tick wx-compass-tick--n">N</span>
        <span class="wx-compass-tick wx-compass-tick--e">E</span>
        <span class="wx-compass-tick wx-compass-tick--s">S</span>
        <span class="wx-compass-tick wx-compass-tick--w">W</span>
        <div class="wx-compass-ring"></div>
        <div class="wx-compass-arrow">
          <span class="wx-compass-arrow-head"></span>
          <span class="wx-compass-arrow-shaft"></span>
        </div>
        <div class="wx-compass-hub"></div>
      </div>`;
    }

    function windCompass(deg) {
      return `${windCompassMarkup(deg, 'full')}
        <div class="weather-chart-sub weather-compass-caption">${escapeHtml(degToCompass(deg))} · ${deg != null ? Math.round(deg) + '°' : '—'}</div>`;
    }

    return {
      tempToBarColor: tempToBarColor,
      dailyBarsHtml: dailyBarsHtml,
      hourlyWindow: hourlyWindow,
      localDateKey: localDateKey,
      hourlyLocalDay: hourlyLocalDay,
      smoothLinePath: smoothLinePath,
      buildTempChart: buildTempChart,
      bindCharts: bindCharts,
      uvGauge: uvGauge,
      sunPathGeometry: sunPathGeometry,
      sunArcSvg: sunArcSvg,
      formatDurationMs: formatDurationMs,
      buildSunDaySheet: buildSunDaySheet,
      windCompassMarkup: windCompassMarkup,
      windCompass: windCompass
    };
  };
})(window);
