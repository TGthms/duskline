'use strict';
/* Vibration API feedback, plus native iOS switch ticks from trusted label taps.
   The real buttons remain keyboard/accessibility controls. Native switches are
   non-rendered inside a separate shadow tree and never receive touch gestures.
   Motion Off suppresses both paths. */
(function (global) {
  var W = global.DusklineWeather;
  if (!W) return;

  function allowed() {
    try {
      var motion = document.documentElement.getAttribute('data-motion-effective');
      if (motion) return motion !== 'off';
      return global.localStorage.getItem('duskline-motion') !== 'off';
    } catch (error) { return false; }
  }
  function vibrate(duration) {
    if (!allowed() || typeof global.navigator.vibrate !== 'function') return;
    try { global.navigator.vibrate(duration); } catch (error) { /* Optional feedback. */ }
  }
  function buzz() { vibrate(10); }
  var lastDetent = -Infinity;
  function detent() {
    if (!allowed()) return;
    var now = Date.now();
    if (now - lastDetent < 60) return;
    lastDetent = now;
    vibrate(8);
  }

  // Vibration API delegation covers new buttons and icon replacements without DOM mutation,
  // observers, or style/layout reads. Programmatic actions do not buzz.
  document.addEventListener('click', function (event) {
    if (!event.isTrusted) return;
    var button = event.target && event.target.closest && event.target.closest('button');
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true'
        || button.closest('[inert], [aria-hidden="true"]')) return;
    buzz();
  }, { capture: true, passive: true });

  function iosSwitchSupported() {
    var nav = global.navigator;
    var ios = /iP(hone|ad|od)/.test(nav.userAgent || '')
      || nav.platform === 'MacIntel' && nav.maxTouchPoints > 1;
    if (!ios || 'vibrate' in nav || !global.MutationObserver) return false;
    var probe = document.createElement('input');
    return 'switch' in probe && typeof probe.attachShadow === 'function';
  }

  function usable(button) {
    return button.isConnected && !button.disabled
      && button.getAttribute('aria-disabled') !== 'true'
      && !button.closest('[inert], [aria-hidden="true"]');
  }

  function installIosTaps() {
    var hosts = new WeakMap();
    function mount(button, surface) {
      var previous = hosts.get(surface);
      if (previous && previous.parentElement === surface) return;
      if (global.getComputedStyle(surface).position === 'static') surface.classList.add('wx-ios-haptic-relative');
      var host = document.createElement('span');
      host.className = 'wx-ios-haptic-hit';
      host.setAttribute('aria-hidden', 'true');
      var root = host.attachShadow({mode:'open'});
      var style = document.createElement('style');
      // The switch is hidden, not transparent: it cannot be hit or focused.
      style.textContent = 'label{position:absolute;inset:0;display:block;cursor:inherit}input{display:none!important}';
      var label = document.createElement('label');
      label.htmlFor = 'tick';
      label.setAttribute('aria-hidden', 'true');
      var tick = document.createElement('input');
      tick.id = 'tick';tick.type = 'checkbox';tick.setAttribute('switch','');
      tick.hidden = true;tick.tabIndex = -1;tick.setAttribute('aria-hidden','true');
      var pending = false;
      var gesture = null;
      label.addEventListener('pointerdown', function (event) {
        gesture = {id:event.pointerId,x:event.clientX,y:event.clientY,cancelled:event.isPrimary === false};
      },{passive:true});
      label.addEventListener('pointermove', function (event) {
        if (gesture && gesture.id === event.pointerId && Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y) > 12) gesture.cancelled = true;
      },{passive:true});
      label.addEventListener('pointercancel', function () { if (gesture) gesture.cancelled = true; },{passive:true});
      label.addEventListener('click', function (event) {
        var cancelled = gesture && gesture.cancelled;
        gesture = null;
        if (event.defaultPrevented || cancelled || !event.isTrusted || !usable(button)) {
          pending = false;event.preventDefault();event.stopPropagation();return;
        }
        if (!allowed()) {
          pending = false;event.preventDefault();
          button.focus({preventScroll:true});
          // The original trusted click can still reach the button, but its
          // label default must not activate the native switch when feedback is off.
          return;
        }
        event.stopPropagation();
        pending = true;
        // Default label activation supplies a trusted native switch click. Stop
        // the first click so the button receives only that second, native event.
      });
      tick.addEventListener('click', function (event) {
        var accepted = pending && event.isTrusted && usable(button);
        pending = false;
        if (!accepted) { event.stopPropagation();return; }
        button.focus({preventScroll:true});
        // Bubble the native click through the shadow host to the real button.
        // The tick happens first; trust, coordinates and user activation survive
        // icon replacement or dialog dismissal, with no scripted button clicks.
      });
      root.append(style,label,tick);
      surface.appendChild(host);
      hosts.set(surface,host);
    }
    function arm(button) {
      if (!button.isConnected) return;
      // A single full-card label would cover the hourly scroller's hit target.
      // Put tap surfaces inside each item instead, retaining its scroll ancestry.
      if (button.querySelector('.weather-hourly')) {
        var title = button.querySelector('.weather-mod-label');
        if (title) mount(button,title);
        button.querySelectorAll('.weather-hourly-item').forEach(function (item) { mount(button,item); });
      } else if (!button.querySelector('input,select,textarea,[contenteditable="true"],[role="slider"]')) {
        mount(button,button);
      }
    }
    function scan(scope, owners) {
      if (scope.nodeType !== 1 || scope.classList.contains('wx-ios-haptic-hit')) return;
      var owner = scope.closest('button');
      if (owner) owners.add(owner);
      scope.querySelectorAll('button').forEach(function (button) { owners.add(button); });
    }
    document.querySelectorAll('button').forEach(arm);
    new global.MutationObserver(function (records) {
      var owners = new Set();
      records.forEach(function (record) {
        scan(record.target,owners);
        record.addedNodes.forEach(function (node) { scan(node,owners); });
      });
      owners.forEach(arm);
    }).observe(document.documentElement,{childList:true,subtree:true});
  }
  if (iosSwitchSupported()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',installIosTaps,{once:true});
    else installIosTaps();
  }

  W.haptics = { buzz: buzz, detent: detent, allowed: allowed };
})(window);
