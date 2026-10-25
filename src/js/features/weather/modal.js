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
    requestAnimationFrame(function () {
      if (stack[stack.length - 1] !== owner || owner.element.contains(document.activeElement)) return;
      const target = owner.element.querySelector('[role="dialog"][tabindex="-1"]') || Array.from(owner.element.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]'))
        .find(element=>element.getClientRects().length && !element.closest('[inert]') && getComputedStyle(element).visibility === 'visible');
      if (target) target.focus({preventScroll:true});
    });
  }
  document.addEventListener('focusin',containFocus);
  document.addEventListener('focusout',containFocus);
  function sync() {
    saved.forEach((value, element) => { element.inert = value; });
    saved.clear();
    const top = stack[stack.length - 1];
    if (!top) { delete document.documentElement.dataset.weatherModal; return; }
    document.documentElement.dataset.weatherModal = top.id;
    const background = ['navbar','main','dusklineFooter','weatherMobileNav','weatherToast','weatherUpdateToast']
      .map(id => document.getElementById(id)).concat(stack.slice(0,-1).map(item => item.element));
    background.forEach(element => {
      if (!element || element === top.element || element.contains(top.element) || saved.has(element)) return;
      saved.set(element, !!element.inert);
      element.inert = true;
    });
    containFocus();
  }
  W.modal = {
    open(id, element) {
      if (!element) return;
      const current = stack.find(item => item.id === id);
      if (current) current.element = element;
      else stack.push({id,element});
      sync();
    },
    close(id) {
      const index = stack.findIndex(item => item.id === id);
      if (index < 0) return;
      stack.splice(index,1);
      sync();
    },
    sync,containFocus
  };
})(window);
