'use strict';
/**
 * Regressions this suite exists to prevent. Each one was a real defect found during review.
 *
 *  1. The list must load the LIGHT query (no hourly, three daily fields). Asking for the full
 *     shape for the visible catalog on boot costs much more data and time.
 *  2. Opening a city must upgrade that pack to the FULL shape, and the detail must actually
 *     render the result. The enrichment re-render used to be gated on `isDetailVisible()`,
 *     which reads a class the enter animation withholds for two frames — so a fast response
 *     was fetched and then discarded, leaving the detail with no hourly, sunrise or UV data.
 *  3. A manual refresh must mark the shell busy for assistive tech and clear it afterwards.
 *  4. The theme must follow the OS light/dark setting — resolved before first paint, and
 *     re-resolved when the OS flips while the app is open. A stale appearance/style pair left
 *     behind by the multi-tool site this app was extracted from must be ignored.
 *
 * The provider stub answers according to the request, so a light pack stays light and a full
 * request stays full. Without that, this file could not tell the two apart.
 */
const { test, expect } = require('@playwright/test');

const LIGHT_DAILY = 'weather_code,temperature_2m_max,temperature_2m_min';

function iso(offsetHours, base) { return new Date(base + offsetHours * 3600000).toISOString(); }
function ymd(offsetDays, base) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(base + offsetDays * 86400000));
}

function body(light, base, seed) {
  const times = Array.from({ length: 264 }, (_, i) => iso(i - 12, base));
  const firstDay = light ? 0 : -1;                    // the full query uses past_days=1
  const days = Array.from({ length: light ? 10 : 11 }, (_, i) => ymd(firstDay + i, base));
  const current = {
    time: iso(0, base), temperature_2m: 20 + seed, apparent_temperature: 19 + seed,
    relative_humidity_2m: 55, weather_code: 2, wind_speed_10m: 3.5, wind_direction_10m: 220,
    surface_pressure: 1012, visibility: 10000, precipitation: 0
  };
  const daily = {
    time: days,
    weather_code: days.map(() => 2),
    temperature_2m_max: days.map(() => 26),
    temperature_2m_min: days.map(() => 14)
  };
  if (light) return { latitude: 0, longitude: 0, timezone: 'America/New_York', current, daily };
  return {
    latitude: 0, longitude: 0, timezone: 'America/New_York', current,
    hourly: {
      time: times,
      temperature_2m: times.map((_, i) => 18 + 6 * Math.sin(i / 5)),
      apparent_temperature: times.map((_, i) => 17 + 6 * Math.sin(i / 5)),
      weather_code: times.map(() => 2),
      precipitation_probability: times.map(() => 10),
      precipitation: times.map(() => 0),
      wind_speed_10m: times.map(() => 3),
      wind_direction_10m: times.map(() => 200),
      relative_humidity_2m: times.map(() => 50),
      surface_pressure: times.map(() => 1012),
      uv_index: times.map((_, i) => Math.max(0, 6 * Math.sin(((i % 24) - 6) / 12 * Math.PI)))
    },
    daily: Object.assign({}, daily, {
      sunrise: days.map((d) => d + 'T06:16'), sunset: days.map((d) => d + 'T19:24'),
      uv_index_max: days.map(() => 6), precipitation_sum: days.map(() => 1.2),
      precipitation_probability_max: days.map(() => 30)
    })
  };
}

