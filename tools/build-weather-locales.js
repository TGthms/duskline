'use strict';
/* Keep editorial catalogs readable; ship only the active locale to the weather page. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = {window: {}};
vm.createContext(context);
const sources = ['i18n', 'duskline-locales', 'weather-about-i18n', 'weather-aqi-i18n', 'weather-copy-i18n', 'weather-greeting-pools-i18n', 'weather-greeting-settings-i18n', 'weather-stability-i18n'];
for (const name of sources) vm.runInContext(fs.readFileSync(path.join(root,'src/js/data/'+name+'.js'),'utf8'),context);
const target = path.join(root,'src/js/data/weather-packs');
fs.mkdirSync(target,{recursive:true});
for (const [code] of context.window.DUSKLINE_LOCALES) fs.writeFileSync(path.join(target,code+'.json'), JSON.stringify({...context.window.I18N.en,...context.window.I18N[code]})+'\n');
fs.writeFileSync(path.join(root,'src/js/data/weather-locale-registry.js'), "'use strict';\nwindow.DUSKLINE_LOCALES = " + JSON.stringify(context.window.DUSKLINE_LOCALES) + ';\nwindow.DUSKLINE_LANG_CODES = window.DUSKLINE_LOCALES.map(function (item) { return item[0]; });\nwindow.I18N = {en: '+JSON.stringify(context.window.I18N.en)+'};\n');
