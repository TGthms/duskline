'use strict';
/* Pure geocoder identity policy, shared by UI and transition tests. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W) return;
  W.searchPlaces = {
    deduplicate: function (results) {
      const places = new Map();
      results.forEach(function (place) {
        if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return;
        const key = [String(place.name || '').normalize('NFKC').trim().toLowerCase(),
          String(place.country_code || place.country || '').toLowerCase(),
          place.latitude.toFixed(3), place.longitude.toFixed(3)].join(':');
        const previous = places.get(key);
        const detail = item => ['admin1', 'admin2', 'timezone'].filter(field => item[field]).length;
        if (!previous || detail(place) > detail(previous)) places.set(key, place);
      });
      return Array.from(places.values());
    },
    validForecast: function (pack) {
      return !!(pack && !pack.error && pack.weather && pack.weather.current &&
        Number.isFinite(pack.weather.current.temperature_2m));
    }
  };
})(window);
