'use strict';
/* Modal owners retain their own history, scroll locks and return-focus targets. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W || !W.active) return;
  const stack = [];
  const saved = new Map();
  function containFocus() {
    const owner = stack[stack.length - 1];
    if (!owner) return;
    let frames=0;
    requestAnimationFrame(function settle() {
      if (stack[stack.length - 1] !== owner) return;
      if (!owner.element.contains(document.activeElement)) {
        const target = owner.element.querySelector('[role="dialog"][tabindex="-1"]') || Array.from(owner.element.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]'))
          .find(element=>element.getClientRects().length && !element.closest('[inert]') && getComputedStyle(element).visibility === 'visible');
        if (target) target.focus({preventScroll:true});
      }
      if (++frames<3) requestAnimationFrame(settle);
    });
  }
  document.addEventListener('focusin',containFocus);
  document.addEventListener('focusout',containFocus);
  document.addEventListener('click',containFocus);
  function sync() {
    saved.forEach((value, element) => {
      element.inert=value.inert;
      if(value.aria===null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden',value.aria);
    });
    saved.clear();
    const top = stack[stack.length - 1];
    const toast=document.getElementById('weatherToast');
    const toastParent=top?top.element:document.body;
    if(toast && toast.parentElement!==toastParent) toastParent.append(toast);
    if (!top) { delete document.documentElement.dataset.weatherModal; return; }
    document.documentElement.dataset.weatherModal = top.id;
    const background = ['navbar','main','dusklineFooter','weatherMobileNav','weatherToast','weatherUpdateToast']
      .map(id => document.getElementById(id)).concat(stack.slice(0,-1).map(item => item.element));
    background.forEach(element => {
      if (!element || element === top.element || element.contains(top.element) || top.element.contains(element) || saved.has(element)) return;
      saved.set(element,{inert:!!element.inert,aria:element.getAttribute('aria-hidden')});
      element.inert = true;
      element.setAttribute('aria-hidden','true');
    });
    containFocus();
  }
  W.modal = {
    open(id, element) {
      if (!element) return;
      element.inert=false;
      element.setAttribute('aria-hidden','false');
      const current = stack.find(item => item.id === id);
      if (current) current.element = element;
      else stack.push({id,element});
      sync();
    },
    close(id) {
      const index = stack.findIndex(item => item.id === id);
      if (index < 0) return;
      const [owner]=stack.splice(index,1);
      sync();
      owner.element.inert=true;
      owner.element.setAttribute('aria-hidden','true');
    },
    sync,containFocus
  };
})(window);
