'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {classify}=require('../tools/test-scope');

test('CI keeps release and shared-runtime coverage broad while targeting routine changes',()=>{
  assert.equal(classify(['docs/testing.md']).browser,false);
  const provider=classify(['src/js/features/weather/data.js']);
  assert.equal(provider.full,false);assert.equal(provider.browser,true);assert.equal(provider.visual,false);
  assert.match(provider.grep,/forecast/);
  const style=classify(['src/css/weather-product.css']);
  assert.equal(style.visual,true);assert.equal(style.grep,'.');
  const map=classify(['src/js/features/weather/map.js']);
  assert.equal(map.visual,true);assert.match(map.grep,/geograph/);
  const navigation=classify(['src/js/features/weather/navigation.js']);
  assert.equal(navigation.full,true);assert.equal(navigation.visual,true);
  const release=classify(['src/js/features/weather/data.js'],{event:'push'});
  assert.equal(release.full,true);assert.equal(release.grep,'.');
  assert.equal(classify(['workers/alert-poller/src/poll.js']).runtime,true);
  assert.equal(classify(['src/js/features/weather/push-notifications.js']).runtime,true);
  assert.equal(classify(['_routes.json']).runtime,true);
  assert.equal(classify(['README.md'],{forceFull:true}).browser,true);
  assert.equal(classify(['README.md'],{forceFull:true}).runtime,true);
});
