const { test, expect } = require('@playwright/test');
const primary = {
  name: 'Boston',
  lat: 42.36,
  lon: -71.06,
  country_code: 'US',
  tz: 'America/New_York',
};
const favorite = {
  name: 'New York',
  lat: 40.71,
  lon: -74.01,
  country_code: 'US',
  tz: 'America/New_York',
};
const publicKey =
  'BP3dIi3qXzMN8PueacJpT5wJH7Vje5o7SV8U4kqGZJcyM2yy9JWUd-OeHl7m50bXEPdWxI4JxN60qPCTBzNNbbk';
async function fixtures(
  page,
  { permission = 'granted', onlyLocation = false, city = primary } = {},
) {
  const calls = [],
    records = new Map();
  let failSubscribe = false,
    failDelete = false,
    failTest = false,
    failStatus = false;
  await page.addInitScript(
    ({ permission, primary, favorite, onlyLocation }) => {
      localStorage.setItem('duskline-motion', 'off');
      localStorage.setItem(
        onlyLocation ? 'duskline-weather-myloc' : 'duskline-weather-greeting-city',
        JSON.stringify(primary),
      );
      localStorage.setItem(
        'duskline-weather-favorites',
        JSON.stringify(onlyLocation ? [] : [favorite]),
      );
      localStorage.setItem(
        'duskline-weather-greeting-source',
        onlyLocation ? 'my-location' : 'city:42.360,-71.060',
      );
      window.__push = { sub: null, permissionCalls: 0, unsubscribes: 0 };
      window.Notification = {
        permission,
        requestPermission() {
          window.__push.permissionCalls++;
          return Promise.resolve(permission);
        },
      };
      window.PushManager = function () {};
      const manager = {
        getSubscription: async () => window.__push.sub,
        subscribe: async () => {
          const sub = {
            endpoint: 'https://web.push.apple.com/Q/test',
            toJSON: () => ({
              endpoint: 'https://web.push.apple.com/Q/test',
              keys: { p256dh: 'test', auth: 'test' },
            }),
            unsubscribe: async () => {
              window.__push.unsubscribes++;
              window.__push.sub = null;
              return true;
            },
          };
          window.__push.sub = sub;
          return sub;
        },
      };
      Object.defineProperty(navigator.serviceWorker, 'ready', {
        configurable: true,
        get: () => Promise.resolve({ pushManager: manager }),
      });
    },
    { permission, primary: city, favorite, onlyLocation },
  );
  await page.route('**/api/push/**', async (route) => {
    const path = new URL(route.request().url()).pathname.split('/').pop(),
      body = route.request().postDataJSON();
    calls.push({ path, body });
    if (path === 'config') return route.fulfill({ json: { available: true, publicKey } });
    if (path === 'subscribe') {
      if (failSubscribe) return route.fulfill({ status: 503, json: { error: 'unavailable' } });
      records.set(body.endpoint, {
        registered: true,
        ...body,
        renewedAt: Date.now(),
        lastCheckedAt: Date.now(),
        activity: [],
      });
      return route.fulfill({ json: { ok: true } });
    }
    if (path === 'unsubscribe') {
      if (failDelete) return route.fulfill({ status: 503, json: { error: 'unavailable' } });
      records.delete(body.endpoint);
      return route.fulfill({ json: { ok: true } });
    }
    if (path === 'status') {
      if (failStatus) return route.fulfill({ status: 503, json: { error: 'unavailable' } });
      const row = records.get(body.endpoint);
      return route.fulfill({ status: row ? 200 : 404, json: row || { error: 'not_registered' } });
    }
    if (path === 'test' && failTest)
      return route.fulfill({ status: 502, json: { error: 'delivery_failed' } });
    return route.fulfill({ json: { accepted: true } });
  });
  await page.route(
    /api\.weather\.gov|api\.open-meteo\.com|air-quality-api\.open-meteo\.com|geocoding-api\.open-meteo\.com/,
    async (route) => {
      const url = route.request().url();
      if (url.includes('weather.gov')) return route.fulfill({ status: 503, json: {} });
      if (url.includes('geocoding')) return route.fulfill({ json: { results: [] } });
      if (url.includes('air-quality')) return route.fulfill({ json: { current: { us_aqi: 30 } } });
      const times = Array.from({ length: 240 }, (_, i) =>
          new Date(Date.now() + i * 3600000).toISOString(),
        ),
        days = Array.from({ length: 10 }, (_, i) => times[i * 24].slice(0, 10));
      const doc = {
        timezone: 'America/New_York',
        current: { temperature_2m: 20, apparent_temperature: 19, weather_code: 0, is_day: 1 },
        hourly: {
          time: times,
          temperature_2m: times.map(() => 20),
          weather_code: times.map(() => 0),
          precipitation_probability: times.map(() => 0),
        },
        daily: {
          time: days,
          temperature_2m_max: days.map(() => 22),
          temperature_2m_min: days.map(() => 12),
          weather_code: days.map(() => 0),
        },
      };
      const count = new URL(url).searchParams.get('latitude')?.split(',').length || 1;
      return route.fulfill({ json: count > 1 ? Array.from({ length: count }, () => doc) : doc });
    },
  );
  return {
    calls,
    records,
    failSubscribe: (v) => (failSubscribe = v),
    failDelete: (v) => (failDelete = v),
    failTest: (v) => (failTest = v),
    failStatus: (v) => (failStatus = v),
  };
}
async function settings(page) {
  await page.locator('#weatherUnitsBtn').click();
  await page.locator('.weather-push-summary').click();
  await expect(page.locator('.weather-push-toggle')).toBeEnabled();
}
for (const width of [320, 430, 844, 1440])
  test('notification settings remain usable and labelled at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await fixtures(page);
    await page.goto('/');
    await settings(page);
    await expect(page.getByLabel('Weather notifications', { exact: true })).toBeVisible();
    expect(
      await page.locator('.weather-push-switch').evaluate((e) => e.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.locator('.weather-sheet-back').click();
    await expect(page.locator('.weather-push-summary')).toBeVisible();
    await page.locator('.weather-push-summary').click();
    await expect(page.locator('.weather-push-toggle')).toBeVisible();
  });
test('notification Back restores Settings focus and scroll; Close dismisses both levels', async ({
  page,
}) => {
  await fixtures(page);
  await page.goto('/');
  await page.locator('#weatherUnitsBtn').click();
  await page.locator('.weather-push-summary').scrollIntoViewIfNeeded();
  const scroll = await page.locator('#weatherSheetBody').evaluate((el) => el.scrollTop);
  await page.locator('.weather-push-summary').click();
  await expect(page.locator('.weather-sheet-back')).toBeFocused();
  await page.getByLabel('Minimum severity').selectOption('extreme');
  await page.locator('.weather-sheet-back').click();
  await expect(page.locator('.weather-push-summary')).toBeFocused();
  await expect
    .poll(() => page.locator('#weatherSheetBody').evaluate((el) => el.scrollTop))
    .toBe(scroll);
  await page.locator('.weather-push-summary').click();
  await expect(page.getByLabel('Minimum severity')).toHaveValue('extreme');
  await page.locator('#weatherSheetClose').click();
  await expect(page.locator('#weatherSheet')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#weatherUnitsBtn')).toBeFocused();
  await page.locator('#weatherUnitsBtn').click();
  await expect(page.locator('.weather-push-summary')).toBeVisible();
});
test('notifications follow chosen My Sky primary rather than first favorite and save custom rules', async ({
  page,
}) => {
  const fixture = await fixtures(page);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  expect(fixture.calls.find((c) => c.path === 'subscribe').body.locations[0].name).toBe('Boston');
  await page.getByLabel('Minimum severity').selectOption('extreme');
  await page.getByLabel('Alert type', { exact: true }).selectOption('flood');
  await page.getByLabel('Include significant updates').uncheck();
  await page.getByRole('button', { name: 'Save preferences', exact: true }).click();
  await expect.poll(() => fixture.calls.filter((c) => c.path === 'subscribe').length).toBe(2);
  const prefs = fixture.calls.filter((c) => c.path === 'subscribe').at(-1).body.preferences;
  expect(prefs).toMatchObject({ severity: 'extreme', categories: ['flood'], updates: false });
  await page.getByRole('button', { name: 'Send test notification', exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('Test accepted');
  expect(fixture.calls.some((c) => c.path === 'test')).toBe(true);
});
test('My Location alone supports notification enrollment', async ({ page }) => {
  const f = await fixtures(page, { onlyLocation: true });
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect.poll(() => f.calls.filter((c) => c.path === 'subscribe').length).toBe(1);
  expect(f.calls.find((c) => c.path === 'subscribe').body.locations[0].name).toBe('Boston');
});
test('a failed test remains explicit after reconciliation and can be retried', async ({ page }) => {
  const f = await fixtures(page);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  f.failTest(true);
  await page.getByRole('button', { name: 'Send test notification', exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('The test could not be sent');
  const before = f.calls.filter((c) => c.path === 'status').length;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect
    .poll(() => f.calls.filter((c) => c.path === 'status').length)
    .toBeGreaterThan(before);
  await expect(page.locator('.weather-push-toggle')).toBeEnabled();
  await expect(page.locator('.weather-push-status')).toContainText('The test could not be sent');
  f.failTest(false);
  await page.getByRole('button', { name: 'Send test notification', exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('Test accepted');
});
test('an activity refresh failure cannot turn an accepted test into a delivery failure', async ({
  page,
}) => {
  const f = await fixtures(page);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  f.failStatus(true);
  await page.getByRole('button', { name: 'Send test notification', exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('Test accepted');
  await expect(
    page.getByRole('button', { name: 'Send test notification', exact: true }),
  ).toBeEnabled();
});
test('a saved lowercase US device location can enable notifications', async ({ page }) => {
  const f = await fixtures(page, {
    onlyLocation: true,
    city: {
      name: 'Fremont',
      lat: 37.55,
      lon: -121.99,
      country_code: 'us',
      tz: 'America/Los_Angeles',
    },
  });
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  expect(f.calls.find((c) => c.path === 'subscribe').body.locations[0]).toMatchObject({
    name: 'Fremont',
    country_code: 'US',
  });
});
test('a fresh Nominatim device location is normalized before notification enrollment', async ({
  page,
}) => {
  const f = await fixtures(page);
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = (done) =>
      done({ coords: { latitude: 37.55, longitude: -121.99 } });
  });
  await page.route(/api\.bigdatacloud\.net/, (route) => route.fulfill({ status: 503, json: {} }));
  await page.route(/nominatim\.openstreetmap\.org/, (route) =>
    route.fulfill({
      json: {
        address: {
          city: 'Fremont',
          state: 'California',
          country: 'United States',
          country_code: 'us',
        },
      },
    }),
  );
  await page.goto('/');
  await page.locator('#weatherLocate').click();
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem('duskline-weather-myloc') || 'null')?.country_code,
      ),
    )
    .toBe('US');
  await expect(page.locator('#weatherLocate')).toBeEnabled();
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  expect(f.calls.find((c) => c.path === 'subscribe').body.locations[0]).toMatchObject({
    name: 'Fremont',
    country_code: 'US',
  });
});
test('permission denial remains visible and does not register a subscription', async ({ page }) => {
  const f = await fixtures(page, { permission: 'denied' });
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('blocked');
  await page.waitForTimeout(100);
  await expect(page.locator('.weather-push-status')).toContainText('blocked');
  expect(f.calls.some((c) => c.path === 'subscribe')).toBe(false);
});
test('failed server enrollment retains durable repair intent and reconnect synchronizes it', async ({
  page,
}) => {
  const f = await fixtures(page);
  f.failSubscribe(true);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('Could not connect');
  expect(await page.evaluate(() => !!window.__push.sub)).toBe(true);
  f.failSubscribe(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
});
test('disable retries failed server deletion without resubscribing', async ({ page }) => {
  const f = await fixtures(page);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  f.failDelete(true);
  await page.getByLabel('Weather notifications', { exact: true }).uncheck();
  await expect(page.locator('.weather-push-status')).toContainText('Could not connect');
  expect(await page.evaluate(() => window.__push.sub)).toBe(null);
  f.failDelete(false);
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(page.locator('.weather-push-status')).toHaveText('Off');
  expect(f.records.size).toBe(0);
  expect(f.calls.filter((c) => c.path === 'subscribe')).toHaveLength(1);
});
test('unsupported primary is explained before asking for notification permission', async ({
  page,
}) => {
  const f = await fixtures(page, { permission: 'default' });
  await page.addInitScript(() =>
    localStorage.setItem(
      'duskline-weather-greeting-city',
      JSON.stringify({
        name: 'Paris',
        lat: 48.85,
        lon: 2.35,
        country_code: 'FR',
        tz: 'Europe/Paris',
      }),
    ),
  );
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('US places only');
  expect(await page.evaluate(() => window.__push.permissionCalls)).toBe(0);
  expect(f.calls.some((c) => c.path === 'subscribe')).toBe(false);
});
test('manual city selection and quiet hours persist across settings rebuilds', async ({ page }) => {
  const f = await fixtures(page);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Follow My Sky primary city', { exact: true }).uncheck();
  await page.getByLabel('New York', { exact: true }).check();
  await page.getByLabel('Pause notifications during quiet hours').check();
  await page.getByLabel('Time zone', { exact: true }).fill('Europe/Paris');
  await page.getByLabel('Time zone', { exact: true }).press('Tab');
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  const body = f.calls.find((c) => c.path === 'subscribe').body;
  expect(body.locations.map((p) => p.name)).toEqual(['New York']);
  expect(body.preferences.quiet).toMatchObject({ enabled: true, timeZone: 'Europe/Paris' });
  await page.locator('.weather-sheet-back').click();
  await page.locator('.weather-push-summary').click();
  await expect(page.getByLabel('Follow My Sky primary city', { exact: true })).not.toBeChecked();
  await expect(page.getByLabel('Time zone', { exact: true })).toHaveValue('Europe/Paris');
});
test('changing the primary or removing a favorite updates server monitoring', async ({ page }) => {
  const f = await fixtures(page);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  await page.evaluate(() => {
    localStorage.setItem('duskline-weather-greeting-source', 'city:40.710,-74.010');
    window.DusklineWeather.pushNotifications.placesChanged();
  });
  await expect
    .poll(() => f.calls.filter((c) => c.path === 'subscribe').at(-1)?.body.locations[0].name)
    .toBe('New York');
  await page.evaluate(() => {
    localStorage.setItem('duskline-weather-favorites', '[]');
    localStorage.setItem('duskline-weather-greeting-source', '');
    window.DusklineWeather.pushNotifications.placesChanged();
  });
  await expect
    .poll(() => f.calls.filter((c) => c.path === 'subscribe').at(-1)?.body.locations[0].name)
    .toBe('Boston');
});

test('rotated application keys request repair and reconnect without leaving an orphan', async ({
  page,
}) => {
  const f = await fixtures(page);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  await page.evaluate(async () => {
    window.__push.sub.options = { applicationServerKey: new Uint8Array(65).buffer };
    await window.DusklineWeather.pushNotifications.reconcile();
  });
  await expect(page.locator('.weather-push-status')).toContainText('Reconnect');
  expect(f.records.size).toBe(0);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  expect(await page.evaluate(() => window.__push.unsubscribes)).toBe(1);
});
test('notification links open current warning details and Back clears notification routing', async ({
  page,
}) => {
  await fixtures(page);
  await page.route('https://api.weather.gov/alerts/**', (route) =>
    route.fulfill({
      json: {
        features: [
          {
            id: 'warning-1',
            properties: {
              id: 'warning-1',
              event: 'Tornado Warning',
              severity: 'Severe',
              status: 'Actual',
              messageType: 'Alert',
              headline: 'Take shelter',
              description: 'Test warning',
              expires: new Date(Date.now() + 3600000).toISOString(),
            },
          },
        ],
      },
    }),
  );
  await page.goto(
    '/?lat=42.36&lon=-71.06&name=Boston&country_code=US&tz=America%2FNew_York&alert=warning-1&alert_event=Tornado%20Warning',
  );
  await expect(page.locator('.weather-alert.is-open .weather-alert-title')).toHaveText(
    'Tornado Warning',
  );
  await page.locator('#weatherDetailBack').click();
  await expect(page.locator('#weatherDetail')).toBeHidden();
  expect(new URL(page.url()).searchParams.has('alert')).toBe(false);
});
test('expired notification links explain expiry rather than showing old warning content', async ({
  page,
}) => {
  await fixtures(page);
  await page.route('https://api.weather.gov/alerts/**', (route) =>
    route.fulfill({ json: { features: [] } }),
  );
  await page.goto('/?lat=42.36&lon=-71.06&name=Boston&country_code=US&alert=expired');
  await expect(
    page.locator('.weather-toast').filter({ hasText: 'This warning is no longer active.' }),
  ).toBeVisible();
  await expect(page.locator('.weather-alert')).toHaveCount(0);
});
test('unsaved preferences do not leak into reconnect synchronization', async ({ page }) => {
  const f = await fixtures(page);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  await page.getByRole('button', { name: 'Save preferences', exact: true }).click();
  await expect(page.locator('.weather-push-status')).toContainText('Preferences saved');
  await page.getByLabel('Minimum severity').selectOption('extreme');
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  expect(f.calls.filter((c) => c.path === 'subscribe').at(-1).body.preferences.severity).toBe(
    'severe',
  );
});
test('notification Retry is hidden while off and recent activity keeps its heading', async ({
  page,
}) => {
  await fixtures(page);
  await page.goto('/');
  await settings(page);
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeHidden();
  await expect(page.getByRole('group', { name: 'Recent activity' })).toBeVisible();
});
test('storage failure cannot prevent disabling delivery', async ({ page }) => {
  const f = await fixtures(page);
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).check();
  await expect(page.locator('.weather-push-status')).toContainText('On ·');
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'duskline-push-settings-v2') throw new DOMException('full', 'QuotaExceededError');
      return original.call(this, k, v);
    };
  });
  await page.getByLabel('Weather notifications', { exact: true }).uncheck();
  await expect.poll(() => f.records.size).toBe(0);
  await expect(page.locator('.weather-push-status')).toContainText('local storage');
  expect(await page.evaluate(() => window.__push.sub)).toBe(null);
});
test('returning from a notification does not wait for a slow alert check', async ({ page }) => {
  await fixtures(page);
  let release;
  const held = new Promise((r) => (release = r)),
    batches = [];
  page.on('request', (request) => {
    if (request.url().includes('api.open-meteo.com')) {
      const coordinates = new URL(request.url()).searchParams.get('latitude') || '';
      if (coordinates && coordinates !== '42.36') batches.push(coordinates);
    }
  });
  await page.route('https://api.weather.gov/alerts/**', async (route) => {
    await held;
    await route.fulfill({ json: { features: [] } }).catch(() => {});
  });
  try {
    await page.goto('/?lat=42.36&lon=-71.06&name=Boston&country_code=US&alert=slow');
    await expect(page.locator('#weatherDetail')).toBeVisible();
    await page.locator('#weatherDetailBack').click();
    await expect(page.locator('#weatherDetail')).toBeHidden();
    await expect.poll(() => batches.length).toBeGreaterThan(0);
  } finally {
    release();
  }
});

test('a primary change during registration is reconciled after the in-flight operation', async ({
  page,
}) => {
  const f = await fixtures(page);
  let release, started;
  const held = new Promise((r) => (release = r)),
    requestStarted = new Promise((r) => (started = r));
  let requests = 0;
  await page.route('**/api/push/subscribe', async (route) => {
    if (++requests === 1) {
      started();
      await held;
    }
    await route.fallback();
  });
  try {
    await page.goto('/');
    await settings(page);
    await page.getByLabel('Weather notifications', { exact: true }).check();
    await requestStarted;
    await page.evaluate(() => {
      localStorage.setItem('duskline-weather-greeting-source', 'city:40.710,-74.010');
      window.DusklineWeather.pushNotifications.placesChanged();
    });
    await page.waitForTimeout(900);
    release();
    await expect
      .poll(() => f.calls.filter((c) => c.path === 'subscribe').at(-1)?.body.locations[0].name)
      .toBe('New York');
  } finally {
    release();
  }
});

test('foreground events from a denied native prompt preserve the recovery message', async ({
  page,
}) => {
  await fixtures(page, { permission: 'default' });
  await page.addInitScript(() => {
    window.Notification.requestPermission = () => {
      window.Notification.permission = 'denied';
      queueMicrotask(() => window.dispatchEvent(new Event('pageshow')));
      return Promise.resolve('denied');
    };
  });
  await page.goto('/');
  await settings(page);
  await page.getByLabel('Weather notifications', { exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const state = window.DusklineWeather.pushNotifications.getState();
        return state.phase + ':' + state.busy;
      }),
    )
    .toBe('blocked:false');
  await expect(page.locator('.weather-push-status')).toContainText('blocked');
});