/** Stub the providers, answering in the shape the request actually asked for. */
async function stubWeather(page, log) {
  const base = Date.now();
  await page.route(/api\.weather\.gov|api\.open-meteo\.com|air-quality-api\.open-meteo\.com|geocoding-api\.open-meteo\.com/, async (route) => {
    const url = route.request().url();
    if (url.includes('geocoding')) return route.fulfill({ json: { results: [] } });
    if (url.includes('alerts')) return route.fulfill({ json: { features: [] } });
    if (url.includes('air-quality')) return route.fulfill({ json: { current: { us_aqi: 42, pm2_5: 8, pm10: 12, european_aqi: 30 } } });
    if (url.includes('points')) return route.fulfill({ json: { properties: { gridId: 'OKX', gridX: 33, gridY: 37, timeZone: 'America/New_York', forecast: 'https://api.weather.gov/gridpoints/OKX/33,37/forecast', forecastHourly: 'https://api.weather.gov/gridpoints/OKX/33,37/forecast/hourly' } } });

    const u = new URL(url);
    const light = !u.searchParams.has('hourly');
    const lats = String(u.searchParams.get('latitude') || '').split(',');
    if (log) {
      log.push({
        light, coords: lats.length,
        hasHourly: u.searchParams.has('hourly'),
        hasPastDays: u.searchParams.has('past_days'),
        daily: u.searchParams.get('daily') || ''
      });
    }
    const many = lats.map((_, i) => body(light, base, i + 1));
    return route.fulfill({ json: many.length > 1 ? many : body(light, base, 1) });
  });
}

test('the list loads the light query and the detail upgrades itself to full', async ({ page }) => {
  const log = [];
  await stubWeather(page, log);
  await page.goto('/');
  // Settle on the high/low line: the US row legitimately shows "—" for the current
  // temperature here because the NWS stub below returns a grid-points body with no
  // temperature in it, and a real NWS response always has one.
  await expect(page.locator('#weatherList .weather-row .weather-row-hl').first()).toContainText('H:', { timeout: 20000 });
  await page.waitForTimeout(2000);

  // ── the boot batch must ask for the light shape ──
  const batches = log.filter((r) => r.coords > 1);
  expect(batches.length, 'no batched list request was made').toBeGreaterThan(0);
  for (const b of batches) {
    expect(b.light, `list batch requested the full shape: ${JSON.stringify(b)}`).toBe(true);
    expect(b.hasHourly).toBe(false);
    expect(b.hasPastDays).toBe(false);
    expect(b.daily).toBe(LIGHT_DAILY);
  }

  // ── a light pack must still render a complete row ──
  const tokyo = page.locator('#weatherList .weather-row').filter({ hasText: 'Tokyo' }).first();
  await expect(tokyo).toBeVisible();
  await expect(tokyo.locator('.weather-row-temp')).not.toHaveText('—');
  await expect(tokyo.locator('.weather-row-hl')).toContainText('H:');
  await expect(tokyo.locator('.weather-row-hl')).toContainText('L:');

  // ── opening it must fetch the full shape AND render it ──
  const before = log.length;
  await tokyo.click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  expect(log.slice(before).some((r) => r.hasHourly), 'opening the detail never requested the full shape').toBe(true);

  await expect(page.locator('#weatherModules .weather-hourly-item').first()).toBeVisible({ timeout: 10000 });
  expect(await page.locator('#weatherModules .weather-hourly-item').count()).toBeGreaterThan(12);
  await expect(page.locator('.weather-daily-row')).toHaveCount(10);
  const uv = (await page.locator('.weather-mod[data-sheet="uv"] .weather-mod-value').textContent()).trim();
  expect(uv, 'UV value missing after enrichment').not.toBe('—');

  // sunrise/sunset only exist in the full body, so a time proves the merge landed
  await page.locator('.weather-mod[data-sheet="sun"]').click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await expect(page.locator('#weatherSheetBody')).toContainText(/\d{1,2}:\d{2}/);
});

test('a deep link opens a complete detail immediately', async ({ page }) => {
  const log = [];
  await stubWeather(page, log);
  await page.goto('/?city=tokyo');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/, { timeout: 20000 });
  expect(log.some((r) => r.hasHourly), 'deep link did not request the full shape').toBe(true);
  await expect(page.locator('#weatherModules .weather-hourly-item').first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.weather-daily-row')).toHaveCount(10);
});

