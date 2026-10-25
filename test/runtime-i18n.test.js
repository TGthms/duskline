'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function element(attributes, textContent='') {
  const attrs = new Map(Object.entries(attributes));
  return {textContent,innerHTML:textContent,
    hasAttribute:key=>attrs.has(key),getAttribute:key=>attrs.get(key) ?? null,
    setAttribute:(key,value)=>attrs.set(key,value)};
}

test('language changes translate each declared label, tooltip and content independently and restore English', () => {
  const button=element({'data-i18n':'text','data-i18n-aria':'label','data-i18n-title':'tip',
    'aria-label':'English label',title:'English tooltip'},'English text');
  const titleOnly=element({'data-i18n-title':'tip',title:'Original tooltip'});
  const input=element({'data-i18n-aria':'label','data-i18n-placeholder':'hint',
    'aria-label':'Search label',placeholder:'Search placeholder'});
  const context={window:{I18N:{fr:{text:'Texte',label:'Libellé',tip:'Conseil',hint:'Rechercher'}}},
    document:{querySelectorAll:()=>[button,titleOnly,input],documentElement:{setAttribute:()=>{}},dispatchEvent:()=>{}},
    paintUnitSpans:()=>{},CustomEvent:function(){}};
  const source=fs.readFileSync('src/js/core/runtime.js','utf8').split('/* ── UNIT CONVERSION ENGINE')[0];
  vm.createContext(context);vm.runInContext(source,context);
  context.applyLanguage('fr');
  assert.equal(button.getAttribute('aria-label'),'Libellé');
  assert.equal(button.getAttribute('title'),'Conseil');
  assert.equal(button.textContent,'Texte');
  assert.equal(input.getAttribute('placeholder'),'Rechercher');
  assert.equal(titleOnly.getAttribute('title'),'Conseil');
  context.applyLanguage('en');
  assert.equal(button.getAttribute('aria-label'),'English label');
  assert.equal(button.getAttribute('title'),'English tooltip');
  assert.equal(button.textContent,'English text');
  assert.equal(input.getAttribute('placeholder'),'Search placeholder');
  assert.equal(titleOnly.getAttribute('title'),'Original tooltip');
});
