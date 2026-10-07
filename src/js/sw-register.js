 'use strict';
(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'}).then(function (registration) {
      let lastUpdateCheck=Date.now(),updateRequested=false,reloading=false,activationTimer;
      navigator.serviceWorker.addEventListener('controllerchange',function () {
        if(!updateRequested || reloading) return;
        reloading=true;clearTimeout(activationTimer);location.reload();
      });
      function checkOnResume() {
        if(document.visibilityState !== 'visible' || Date.now()-lastUpdateCheck<30*60*1000) return;
        lastUpdateCheck=Date.now();registration.update().catch(function () { /* Offline sessions retain the installed version. */ });
      }
      document.addEventListener('visibilitychange',checkOnResume);
      window.addEventListener('pageshow',checkOnResume);
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
          updateRequested=true;clearTimeout(activationTimer);
          const failed=function () {
            action.disabled=false;
            label.textContent=typeof tKey === 'function' ? tKey('weather.updateFailed','The update did not finish. Try again.') : 'The update did not finish. Try again.';
          };
          activationTimer=setTimeout(failed,10000);
          try {waiting.postMessage({type: 'ACTIVATE_UPDATE'});} catch(error) {clearTimeout(activationTimer);failed();}
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
  const standalone=()=>!!navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
  const mobile=/iP(hone|ad|od)|Android/.test(navigator.userAgent) || navigator.platform==='MacIntel' && navigator.maxTouchPoints>1;
  if(button) button.hidden=standalone() || !mobile;
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault(); installPrompt = event;
    if (button) button.hidden = standalone();
  });
  if (button) button.addEventListener('click', async function () {
    if (!installPrompt) {window.dispatchEvent(new Event('duskline:installhelp'));return;}
    try {
      await installPrompt.prompt();
      const choice=await installPrompt.userChoice;
      if(choice.outcome === 'accepted') button.hidden=true;
    } catch(error) {window.dispatchEvent(new Event('duskline:installhelp'));}
    finally {installPrompt=null;}
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