test('a manual refresh marks the shell busy and clears it again', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row .weather-row-hl').first()).toContainText('H:', { timeout: 20000 });

  const shell = page.locator('#weatherShell');
  await expect(shell).not.toHaveAttribute('aria-busy', 'true');
  await page.click('#weatherRefresh');
  await expect(shell).toHaveAttribute('aria-busy', 'true');
  await expect(shell).not.toHaveAttribute('aria-busy', 'true', { timeout: 15000 });
});

test('the theme follows the OS, before first paint and when the OS flips', async ({ page }) => {
  await stubWeather(page, null);

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  // boot.js resolves this in <head>, ahead of the stylesheet, so there is no flash of the
  // wrong theme. Both the attribute and the browser-chrome colour must agree.
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'glass');
  expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe('#000000');

  // Flipping the OS preference while the app is open must re-resolve live.
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'minimal');
  expect(await page.locator('html').evaluate((el) => el.style.colorScheme)).toBe('light');
  expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe('#f5f5f7');
});

test('a stale parent-site appearance preference is ignored', async ({ page }) => {
  // These keys belonged to a Settings overlay this app does not ship. `light` + `classic`
  // used to select the `elegant` theme; now nothing may read them at all.
  await page.addInitScript(() => {
    localStorage.setItem('duskline-appearance', 'light');
    localStorage.setItem('duskline-style', 'classic');
  });
  await page.emulateMedia({ colorScheme: 'dark' });
  await stubWeather(page, null);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'glass');
  await expect(page.locator('#weatherList .weather-row .weather-row-hl').first()).toContainText('H:', { timeout: 20000 });
});

test('first visit offers My Sky above a compact global preview', async ({ page }) => {
  const log = [];
  await stubWeather(page, log);
  await page.goto('/');
  await expect(page.locator('#weatherStart')).toBeVisible();
  await expect(page.locator('#weatherList .weather-row')).toHaveCount(6);
  await expect(page.locator('#weatherMore')).toBeVisible();
  await expect(page.locator('#weatherList .weather-region-heading')).toHaveCount(0);
  await expect(page.locator('#weatherList .weather-row .weather-row-hl').first()).toContainText('H:');
  expect(log.filter((r) => r.coords > 1).every((r) => r.coords <= 6)).toBe(true);
  await page.locator('#weatherMore').click();
  await expect(page.locator('#weatherList .weather-row')).toHaveCount(36);
  await expect(page.locator('#weatherMore')).toBeHidden();
});

test('a failed search selection explains the failure and closes its loading detail', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row .weather-row-hl').first()).toContainText('H:');
  await page.route(/geocoding-api\.open-meteo\.com/, route => route.fulfill({ json: {
    results: [{ name: 'Boston', latitude: 42.36, longitude: -71.06, admin1: 'Massachusetts', country: 'United States', country_code: 'US', timezone: 'America/New_York' }]
  } }));
  await page.route(/^https:\/\/(api\.weather\.gov|api\.open-meteo\.com)\//, route => route.abort());
  await page.locator('#weatherSearch').fill('Boston');
  await page.locator('#weatherSuggest button[role="option"]').first().click();
  await expect(page.locator('#weatherError')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#weatherDetail')).not.toHaveClass(/open/, { timeout: 15000 });
  await expect(page.locator('#weatherError')).toContainText('Could not load');
});

test('a saved forecast remains visible after provider failure and is marked as saved', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/');
  const row = page.locator('#weatherList .weather-row').first();
  await expect(row.locator('.weather-row-hl')).toContainText('H:');
  await row.click();
  await expect(page.locator('#weatherModules .weather-hourly-item').first()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#weatherDetailBack')).toBeFocused();
  await page.locator('#weatherDetailBack').click();
  await expect(page.locator('#weatherList .weather-row').first()).toBeFocused();
  await page.route(/api\.weather\.gov|api\.open-meteo\.com|air-quality-api\.open-meteo\.com/, route => route.abort());
  await page.reload();
  const saved = page.locator('#weatherList .weather-row').first();
  await expect(saved).toContainText('Saved forecast');
  await expect(saved.locator('.weather-row-temp')).not.toHaveText('—');
});

test('hourly charts can be explored with a keyboard', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/');
  await page.locator('#weatherList .weather-row').first().click();
  await page.locator('#weatherModules [data-sheet="conditions"]').click();
  const chart = page.locator('#weatherSheet .weather-chart-wrap[role="slider"]').first();
  await expect(chart).toBeVisible();
  await chart.focus();
  await chart.press('Home');
  await expect(chart).toHaveAttribute('aria-valuenow', '0');
  await chart.press('ArrowRight');
  await expect(chart).toHaveAttribute('aria-valuenow', '1');
  await chart.press('End');
  const last = Number(await chart.getAttribute('aria-valuemax'));
  await expect(chart).toHaveAttribute('aria-valuenow', String(last));
});

