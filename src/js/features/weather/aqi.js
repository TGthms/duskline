'use strict';
/* AQI normalization, rendering and request ownership share one tested boundary. */
(function (global) {
  const W=global.DusklineWeather;
  if(!W || !W.active) return;
  W.factories.aqi=function (deps) {
    const {t,escapeHtml,localeTag,aqiScale,cityKey,cache,stampToMs,formatClock}=deps;
    const AIR=deps.AIR,REFRESH_MS=deps.refreshMs;
    const aqiDetailInflight=new Map();
  function aqiCurrentValue(current, scale) {
    const source = current || {};
    return source[scale === 'eu' ? 'european_aqi' : 'us_aqi'];
  }
  function aqiScaleLabel(scale) {
    return scale === 'eu'
      ? t('weather.aqiEuropeanAqi', 'European AQI')
      : 'US AQI';
  }
  function aqiLabel(v, scale) {
    const band = aqiBandKey(v, scale);
    const labels = {
      Good: ['weather.aqiGood', 'Good'],
      Moderate: ['weather.aqiModerate', 'Moderate'],
      UnhealthySG: ['weather.aqiUnhealthySG', 'Unhealthy for Sensitive Groups'],
      Unhealthy: ['weather.aqiUnhealthy', 'Unhealthy'],
      VeryUnhealthy: ['weather.aqiVeryUnhealthy', 'Very unhealthy'],
      Hazardous: ['weather.aqiHazardous', 'Hazardous'],
      Fair: ['weather.aqiEurFair', 'Fair'],
      Poor: ['weather.aqiEurPoor', 'Poor'],
      VeryPoor: ['weather.aqiEurVeryPoor', 'Very poor'],
      ExtremelyPoor: ['weather.aqiEurExtremelyPoor', 'Extremely poor']
    };
    return band ? t(labels[band][0], labels[band][1]) : '';
  }
  function aqiBandKey(v, scale) {
    return window.DusklineAqiMath.band(v, scale || aqiScale());
  }
  function aqiDescription(v, scale) {
    scale = scale || aqiScale();
    if (scale === 'eu') return '';
    const band = aqiBandKey(v, scale);
    return band ? t('weather.aqiDesc' + band, '') : '';
  }
  function aqiGreetingDescription(v, scale) {
    scale = scale || aqiScale();
    const band = aqiBandKey(v, scale);
    if (!band) return '';
    if (scale === 'eu') return aqiScaleLabel(scale) + ': ' + aqiLabel(v, scale) + '.';
    return t('weather.aqiGreeting' + band, aqiLabel(v, scale));
  }
  function aqiRange(v, scale) {
    scale = scale || aqiScale();
    const band = aqiBandKey(v, scale);
    if (!band) return '';
    if (scale === 'eu') {
      const euRanges = {
        Good: [0, 20], Fair: [21, 40], Moderate: [41, 60],
        Poor: [61, 80], VeryPoor: [81, 100]
      };
      if (band === 'ExtremelyPoor') return '101+';
      const range = euRanges[band];
      return range[0] + '–' + range[1];
    }
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
    'olive_pollen', 'ragweed_pollen', 'european_aqi', 'european_aqi_pm2_5', 'european_aqi_pm10',
    'european_aqi_nitrogen_dioxide', 'european_aqi_ozone', 'european_aqi_sulphur_dioxide',
    'uv_index', 'uv_index_clear_sky'
  ];
  const AQI_POLLUTANTS = [
    { key: 'pm2_5', label: 'PM₂.₅', sub: 'us_aqi_pm2_5', euSub: 'european_aqi_pm2_5' },
    { key: 'pm10', label: 'PM₁₀', sub: 'us_aqi_pm10', euSub: 'european_aqi_pm10' },
    { key: 'ozone', label: 'O₃', sub: 'us_aqi_ozone', euSub: 'european_aqi_ozone' },
    { key: 'nitrogen_dioxide', label: 'NO₂', sub: 'us_aqi_nitrogen_dioxide', euSub: 'european_aqi_nitrogen_dioxide' },
    { key: 'sulphur_dioxide', label: 'SO₂', sub: 'us_aqi_sulphur_dioxide', euSub: 'european_aqi_sulphur_dioxide' },
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
  function aqiExtendedHtml(air, scale) {
    scale = scale || aqiScale();
    const current = air && air.current || {};
    const units = air && air.current_units || {};
    const rows = AQI_POLLUTANTS.filter(function (p) {
      return current[p.key] != null && Number.isFinite(Number(current[p.key]));
    });
    const secondaryIndex = scale === 'eu'
      ? { key: 'us_aqi', label: aqiScaleLabel('us'), unitless: true }
      : { key: 'european_aqi', label: t('weather.aqiEuropeanAqi', 'European AQI'), unitless: true };
    const additional = [
      secondaryIndex,
      { key: 'uv_index', label: t('weather.uv', 'UV Index'), unitless: true },
      { key: 'uv_index_clear_sky', label: t('weather.aqiClearSkyUv', 'Clear-sky UV'), unitless: true }
    ].filter(function (item) { return current[item.key] != null && Number.isFinite(Number(current[item.key])); });
    if (!rows.length && !additional.length) return '';
    const contributors = AQI_POLLUTANTS.filter(function (p) {
      const sub = scale === 'eu' ? p.euSub : p.sub;
      return sub && current[sub] != null && Number.isFinite(Number(current[sub]));
    }).map(function (p) {
      const sub = scale === 'eu' ? p.euSub : p.sub;
      return { pollutant: p, value: Number(current[sub]) };
    });
    contributors.sort(function (a, b) { return b.value - a.value; });
    let html = '<div class="wx-air-detail">';
    if (rows.length && contributors.length) {
      const top = contributors[0];
      const mainLabel = top.pollutant.labelKey ? t(top.pollutant.labelKey, top.pollutant.label) : top.pollutant.label;
      html += `<div class="wx-air-main"><span class="wx-air-main-label">${escapeHtml(t('weather.aqiMainPollutant', 'Main pollutant'))}</span><strong>${escapeHtml(mainLabel)}</strong><span class="wx-air-main-score" style="--wx-aqi-color:${aqiColor(top.value, scale)};--wx-aqi-light:${aqiLightColor(top.value, scale)}">${Math.round(top.value)}</span></div>`;
    }
    if (rows.length) {
      html += `<div class="wx-air-list-title">${escapeHtml(t('weather.aqiPollutantLevels', 'Pollutant levels'))}</div><div class="wx-air-list">`;
      rows.forEach(function (p) {
        const sub = scale === 'eu' ? p.euSub : p.sub;
        const contribution = sub && current[sub] != null && Number.isFinite(Number(current[sub]))
          ? Number(current[sub]) : null;
        const unit = units[p.key] || (p.key.indexOf('_pollen') >= 0 ? 'grains/m³' : 'µg/m³');
        const amount = airValueText(current[p.key], p.key === 'aerosol_optical_depth' ? '' : unit);
        const label = p.labelKey ? t(p.labelKey, p.label) : p.label;
        const contributionHtml = contribution == null ? ''
          : `<span class="wx-air-contribution${contribution > (scale === 'eu' ? 60 : 100) ? ' is-elevated' : ''}" style="--wx-air-color:${aqiColor(contribution, scale)};--wx-aqi-light:${aqiLightColor(contribution, scale)}"><span>${escapeHtml(t('weather.aqiContribution', 'AQI contribution'))}</span><strong>${Math.round(contribution)}</strong></span>`;
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
    if (!pack || !pack.city || typeof deps.fetchJson !== 'function') return Promise.resolve(null);
    // Cache a successful detailed response even if a region omits optional fields.
    if (pack.air && Date.now() - (pack.air._detailFetchedAt || 0) < REFRESH_MS) return Promise.resolve(pack);
    const key = cityKey(pack.city);
    if (aqiDetailInflight.has(key)) return aqiDetailInflight.get(key);
    const requestedAt=Date.now();
    const fields = AQI_DETAIL_FIELDS.join(',');
    const url = AIR + '?latitude=' + encodeURIComponent(pack.city.lat)
      + '&longitude=' + encodeURIComponent(pack.city.lon)
      + '&current=' + encodeURIComponent(fields)
      + '&hourly=us_aqi,european_aqi&forecast_hours=24&timezone=auto';
    const request = deps.fetchJson(url).then(function (detail) {
      if (!detail || !detail.current) return null;
      const latest = cache.get(key) || pack;
      if(latest !== pack && latest.fetchedAt>requestedAt && latest.air) return latest;
      if (latest.air && latest.air._detailFetchedAt > (pack.air && pack.air._detailFetchedAt || 0)) return latest;
      const oldAir = latest.air || {};
      const current = Object.assign({}, oldAir.current || {}, detail.current);
      latest.air = Object.assign({}, oldAir, detail, { current: current, _detailFetchedAt: Date.now() });
      cache.set(key, latest);
      return latest;
    }).catch(function () {
      return null;
    }).finally(function () {
      aqiDetailInflight.delete(key);
    });
    aqiDetailInflight.set(key, request);
    return request;
  }
  function aqiOutlookHtml(air, scale, timeZone, loading) {
    scale = scale || aqiScale();
    const key = scale === 'eu' ? 'european_aqi' : 'us_aqi';
    const hourly = air && air.hourly || {};
    const times = hourly.time || [];
    const values = hourly[key] || [];
    const title = escapeHtml(t('weather.hourly', 'Hourly Forecast') + ' · ' + aqiScaleLabel(scale));
    if (loading) {
      return `<section id="wxAqiOutlook" class="wx-aqi-outlook" aria-busy="true" role="status"><div class="wx-air-list-title">${title}</div><p class="wx-aqi-outlook-status"><span class="loader" aria-hidden="true"></span>${escapeHtml(t('weather.loadingForecast', 'Loading forecast…'))}</p></section>`;
    }
    const now = Date.now();
    const candidates = [];
    for (let i = 0; i < times.length; i++) {
      const at = stampToMs(times[i], timeZone);
      if (values[i] == null || values[i] === '') continue;
      const value = Number(values[i]);
      if (!Number.isFinite(at) || !Number.isFinite(value) || at < now - 45 * 60 * 1000 || at > now + 24 * 60 * 60 * 1000) continue;
      candidates.push({ time: times[i], at: at, value: value });
    }
    if (!candidates.length) {
      return `<section id="wxAqiOutlook" class="wx-aqi-outlook"><div class="wx-air-list-title">${title}</div><p class="wx-aqi-outlook-status">${escapeHtml(t('weather.unavailable', 'Unavailable'))}</p></section>`;
    }
    const samples = candidates.length <= 8 ? candidates : Array.from({ length: 8 }, function (_, i) {
      return candidates[Math.round(i * (candidates.length - 1) / 7)];
    });
    const max = Math.max(1, ...samples.map(function (sample) { return sample.value; }));
    const upper = max * 1.15;
    const items = samples.map(function (sample) {
      const value = Math.round(sample.value);
      const band = aqiLabel(value, scale);
      let time = formatClock(sample.time, timeZone);
      if (!time) time = String(sample.time).slice(11, 16);
      const height = Math.max(8, Math.min(100, sample.value / upper * 100));
      const color = aqiColor(sample.value, scale);
      const aria = aqiScaleLabel(scale) + ', ' + time + ', ' + value + ', ' + band;
      return `<li class="wx-aqi-outlook-item" aria-label="${escapeHtml(aria)}"><span class="wx-aqi-outlook-time" aria-hidden="true">${escapeHtml(time)}</span><span class="wx-aqi-outlook-value" aria-hidden="true">${value}</span><span class="wx-aqi-outlook-track" aria-hidden="true"><span style="height:${height.toFixed(1)}%;background:${color}"></span></span></li>`;
    }).join('');
    return `<section id="wxAqiOutlook" class="wx-aqi-outlook"><div class="wx-air-list-title">${title}</div><div class="wx-aqi-outlook-scroll"><ol class="wx-aqi-outlook-grid" aria-label="${title}">${items}</ol></div></section>`;
  }
  function aqiColor(v, scale) {
    const band = aqiBandKey(v, scale);
    return ({
      Good: '#34c759', Fair: '#8bcf71', Moderate: '#ffd60a',
      UnhealthySG: '#ff9f0a', Poor: '#ff9f0a', Unhealthy: '#ff453a',
      VeryUnhealthy: '#bf5af2', VeryPoor: '#ff453a', Hazardous: '#9b2335',
      ExtremelyPoor: '#bf5af2'
    })[band] || '#8e8e93';
  }
  function aqiLightColor(v, scale) {
    const band = aqiBandKey(v, scale);
    return ({
      Good: '#176b32', Fair: '#3c6b31', Moderate: '#765300', UnhealthySG: '#934600',
      Poor: '#934600', Unhealthy: '#b3261e', VeryUnhealthy: '#7130a0',
      VeryPoor: '#b3261e', Hazardous: '#7b1832', ExtremelyPoor: '#7130a0'
    })[band] || '#40556a';
  }
  function aqiPct(v, scale) {
    const band = aqiBandKey(v, scale);
    if (!band) return 0;
    return window.DusklineAqiMath.percent(v, scale || aqiScale());
  }
  function aqiBarHtml(v, compact, scale) {
    if(v == null || v === '' || !Number.isFinite(Number(v)) || Number(v)<0) return '';
    scale = scale || aqiScale();
    const pct = aqiPct(v, scale);
    const col = aqiColor(v, scale);
    if (compact) {
      const gradient = scale === 'eu'
        ? 'linear-gradient(90deg,#34c759,#8bcf71 20%,#ffd60a 40%,#ff9f0a 60%,#ff453a 80%,#bf5af2)'
        : 'linear-gradient(90deg,#34c759,#ffd60a 10%,#ff9f0a 20%,#ff453a 30%,#bf5af2 40%,#9b2335 60%)';
      return `<div class="wx-aqi-bar wx-aqi-bar--compact" aria-hidden="true">
        <span class="wx-aqi-track" style="background:${gradient}"><span class="wx-aqi-fill" style="width:${pct.toFixed(1)}%;background:${col}"></span></span>
        <span class="wx-aqi-dot" style="left:${Math.max(1.5, Math.min(98.5, pct)).toFixed(1)}%;background:${col}"></span>
      </div>`;
    }
    const eu = scale === 'eu';
    const colors = eu
      ? ['#34c759', '#8bcf71', '#ffd60a', '#ff9f0a', '#ff453a', '#bf5af2']
      : ['#34c759', '#ffd60a', '#ff9f0a', '#ff453a', '#bf5af2', '#9b2335'];
    const weights = eu ? [1, 1, 1, 1, 1, 1] : [1, 1, 1, 1, 2, 4];
    const thresholds = eu
      ? [['0', 0], ['20', 20], ['40', 40], ['60', 60], ['80', 80], ['100+', 100]]
      : [['0', 0], ['50', 50], ['100', 100], ['150', 150], ['200', 200], ['300', 300], ['500+', 500]];
    const scaleMax = eu ? 100 : 500;
    const marker = Math.max(1.5, Math.min(98.5, pct));
    const tickHtml = thresholds.map(function (tick, index) {
      const position = Math.min(100, tick[1] / scaleMax * 100);
      const edgeClass = index === 0 ? ' is-start' : (index === thresholds.length - 1 ? ' is-end' : '');
      return `<span class="${edgeClass.trim()}" style="left:${position}%">${tick[0]}</span>`;
    }).join('');
    return `<div class="wx-aqi-scale" aria-hidden="true">
      <div class="wx-aqi-scale-track">
        ${colors.map(function (color, index) { return `<span class="wx-aqi-seg" style="flex:${weights[index]};background:${color}"></span>`; }).join('')}
      </div>
      <span class="wx-aqi-marker" style="left:${marker.toFixed(1)}%"></span>
    </div>
    <div class="wx-aqi-labels">${tickHtml}</div>`;
  }
    return {aqiCurrentValue,aqiScaleLabel,aqiLabel,aqiBandKey,aqiDescription,aqiGreetingDescription,aqiRange,airValueText,aqiExtendedHtml,loadAqiDetail,aqiOutlookHtml,aqiColor,aqiLightColor,aqiPct,aqiBarHtml};
  };
})(window);
