'use strict';
/* Pure geocoder identity policy, shared by UI and transition tests. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W) return;
  const detailScore = item => ['admin1', 'admin2', 'timezone'].filter(field => item[field]).length;
  const placeName = place => String(place.name || '').normalize('NFKC').trim().toLowerCase();
  const normalize = value => String(value || '').normalize('NFKC').trim().toLowerCase();
  const placeCountry = place => normalize(place.country_code || place.country);
  function sameIdentity(a, b) {
    if (placeName(a) !== placeName(b) || placeCountry(a) !== placeCountry(b)) return false;
    if (a.id != null && b.id != null && String(a.id) !== String(b.id)) return false;
    for (const field of ['admin1', 'admin2', 'admin3', 'admin4']) {
      if (a[field] && b[field] && normalize(a[field]) !== normalize(b[field])) return false;
    }
    // Coalesce coordinate jitter, not neighboring settlements. Provider IDs
    // and administrative conflicts always take precedence over proximity.
    return distanceKm(a, b) < 0.5;
  }
  function distanceKm(a, b) {
    const rad = Math.PI / 180;
    const dLat = (b.latitude - a.latitude) * rad;
    const dLon = (b.longitude - a.longitude) * rad;
    const sLat = Math.sin(dLat / 2);
    const sLon = Math.sin(dLon / 2);
    const h = sLat * sLat + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * sLon * sLon;
    return 2 * 6371 * Math.asin(Math.sqrt(Math.min(1, h)));
  }
  W.searchPlaces = {
    deduplicate: function (results) {
      // True distance catches rounding-boundary duplicates while preserving
      // distinct provider identities and administrative regions.
      const kept = [];
      results.forEach(function (place) {
        if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return;
        const twin = kept.find(function (seen) {
          return sameIdentity(seen, place);
        });
        if (!twin) { kept.push(place); return; }
        if (detailScore(place) > detailScore(twin)) kept[kept.indexOf(twin)] = place;
      });
      return kept;
    },
    validForecast: function (pack) {
      return !!(pack && !pack.error && pack.weather && pack.weather.current &&
        Number.isFinite(pack.weather.current.temperature_2m));
    }
  };
})(window);
