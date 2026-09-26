'use strict';
/* Small, bounded local forecast history. Alerts are deliberately never persisted. */
(function (global) {
  var W = global.DusklineWeather;
  if (!W || !W.active) return;

  W.factories.snapshots = function createSnapshotStore(deps) {
    const KEY = 'duskline-weather-snapshots-v1';
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
    const MAX_COUNT = 10;
    const cityKey = deps.cityKey;
    const sameCity = deps.sameCity;
    const storage = deps.storage;
    const now = deps.now || Date.now;

    function read() {
      try {
        const parsed = JSON.parse(storage.getItem(KEY) || '{}');
        if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.packs)) return [];
        return parsed.packs.filter(function (pack) {
          return pack && pack.city && pack.weather && Number.isFinite(pack.fetchedAt)
            && now() - pack.fetchedAt < MAX_AGE;
        }).slice(0, MAX_COUNT);
      } catch (e) { return []; }
    }

    const all = read();
    function save(pack, opts) {
      if (!pack || !pack.city || !pack.weather || !pack.fetchedAt || pack.error) return;
      opts = opts || {};
      const key = cityKey(pack.city);
      const previousIndex = all.findIndex(function (p) { return cityKey(p.city) === key; });
      const previous = previousIndex >= 0 ? all[previousIndex] : null;
      const snapshot = {
        city: pack.city, weather: pack.weather, air: pack.air || null,
        fetchedAt: pack.fetchedAt, source: pack.source || 'open-meteo',
        needsEnrich: !!pack.needsEnrich, light: !!pack.light,
        visited: !!opts.visited || !!(previous && previous.visited)
      };
      const next = all.filter(function (p) { return cityKey(p.city) !== key; });
      if (opts.visited) next.unshift(snapshot);
      else if (previousIndex >= 0) next.splice(previousIndex, 0, snapshot);
      else next.push(snapshot);
      next.length = Math.min(next.length, MAX_COUNT);
      // A full storage bucket should still retain the newest useful forecast.
      while (next.length) {
        try {
          storage.setItem(KEY, JSON.stringify({ version: 1, packs: next }));
          all.splice(0, all.length, ...next);
          return;
        } catch (e) { next.pop(); }
      }
    }
    function find(city) {
      const hit = all.find(function (pack) { return sameCity(pack.city, city); });
      return hit ? Object.assign({}, hit, { stored: true }) : null;
    }
    function forget(city) {
      if (!city) return;
      const next = all.filter(function (pack) { return !sameCity(pack.city, city); });
      all.splice(0, all.length, ...next);
      try { storage.setItem(KEY, JSON.stringify({ version: 1, packs: next })); } catch (e) {}
    }
    return { all: all, save: save, find: find, forget: forget };
  };
})(window);
