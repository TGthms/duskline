'use strict';
/* Loads privacy/terms copy one locale at a time from src/js/data/legal/packs/*.json */
(function (global) {
  var cache = {};
  var inflight = {};

  function packUrl(code) {
    var scripts = document.getElementsByTagName('script');
    var src = '';
    var i;
    for (i = 0; i < scripts.length; i++) {
      if ((scripts[i].src || '').indexOf('legal-i18n.js') !== -1) {
        src = scripts[i].src;
        break;
      }
    }
    var base = src ? src.replace(/legal-i18n\.js(\?.*)?$/, 'legal/packs/') : 'src/js/data/legal/packs/';
    return base + encodeURIComponent(code) + '.json';
  }

  function install(code, row) {
    global.I18N = global.I18N || {};
    global.I18N[code] = Object.assign({}, global.I18N[code] || {}, row || {});
  }

  function loadLegalPack(code) {
    if (cache[code]) return Promise.resolve(cache[code]);
    if (inflight[code]) return inflight[code];
    inflight[code] = fetch(packUrl(code), { credentials: 'same-origin' }).then(function (res) {
      if (!res.ok) throw new Error('legal pack ' + code);
      return res.json();
    }).then(function (row) {
      install(code, row);
      cache[code] = row;
      delete inflight[code];
      return row;
    }).catch(function (err) {
      delete inflight[code];
      throw err;
    });
    return inflight[code];
  }

  global.dusklineLoadLegalPack = loadLegalPack;
})(window);
