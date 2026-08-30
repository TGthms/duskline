'use strict';
/* Duskline — shared weather math (browser + Node).
   Canonical conversions, HTML escaping, and timezone helpers.
   Weather UI formatters in features/weather/app.js delegate here. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.DusklineWxMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[ch];
    });
  }

  function windMsTo(unit, ms) {
    if (ms == null) return null;
    if (unit === 'mph') return ms * 2.23694;
    if (unit === 'kmh') return ms * 3.6;
    if (unit === 'kn') return ms * 1.94384;
    if (unit === 'bft') {
      var t = Math.pow(ms / 0.836, 2 / 3);
      return Math.max(0, Math.min(12, Math.round(t)));
    }
    return ms;
  }

  function fmtWind(ms, unit) {
    var u = unit || 'ms';
    var v = windMsTo(u, ms);
    if (v == null) return '—';
    if (u === 'bft') return v + ' bft';
    if (u === 'mph') return Math.round(v) + ' mph';
    if (u === 'kmh') return Math.round(v) + ' km/h';
    if (u === 'kn') return Math.round(v) + ' kn';
    return Number(v).toFixed(1) + ' m/s';
  }

  function fmtTempFromC(celsius, useF) {
    if (celsius == null || Number.isNaN(Number(celsius))) return '—';
    var n = Number(celsius);
    if (useF) n = n * 9 / 5 + 32;
    return String(Math.round(n)) + '°';
  }

  function fmtPrecip(mm, unit) {
    if (mm == null) return '—';
    var u = unit || 'mm';
    if (u === 'in') return (mm / 25.4).toFixed(2) + ' in';
    if (u === 'cm') return (mm / 10).toFixed(1) + ' cm';
    return Number(mm).toFixed(1) + ' mm';
  }

  function fmtPress(hpa, unit) {
    if (hpa == null) return '—';
    var u = unit || 'hPa';
    if (u === 'mbar') return Math.round(hpa) + ' mbar';
    if (u === 'inHg') return (hpa * 0.02953).toFixed(2) + ' inHg';
    if (u === 'mmHg') return Math.round(hpa * 0.75006) + ' mmHg';
    if (u === 'kPa') return (hpa / 10).toFixed(1) + ' kPa';
    return Math.round(hpa) + ' hPa';
  }

  function fmtVis(m, useMi) {
    if (m == null) return '—';
    if (useMi) return (m / 1609.34).toFixed(1) + ' mi';
    return (m / 1000).toFixed(1) + ' km';
  }

  /**
   * Wall-clock hour 0–24 as a fraction (14.5 = 14:30).
   * Bare Open-Meteo local ISO (`2026-08-30T14:00`) uses the embedded clock.
   * Offset/`Z` strings use `timeZone` when given, never the browser zone.
   */
  function hourFromIso(isoTime, timeZone) {
    function frac(h, min) {
      var hh = Number(h);
      if (hh === 24) hh = 0;
      var mm = Number(min) || 0;
      if (!Number.isFinite(hh)) return 12;
      return hh + (Number.isFinite(mm) ? mm / 60 : 0);
    }
    if (isoTime && typeof isoTime === 'string') {
      var m = isoTime.match(/T(\d{2})(?::(\d{2}))?/);
      var hasOffset = /[zZ]$/.test(isoTime) || /[+-]\d{2}:\d{2}$/.test(isoTime);
      if (m && !hasOffset) return frac(m[1], m[2]);
      if (hasOffset && timeZone) {
        try {
          var parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: timeZone,
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
            hourCycle: 'h23'
          }).formatToParts(new Date(isoTime));
          var h = 12;
          var min = 0;
          for (var i = 0; i < parts.length; i++) {
            if (parts[i].type === 'hour') h = parseInt(parts[i].value, 10);
            if (parts[i].type === 'minute') min = parseInt(parts[i].value, 10);
          }
          if (h === 24) h = 0;
          if (Number.isFinite(h)) return frac(h, min);
        } catch (e) { /* fall through */ }
      }
      if (m) return frac(m[1], m[2]);
    }
    return 12;
  }

  /**
   * Convert a wall-clock ISO (Open-Meteo local, no Z) to UTC ms in `timeZone`.
   * Offset-bearing strings use Date.parse.
   */
  function wallClockInZoneToUtcMs(iso, timeZone) {
    var s = String(iso || '');
    if (!s) return NaN;
    if (/[zZ]$/.test(s) || /[+-]\d{2}:\d{2}$/.test(s)) {
      var t = new Date(s).getTime();
      return Number.isFinite(t) ? t : NaN;
    }
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!m) {
      var t2 = new Date(s).getTime();
      return Number.isFinite(t2) ? t2 : NaN;
    }
    var y = Number(m[1]);
    var mo = Number(m[2]);
    var d = Number(m[3]);
    var h = Number(m[4]);
    var mi = Number(m[5]);
    var se = Number(m[6] || 0);
    var tz = timeZone || 'UTC';
    var guess = Date.UTC(y, mo - 1, d, h, mi, se);
    for (var iter = 0; iter < 4; iter++) {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
      }).formatToParts(new Date(guess));
      var get = function (type) {
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].type === type) return Number(parts[i].value);
        }
        return 0;
      };
      var hh = get('hour');
      if (hh === 24) hh = 0;
      var asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hh, get('minute'), get('second'));
      var want = Date.UTC(y, mo - 1, d, h, mi, se);
      guess += want - asUtc;
    }
    return guess;
  }

  function startOfLocalDayUtcMs(ms, timeZone) {
    try {
      var parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: timeZone || undefined,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(new Date(ms));
      var get = function (type) {
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].type === type) return parts[i].value;
        }
        return '01';
      };
      var ymd = get('year') + '-' + get('month') + '-' + get('day') + 'T00:00:00';
      return wallClockInZoneToUtcMs(ymd, timeZone);
    } catch (e) {
      var d = new Date(ms);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }
  }

  return {
    escapeHtml: escapeHtml,
    windMsTo: windMsTo,
    fmtWind: fmtWind,
    fmtTempFromC: fmtTempFromC,
    fmtPrecip: fmtPrecip,
    fmtPress: fmtPress,
    fmtVis: fmtVis,
    hourFromIso: hourFromIso,
    wallClockInZoneToUtcMs: wallClockInZoneToUtcMs,
    startOfLocalDayUtcMs: startOfLocalDayUtcMs
  };
});
