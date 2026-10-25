'use strict';
/* Responsive chrome uses the same controls and handlers at every viewport. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W || !W.active) return;
  W.factories.shell = function (deps) {
    const {t} = deps;
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
    });
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
    }
    return {mountSettings};
  };
})(window);
