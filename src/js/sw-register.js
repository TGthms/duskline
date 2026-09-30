 'use strict';
(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).then(function (registration) {
      function retainActiveLocale() {
        const code = document.documentElement.dataset.lang || 'en';
        const worker = registration.active;
        if (worker) worker.postMessage({type:'CACHE_LOCALE',code:code,legal:!document.getElementById('weatherList')});
      }
      navigator.serviceWorker.ready.then(retainActiveLocale);
      document.addEventListener('duskline:prefs', function () {
        retainActiveLocale();
        const notice = document.getElementById('weatherUpdateToast');
        if (notice && !notice.querySelector('button:disabled')) offerUpdate();
      });
      function offerUpdate() {
        if (!registration.waiting) return;
        let toast = document.getElementById('weatherUpdateToast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'weatherUpdateToast';
          toast.className = 'weather-toast weather-update-toast';
          toast.setAttribute('role','status');
          document.body.append(toast);
        }
        toast.replaceChildren();
        const label = document.createElement('span');
        label.textContent = typeof tKey === 'function' ? tKey('weather.updateReady', 'A duskline update is ready') : 'A duskline update is ready';
        const action = document.createElement('button');
        action.type = 'button';
        action.textContent = typeof tKey === 'function' ? tKey('weather.update', 'Update') : 'Update';
        action.addEventListener('click', function () {
          const waiting = registration.waiting;
          if (!waiting) return;
          action.disabled = true;
          navigator.serviceWorker.addEventListener('controllerchange', function () { location.reload(); }, {once: true});
          waiting.postMessage({type: 'ACTIVATE_UPDATE'});
        });
        toast.append(label, action);
        toast.classList.add('is-visible');
      }
      offerUpdate();
      registration.addEventListener('updatefound', function () {
        const worker = registration.installing;
        if (worker) worker.addEventListener('statechange', function () {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) offerUpdate();
        });
      });
    }).catch(function () {});
  });
})();
(function () {
  let installPrompt = null;
  const button = document.getElementById('weatherInstall');
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault(); installPrompt = event;
    if (button) button.hidden = false;
  });
  if (button) button.addEventListener('click', async function () {
    if (!installPrompt) return;
    await installPrompt.prompt(); installPrompt = null; button.hidden = true;
  });
  window.addEventListener('appinstalled', function () { if (button) button.hidden = true; });
  const connection = document.getElementById('weatherConnection');
  function updateConnection() {
    if (!connection) return;
    connection.hidden = navigator.onLine;
    connection.textContent = typeof tKey === 'function' ? tKey('weather.offline', 'Offline · Showing saved forecasts') : 'Offline · Showing saved forecasts';
  }
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);
  document.addEventListener('duskline:prefs', updateConnection);
  updateConnection();
})();
