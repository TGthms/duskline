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
    const headerActions = document.querySelector('#navbar .nav-actions');
    const nav = document.createElement('nav');
    nav.id='weatherMobileNav';nav.className='weather-mobile-nav';
    nav.setAttribute('aria-label',t('weather.weatherView','Weather view'));
    document.body.append(nav);
    const controls = ['weatherModeSwitch','weatherMapOpen','weatherLocate','weatherRefresh','weatherUnitsBtn'].map(id=>{
      const element=document.getElementById(id),anchor=document.createComment('');
      element.before(anchor);return {element,anchor};
    });
    function layout() {
      const focused=document.activeElement;
      if (media.matches) document.body.dataset.mobileShell='true';
      else delete document.body.dataset.mobileShell;
      controls.forEach(({element,anchor},index)=>{
        if (media.matches) (index<2?nav:headerActions).append(element);
        else anchor.after(element);
      });
      nav.hidden=!media.matches;
      if (W.modal) W.modal.sync();
      if (focused && focused.isConnected && !focused.closest('[inert]') && controls.some(row=>row.element.contains(focused))) focused.focus({preventScroll:true});
    }
    media.addEventListener('change',layout);layout();
    nav.addEventListener('keydown',function (event) {
      const buttons=Array.from(nav.querySelectorAll('button'));
      const index=buttons.indexOf(document.activeElement),direction=document.documentElement.dir==='rtl'?-1:1;
      const step=event.key==='ArrowRight'?direction:event.key==='ArrowLeft'?-direction:0;
      if(index>=0 && step) {event.preventDefault();buttons[(index+step+buttons.length)%buttons.length].focus();}
    });
    document.addEventListener('duskline:prefs',function () {
      nav.setAttribute('aria-label',t('weather.weatherView','Weather view'));
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
      const label=document.createElement('label');label.className='weather-settings-language';
      const text=document.createElement('span');text.textContent=t('settings.languageLabel','Language');
      const select=document.createElement('select');select.dataset.shellLanguage='';
      for (const [code,name] of global.DUSKLINE_LOCALES) {
        const option=document.createElement('option');option.value=code;option.textContent=name;select.append(option);
      }
      select.value=document.documentElement.dataset.lang || 'en';
      select.addEventListener('change',()=>global.setDusklineLanguage(select.value));
      label.append(text,select);host.append(label);
      updateHost=document.createElement('section');updateHost.className='weather-settings-updates';host.append(updateHost);renderUpdates();
    }
    return {mountSettings};
  };
})(window);
