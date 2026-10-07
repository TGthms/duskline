'use strict';
/* One cancellable owner for full city forecasts. Lists remain independent. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W || !W.active) return;
  W.factories.cityRefresh = function (deps) {
    const pending = new Map();
    function cancel(city) {
      const key = deps.cityKey(city), work = pending.get(key);
      if (work) { work.controller.abort(); pending.delete(key); }
    }
    async function refresh(city, options) {
      options = options || {};
      cancel(city);
      const key = deps.cityKey(city), controller = new AbortController();
      const work = {controller};
      pending.set(key, work);
      const current = () => pending.get(key) === work && !controller.signal.aborted;
      try {
        const pack = await deps.load(city, controller.signal, {forceFetch: options.force !== false, enrich: true});
        if (!current()) return null;
        if (!pack || !pack.weather) throw new Error('Forecast unavailable');
        const alerts = deps.alerts(pack, {force: options.force !== false});
        deps.paint(pack);
        await Promise.allSettled([alerts, pack._airReady]);
        if (!current()) return null;
        deps.paint(pack);
        return pack;
      } catch (error) {
        if (!current() || error.name === 'AbortError') return null;
        deps.failed(city, error);
        return null;
      } finally {
        if (pending.get(key) === work) pending.delete(key);
      }
    }
    return {refresh, cancel};
  };
})(window);
