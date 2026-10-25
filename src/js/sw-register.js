/* Version checks and explicit service-worker activation. */
'use strict';
(function (global) {
  const listeners = new Set();
  let registration, dismissedWorker, activationTimer, checkTask;
  let lastUpdateCheck=Date.now(), updateRequested=false, reloading=false;
  let deferred=false;
  try {deferred=sessionStorage.getItem('duskline-update-deferred')==='true';} catch(error) {}
  let state={status:'idle',available:false,busy:false};
  const text=(key,fallback)=>typeof tKey==='function'?tKey(key,fallback):fallback;
  function publish(status) {
    state={status,available:!!(registration && registration.waiting),busy:status==='checking'||status==='activating'};
    listeners.forEach(listener=>listener({...state}));
    renderNotice();
  }
  function renderNotice() {
    let notice=document.getElementById('weatherUpdateToast');
    if (!state.available || deferred || registration.waiting===dismissedWorker) {
      if(notice) {notice.hidden=true;notice.classList.remove('is-visible');}
      return;
    }
    if(!notice) {
      notice=document.createElement('div');notice.id='weatherUpdateToast';
      notice.className='weather-toast weather-update-toast';notice.setAttribute('role','status');document.body.append(notice);
    }
    notice.replaceChildren();notice.hidden=false;
    const label=document.createElement('span');
    label.textContent=state.status==='activationFailed'
      ? text('weather.updateFailed','The update did not finish. Try again.')
      : text('weather.updateReady','A duskline update is ready');
    const update=document.createElement('button');update.type='button';update.disabled=state.busy;
    update.textContent=text('weather.update','Update');update.addEventListener('click',activate);
    const later=document.createElement('button');later.type='button';later.disabled=state.busy;
    later.textContent=text('weather.later','Later');later.addEventListener('click',dismiss);
    notice.append(label,update,later);notice.classList.add('is-visible');
    if(global.DusklineWeather && global.DusklineWeather.modal) global.DusklineWeather.modal.sync();
  }
  function offerUpdate() { if(registration.waiting && state.status!=='activating') publish('ready'); }
  function dismiss() {
    dismissedWorker=registration && registration.waiting;deferred=true;
    try {sessionStorage.setItem('duskline-update-deferred','true');} catch(error) {}
    renderNotice();
  }
  function activate() {
    const worker=registration && registration.waiting;
    if(!worker || state.status==='activating') return;
    updateRequested=true;clearTimeout(activationTimer);publish('activating');
    const failed=()=>publish('activationFailed');
    activationTimer=setTimeout(failed,10000);
    try {worker.postMessage({type:'ACTIVATE_UPDATE'});} catch(error) {clearTimeout(activationTimer);failed();}
  }
  function bounded(promise) {
    let timer;
    return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),14000);})]).finally(()=>clearTimeout(timer));
  }
  function check() {
    if(checkTask) return checkTask;
    if(!registration) {publish('unavailable');return Promise.resolve();}
    if(state.status==='activating') return Promise.resolve();
    lastUpdateCheck=Date.now();publish('checking');
    checkTask=(async()=>{
      try {
        await bounded(Promise.resolve().then(()=>registration.update()));
        const worker=registration.installing;
        if(worker && worker.state==='redundant') throw Error('install');
        if(worker && !['installed','redundant'].includes(worker.state)) {
          let changed;
          try {
            await bounded(new Promise((resolve,reject)=>{
              changed=()=>{
                if(worker.state==='installed') resolve();
                else if(worker.state==='redundant') reject(Error('install'));
              };
              worker.addEventListener('statechange',changed);changed();
            }));
          } finally {worker.removeEventListener('statechange',changed);}
        }
        publish(registration.waiting?'ready':'current');
      } catch(error) {publish(registration.waiting?'ready':'error');}
      finally {checkTask=null;}
    })();
    return checkTask;
  }
  global.DusklineUpdates={
    getState:()=>({...state}),check,activate,dismiss,
    subscribe(listener) {listeners.add(listener);return ()=>listeners.delete(listener);}
  };
  if(!('serviceWorker' in navigator)) {publish('unavailable');return;}
  global.addEventListener('load',function () {
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(function (value) {
      registration=value;
      navigator.serviceWorker.addEventListener('controllerchange',function () {
        if(!updateRequested || reloading) return;
        reloading=true;clearTimeout(activationTimer);location.reload();
      });
      function checkOnResume() {
        if(document.visibilityState==='visible' && Date.now()-lastUpdateCheck>=30*60*1000) check();
      }
      document.addEventListener('visibilitychange',checkOnResume);global.addEventListener('pageshow',checkOnResume);
      function retainActiveLocale() {
        const worker=registration.active;
        if(worker) worker.postMessage({type:'CACHE_LOCALE',code:document.documentElement.dataset.lang || 'en',legal:!document.getElementById('weatherList')});
      }
      navigator.serviceWorker.ready.then(retainActiveLocale);
      document.addEventListener('duskline:prefs',function () {retainActiveLocale();renderNotice();});
      offerUpdate();
      registration.addEventListener('updatefound',function () {
        const worker=registration.installing;
        if(worker) worker.addEventListener('statechange',function () {
          if(worker.state==='installed' && navigator.serviceWorker.controller) offerUpdate();
        });
      });
    }).catch(()=>publish('unavailable'));
  });
})(window);
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
