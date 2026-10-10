const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  vm = require('node:vm');
function worker() {
  const events = {},
    notifications = [],
    calls = [];
  const client = {
    url: 'https://app.test/privacy.html',
    visibilityState: 'visible',
    navigate: async (url) => {
      calls.push(['navigate', url]);
      return client;
    },
    focus: async () => calls.push(['focus']),
  };
  const self = {
    registration: {
      scope: 'https://app.test/',
      showNotification: async (title, options) => notifications.push({ title, ...options }),
    },
    addEventListener: (name, fn) => (events[name] = fn),
  };
  vm.runInNewContext(fs.readFileSync('sw.js', 'utf8'), {
    self,
    URL,
    clients: {
      matchAll: async () => [client],
      openWindow: async (url) => calls.push(['open', url]),
    },
    console,
  });
  return { events, notifications, calls };
}
test('notification click navigates an existing unrelated page to the warning city', async () => {
  const w = worker();
  let pending;
  w.events.notificationclick({
    notification: { close() {}, data: { url: './?lat=42&lon=-71&alert=warning' } },
    waitUntil: (p) => (pending = p),
  });
  await pending;
  assert.equal(w.calls[0][0], 'navigate');
  assert.match(w.calls[0][1], /lat=42/);
  assert.equal(w.calls[1][0], 'focus');
});
test('notification URLs cannot navigate users off origin or into arbitrary same-origin paths', async () => {
  for (const url of ['https://evil.example/', '/api/push/subscribe', 'javascript:alert(1)']) {
    const w = worker();
    let p;
    w.events.notificationclick({
      notification: { close() {}, data: { url } },
      waitUntil: (v) => (p = v),
    });
    await p;
    assert.equal(w.calls[0][1], 'https://app.test/');
  }
});
test('expired pushes disclose expiry and stable tags do not renotify on duplicate delivery', async () => {
  const w = worker();
  let p;
  w.events.push({
    data: {
      json: () => ({
        title: 'Boston warning',
        body: 'Old warning',
        tag: 'same',
        data: { url: './?lat=42', expiresAt: 1 },
      }),
    },
    waitUntil: (v) => (p = v),
  });
  await p;
  assert.match(w.notifications[0].body, /expired/);
  assert.equal(w.notifications[0].renotify, false);
  assert.equal(w.notifications[0].data.expired, true);
});
test('malformed push JSON still produces a visible notification', async () => {
  const w = worker();
  let p;
  w.events.push({
    data: {
      json() {
        throw Error('malformed');
      },
    },
    waitUntil: (v) => (p = v),
  });
  await p;
  assert.equal(w.notifications.length, 1);
  assert.equal(w.notifications[0].title, 'duskline');
});
