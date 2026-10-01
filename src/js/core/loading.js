'use strict';
/* Shared, reference-counted feedback for overlapping foreground async work. */
(function (global) {
  const indicator = document.getElementById('weatherModeLoading');
  if (!indicator) return;
  const operations = new Map();
  let visibleUntil = 0;
  let hideTimer = 0;
  function defaultLabel() {
    return typeof global.tKey === 'function' ? global.tKey('weather.loadingForecast','Loading forecast…') : 'Loading forecast…';
  }
  function begin(label) {
    global.clearTimeout(hideTimer);
    hideTimer = 0;
    visibleUntil = Date.now()+450;
    const token = {};
    operations.set(token,label || defaultLabel());
    indicator.hidden = false;
    indicator.dataset.active = 'true';
    indicator.setAttribute('aria-label',label || defaultLabel());
    return function finish() {
      if (!operations.delete(token)) return;
      if (operations.size) {
        const labels = Array.from(operations.values());
        indicator.setAttribute('aria-label',labels[labels.length-1]);
        return;
      }
      hideTimer = global.setTimeout(function () {
        if (operations.size) return;
        indicator.hidden = true;
        indicator.dataset.active = 'false';
        hideTimer = 0;
      },Math.max(0,visibleUntil-Date.now()));
    };
  }
  global.DusklineLoading = {
    begin:begin,
    run:function (work,label) {
      const finish = begin(label);
      return Promise.resolve().then(work).finally(finish);
    }
  };
  const header = document.getElementById('navbar');
  function position() {
    if (header) {
      const bottom = header.getBoundingClientRect().bottom+'px';
      indicator.style.setProperty('--weather-header-bottom',bottom);
      document.documentElement.style.setProperty('--weather-header-bottom',bottom);
    }
  }
  position();
  if (typeof ResizeObserver === 'function' && header) new ResizeObserver(position).observe(header);
  global.addEventListener('resize',position);
})(window);
