'use strict';
/* Optional vibration feedback on real controls. Browsers without the Vibration
   API (including iOS Safari) keep normal button and scrolling semantics.
   Motion Off disables feedback immediately. No synthetic interactive overlays. */
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

  // Delegation covers new buttons and icon replacements without DOM mutation,
  // observers, or style/layout reads. Programmatic proxy clicks do not buzz twice.
  document.addEventListener('click', function (event) {
    if (!event.isTrusted) return;
    var button = event.target && event.target.closest && event.target.closest('button');
    if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true'
        || button.closest('[inert], [aria-hidden="true"]')) return;
    buzz();
  }, { capture: true, passive: true });

  W.haptics = { buzz: buzz, detent: detent, allowed: allowed };
})(window);
