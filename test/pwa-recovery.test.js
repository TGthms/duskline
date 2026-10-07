'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
test('a stalled activation offers retry and a late controller change reloads exactly once',async()=>{
 const elements=new Map(),windowEvents=new Map(),workerEvents=new Map(),timers=new Map();let next=0,reloads=0;
 function element(){return {children:[],events:new Map(),classList:{add(){}},setAttribute(){},replaceChildren(){this.children=[];},append(...nodes){this.children.push(...nodes);},addEventListener(type,fn){this.events.set(type,fn);}};}
 const document={documentElement:{dataset:{lang:'en'}},visibilityState:'visible',addEventListener(){},getElementById:id=>elements.get(id)||null,createElement:element,body:{append(node){elements.set(node.id,node);}}};
 const registration={active:{postMessage(){}},waiting:{postMessage(){}},addEventListener(){},update:async()=>{}};
 const serviceWorker={controller:{},register:async()=>registration,ready:Promise.resolve(),addEventListener:(type,fn)=>workerEvents.set(type,fn)};
 const window={addEventListener:(type,fn)=>windowEvents.set(type,fn),matchMedia:()=>({matches:false})};
 const context={window,document,navigator:{serviceWorker,userAgent:'desktop',platform:'MacIntel',maxTouchPoints:0,onLine:true},location:{reload(){reloads++;}},setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(fs.readFileSync('src/js/sw-register.js','utf8'),context);
 windowEvents.get('load')();await new Promise(r=>setImmediate(r));
 const toast=elements.get('weatherUpdateToast'),action=toast.children[1],label=toast.children[0];
 action.events.get('click')();assert.equal(action.disabled,true);
 Array.from(timers.values())[0]();assert.equal(action.disabled,false);assert.match(label.textContent,/did not finish/);
 workerEvents.get('controllerchange')();workerEvents.get('controllerchange')();assert.equal(reloads,1);
});