test('the installed app opens a saved forecast offline', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row .weather-row-hl').first()).toContainText('H:');
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherModules .weather-hourly-item').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherDetailBack').click();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, undefined, { timeout: 15000 });
  await page.route(/api\.weather\.gov|api\.open-meteo\.com|air-quality-api\.open-meteo\.com/, route => route.abort());
  await page.context().setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#weatherList .weather-row').first()).toContainText('Saved forecast', { timeout: 15000 });
  await expect(page.locator('#weatherList .weather-row-temp').first()).not.toHaveText('—');
  await page.context().setOffline(false);
});

test('detail and info sheet return focus to the control that opened them', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/');
  const row = page.locator('#weatherList .weather-row').first();
  await expect(row.locator('.weather-row-hl')).toContainText('H:');
  await row.click();
  const tile = page.locator('#weatherModules [data-sheet="feels"]');
  await tile.click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await page.locator('#weatherSheetClose').click();
  await expect(tile).toBeFocused();
  await page.locator('#weatherDetailBack').click();
  await expect(page.locator('#weatherList .weather-row').first()).toBeFocused();
});

test('closing a city does not dismiss a place picker opened during its exit transition', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('duskline-weather-mode', 'my-sky');
    localStorage.setItem('duskline-weather-greeting-city', JSON.stringify({
      name: 'Boston', admin1: 'Massachusetts', lat: 42.36, lon: -71.059,
      tz: 'America/New_York', country: 'United States', country_code: 'US'
    }));
  });
  await stubWeather(page, null);
  await page.goto('/');
  await page.locator('#weatherMyLocationList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.evaluate(() => {
    document.querySelector('#weatherDetailBack').click();
    document.querySelector('#weatherGreetingPlace').click();
  });
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await page.waitForTimeout(300);
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await expect(page.locator('#weatherSheetBody [role="radio"]')).toHaveCount(1);
});

test('share creates a direct city link with its forecast coordinates', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.__sharedForecast = data; } });
  });
  await stubWeather(page, null);
  await page.goto('/?city=tokyo');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherDetailShare').click();
  const shared = await page.evaluate(() => window.__sharedForecast);
  expect(shared.title).toContain('Tokyo');
  const url = new URL(shared.url);
  expect(url.searchParams.get('lat')).toBe('35.6762');
  expect(url.searchParams.get('lon')).toBe('139.6503');
});

test('search offers recently opened cities without a geocoding request', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/');
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherModules .weather-hourly-item').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherDetailBack').click();
  await page.locator('#weatherSearch').focus();
  await expect(page.locator('#weatherSuggest')).toBeVisible();
  await expect(page.locator('#weatherSuggest .s-group')).toContainText('Recent places');
  await expect(page.locator('#weatherSuggest button[role="option"]').first()).toContainText('New York');
});

test('the empty My Sky message uses dark readable text on the light canvas', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await stubWeather(page, null);
  await page.goto('/');
  await page.locator('[data-weather-mode="my-sky"]').click();
  const message = page.locator('#weatherMySkyEmpty p');
  await expect(message).toBeVisible();
  expect(await message.evaluate(el => getComputedStyle(el).color)).toBe('rgb(36, 73, 102)');
});
