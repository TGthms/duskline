'use strict';
(function (global) {
  const W = global.DusklineWeather;
  if (!W) return;
  W.networkPolicy = {
    retryDelay: function (header, attempt, now, random) {
      if (header) {
        const seconds = Number(header);
        const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - (now || Date.now());
        if (Number.isFinite(delay)) return Math.max(0, delay);
      }
      return Math.min(8000, 650 * Math.pow(2, attempt || 0)) * (0.75 + (random == null ? Math.random() : random) * 0.5);
    },
    wait: function (delay, signal) {
      return new Promise(function (resolve, reject) {
        let timer;
        function abort() { clearTimeout(timer); signal.removeEventListener('abort', abort); reject(new DOMException('Cancelled', 'AbortError')); }
        if (signal && signal.aborted) return abort();
        if (signal) signal.addEventListener('abort', abort, {once:true});
        timer = setTimeout(function () { if (signal) signal.removeEventListener('abort', abort); resolve(); }, delay);
      });
    }
  };
})(window);
