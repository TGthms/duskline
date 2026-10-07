'use strict';
/* Vibration API feedback, plus native iOS switch ticks from trusted label taps.
   The real buttons remain keyboard/accessibility controls. Native switches are
   non-rendered inside a separate shadow tree and never receive touch gestures.
   Motion Off suppresses both paths. */
(function (global) {
  var W = global.DusklineWeather;
  if (!W) return;

  function hapticMode() {
    try {
      var mode = global.localStorage.getItem('duskline-haptic');
      return mode === 'reduced' || mode === 'off' ? mode : 'full';
    } catch (error) { return 'full'; }
  }
  function allowed() {
    if (hapticMode() === 'off') return false;
    try {
      var motion = document.documentElement.getAttribute('data-motion-effective');
      if (motion) return motion !== 'off';
      return global.localStorage.getItem('duskline-motion') !== 'off';
    } catch (error) { return false; }
  }
  // Reduced mode only fires for important actions. Buttons opt in with
  // data-haptic-important; unit selects are important by virtue of
  // changing the app's measurement system.
  function isImportantAction(element) {
    if (!element) return false;
    if (element.hasAttribute && element.hasAttribute('data-haptic-important')) return true;
    var tag = element.tagName;
    if (tag === 'SELECT' && element.classList.contains('weather-unit-select')) return true;
    var button = element.closest ? element.closest('[data-haptic-important]') : null;
    return !!button;
  }
  function shouldBuzz(element) {
    if (!allowed()) return false;
    if (hapticMode() === 'reduced' && !isImportantAction(element)) return false;
    return true;
  }
  function vibrate(duration) {
    if (!allowed() || typeof global.navigator.vibrate !== 'function') return;
    try { global.navigator.vibrate(duration); } catch (error) { /* Optional feedback. */ }
  }
  // Optional element: when provided, reduced mode filters through shouldBuzz().
  // Callers triggering haptics for a specific UI action should pass the element.
  function buzz(element) {
    if (element && !shouldBuzz(element)) return;
    vibrate(10);
  }
  var lastDetent = -Infinity;
  function detent() {
    if (!allowed() || hapticMode() === 'reduced') return;
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
    if (shouldBuzz(button)) buzz();
  }, { capture: true, passive: true });

  // Unit changes are important actions in reduced mode. They use select
  // elements rather than buttons, so they need their own listener.
  document.addEventListener('change', function (event) {
    if (!event.isTrusted) return;
    var select = event.target;
    if (!select || select.tagName !== 'SELECT') return;
    if (shouldBuzz(select)) buzz();
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
          event.preventDefault();event.stopPropagation();return;
        }
        if (!shouldBuzz(button)) {
          event.preventDefault();
          button.focus({preventScroll:true});
          // The original trusted click can still reach the button, but its
          // label default must not activate the native switch when feedback is off.
          return;
        }
        button.focus({preventScroll:true});

        // The original trusted click owns the action. Native feedback is optional.
      });
      tick.addEventListener('click', function (event) {

        event.stopPropagation();
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
    // Unmounted controls receive the original tap without optional native feedback.

  }
  if (iosSwitchSupported()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',installIosTaps,{once:true});
    else installIosTaps();
  }

  W.haptics = { buzz: buzz, detent: detent, allowed: allowed, hapticMode: hapticMode, shouldBuzz: shouldBuzz };
})(window);
