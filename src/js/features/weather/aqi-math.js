'use strict';
/* Pure index helpers shared by the weather UI and its contract tests. */
(function (global) {
  const BANDS = {
    us: [
      { key: 'Good', min: 0, max: 50 },
      { key: 'Moderate', min: 51, max: 100 },
      { key: 'UnhealthySG', min: 101, max: 150 },
      { key: 'Unhealthy', min: 151, max: 200 },
      { key: 'VeryUnhealthy', min: 201, max: 300 },
      { key: 'Hazardous', min: 301, max: 500 }
    ],
    eu: [
      { key: 'Good', min: 0, max: 20 },
      { key: 'Fair', min: 21, max: 40 },
      { key: 'Moderate', min: 41, max: 60 },
      { key: 'Poor', min: 61, max: 80 },
      { key: 'VeryPoor', min: 81, max: 100 },
      { key: 'ExtremelyPoor', min: 101, max: Infinity }
    ]
  };
  const EU_COUNTRY_CODES = new Set([
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'EL', 'HU',
    'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ]);
  const EU_COUNTRY_NAMES = new Set([
    'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czechia', 'czech republic',
    'denmark', 'estonia', 'finland', 'france', 'germany', 'greece', 'hungary', 'ireland',
    'italy', 'latvia', 'lithuania', 'luxembourg', 'malta', 'netherlands', 'the netherlands',
    'poland', 'portugal', 'romania', 'slovakia', 'slovenia', 'spain', 'sweden'
  ]);

  function scale(value) { return value === 'eu' ? 'eu' : 'us'; }

  function defaultScale(city) {
    if (!city) return 'us';
    const code = String(city.country_code || city.countryCode || '').trim().toUpperCase();
    // A recognized country code is authoritative. Unknown/non-EU codes use the
    // requested US fallback instead of trusting a potentially localized label.
    if (code) return EU_COUNTRY_CODES.has(code) ? 'eu' : 'us';
    const country = String(city.country || '').trim().toLowerCase();
    return EU_COUNTRY_NAMES.has(country) ? 'eu' : 'us';
  }

  function band(value, standard) {
    if (value == null || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0) return '';
    const n = Math.round(Number(value));
    const bands = BANDS[scale(standard)];
    for (let i = 0; i < bands.length; i++) {
      if (n <= bands[i].max) return bands[i].key;
    }
    return bands[bands.length - 1].key;
  }

  function maxValue(standard) { return scale(standard) === 'eu' ? 100 : 500; }

  function percent(value, standard) {
    if (value == null || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0) return 0;
    return Math.max(0, Math.min(100, (Number(value) / maxValue(standard)) * 100));
  }

  function bands(standard) {
    return BANDS[scale(standard)].map(function (item) { return Object.assign({}, item); });
  }

  global.DusklineAqiMath = Object.freeze({
    defaultScale: defaultScale, band: band, maxValue: maxValue, percent: percent, bands: bands
  });
})(window);
