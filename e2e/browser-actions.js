'use strict';
async function attemptUserScroll(page, delta) {
  try { await page.mouse.wheel(0,delta); }
  catch (error) {
    if (!/Mouse wheel.*not supported/.test(error.message)) throw error;
    await page.keyboard.press(delta > 0 ? 'PageDown' : 'PageUp');
  }
}
async function prepareAppearance(page,scheme,browserName) {
  await page.emulateMedia({colorScheme:scheme});
  if(browserName !== 'firefox') return;
  // Exercise the preference API contract deterministically. Linux Firefox's
  // emulation may still report the GTK light preference for a requested dark one.
  await page.addInitScript(initial=>{
    let dark=initial==='dark';
    const native=window.matchMedia.bind(window);
    const queries=new Map();
    window.matchMedia=function(query){
      if(!/^\(prefers-color-scheme: (light|dark)\)$/.test(query)) return native(query);
      if(!queries.has(query)) {
        const listeners=new Set();
        queries.set(query,{media:query,get matches(){return query.includes('dark')?dark:!dark;},
          addEventListener(type,fn){if(type==='change')listeners.add(fn);},removeEventListener(type,fn){listeners.delete(fn);},
          addListener(fn){listeners.add(fn);},removeListener(fn){listeners.delete(fn);},
          notify(){listeners.forEach(fn=>fn({matches:this.matches,media:query}));}});
      }
      return queries.get(query);
    };
    window.__setPreferredSchemeForTest=function(next){dark=next==='dark';queries.forEach(query=>query.notify());};
  },scheme);
}
async function changeAppearance(page,scheme,browserName) {
  await page.emulateMedia({colorScheme:scheme});
  if(browserName==='firefox') await page.evaluate(next=>window.__setPreferredSchemeForTest(next),scheme);
}
module.exports={attemptUserScroll,prepareAppearance,changeAppearance};
