const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm');
test('notification strings exist explicitly in all supported locales and generated packs', () => {
  const context = { window: { I18N: {} } };
  vm.runInNewContext(fs.readFileSync('src/js/data/weather-push-i18n.js', 'utf8'), context);
  assert.equal(Object.keys(context.window.I18N).length, 30);
  const keys = Object.keys(context.window.I18N.en);
  assert.equal(keys.length, 52);
  const source = fs.readFileSync('src/js/features/weather/push-notifications.js', 'utf8');
  for (const match of source.matchAll(/(?<![.\w])t\('([^']+)'/g))
    assert.ok(context.window.I18N.en['weather.push.' + match[1]], match[1]);
  for (const [code, dict] of Object.entries(context.window.I18N)) {
    assert.deepEqual(Object.keys(dict).sort(), keys.slice().sort());
    const pack = JSON.parse(fs.readFileSync('src/js/data/weather-packs/' + code + '.json', 'utf8'));
    for (const key of keys) {
      assert.ok(dict[key].trim(), code + ':' + key);
      assert.equal(pack[key], dict[key]);
    }
  }
});
