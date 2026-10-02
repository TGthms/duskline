'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function fixture(supported=true) {
  let motion='full', now=1000, listener;
  const calls=[];
  const window={DusklineWeather:{},navigator:supported?{vibrate:n=>calls.push(n)}:{},localStorage:{getItem:()=>motion}};
  const document={documentElement:{getAttribute:()=>motion},addEventListener:(name,fn)=>{assert.equal(name,'click');listener=fn;}};
  vm.runInNewContext(fs.readFileSync('src/js/features/weather/haptics.js','utf8'),{window,document,Date:{now:()=>now}});
  const button={disabled:false,getAttribute:()=>null,closest:()=>null};
  const click=(trusted=true)=>listener({isTrusted:trusted,target:{closest:()=>button}});
  return {api:window.DusklineWeather.haptics,calls,button,click,setMotion:value=>{motion=value;},advance:ms=>{now+=ms;}};
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
