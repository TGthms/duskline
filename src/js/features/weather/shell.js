'use strict';
/* Responsive chrome uses the same controls and handlers at every viewport. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W || !W.active) return;
  W.factories.shell = function (deps) {
    const {t} = deps;
    let updateHost;
    const updates=global.DusklineUpdates;
    const media = matchMedia('(max-width:640px) and (min-height:500px)');
    function syncView() {
      document.querySelectorAll('[data-weather-mode]').forEach(button=>{
        button.setAttribute('aria-pressed',String(button.dataset.weatherMode===document.body.dataset.weatherView));
      });
    }
    function placeLabel() {
      const button=document.getElementById('weatherManagePlaces');
      if(button) button.textContent=media.matches?t('weather.savedPlaces','Saved places'):t('weather.rearrange','Rearrange saved places');
    }
    function layout() {
      if (media.matches) document.body.dataset.mobileShell='true';
      else delete document.body.dataset.mobileShell;
      placeLabel();
      if (deps.layoutChanged) deps.layoutChanged();
      syncView();
      if (W.modal) W.modal.sync();
    }
    media.addEventListener('change',layout);layout();
    document.addEventListener('duskline:prefs',function () {
      placeLabel();
      document.querySelectorAll('[data-shell-language]').forEach(select=>{select.value=document.documentElement.dataset.lang || 'en';});
      renderUpdates();
    });
    function renderUpdates() {
      if(!updateHost || !updateHost.isConnected || !updates) return;
      const state=updates.getState();
      const heading=document.createElement('h4');heading.textContent=t('weather.appUpdates','App updates');
      const status=document.createElement('p');status.setAttribute('role','status');
      const messages={ready:['weather.updateReady','A duskline update is ready'],current:['weather.upToDate','duskline is up to date'],checking:['weather.checkingUpdates','Checking for updates…'],error:['weather.checkUpdateFailed','Could not check for updates. Try again.'],activationFailed:['weather.updateFailed','The update did not finish. Try again.'],unavailable:['weather.unavailable','Unavailable']};
      const message=state.status==='activating'?messages.ready:messages[state.status];
      status.textContent=message?t(message[0],message[1]):'';
      const action=document.createElement('button');action.type='button';action.dataset.appUpdate='';
      action.disabled=state.busy || state.status==='unavailable';
      action.textContent=state.available?t('weather.update','Update'):t('weather.checkUpdates','Check for updates');
      action.addEventListener('click',()=>state.available?updates.activate():updates.check());
      const focused=updateHost.contains(document.activeElement);
      updateHost.replaceChildren(heading,status,action);
      if(focused && !action.disabled) action.focus({preventScroll:true});
    }
    if(updates) updates.subscribe(renderUpdates);
    function mountSettings(host) {
      const label=document.createElement('label');label.className='weather-settings-language weather-settings-row';
      const text=document.createElement('span');text.textContent=t('settings.languageLabel','Language');
      const select=document.createElement('select');select.dataset.shellLanguage='';
      for (const [code,name] of global.DUSKLINE_LOCALES) {
        const option=document.createElement('option');option.value=code;option.textContent=name;select.append(option);
      }
      select.value=document.documentElement.dataset.lang || 'en';
      select.addEventListener('change',()=>global.setDusklineLanguage(select.value));
      label.append(text,select);host.append(label);
      updateHost=document.createElement('section');updateHost.className='weather-settings-updates';host.append(updateHost);renderUpdates();
      return {language:label,updates:updateHost};
    }
    return {mountSettings,syncView};
  };
})(window);
