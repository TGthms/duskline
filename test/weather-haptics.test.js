'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function fixture(supported=true) {
  let motion='full', haptic='full', now=1000, clickListener, changeListener;
  const calls=[];
  const store={getItem:key=>key==='duskline-haptic'?haptic:key==='duskline-motion'?motion:null};
  const window={DusklineWeather:{},navigator:supported?{vibrate:n=>calls.push(n)}:{},localStorage:store};
  const document={documentElement:{getAttribute:()=>motion},addEventListener:(name,fn)=>{assert.ok(name==='click'||name==='change');if(name==='click')clickListener=fn;else changeListener=fn;}};
  vm.runInNewContext(fs.readFileSync('src/js/features/weather/haptics.js','utf8'),{window,document,Date:{now:()=>now}});
  const button={disabled:false,getAttribute:()=>null,closest:()=>null,hasAttribute:()=>false,tagName:'BUTTON',classList:{contains:()=>false}};
  const click=(trusted=true)=>clickListener({isTrusted:trusted,target:{closest:()=>button}});
  const change=(trusted=true)=>changeListener({isTrusted:trusted,target:{tagName:'SELECT',classList:{contains:c=>c==='weather-unit-select'}}});
  return {api:window.DusklineWeather.haptics,calls,button,click,change,setMotion:value=>{motion=value;},setHaptic:value=>{haptic=value;},advance:ms=>{now+=ms;}};
}
test('haptics follow live Motion Off and ignore disabled or programmatic actions',()=>{
  const f=fixture();f.click();assert.deepEqual(f.calls,[10]);
  f.setMotion('off');f.click();f.api.detent();assert.deepEqual(f.calls,[10]);
  f.setMotion('full');f.click(false);f.button.disabled=true;f.click();assert.deepEqual(f.calls,[10]);
  f.button.disabled=false;f.click();assert.deepEqual(f.calls,[10,10]);
});
test('haptic slider feedback is throttled and safely unavailable without the API',()=>{
  const f=fixture();f.api.detent();f.api.detent();f.advance(60);f.api.detent();assert.deepEqual(f.calls,[8,8]);
  const unsupported=fixture(false);unsupported.click();unsupported.api.detent();assert.deepEqual(unsupported.calls,[]);
});
test('haptic off silences all feedback including important actions',()=>{
  const f=fixture();f.setHaptic('off');f.click();f.change();f.api.detent();assert.deepEqual(f.calls,[]);
});
test('reduced haptic mode only fires for important actions',()=>{
  const f=fixture();f.setHaptic('reduced');
  f.click();assert.deepEqual(f.calls,[]); // plain button is not important
  f.change();assert.deepEqual(f.calls,[10]); // unit select change is important
});
