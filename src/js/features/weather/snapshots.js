'use strict';
/* Small, bounded local forecast history. Alerts are deliberately never persisted. */
(function (global) {
  var W = global.DusklineWeather;
  if (!W || !W.active) return;

  W.factories.snapshots = function createSnapshotStore(deps) {
    const KEY = 'duskline-weather-snapshots-v1';
    const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
    const MAX_COUNT = 34;
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
    const signatures = new Map();
    let writePending=false,lastKey='';
    function flush() {
      if(!writePending) return;
      writePending=false;
      const next=all.filter(pack=>now()-pack.fetchedAt<MAX_AGE);
      while(next.length) {
        try {storage.setItem(KEY,JSON.stringify({version:1,packs:next}));all.splice(0,all.length,...next);return;}
        catch(error) {
          const drop=next.findIndex(pack=>cityKey(pack.city)!==lastKey);
          if(drop<0) return;
          signatures.delete(cityKey(next[drop].city));next.splice(drop,1);
        }
      }
      try {storage.setItem(KEY,JSON.stringify({version:1,packs:[]}));}catch(error){}
    }
    function requestWrite() {
      if(writePending) return;
      writePending=true;
      if(typeof deps.schedule === 'function') deps.schedule(flush);
      else flush();
    }
    function save(pack,opts) {
      if(!pack || !pack.city || !pack.weather || !pack.fetchedAt || pack.error) return;
      opts=opts || {};
      const key=cityKey(pack.city),index=all.findIndex(p=>cityKey(p.city)===key),previous=all[index];
      const snapshot={city:pack.city,weather:pack.weather,air:pack.air || null,fetchedAt:pack.fetchedAt,
        source:pack.source || 'open-meteo',needsEnrich:!!pack.needsEnrich,light:!!pack.light,
        visited:!!opts.visited || !!(previous && previous.visited)};
      const signature=JSON.stringify(snapshot);
      if(signatures.get(key)===signature) return;
      signatures.set(key,signature);lastKey=key;
      const next=all.filter(p=>cityKey(p.city)!==key);
      if(opts.visited) next.unshift(snapshot);
      else if(index>=0) next.splice(index,0,snapshot);
      else next.push(snapshot);
      next.length=Math.min(next.length,MAX_COUNT);all.splice(0,all.length,...next);
      requestWrite();
    }
    function find(city) {
      const hit = all.find(function (pack) { return sameCity(pack.city, city) && now() - pack.fetchedAt < MAX_AGE; });
      return hit ? Object.assign({}, hit, { stored: true }) : null;
    }
    function forget(city) {
      if (!city) return;
      signatures.delete(cityKey(city));
      const next = all.filter(function (pack) { return !sameCity(pack.city, city); });
      all.splice(0, all.length, ...next);
      requestWrite();
    }
    return { all: all, save: save, find: find, forget: forget, flush:flush };
  };
})(window);
