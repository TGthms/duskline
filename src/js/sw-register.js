'use strict';
/* Duskline — src/js/sw-register.js
   Registers the offline shell. Extracted from an inline <script> so index.html carries no
   inline JavaScript and a strict Content-Security-Policy needs no hashes (see `_headers`).
   Registration is deliberately deferred to `load` so it does not compete with the
   first-paint resources (boot.js, the font CSS); the service worker is a progressive
   enhancement, so failing to register is not an error. */
(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('./sw.js').catch(function () {
      /* offline shell unavailable — the app is fully usable without it */
    });
  });
})();
