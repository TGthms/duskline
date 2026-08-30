'use strict';
/* Duskline — weather/sky.js */
(function (global) {
  var W = global.DusklineWeather;
  if (!W || !W.active) return;

  W.factories.sky = function createSkyModule(deps) {
    deps = deps || {};
    function motionLevel() {
      if (typeof deps.motionLevel === 'function') return deps.motionLevel();
      return 'full';
    }
    function motionFull() { return motionLevel() === 'full'; }
    var WEATHER_STATIC_LIST_FX = deps.staticListFx !== false;

    function celestialPos(hour, isRow) {
      const night = hour < 5.5 || hour >= 20;
      if (night) {
        // Moon drifts across evening sky by hour
        const t = hour >= 20 ? (hour - 20) / 9.5 : (hour + 4) / 9.5;
        const left = 18 + t * 55;
        const top = 18 + Math.sin(t * Math.PI) * 8;
        return { left, top, size: isRow ? 36 : 72, night: true };
      }
      // Solar day ~5:30–20:00 → t 0..1
      const t = Math.max(0, Math.min(1, (hour - 5.5) / 14.5));
      const left = 6 + t * 72; // morning left → afternoon right
      // Arc: high near noon
      const top = 48 - Math.sin(t * Math.PI) * 38; // noon ~10%, ends ~48%
      const noonBoost = Math.sin(t * Math.PI);
      const size = isRow
        ? (32 + noonBoost * 14)
        : (70 + noonBoost * 50);
      return { left, top, size, night: false, t };
    }

    function skyFor(code, hour, seed) {
      const night = hour < 6 || hour >= 20;
      // Small per-city hue shift so identical conditions still differ
      const s = ((seed || 0) % 7) - 3; // -3..3
      const shift = (hex, n) => {
        // lightweight RGB nudge
        try {
          const h = hex.replace('#', '');
          let r = parseInt(h.slice(0, 2), 16);
          let g = parseInt(h.slice(2, 4), 16);
          let b = parseInt(h.slice(4, 6), 16);
          r = Math.max(0, Math.min(255, r + n * 4));
          g = Math.max(0, Math.min(255, g + n * 2));
          b = Math.max(0, Math.min(255, b - n * 3));
          return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
        } catch (e) { return hex; }
      };
      if (code >= 95) return { c1: shift('#1a1428', s), c2: shift('#0a0612', s), fx: 'storm' };
      // Snow 71–77 / snow showers 85–86 (do not catch rain showers 80–82)
      if ((code >= 71 && code < 80) || (code >= 85 && code < 90)) {
        return { c1: shift('#3d4f66', s), c2: shift('#1c2533', s), fx: 'snow' };
      }
      // Drizzle/rain 51–67, rain showers 80–82
      if ((code >= 51 && code < 70) || (code >= 80 && code < 85)) {
        return { c1: shift('#2c3e50', s), c2: shift('#1a252f', s), fx: 'rain' };
      }
      if (code === 45 || code === 48) return { c1: shift('#4a5560', s), c2: shift('#2a3038', s), fx: 'fog' };
      if (code >= 2) {
        return night
          ? { c1: shift('#1e2a44', s), c2: shift('#0c1220', s), fx: 'cloud' }
          : { c1: shift('#5b86b8', s), c2: shift('#2c4870', s), fx: 'cloud' };
      }
      // Clear: palette follows local time (not one flat blue for every city)
      if (night) return { c1: shift('#0b1a3a', s), c2: shift('#050b18', s), fx: 'clear-night' };
      if (hour < 8) return { c1: shift('#e8926a', s), c2: shift('#5a7eb8', s), fx: 'clear-dawn' };
      if (hour < 10) return { c1: shift('#5aaed8', s), c2: shift('#2d74b0', s), fx: 'clear' };
      if (hour < 15) return { c1: shift('#3b8ec4', s), c2: shift('#155890', s), fx: 'clear' };
      if (hour < 17.5) return { c1: shift('#4a8fbf', s), c2: shift('#245a88', s), fx: 'clear' };
      return { c1: shift('#e88858', s), c2: shift('#4a5a9a', s), fx: 'clear-dusk' };
    }

    /** 0–1 precip visual intensity from WMO code + optional mm amount. */
    function precipIntensity(code, precipMm) {
      const c = code || 0;
      let base = 0;
      if (c >= 95) base = 0.88;
      else if (c === 82 || c === 65 || c === 67) base = 0.92;
      else if (c === 81 || c === 63 || c === 55 || c === 57) base = 0.68;
      else if (c === 80 || c === 61 || c === 53) base = 0.48;
      else if (c >= 51 && c < 60) base = 0.32;
      else if (c >= 80 && c < 90) base = 0.58;
      else if (c >= 61 && c < 70) base = 0.55;
      else if (c >= 71 && c < 80) base = 0.5; // snow
      else if (c >= 85 && c < 87) base = 0.7;
      else return 0;
      if (precipMm != null && precipMm > 0) {
        base = Math.min(1, base + Math.min(0.28, precipMm / 8));
      }
      return base;
    }

    function applySky(el, code, isoTime, opts) {
      if (!el) return;
      opts = opts || {};
      let hour = opts.hour;
      if (hour == null) {
        if (window.DusklineWxMath && typeof window.DusklineWxMath.hourFromIso === 'function') {
          hour = window.DusklineWxMath.hourFromIso(isoTime, opts.timeZone);
        } else {
          hour = 12;
          try {
            if (isoTime && typeof isoTime === 'string') {
              const m = isoTime.match(/T(\d{2})/);
              if (m) hour = parseInt(m[1], 10);
            }
          } catch (e) {}
        }
      }
      const seed = opts.seed != null ? opts.seed : 0;
      const isRow = !!opts.isRow;
      const s = skyFor(code || 0, hour, seed);
      // Keep labels legible against each city's actual gradient, independent
      // of the page's system appearance.
      function luminance(hex) {
        try {
          const h = hex.replace('#', '');
          const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
          return rgb.map((v) => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4))
            .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        } catch (e) { return 0.12; }
      }
      const night = hour < 6 || hour >= 20;
      const isStorm = (code || 0) >= 95;
      // Detail tiles follow the city's sky — light frost by day, navy glass at
      // night/storm. Hero type on the gradient stays light either way.
      const modsLight = !opts.isRow && !night && !isStorm;
      const lightSky = modsLight || (luminance(s.c1) + luminance(s.c2)) / 2 > .22;
      el.classList.toggle('wx-mods-light', modsLight);
      el.style.setProperty('--wx-content', '#f4f8ff');
      el.style.setProperty('--wx-content-muted', 'rgba(244,248,255,.78)');
      el.style.setProperty('--wx-content-shadow', 'rgba(0,0,0,.42)');
      el.style.setProperty('--wx-sky-bright', lightSky ? '1' : '0');
      if (modsLight) {
        el.style.setProperty('--wx-mod-ink', '#16344f');
        el.style.setProperty('--wx-mod-muted', 'rgba(22, 52, 79, 0.62)');
        el.style.setProperty('--wx-mod-shadow', 'none');
      } else {
        el.style.setProperty('--wx-mod-ink', '#f4f8ff');
        el.style.setProperty('--wx-mod-muted', 'rgba(244,248,255,.72)');
        el.style.setProperty('--wx-mod-shadow', '0 1px 3px rgba(0,0,0,.42)');
      }
      const level = motionLevel();
      el.style.setProperty('--wx-sky-1', s.c1);
      el.style.setProperty('--wx-sky-2', s.c2);
      el.style.setProperty('--wx-flat', s.c2);

      // Celestial position from local hour
      const pos = celestialPos(hour, isRow);
      el.style.setProperty('--wx-sun-left', pos.left.toFixed(1) + '%');
      el.style.setProperty('--wx-sun-top', pos.top.toFixed(1) + '%');
      el.style.setProperty('--wx-sun-size', pos.size.toFixed(0) + 'px');
      // Per-card cloud offsets so rows don't look stamped
      const c1x = ((seed * 17) % 30) - 10;
      const c2x = ((seed * 29) % 40) - 15;
      const c3x = ((seed * 13) % 25) - 8;
      el.style.setProperty('--wx-cloud-1-x', c1x + '%');
      el.style.setProperty('--wx-cloud-2-x', c2x + '%');
      el.style.setProperty('--wx-cloud-3-x', c3x + '%');
      const isPrecipFx = s.fx === 'rain' || s.fx === 'storm' || s.fx === 'snow';
      el.style.setProperty('--wx-cloud-op', isPrecipFx ? '0.9' : ((code >= 2 && code < 50) ? '0.85' : (s.fx === 'clear' || s.fx === 'clear-dawn' || s.fx === 'clear-dusk') ? '0.22' : '0.55'));

      // List rows: static (no rain particles). Detail view: full animated FX.
      const listStatic = WEATHER_STATIC_LIST_FX && isRow;
      const intensity = precipIntensity(code || 0, opts.precipMm);
      const rowScale = isRow ? 0.55 : 1;
      let rainOp = 0;
      if (!listStatic && intensity > 0) {
        if (level === 'reduced') {
          rainOp = Math.min(0.42, 0.28 + intensity * 0.2) * rowScale;
        } else {
          // Light ~0.35 → heavy ~0.58 (capped for comfort)
          rainOp = Math.min(0.58, 0.32 + intensity * 0.32) * rowScale;
        }
      }
      el.style.setProperty('--wx-rain-opacity', String(rainOp));
      el.dataset.wxIntensity = intensity < 0.4 ? 'light' : intensity < 0.72 ? 'med' : 'heavy';

      if (level === 'off') {
        el.style.setProperty('--wx-fx-bg', 'none');
        el.style.setProperty('--wx-fx-bg-2', 'none');
        el.style.setProperty('--wx-fx-opacity', '0');
        el.style.setProperty('--wx-rain-opacity', '0');
        if (isRow || opts.noOrnaments) {
          paintSkyModeClassOnly(el, code || 0, hour, { isRow: isRow, staticFx: true });
        } else {
          paintSkyMode(el, code || 0, isoTime, {
            hour, seed, isRow, intensity, staticFx: true
          });
        }
        return;
      }
      // Soft atmospheric base (mist/veil) — particles are separate ornaments
      const sunGlow = `radial-gradient(circle at ${pos.left.toFixed(1)}% ${pos.top.toFixed(1)}%, rgba(255,230,150,.48), transparent 44%)`;
      // Cool wet-atmosphere veil under rain (supports the drop layer)
      const rainVeil = 'radial-gradient(ellipse at 40% 0%, rgba(140,175,210,.38), transparent 55%), linear-gradient(180deg, rgba(90,120,150,.12) 0%, rgba(50,70,95,.28) 100%), radial-gradient(ellipse at 70% 60%, rgba(160,190,220,.16), transparent 50%)';
      const snow = 'radial-gradient(circle at 20% 30%, rgba(255,255,255,.28) 0 1.2px, transparent 2.2px), radial-gradient(circle at 70% 60%, rgba(255,255,255,.2) 0 1px, transparent 2px), radial-gradient(circle at 45% 75%, rgba(255,255,255,.16) 0 1px, transparent 2px), radial-gradient(ellipse at 50% 0%, rgba(220,230,245,.2), transparent 50%)';
      const cloud = 'radial-gradient(ellipse at 28% 18%, rgba(255,255,255,.28), transparent 50%), radial-gradient(ellipse at 72% 38%, rgba(255,255,255,.16), transparent 44%), radial-gradient(ellipse at 50% 90%, rgba(255,255,255,.08), transparent 40%)';
      const clear = sunGlow + ', radial-gradient(ellipse at 50% -10%, rgba(255,255,255,.32), transparent 55%)';
      const dawn = sunGlow + ', radial-gradient(ellipse at 30% 90%, rgba(255,160,100,.32), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,200,160,.15), transparent 40%)';
      const dusk = sunGlow + ', radial-gradient(ellipse at 70% 85%, rgba(255,120,80,.34), transparent 50%), radial-gradient(ellipse at 20% 30%, rgba(120,80,160,.18), transparent 45%)';
      const nightFx = 'radial-gradient(circle at 72% 18%, rgba(255,255,255,.5) 0 1.2px, transparent 2px), radial-gradient(circle at 30% 40%, rgba(255,255,255,.3) 0 1px, transparent 2px), radial-gradient(ellipse at 50% 100%, rgba(80,100,180,.24), transparent 50%)';
      const storm = 'radial-gradient(ellipse at 40% 0%, rgba(140,120,220,.35), transparent 52%), radial-gradient(ellipse at 60% 30%, rgba(50,35,80,.3), transparent 45%), ' + rainVeil;
      let fx = clear, fx2 = cloud, op = isRow ? 0.48 : 0.55;
      if (s.fx === 'rain') { fx = rainVeil; fx2 = cloud; op = isRow ? 0.55 : 0.68; }
      else if (s.fx === 'snow') { fx = snow; fx2 = cloud; op = 0.58; }
      else if (s.fx === 'storm') { fx = storm; fx2 = cloud; op = 0.72; }
      else if (s.fx === 'fog') { fx = 'linear-gradient(180deg, rgba(200,210,220,.2), rgba(120,130,140,.28))'; fx2 = cloud; op = 0.45; }
      else if (s.fx === 'cloud') { fx = cloud; fx2 = sunGlow; op = 0.52; }
      else if (s.fx === 'clear-night') { fx = nightFx; fx2 = cloud; op = 0.48; }
      else if (s.fx === 'clear-dawn') { fx = dawn; fx2 = cloud; op = 0.55; }
      else if (s.fx === 'clear-dusk') { fx = dusk; fx2 = cloud; op = 0.55; }
      el.style.setProperty('--wx-fx-bg', fx);
      el.style.setProperty('--wx-fx-bg-2', fx2);
      el.style.setProperty('--wx-fx-opacity', level === 'reduced' ? String(op * 0.55) : String(op));
      // List rows: mode class + CSS vars only (no ornament DOM — major battery win)
      // Detail: full ornaments + rain when not noOrnaments
      if (isRow || opts.noOrnaments) {
        paintSkyModeClassOnly(el, code || 0, hour, { isRow: isRow, staticFx: listStatic || isRow });
      } else if (!opts.noOrnaments) {
        paintSkyMode(el, code || 0, isoTime, {
          hour, seed, isRow, intensity, staticFx: false
        });
      }
    }

    /** Page canvas: browser time by default, or saved-location conditions when available. */
    function applyAmbientPageSky(pack) {
      const sky = document.getElementById('weatherPageSky');
      if (!sky) return;
      let hour = new Date().getHours();
      const cityTz = pack && pack.weather && pack.weather.timezone || pack && pack.city && pack.city.tz;
      if (cityTz) {
        try {
          const part = new Intl.DateTimeFormat('en-GB', { timeZone: cityTz, hour: 'numeric', hour12: false, hourCycle: 'h23' }).formatToParts(new Date()).find(function (p) { return p.type === 'hour'; });
          if (part) hour = Number(part.value);
        } catch (e) {}
      }
      const code = pack && pack.weather && pack.weather.current && Number(pack.weather.current.weather_code);
      const theme = (document.documentElement.getAttribute('data-theme') || 'default');
      const period = hour < 5 ? 'night' : hour < 8 ? 'dawn' : hour < 17 ? 'day' : hour < 20 ? 'dusk' : 'night';
      // [top, mid, bottom] — soft, satisfying palettes tuned per theme
      const palettes = {
        default: {
          night: ['#0a1024', '#121a38', '#060a14'],
          dawn: ['#2a1848', '#c4785a', '#1a2848'],
          day: ['#1a5a9e', '#4a9fd4', '#0c2440'],
          dusk: ['#3a1848', '#c45a48', '#101828']
        },
        minimal: {
          night: ['#1c1c1e', '#2c2c2e', '#0d0d0f'],
          dawn: ['#a8c0d8', '#f0c8b0', '#d8e4f0'],
          day: ['#7eb8e8', '#c5e0f5', '#e8f2fa'],
          dusk: ['#6b7a9a', '#e8a878', '#2a3040']
        },
        elegant: {
          night: ['#1a1410', '#2a2018', '#0e0a08'],
          dawn: ['#8a6a58', '#e8c4a0', '#f0e6d8'],
          day: ['#c8b8a0', '#efe6d8', '#f7f1e8'],
          dusk: ['#5a3040', '#c47858', '#2a1810']
        },
        glass: {
          night: ['#000000', '#0a1020', '#000000'],
          dawn: ['#0a1028', '#4a3060', '#000810'],
          day: ['#061428', '#0a3a68', '#000810'],
          dusk: ['#100818', '#3a1848', '#000408']
        },
      };
      let set = (palettes[theme] || palettes.default)[period];
      if (code >= 95) set = ['#24172d', '#352044', '#100a1c'];
      else if ((code >= 51 && code < 70) || (code >= 80 && code < 85)) set = period === 'night' ? ['#17243a', '#26384e', '#0b1320'] : ['#46718f', '#6d9ab1', '#18344d'];
      else if ((code >= 71 && code < 80) || (code >= 85 && code < 90)) set = period === 'night' ? ['#202b3c', '#34445a', '#101722'] : ['#7890a7', '#b8c7d4', '#40586d'];
      else if (code >= 2 && code <= 3) set = period === 'night' ? ['#18243b', '#2a3852', '#0b1220'] : ['#52799b', '#86a9c2', '#294965'];
      const level = motionLevel();
      sky.style.setProperty('--wx-page-1', set[0]);
      sky.style.setProperty('--wx-page-2', set[1]);
      sky.style.setProperty('--wx-page-3', set[2]);
      sky.style.setProperty('--wx-page-flat', set[2]);
      sky.setAttribute('data-period', period);
      sky.setAttribute('data-theme-sky', theme);
      sky.setAttribute('data-condition', Number.isFinite(code) ? String(code) : 'ambient');

      // Soft ambient texture (not weather-condition FX)
      let fx = 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.12), transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255,255,255,.06), transparent 45%)';
      let op = 0.45;
      if (period === 'night') {
        fx = 'radial-gradient(circle at 72% 18%, rgba(255,255,255,.5) 0 1px, transparent 2px), radial-gradient(circle at 30% 40%, rgba(255,255,255,.28) 0 1px, transparent 2px), radial-gradient(ellipse at 50% 100%, rgba(80,100,180,.18), transparent 50%)';
        op = 0.4;
      } else if (period === 'dawn' || period === 'dusk') {
        fx = 'radial-gradient(ellipse at 50% 80%, rgba(255,180,120,.22), transparent 55%), radial-gradient(ellipse at 20% 10%, rgba(255,220,180,.15), transparent 40%)';
        op = 0.5;
      } else if (theme === 'minimal' || theme === 'elegant') {
        fx = 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.35), transparent 55%), radial-gradient(ellipse at 80% 40%, rgba(255,255,255,.12), transparent 40%)';
        op = 0.35;
      }
      sky.style.setProperty('--wx-page-fx', fx);
      sky.style.setProperty('--wx-page-fx-o', level === 'off' ? '0' : (level === 'reduced' ? String(op * 0.55) : String(op)));
      // Theme class for CSS light/dark text tuning
      document.body.classList.toggle('weather-sky-light', theme === 'minimal' || (theme === 'elegant' && period === 'day'));
      // Pale page wash (minimal/elegant day+dawn) — footer/attribution need dark ink.
      document.body.classList.toggle('wx-page-canvas-light',
        (theme === 'minimal' || theme === 'elegant') && (period === 'day' || period === 'dawn'));
      // Full motion: living sun/moon/cloud ornaments. Reduced/off: static gradient only.
      let live = sky.querySelector('.wx-page-live');
      if (level === 'full') {
        if (!live) {
          live = document.createElement('div');
          live.className = 'wx-page-live';
          live.setAttribute('aria-hidden', 'true');
          live.innerHTML =
            '<div class="wx-page-blob wx-page-blob-1"></div>' +
            '<div class="wx-page-blob wx-page-blob-2"></div>' +
            '<div class="wx-page-blob wx-page-blob-3"></div>' +
            '<div class="wx-page-cloud wx-page-cloud-a"></div>' +
            '<div class="wx-page-cloud wx-page-cloud-b"></div>' +
            '<div class="wx-page-sun"></div>' +
            '<div class="wx-page-moon"></div>' +
            '<div class="wx-page-glow"></div>';
          sky.appendChild(live);
        } else if (!live.querySelector('.wx-page-cloud')) {
          // Upgrade older live layers that only had blobs/sun
          live.insertAdjacentHTML('beforeend',
            '<div class="wx-page-cloud wx-page-cloud-a"></div>' +
            '<div class="wx-page-cloud wx-page-cloud-b"></div>' +
            '<div class="wx-page-moon"></div>');
        }
        const pos = celestialPos(hour, false);
        sky.style.setProperty('--wx-page-sun-left', pos.left.toFixed(1) + '%');
        sky.style.setProperty('--wx-page-sun-top', Math.max(8, pos.top * 0.55).toFixed(1) + '%');
        sky.style.setProperty('--wx-page-sun-size', (pos.night ? 48 : Math.max(100, pos.size * 1.15)).toFixed(0) + 'px');
      } else if (live) {
        try { live.remove(); } catch (e) { live.innerHTML = ''; }
      }
      sky.classList.toggle('wx-page--night', period === 'night');
      sky.classList.toggle('wx-page--day', period === 'day' || period === 'dawn' || period === 'dusk');
    }
    function applyPageSkyFromPacks() {
      applyAmbientPageSky();
    }
    function ensureOrnaments(host) {
      if (!host) return null;
      let box = host.querySelector('.wx-ornaments');
      if (!box) {
        box = document.createElement('div');
        box.className = 'wx-ornaments';
        box.setAttribute('aria-hidden', 'true');
        box.innerHTML = `
          <div class="wx-ornament wx-sun"></div>
          <div class="wx-ornament wx-moon"></div>
          <div class="wx-ornament wx-stars"></div>
          <div class="wx-ornament wx-cloud wx-cloud-1"></div>
          <div class="wx-ornament wx-cloud wx-cloud-2"></div>
          <div class="wx-ornament wx-cloud wx-cloud-3"></div>
          <div class="wx-ornament wx-rain" aria-hidden="true"></div>
          <div class="wx-ornament wx-snow" aria-hidden="true"></div>
          <div class="wx-ornament wx-lightning" aria-hidden="true"></div>`;
        host.appendChild(box);
      } else if (!box.querySelector('.wx-rain')) {
        // Upgrade ornaments created before rain layers existed
        box.insertAdjacentHTML('beforeend',
          '<div class="wx-ornament wx-rain" aria-hidden="true"></div>' +
          '<div class="wx-ornament wx-snow" aria-hidden="true"></div>' +
          '<div class="wx-ornament wx-lightning" aria-hidden="true"></div>');
      }
      return box;
    }
    function skyModeFromCode(code, hour, staticFx) {
      const night = hour < 6 || hour >= 20;
      const c = code || 0;
      let mode = night ? 'night' : 'day';
      if (c >= 95) mode = 'storm';
      else if ((c >= 51 && c < 70) || (c >= 80 && c < 85)) mode = 'rain';
      else if ((c >= 71 && c < 80) || (c >= 85 && c < 90)) mode = 'snow';
      else if (c >= 2 && c <= 3) mode = night ? 'night' : 'cloud';
      else if (c === 45 || c === 48) mode = 'cloud';
      if (staticFx) {
        if (mode === 'rain' || mode === 'storm' || mode === 'snow') {
          mode = night ? 'night' : 'cloud';
        }
      }
      return mode;
    }

    /** List rows: CSS vars + mode class only — no ornament DOM. */
    function paintSkyModeClassOnly(host, code, hour, opts) {
      if (!host) return;
      opts = opts || {};
      const h = hour != null ? hour : 12;
      const mode = skyModeFromCode(code, h, !!(opts.staticFx || opts.isRow));
      host.classList.remove('wx-sky--day', 'wx-sky--night', 'wx-sky--cloud', 'wx-sky--rain', 'wx-sky--storm', 'wx-sky--snow');
      host.classList.add('wx-sky--' + mode);
      if (opts.isRow) host.classList.add('wx-sky--row');
      else host.classList.remove('wx-sky--row');
      // Strip leftover ornaments if a row was ever upgraded
      const box = host.querySelector('.wx-ornaments');
      if (box) {
        try { box.remove(); } catch (e) { box.innerHTML = ''; }
      }
    }

    function paintSkyMode(host, code, isoTime, opts) {
      if (!host) return;
      ensureOrnaments(host);
      opts = opts || {};
      let hour = opts.hour;
      if (hour == null) {
        if (window.DusklineWxMath && typeof window.DusklineWxMath.hourFromIso === 'function') {
          hour = window.DusklineWxMath.hourFromIso(isoTime, opts.timeZone);
        } else {
          hour = 12;
          try {
            if (isoTime && typeof isoTime === 'string') {
              const m = isoTime.match(/T(\d{2})/);
              if (m) hour = parseInt(m[1], 10);
            }
          } catch (e) {}
        }
      }
      const mode = skyModeFromCode(code, hour, !!(opts.staticFx || (WEATHER_STATIC_LIST_FX && opts.isRow)));
      host.classList.remove('wx-sky--day', 'wx-sky--night', 'wx-sky--cloud', 'wx-sky--rain', 'wx-sky--storm', 'wx-sky--snow');
      host.classList.add('wx-sky--' + mode);
      if (opts.isRow) host.classList.add('wx-sky--row');
      else host.classList.remove('wx-sky--row');
    }

    return {
      celestialPos: celestialPos,
      skyFor: skyFor,
      precipIntensity: precipIntensity,
      applySky: applySky,
      applyAmbientPageSky: applyAmbientPageSky,
      applyPageSkyFromPacks: applyPageSkyFromPacks,
      ensureOrnaments: ensureOrnaments,
      skyModeFromCode: skyModeFromCode,
      paintSkyModeClassOnly: paintSkyModeClassOnly,
      paintSkyMode: paintSkyMode
    };
  };
})(window);
