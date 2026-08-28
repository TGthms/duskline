'use strict';
/* Duskline — weather/ns.js
   Page gate + factory registry.
   Load order: ns → sky → charts → alerts → data → app
*/
(function (global) {
  var page = document.getElementById('weatherList')
    || document.querySelector('[data-tool="weather"]');
  var W = global.DusklineWeather = global.DusklineWeather || {};
  W.active = !!page;
  W.version = 2;
  W.factories = W.factories || {};
})(window);
