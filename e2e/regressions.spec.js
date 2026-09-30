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
  await page.route(/\/api\/international-alerts(?:\?|$)/, route => route.fulfill({
    json: { availability: 'available', provider: 'IFRC Alert Hub', country: 'Japan', alerts: [], truncated: false, fetchedAt: Date.now() }
  }));
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
        hourly: u.searchParams.get('hourly') || '',
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
    expect(b.hourly).toBe('');
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
  const fullRequest = log.slice(before).find((r) => r.hasHourly);
  expect(fullRequest, 'opening the detail never requested the full shape').toBeTruthy();
  expect(fullRequest.hourly).toContain('wind_gusts_10m');
  expect(fullRequest.daily).toContain('wind_gusts_10m_max');

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
  await page.route(/api\.open-meteo\.com/, async route => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.fallback();
  });

  const shell = page.locator('#weatherShell');
  await expect(shell).not.toHaveAttribute('aria-busy', 'true');
  await page.click('#weatherRefresh');
  await expect(shell).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#weatherRefresh')).toHaveClass(/is-busy/);
  const spin = await page.locator('#weatherRefresh svg').evaluate(node => getComputedStyle(node).animationName);
  expect(spin).toBe('wx-refresh-spin');
  await expect(shell).not.toHaveAttribute('aria-busy', 'true', { timeout: 15000 });
  await expect(page.locator('#weatherRefresh')).not.toHaveClass(/is-busy/);
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

test('switching to an uncached My Sky place shows non-blocking progress until it loads', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('duskline-weather-mode', 'horizon');
    localStorage.setItem('duskline-weather-favorites', JSON.stringify([{
      name: 'Boston', admin1: 'Massachusetts', lat: 42.36, lon: -71.06,
      tz: 'America/New_York', country: 'United States', country_code: 'US'
    }]));
  });
  await stubWeather(page, null);
  await page.route(/api\.open-meteo\.com\/v1\/forecast(?:\?|$)/, async route => {
    const latitude = new URL(route.request().url()).searchParams.get('latitude') || '';
    if (latitude.split(',').some(value => Math.abs(Number(value) - 42.36) < 0.01)) {
      await new Promise(resolve => setTimeout(resolve, 700));
    }
    await route.fallback();
  });
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row .weather-row-hl').first()).toContainText('H:', { timeout: 20000 });
  await page.locator('#weatherModeSwitch [data-weather-mode="my-sky"]').click();
  await expect(page.locator('#weatherModeLoading')).toBeVisible();
  await expect(page.locator('#weatherModeSwitch')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#weatherHome')).toContainText('Boston', { timeout: 15000 });
  await expect(page.locator('#weatherModeLoading')).toBeHidden();
  await expect(page.locator('#weatherModeSwitch')).not.toHaveAttribute('aria-busy', 'true');
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
  await page.locator('#weatherSuggest button[data-place-choice]').first().click();
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

test('hourly chart values update on pointer hover and reset when the pointer leaves', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/?city=nyc');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherModules [data-sheet="conditions"]').click();
  const chart = page.locator('#weatherSheet .weather-chart-wrap[role="slider"]').first();
  await expect(chart).toBeVisible();
  const initialIndex = await chart.getAttribute('aria-valuenow');
  const svg = chart.locator('svg');
  const box = await svg.boundingBox();
  expect(box).toBeTruthy();
  await page.mouse.move(box.x + box.width * 0.22, box.y + box.height * 0.55);
  await expect.poll(() => chart.getAttribute('aria-valuenow')).not.toBe(initialIndex);
  const hoveredReadout = await chart.locator('[data-readout]').textContent();
  expect(hoveredReadout).toBeTruthy();
  await page.mouse.move(0, 0);
  await expect(chart).toHaveAttribute('aria-valuenow', initialIndex);
});

test.describe('installed offline shell', () => {
  test.use({serviceWorkers:'allow'});

test('the installed app opens a saved forecast offline', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Playwright WebKit setOffline bypasses service workers on reload; redirecting-host outage coverage runs separately.');
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

test('recently used legal languages remain available offline without downloading all packs', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.goto('/terms.html');
  const title = page.locator('[data-i18n="legal.terms.title"]');
  await page.locator('#dusklineLanguage').selectOption('fr');
  await expect(title).toHaveText('Conditions d’utilisation');
  await expect.poll(() => page.evaluate(async () => (await (await caches.open('duskline-locales-v58')).keys()).length)).toBeGreaterThan(0);
  await page.locator('#dusklineLanguage').selectOption('en');
  await page.context().setOffline(true);
  await page.locator('#dusklineLanguage').selectOption('fr');
  await expect(title).toHaveText('Conditions d’utilisation');
  await page.context().setOffline(false);
});

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

test('Units sheet locks background scrolling and restores the previous page position', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stubWeather(page, null);
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  const before = await page.evaluate(() => window.scrollY);

  await page.locator('#weatherUnitsBtn').click();
  const sheet = page.locator('#weatherSheet');
  await expect(sheet).toHaveClass(/open/);
  await page.waitForTimeout(500); // Allow an in-flight city-list refresh to finish under the sheet.
  const locked = await page.evaluate(() => ({
    rootOverflow: document.documentElement.style.getPropertyValue('overflow'),
    bodyPosition: document.body.style.getPropertyValue('position'),
    bodyTop: parseFloat(document.body.style.getPropertyValue('top')),
    bodyOverflow: document.body.style.getPropertyValue('overflow')
  }));
  expect(locked.rootOverflow).toBe('hidden');
  expect(locked.bodyPosition).toBe('fixed');
  expect(Math.abs(locked.bodyTop + before)).toBeLessThan(1);
  expect(locked.bodyOverflow).toBe('hidden');

  await page.mouse.move(24, 800);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => parseFloat(document.body.style.top))).toBe(locked.bodyTop);
  await expect.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('overflow'))).toBe('hidden');

  await page.locator('#weatherSheetClose').click();
  await expect(sheet).not.toHaveClass(/open/, { timeout: 4000 });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(before);
  const restored = await page.evaluate(() => ({
    rootOverflow: document.documentElement.style.getPropertyValue('overflow'),
    bodyPosition: document.body.style.getPropertyValue('position'),
    bodyTop: document.body.style.getPropertyValue('top')
  }));
  expect(restored).toEqual({ rootOverflow: '', bodyPosition: '', bodyTop: '' });
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
  await page.locator('#weatherHome [data-home-open]').click();
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
  await expect(page.locator('#weatherSuggest button[data-place-choice]').first()).toContainText('New York');
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

test('mobile city details keep the reduced blur treatment while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stubWeather(page, null);
  await page.goto('/');
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  const card = page.locator('#weatherModules .weather-mod').first();
  await expect(card).toBeVisible();

  const appearance = await card.evaluate(element => ({
    mobileLite: document.documentElement.getAttribute('data-mobile-lite'),
    backdrop: getComputedStyle(element).backdropFilter
  }));
  expect(appearance.mobileLite).toBe('true');
  expect(appearance.backdrop).toContain('blur(20px)');

  const scroll = page.locator('#weatherDetailScroll');
  const dimensions = await scroll.evaluate(element => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight
  }));
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);
  await scroll.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect.poll(() => scroll.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
});

test('detail actions stay in the top right and the footer uses the current year', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stubWeather(page, null);
  await page.goto('/');
  await expect(page.locator('#dusklineYear')).toHaveText(String(new Date().getFullYear()));
  await expect(page.locator('.gallery-app-footer-copy')).toContainText('Tim G (TGthms)');
  const footerGap = await page.evaluate(() => {
    const copy = document.querySelector('.gallery-app-footer-copy').getBoundingClientRect();
    const links = document.querySelector('.gallery-app-footer .footer-legal-links').getBoundingClientRect();
    return links.top - copy.bottom;
  });
  expect(footerGap).toBeLessThan(80);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  const position = await page.locator('.weather-detail-bar-actions').evaluate(node => {
    const box = node.getBoundingClientRect();
    return { right: box.right, top: box.top };
  });
  expect(position.right).toBeGreaterThan(1400);
  expect(position.top).toBeLessThan(80);
  await page.locator('#weatherModules [data-sheet="humidity"]').click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await expect(page.locator('#weatherSheet .wx-sheet-grab')).toBeHidden();
  const sheetSpacing = await page.locator('#weatherSheet').evaluate(node => {
    const panel = node.querySelector('.weather-sheet-panel').getBoundingClientRect();
    const icon = node.querySelector('.wx-sheet-dragzone .wx-sheet-icon').getBoundingClientRect();
    return icon.top - panel.top;
  });
  expect(sheetSpacing).toBeGreaterThanOrEqual(20);
});

test('My Sky checking copy is immediate and the completed forecast types in', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('duskline-weather-mode', 'my-sky');
    localStorage.setItem('duskline-motion', 'full');
    localStorage.setItem('duskline-weather-greeting-city', JSON.stringify({
      name: 'Boston', admin1: 'Massachusetts', lat: 42.36, lon: -71.059,
      tz: 'America/New_York', country: 'United States', country_code: 'US'
    }));
  });
  await stubWeather(page, null);
  await page.route(/api\.open-meteo\.com/, async route => {
    await new Promise(resolve => setTimeout(resolve, 650));
    await route.fallback();
  });
  await page.goto('/');
  const heading = page.locator('#weatherGreeting');
  await expect(heading).toHaveAttribute('aria-label', /checking the weather/i);
  await expect(heading).not.toHaveAttribute('data-typing', 'true');
  await expect(heading).toHaveAttribute('data-typing', 'true', { timeout: 15000 });
  const readGreetingState = () => heading.evaluate((el) => {
    const text = document.querySelector('#weatherGreetingText');
    return {
      label: el.getAttribute('aria-label'),
      text: text ? text.textContent : null,
      typing: el.hasAttribute('data-typing')
    };
  });
  const initialState = await readGreetingState();
  expect(initialState.label).toContain('Boston');
  expect(initialState.text).toBe(initialState.label);
  const measure = () => page.locator('#weatherGreetingText').evaluate(node => ({
    height: node.getBoundingClientRect().height,
    words: Array.from(node.querySelectorAll('.weather-typewriter-word'), word => ({
      top: word.getBoundingClientRect().top,
      left: word.getBoundingClientRect().left,
      clip: word.style.getPropertyValue('--wx-typewriter-clip')
    })),
    text: node.textContent
  }));
  const before = await measure();
  await page.waitForTimeout(180);
  const after = await measure();
  const currentState = await readGreetingState();
  if (currentState.label === before.text && currentState.typing) {
    expect(after.height).toBe(before.height);
    expect(after.words.map(({ top, left }) => ({ top, left }))).toEqual(before.words.map(({ top, left }) => ({ top, left })));
    expect(after.words.map(word => word.clip)).not.toEqual(before.words.map(word => word.clip));
  } else {
    // If enrichment landed during the sample, the new sentence must replace the
    // old reveal atomically rather than restarting midway through another line.
    expect(currentState.text).toBe(currentState.label);
    if (currentState.label !== before.text) expect(currentState.typing).toBe(false);
  }
  await expect.poll(async () => {
    const state = await readGreetingState();
    return !state.typing && state.label === state.text;
  }, { timeout: 15000 }).toBe(true);
  const finalState = await readGreetingState();
  expect(finalState.text).toBe(finalState.label);
});

test('first Horizon greeting keeps its editorial pause after typing', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-weather-mode="horizon"]')).toHaveAttribute('aria-pressed', 'true');
  const heading = page.locator('#weatherGreeting');
  await expect(heading).toHaveAttribute('aria-label', /^Good (morning|afternoon|evening|night) — [a-z]/);
  await expect(heading).toHaveAttribute('data-typing', 'true', { timeout: 10000 });
  await expect(heading).not.toHaveAttribute('data-typing', 'true', { timeout: 10000 });
  const label = await heading.getAttribute('aria-label');
  const renderedCopy = await page.locator('#weatherGreetingText').textContent();
  expect(renderedCopy).toBe(label);
});

test('search shows progress and saves a result directly with confirmation', async ({ page }) => {
  await stubWeather(page, null);
  await page.route(/geocoding-api\.open-meteo\.com/, async route => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.fulfill({ json: { results: [{
      name: 'Boston', latitude: 42.36, longitude: -71.06, admin1: 'Massachusetts',
      country: 'United States', country_code: 'US', timezone: 'America/New_York'
    }] } });
  });
  await page.goto('/');
  await page.locator('#weatherSearch').fill('Boston');
  await expect(page.locator('#weatherSuggest .s-loading')).toBeVisible();
  await expect(page.locator('#weatherSearch')).toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#weatherSuggest .s-add')).toBeVisible();
  await expect(page.locator('#weatherSuggest .s-add svg.weather-save-icon')).toBeVisible();
  await page.locator('#weatherSuggest [data-place-choice]').hover();
  expect(await page.locator('#weatherSuggest [data-place-choice]').evaluate(node => getComputedStyle(node).borderRadius)).toBe('10px');
  await page.locator('#weatherSuggest .s-add').click();
  await expect(page.locator('.weather-toast')).toContainText('Added to My Sky');
  await page.locator('[data-weather-mode="my-sky"]').click();
  await expect(page.locator('#weatherHome')).toContainText('Boston');
});

test('a denied location request gives visible feedback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition(_success, error) { error({ code: 1 }); } }
    });
  });
  await stubWeather(page, null);
  await page.goto('/');
  await page.locator('#weatherLocate').click();
  await expect(page.locator('.weather-toast')).toHaveClass(/is-visible/);
  await expect(page.locator('.weather-toast')).toContainText('permission was denied');
});

test('share exposes a selectable link when clipboard APIs are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    document.execCommand = () => false;
  });
  await stubWeather(page, null);
  await page.goto('/?city=tokyo');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherDetailShare').click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await expect(page.locator('#wxShareLink')).toHaveValue(/lat=35\.6762.*lon=139\.6503/);
  await expect(page.locator('#wxShareLink')).toBeFocused();
});

test('share confirms a legacy clipboard copy when native clipboard is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    document.execCommand = () => true;
  });
  await stubWeather(page, null);
  await page.goto('/?city=tokyo');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherDetailShare').click();
  await expect(page.locator('.weather-toast')).toContainText('Link copied');
  await expect(page.locator('#weatherSheet')).not.toHaveClass(/open/);
});

test('a light city pack explains hourly loading until full data arrives', async ({ page }) => {
  await stubWeather(page, null);
  await page.route(/api\.open-meteo\.com/, async route => {
    if (route.request().url().includes('hourly=')) await new Promise(resolve => setTimeout(resolve, 750));
    await route.fallback();
  });
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row .weather-row-hl').first()).toContainText('H:');
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('.weather-hourly-loading')).toBeVisible();
  await expect(page.locator('.weather-hourly-loading')).toContainText('Loading forecast');
  const hourlyTile = page.locator('#weatherModules [data-sheet="conditions"]');
  const loadingTile = await hourlyTile.boundingBox();
  const loadingContent = await page.locator('.weather-hourly-loading').boundingBox();
  expect(loadingTile).toBeTruthy();
  expect(loadingContent).toBeTruthy();
  expect(Math.abs((loadingContent.x + loadingContent.width / 2) - (loadingTile.x + loadingTile.width / 2))).toBeLessThan(2);
  await expect(page.locator('#weatherModules .weather-hourly-item').first()).toBeVisible({ timeout: 15000 });
  const loadedTile = await hourlyTile.boundingBox();
  expect(Math.abs(loadedTile.height - loadingTile.height)).toBeLessThanOrEqual(5);
});

test('Hourly Forecast switches between actual and feels-like in the same sheet', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/?city=nyc');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherModules [data-sheet="conditions"]').click();
  const sheet = page.locator('#weatherSheet');
  const chart = page.locator('#weatherSheetBody .weather-chart-wrap').first();
  await expect(sheet).toHaveClass(/open/);
  await expect(page.locator('#weatherSheetTitle')).toContainText(String(new Date().getFullYear()));
  await expect(page.locator('#weatherSheetBody [data-temp-mode="actual"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(chart).toHaveAttribute('data-kind', 'temperature_2m');
  await expect(page.locator('#weatherSheetBody .weather-chart-wrap')).toHaveCount(1);

  await page.locator('#weatherSheetBody [data-temp-mode="feels"]').click();
  await expect(page.locator('#weatherSheetTitle')).toContainText(String(new Date().getFullYear()));
  await expect(page.locator('#weatherSheetBody [data-temp-mode="feels"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(chart).toHaveAttribute('data-kind', 'apparent_temperature');

  await page.locator('#weatherSheetClose').click();
  await page.locator('#weatherModules [data-sheet="feels"]').click();
  await expect(page.locator('#weatherSheetTitle')).toContainText(String(new Date().getFullYear()));
  await expect(page.locator('#weatherSheetBody [data-temp-mode="feels"]')).toHaveAttribute('aria-pressed', 'true');
});

test('calm conditions do not promote a zero percent rain insight', async ({ page }) => {
  await stubWeather(page, null);
  await page.goto('/?city=tokyo');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await expect(page.locator('#weatherDetailHero .weather-detail-insight')).toBeVisible();
  await expect(page.locator('#weatherDetailHero .weather-detail-insight')).not.toContainText('Precipitation');
  await expect(page.locator('#weatherDetailHero .weather-detail-insight')).not.toBeEmpty();
});

test('a strong wind replaces the rain insight with timely wind guidance', async ({ page }) => {
  await stubWeather(page, null);
  await page.route(/api\.open-meteo\.com/, async route => {
    if (!route.request().url().includes('hourly=')) return route.fallback();
    const forecast = body(false, Date.now(), 1);
    forecast.current.wind_speed_10m = 20;
    return route.fulfill({ json: forecast });
  });
  await page.goto('/?city=tokyo');
  await expect(page.locator('#weatherDetailHero .weather-detail-insight')).toContainText('Wind');
  await expect(page.locator('#weatherDetailHero .weather-detail-insight')).not.toContainText('Precipitation');
});

test('a forecast wind gust surfaces its expected local time', async ({ page }) => {
  await stubWeather(page, null);
  await page.route(/api\.open-meteo\.com/, async route => {
    if (!route.request().url().includes('hourly=')) return route.fallback();
    const forecast = body(false, Date.now(), 1);
    forecast.hourly.wind_gusts_10m = forecast.hourly.time.map((_, i) => i === 17 ? 22 : 4);
    return route.fulfill({ json: forecast });
  });
  await page.goto('/?city=tokyo');
  const insight = page.locator('#weatherDetailHero .weather-detail-insight');
  await expect(insight).toContainText('Gusts may reach');
  await expect(insight).toContainText('around');
});

test('the detail insight looks ahead to tomorrow near bedtime', async ({ page }) => {
  const bedtimeNewYork = new Date();
  bedtimeNewYork.setUTCHours(3, 0, 0, 0);
  await page.clock.install({ time: bedtimeNewYork });
  await stubWeather(page, null);
  await page.goto('/?city=nyc');
  await expect(page.locator('#weatherDetailHero .weather-detail-insight')).toContainText('Tomorrow');
});

test('light air quality sheet uses readable dark band colors', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  const middayNewYork = new Date();
  middayNewYork.setUTCHours(17, 0, 0, 0);
  await page.clock.install({ time: middayNewYork });
  await stubWeather(page, null);
  await page.route(/air-quality-api\.open-meteo\.com/, route => route.fulfill({
    json: { current: { us_aqi: 66, pm2_5: 17, pm10: 27, us_aqi_pm2_5: 66, us_aqi_pm10: 55 } }
  }));
  await page.goto('/?city=nyc');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherModules [data-sheet="aqi"]').click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/wx-sheet-light/);
  await expect(page.locator('#wxAqiExtended .wx-air-contribution strong').first()).toBeVisible();
  const color = await page.locator('#wxAqiExtended .wx-air-contribution strong').first()
    .evaluate(node => getComputedStyle(node).color);
  expect(color).toBe('rgb(118, 83, 0)');
});

test('weather map opens as an accessible dialog with Lucide controls and selectable layers', async ({ page }) => {
  await stubWeather(page, null);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  const locationControl = await page.locator('#weatherLocate').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height, radius: getComputedStyle(element).borderRadius,
      glyph: element.querySelector('use')?.getAttribute('href') };
  });
  expect(locationControl.width).toBe(44);
  expect(locationControl.height).toBe(44);
  expect(locationControl.radius).toContain('50%');
  expect(locationControl.glyph).toBe('#lucide-map-pin');
  await expect(page.locator('use[href*="assets/icons/"]')).toHaveCount(0);

  const openMap = page.locator('#weatherMapOpen');
  await expect(openMap).toBeVisible();
  await openMap.click();

  const dialog = page.getByRole('dialog', { name: 'Weather map' });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  expect(await page.locator('html').evaluate(el => el.style.overflow)).toBe('hidden');
  expect(await page.locator('body').evaluate(el => el.style.overflow)).toBe('hidden');
  expect(await page.locator('.weather-page-sky').evaluate(el => getComputedStyle(el).visibility)).toBe('hidden');
  const backgroundPosition = await page.evaluate(() => window.scrollY);
  await page.mouse.move(8, 100);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(backgroundPosition);
  await expect(dialog.locator('[data-weather-layer="temperature"]')).toHaveAttribute('aria-pressed', 'true');
  await dialog.locator('[data-weather-layer="wind"]').click();
  await expect(dialog.locator('[data-weather-layer="wind"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(dialog.locator('#weatherMapGradient')).toHaveAttribute('data-layer', 'wind');
  await expect(dialog.locator('#weatherMapZoomIn svg use')).toHaveAttribute('href', '#lucide-zoom-in');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(await page.locator('html').evaluate(el => el.style.overflow)).toBe('');
  expect(await page.locator('body').evaluate(el => el.style.overflow)).toBe('');
  await expect(openMap).toBeFocused();
});

test('weather map falls back to the offline atlas when map tiles fail', async ({ page }) => {
  await stubWeather(page, null);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await page.locator('#weatherMapOpen').click();
  await expect(page.locator('#weatherMapFallback')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#weatherMapStatus')).toContainText('Detailed tiles unavailable');
  await expect(page.locator('#weatherMapCredit')).toContainText('Offline world map');
  await expect(page.locator('#weatherMapFallback .weather-map-fallback-marker').first()).toBeVisible();
  await page.locator('#weatherMapPlacesSummary').click();
  await expect(page.locator('#weatherMapPlaces .weather-map-place').first()).toBeVisible();
  expect(await page.locator('#weatherMapPlaces .weather-map-place').first().getAttribute('aria-label')).toContain('New York');
  await page.locator('#weatherMapPlaces .weather-map-place').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await expect(page.locator('#weatherMap')).toBeHidden();
});

test('map right-click can view and save a dropped pin', async ({ page }) => {
  await stubWeather(page, null);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await page.locator('#weatherMapOpen').click();
  const map = page.locator('#weatherMap');
  await expect(page.locator('#weatherMapFallback')).toBeVisible({ timeout: 15000 });
  const surface = page.locator('#weatherMapFallback');
  const box = await surface.boundingBox();
  expect(box).toBeTruthy();
  const point = { x: box.width * 0.53, y: box.height * 0.45 };

  await surface.click({ button: 'right', position: point });
  const menu = page.locator('#weatherMapContextMenu');
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-map-action="view"]')).toHaveText('View weather here');
  await expect(menu.locator('[data-map-action="add"]')).toHaveText('Add pin to My Sky');
  await menu.locator('[data-map-action="add"]').click();
  await expect(page.locator('#weatherMapStatus')).toContainText('Added to My Sky');
  await page.locator('#weatherMapPlacesSummary').click();
  await expect(page.locator('#weatherMapPlaces .weather-map-place').filter({ hasText: 'Pinned place' })).toBeVisible();
  await page.locator('#weatherMapPlacesSummary').click();

  await surface.click({ button: 'right', position: point });
  await expect(menu.locator('[data-map-action="view"]')).toHaveText('View Pinned place');
  await menu.locator('[data-map-action="view"]').click();
  await expect(page.locator('#weatherMap')).toBeHidden();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await expect(page.locator('#weatherDetailTitle')).toHaveText('Pinned place');
});

test('map supports long-press actions and responsive footer layouts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await stubWeather(page, null);
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto('/');
  await page.locator('#weatherMapOpen').click();
  await expect(page.locator('#weatherMapFallback')).toBeVisible({ timeout: 15000 });
  const surface = page.locator('#weatherMapFallback');
  const box = await surface.boundingBox();
  expect(box).toBeTruthy();
  await surface.dispatchEvent('pointerdown', {
    pointerId: 17, pointerType: 'touch',
    clientX: box.x + box.width * 0.53, clientY: box.y + box.height * 0.45,
    bubbles: true, cancelable: true
  });
  await page.waitForTimeout(560);
  await expect(page.locator('#weatherMapContextMenu')).toBeVisible();
  await surface.dispatchEvent('pointerup', { pointerId: 17, pointerType: 'touch', bubbles: true });
  await page.keyboard.press('Escape');
  await expect(page.locator('#weatherMapContextMenu')).toBeHidden();

  for (const size of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 }
  ]) {
    await page.setViewportSize(size);
    const layout = await page.evaluate(() => {
      const panel = document.querySelector('.weather-map-panel');
      const footer = document.querySelector('.weather-map-footer');
      const legend = document.querySelector('.weather-map-legend');
      const ticks = document.querySelector('#weatherMapLegendValues');
      const stage = document.querySelector('.weather-map-stage');
      return {
        panelOverflow: panel.scrollWidth - panel.clientWidth,
        footerOverflow: footer.scrollWidth - footer.clientWidth,
        legendOverflow: legend.scrollWidth - legend.clientWidth,
        tickOverflow: ticks.scrollWidth - ticks.clientWidth,
        stageHeight: stage.getBoundingClientRect().height
      };
    });
    expect(layout.panelOverflow, 'panel overflow at ' + size.width + 'px').toBeLessThanOrEqual(1);
    expect(layout.footerOverflow, 'footer overflow at ' + size.width + 'px').toBeLessThanOrEqual(1);
    expect(layout.legendOverflow, 'legend overflow at ' + size.width + 'px').toBeLessThanOrEqual(1);
    expect(layout.tickOverflow, 'legend tick overflow at ' + size.width + 'px').toBeLessThanOrEqual(1);
    expect(layout.stageHeight).toBeGreaterThanOrEqual(120);
  }
  await page.locator('#weatherMapClose').click();
  await expect(page.locator('#weatherMap')).toBeHidden();
  await page.setViewportSize({ width: 1280, height: 720 });
});

test('daily forecast rows open the selected date with a day range, matching icon, and real hourly conditions', async ({ page }) => {
  await stubWeather(page, null);
  const tomorrow = new Date();
  const forecastDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(tomorrow.getTime() + 86400000));
  await page.route(/api\.open-meteo\.com\/v1\/forecast(?:\?|$)/, async route => {
    const url = new URL(route.request().url());
    if (!url.searchParams.has('hourly')) return route.fallback();
    const forecast = body(false, Date.now(), 1);
    const target = forecast.hourly.time.findIndex(time => {
      const localDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date(time));
      return localDate === forecastDate;
    });
    if (target >= 0) forecast.hourly.weather_code[target] = 65;
    return route.fulfill({ json: forecast });
  });
  await page.goto('/?city=nyc');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);

  const monday = page.locator('#weatherModules .weather-daily-row').nth(1);
  await monday.press('Enter');
  const sheet = page.locator('#weatherSheet');
  await expect(sheet).toHaveClass(/open/);
  await expect(page.locator('#weatherSheetTitle')).toHaveText(new Intl.DateTimeFormat('en-US', {weekday:'long',year:'numeric',month:'long',day:'numeric',timeZone:'America/New_York'}).format(new Date(forecastDate+'T12:00:00Z')));
  await expect(page.locator('#weatherSheet .wx-sheet-title-host .wx-sheet-icon use')).toHaveAttribute('href', '#lucide-cloud-sun');
  await expect(page.locator('#weatherSheetBody .wx-day-facts')).toContainText('High');
  await expect(page.locator('#weatherSheetBody .wx-day-facts')).toContainText('Low');
  await expect(page.locator('#weatherSheetBody [data-temp-mode="actual"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#weatherSheetBody [data-hourly-date]')).toHaveCount(10);
  await expect(page.locator('#weatherSheetBody .weather-chart-wrap')).toHaveCount(2);
  await expect(page.locator('#weatherSheetBody .weather-chart-wrap').first()).toHaveAttribute('data-kind', 'temperature_2m');
  await expect(page.locator('#weatherSheetBody .weather-chart-wrap').first().locator('[data-readout]'))
    .toHaveAttribute('data-initial-mode', 'range');
  await expect(page.locator('#weatherSheetBody .weather-chart-wrap').first().locator('[data-sub]')).toHaveText('Daily range');
  await page.locator('#weatherSheetBody [data-temp-mode="feels"]').click();
  await expect(page.locator('#weatherSheetBody [data-temp-mode="feels"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#weatherSheetBody .weather-chart-wrap').first()).toHaveAttribute('data-kind', 'apparent_temperature');
  const feelsRange = await page.locator('#weatherSheetBody .weather-chart-wrap').first().locator('[data-readout]').textContent();
  expect(feelsRange).toMatch(/°\s*–\s*.*°/);
  await page.locator('#weatherSheetBody .weather-chart-wrap').first().focus();
  await page.locator('#weatherSheetBody .weather-chart-wrap').first().press('Home');
  await expect(page.locator('#wxDayCondition')).toContainText('Heavy rain');

  await page.locator('#weatherSheetClose').click();
  await expect(sheet).toBeHidden();
  await expect(monday).toBeFocused();
});

test('NWS alert details open and collapse on repeated activation', async ({ page }) => {
  const expires = new Date(Date.now() + 4 * 3600000).toISOString();
  await stubWeather(page, null);
  await page.route(/api\.weather\.gov/, async route => {
    if (!route.request().url().includes('/alerts/')) return route.fallback();
    return route.fulfill({ json: { features: [{
      id: 'https://api.weather.gov/alerts/urn:uuid:duskline-test-flood',
      properties: {
        id: 'urn:uuid:duskline-test-flood', event: 'Coastal Flood Warning', severity: 'Severe',
        urgency: 'Expected', certainty: 'Likely', headline: 'Coastal Flood Warning for New York',
        effective: new Date().toISOString(), expires,
        description: 'Minor coastal flooding is expected near vulnerable shorelines.',
        instruction: 'Avoid flooded roads and follow local emergency guidance.', areaDesc: 'New York County'
      }
    }] } });
  });
  await page.goto('/?city=nyc');
  const card = page.locator('#weatherModules .weather-alert').first();
  const summary = card.locator('.weather-alert-summary');
  await expect(summary).toBeVisible({ timeout: 15000 });
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
  await summary.click();
  await expect(summary).toHaveAttribute('aria-expanded', 'true');
  await expect(card).toHaveClass(/is-open/);
  await expect(card.locator('.weather-alert-instruction')).toContainText('Avoid flooded roads');
  await expect(card).not.toHaveClass(/is-animating/, { timeout: 2000 });
  await summary.click();
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
  await expect(card).not.toHaveClass(/is-open/);
});


test('lists stay quiet and city-detail save removal can be undone', async ({page}) => {
  await stubWeather(page,null);
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row-save, .weather-row-manage')).toHaveCount(0);
  await page.locator('#weatherList .weather-row').first().click();
  const save = page.locator('#weatherDetailFav');
  await save.click();
  await expect(save).toHaveAttribute('aria-pressed','true');
  await save.click();
  await expect(page.locator('#weatherToast button')).toHaveText('Undo');
  await page.locator('#weatherToast button').click();
  await expect(save).toHaveAttribute('aria-pressed','true');
});

test('browser Back closes a forecast sheet then city, and reload restores city', async ({page}) => {
  await stubWeather(page,null);
  await page.goto('/');
  await page.locator('#weatherList .weather-row').filter({hasText:'Tokyo'}).first().click();
  await expect(page).toHaveURL(/lat=/);
  await page.reload();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherModules [data-sheet="conditions"]').click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await page.goBack();
  await expect(page.locator('#weatherSheet')).toBeHidden();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.goBack();
  await expect(page.locator('#weatherDetail')).toBeHidden();
});

test('hourly date switcher preserves temperature mode and changes the chart date', async ({page}, testInfo) => {
  await stubWeather(page,null);
  await page.goto('/?city=tokyo');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherModules [data-sheet="conditions"]').click();
  await page.locator('#weatherSheetBody [data-temp-mode="feels"]').click();
  const dates = page.locator('[data-hourly-date]');
  await expect(dates).toHaveCount(10);
  const date = await dates.nth(1).getAttribute('data-hourly-date');
  await dates.nth(1).click();
  await expect(page.locator(`[data-hourly-date="${date}"]`)).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#weatherSheetBody [data-temp-mode="feels"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#weatherSheetBody .wx-sheet-intelligence')).toContainText('Daily range');
  await expect(page.locator('#weatherSheetBody .wx-sheet-intelligence')).not.toContainText('Today');
  const points = JSON.parse(await page.locator('#weatherSheetBody .weather-chart-wrap').getAttribute('data-pts'));
  expect(points.length).toBeGreaterThan(1);
  await page.locator('#weatherSheetPanel').evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {}))));
  await page.screenshot({path:testInfo.outputPath('date-picker.png')});
});

test('Horizon filters places without adding comparison controls or replacing the selected view', async ({page}) => {
  await stubWeather(page,null);
  await page.goto('/');
  await page.locator('#weatherRegion').selectOption('Europe');
  await expect(page.locator('#weatherList')).toContainText('London');
  await expect(page.locator('#weatherList')).not.toContainText('Tokyo');
  await expect(page.locator('.weather-row-manage, #weatherCompare')).toHaveCount(0);
  await page.locator('#weatherSort').selectOption('temperature');
  await expect(page.locator('#weatherRefresh')).not.toHaveAttribute('aria-busy','true');
  const temperatures = await page.locator('#weatherList .weather-row-temp').allTextContents();
  const values = temperatures.map(value => parseFloat(value));
  expect(values.every(Number.isFinite)).toBe(true);
  expect(values).toEqual(values.slice().sort((a,b) => b-a));
  await expect(page.locator('#weatherModeSwitch [data-weather-mode="horizon"]')).toHaveAttribute('aria-pressed','true');
});

test('greeting resolves to normal text after animation and remains readable after resize', async ({page}) => {
  await stubWeather(page,null);
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await expect(page.locator('#weatherGreeting')).not.toHaveAttribute('data-typing','true',{timeout:5000});
  await page.setViewportSize({width:1440,height:1000});
  await expect(page.locator('#weatherGreetingText .weather-typewriter-word')).toHaveCount(0);
  expect(await page.locator('#weatherGreetingText').textContent()).toBe(await page.locator('#weatherGreeting').getAttribute('aria-label'));
});

test('international shared links check alerts with a visible loader and can retry a failed check', async ({page}) => {
  await stubWeather(page,null);
  let calls = 0;
  let country = '';
  await page.route(/\/api\/international-alerts/, async route => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('cc') !== 'FR') return route.fulfill({json:{availability:'available',alerts:[],truncated:false}});
    country = url.searchParams.get('country');
    const attempt = ++calls;
    await new Promise(resolve => setTimeout(resolve,650));
    if (attempt === 1) return route.fulfill({status:502,json:{error:'upstream_unavailable'}});
    return route.fulfill({json:{availability:'available',provider:'IFRC Alert Hub',country:'France',alerts:[{
      id:'fr-test',event:'Flood warning',severity:'Moderate',ends:new Date(Date.now()+3600000).toISOString(),
      providerName:'IFRC Alert Hub',sourceUrl:'https://vigilance.meteofrance.fr/',
      areas:[{areaDesc:'Paris',polygons:[{valuePolygon:{type:'Polygon',coordinates:[[[2,48],[3,48],[3,49],[2,49],[2,48]]]}}]}]
    }],truncated:false}});
  });
  await page.goto('/?lat=48.85&lon=2.35&name=Paris&cc=FR');
  await expect(page.locator('.weather-alert-status .loader')).toBeVisible();
  await expect(page.locator('[data-alert-retry]')).toBeVisible();
  expect(country).toBe('France');
  await page.locator('[data-alert-retry]').click();
  await expect(page.locator('.weather-alert-status .loader')).toBeVisible();
  await expect(page.locator('.weather-alert-title')).toContainText('Flood warning');
  const panel = page.locator('.weather-alert-collapse');
  await expect(panel).toHaveAttribute('aria-hidden','true');
  await page.locator('.weather-alert-summary').click();
  await expect(panel).toHaveAttribute('aria-hidden','false');
});

test('mode switch selects the new view first and visibly presents progress', async ({page}) => {
  await stubWeather(page,null);
  await page.goto('/');
  await page.locator('[data-weather-mode="my-sky"]').click();
  await expect(page.locator('[data-weather-mode="my-sky"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#navbar #weatherModeLoading')).toBeVisible();
  await expect(page.locator('#weatherModeLoading')).toHaveAttribute('role','progressbar');
  await expect(page.locator('#weatherModeLoading')).toHaveCSS('height','2px');
  await expect(page.locator('.weather-status-row #weatherModeLoading')).toHaveCount(0);
  await expect(page.locator('#weatherMajorsBlock')).toBeHidden();
  await expect(page.locator('#weatherMySkyEmpty')).toBeVisible();
  await expect(page.locator('#weatherModeLoading')).toBeHidden();
});

test('expanded Horizon collapses to preview with only its show-all action', async ({page}) => {
  await stubWeather(page,null);
  await page.goto('/');
  await page.locator('#weatherMore').click();
  await expect(page.locator('#weatherCollapse')).toBeVisible();
  await page.locator('#weatherCollapse').click();
  await expect(page.locator('#weatherCollapse')).toBeHidden();
  await expect(page.locator('#weatherMore')).toBeVisible();
  await expect(page.locator('#weatherList .weather-row')).toHaveCount(6);
});

test('desktop cards match row heights and light hover keeps a readable surface', async ({page}) => {
  await stubWeather(page,null);
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/?city=tokyo');
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  const aqi = page.locator('#weatherModules [data-sheet="aqi"]');
  const feels = page.locator('#weatherModules [data-sheet="feels"]');
  await expect(aqi).toBeVisible();
  await expect(feels).toBeVisible();
  await aqi.scrollIntoViewIfNeeded();
  const [a,b] = await Promise.all([aqi.boundingBox(),feels.boundingBox()]);
  expect(Math.abs(a.height-b.height)).toBeLessThanOrEqual(1);
  await aqi.hover();
  const background = await aqi.evaluate(node => getComputedStyle(node).backgroundColor);
  expect(background).not.toBe('rgba(0, 0, 0, 0)');
});

test('My Sky keeps a compact primary dashboard and one quiet list with rearrangement in preferences', async ({page}, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('duskline-weather-mode','my-sky');
    localStorage.setItem('duskline-weather-greeting-city',JSON.stringify({name:'Boston',lat:42.36,lon:-71.06,tz:'America/New_York',country:'United States',country_code:'US'}));
    localStorage.setItem('duskline-weather-favorites',JSON.stringify([
      {name:'London',lat:51.5074,lon:-.1278,tz:'Europe/London',country:'United Kingdom',country_code:'GB'},
      {name:'Tokyo',lat:35.6762,lon:139.6503,tz:'Asia/Tokyo',country:'Japan',country_code:'JP'}
    ]));
  });
  await stubWeather(page,null);
  await page.goto('/');
  await expect(page.locator('#weatherHome .weather-home-temperature')).toBeVisible();
  await expect(page.locator('#weatherHome .weather-hourly-item').first()).toBeVisible();
  await expect(page.locator('#weatherHome .weather-daily-row')).toHaveCount(5);
  await expect(page.locator('#weatherMyLocationList .weather-row')).toHaveCount(2);
  await expect(page.locator('#weatherMyLocationBlock .weather-section-label, .weather-row-manage, .weather-row-save')).toHaveCount(0);
  await page.locator('#weatherUnitsBtn').click();
  await expect(page.locator('.weather-place-order-row')).toHaveCount(2);
  await page.locator('.weather-place-order-row').first().locator('button').last().click();
  await page.locator('#weatherSheetClose').click();
  await expect(page.locator('#weatherMyLocationList .weather-row').first()).toContainText('Tokyo');
  await page.setViewportSize({width:1440,height:1000});
  await page.screenshot({path:testInfo.outputPath('my-sky-desktop.png'),fullPage:true});
  for (const width of [320,390,768]) {
    await page.setViewportSize({width,height:844});
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await expect(page.locator('#weatherHome [data-home-open]')).toBeVisible();
    await expect(page.locator('#weatherHome .weather-hourly-item')).toHaveCount(8);
    if (width < 420) {
      const hours = page.locator('#weatherHome .weather-hourly');
      await hours.focus(); await hours.press('ArrowRight');
      await expect.poll(() => hours.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:testInfo.outputPath('my-sky-phone.png'),fullPage:true});
});


test('rapid sheet and city dismissal returns to the list without reopening detail', async ({page}) => {
  await stubWeather(page,null);
  await page.goto('/');
  await page.locator('#weatherList .weather-row').first().click();
  await page.locator('#weatherModules [data-sheet="conditions"]').click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await page.locator('[data-hourly-date]').nth(1).click();
  await page.locator('[data-temp-mode="feels"]').click();
  await page.evaluate(() => {
    document.querySelector('#weatherSheetClose').click();
    document.querySelector('#weatherDetailBack').click();
  });
  await expect(page).not.toHaveURL(/lat=/);
  await expect(page.locator('#weatherDetail')).toBeHidden();
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible();
  await expect(page.locator('#weatherList .weather-row').first()).toBeFocused();
});


test('primary forecast failure stops loading and can be retried', async ({page}) => {
  await page.addInitScript(() => {
    localStorage.setItem('duskline-weather-mode','my-sky');
    localStorage.setItem('duskline-weather-greeting-city',JSON.stringify({name:'Boston',lat:42.36,lon:-71.06,country:'United States',country_code:'US'}));
  });
  await stubWeather(page,null);
  let failed = true;
  await page.route(/api\.weather\.gov|api\.open-meteo\.com/, route => failed ? route.fulfill({status:503,json:{error:true}}) : route.fallback());
  await page.goto('/');
  await expect(page.locator('#weatherHome [data-home-retry]')).toBeVisible();
  await expect(page.locator('#weatherHome .loader')).toHaveCount(0);
  failed = false;
  await page.locator('[data-home-retry]').click();
  await expect(page.locator('#weatherHome .weather-home-temperature')).toBeVisible();
  await expect(page.locator('#weatherHome .weather-home-temperature')).not.toHaveText('—');
});


test('a current-provider outage uses NWS hourly temperature instead of its daily high', async ({page}) => {
  await stubWeather(page,null);
  await page.route(/api\.open-meteo\.com/, route => route.fulfill({status:503,json:{error:true}}));
  await page.route(/api\.weather\.gov/, route => {
    const url = route.request().url();
    if (url.includes('alerts')) return route.fulfill({json:{features:[]}});
    if (url.includes('/points/')) return route.fulfill({json:{properties:{timeZone:'America/New_York',forecast:'https://api.weather.gov/gridpoints/TEST/1,1/forecast',forecastHourly:'https://api.weather.gov/gridpoints/TEST/1,1/forecast/hourly'}}});
    const period = {number:1,startTime:new Date().toISOString(),endTime:new Date(Date.now()+3600000).toISOString(),isDaytime:true,temperatureUnit:'F',temperature:url.endsWith('/hourly') ? 68 : 86,shortForecast:'Partly Sunny',windSpeed:'5 mph',windDirection:'SW'};
    return route.fulfill({json:{properties:{periods:[period]}}});
  });
  await page.goto('/');
  const temperature = page.locator('#weatherList .weather-row').filter({hasText:'New York'}).first().locator('.weather-row-temp');
  await expect(temperature).toHaveText(/^(20|68)°$/);
});

test('search deduplicates equivalent places and cancels superseded requests', async ({page}) => {
  await stubWeather(page,null);
  let aborted = false;
  await page.route(/geocoding-api\.open-meteo\.com/, async route => {
    const name = new URL(route.request().url()).searchParams.get('name');
    if (name === 'slow') {
      page.on('requestfailed', request => {if (request.url().includes('name=slow')) aborted = true;});
      await new Promise(resolve => setTimeout(resolve,800));
      return route.fulfill({json:{results:[]}}).catch(() => {});
    }
    const place = {name:'Paris',latitude:48.8566,longitude:2.3522,country:'France',country_code:'FR',timezone:'Europe/Paris'};
    await route.fulfill({json:{results:[place,{...place,admin1:'Île-de-France'}]}});
  });
  await page.goto('/');
  const search = page.locator('#weatherSearch');
  const slowRequest = page.waitForRequest(/name=slow/);
  await search.fill('slow');
  await expect(page.locator('#weatherSuggest .s-loading')).toBeVisible();
  await slowRequest;
  await search.fill('Paris');
  await expect(page.locator('#weatherSuggest [data-place-choice]')).toHaveCount(1);
  await expect(page.locator('#weatherSuggest')).toContainText('Île-de-France');
  await expect.poll(() => aborted).toBe(true);
});

test('failed primary city selection keeps the previous city and offers a retry', async ({page}) => {
  const previous = {name:'Boston',lat:42.36,lon:-71.06,tz:'America/New_York',country:'United States',country_code:'US'};
  await page.addInitScript(city => {
    localStorage.setItem('duskline-weather-mode','my-sky');
    localStorage.setItem('duskline-weather-greeting-city',JSON.stringify(city));
    localStorage.setItem('duskline-weather-greeting-source','city:42.360,-71.060');
  },previous);
  await stubWeather(page,null);
  await page.route(/geocoding-api\.open-meteo\.com/, route => route.fulfill({json:{results:[{name:'Paris',latitude:48.8566,longitude:2.3522,country:'France',country_code:'FR',timezone:'Europe/Paris'}]}}));
  await page.goto('/');
  await expect(page.locator('#weatherHome .weather-home-temperature')).toBeVisible();
  await page.locator('#weatherGreetingPlace').click();
  await page.locator('.weather-greeting-source-search').click();
  await page.route(/^https:\/\/(api\.weather\.gov|api\.open-meteo\.com)\//, route => route.abort());
  await page.locator('#weatherSearch').fill('Paris');
  await page.locator('#weatherSuggest [data-place-choice]').click();
  await expect(page.locator('#weatherError')).toBeVisible();
  await expect(page.locator('#weatherError button')).toHaveText('Retry');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('duskline-weather-greeting-city')));
  expect(saved.name).toBe('Boston');
  expect(await page.evaluate(() => localStorage.getItem('duskline-weather-greeting-source'))).toBe('city:42.360,-71.060');
});

test('primary preview stays within the viewport across sizes and opens its selected forecast date', async ({page},testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('duskline-weather-mode','my-sky');
    localStorage.setItem('duskline-weather-greeting-city',JSON.stringify({name:'A very long coastal city name',lat:21.3,lon:-157.8,tz:'Pacific/Honolulu',country:'United States',country_code:'US'}));
  });
  await stubWeather(page,null);
  await page.goto('/');
  await expect(page.locator('#weatherHome .weather-daily-row')).toHaveCount(5);
  for (const width of [320,390,480,640,719,720,768,860,861,960,1024,1280,1440,1920]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const geometry = await page.locator('#weatherHome').evaluate(card => {
      const parts = [...card.querySelectorAll('.weather-home-reading,.weather-home-description,.weather-home-hours,.weather-home-daily')];
      const bounds = card.getBoundingClientRect();
      return {width:bounds.width,inside:parts.every(part=>{const r=part.getBoundingClientRect();return r.left>=bounds.left&&r.right<=bounds.right;})};
    });
    expect(geometry.width).toBeLessThanOrEqual(1000);
    expect(await page.locator('#weatherHome .weather-hourly').evaluate(strip=>getComputedStyle(strip).display)).toBe(width >= 1024 ? 'grid' : 'flex');
    expect(geometry.inside).toBe(true);
    expect(await page.locator('#weatherHome .weather-hourly').evaluate(strip => {
      const bounds = strip.getBoundingClientRect();
      return [...strip.querySelectorAll('.p')].every(label=>label.getBoundingClientRect().bottom <= bounds.bottom);
    })).toBe(true);
    if ([390,768,1440].includes(width)) await page.screenshot({path:testInfo.outputPath('primary-'+width+'.png'),fullPage:true});
  }
  const day = page.locator('#weatherHome [data-day-date]').nth(2);
  const date = await day.getAttribute('data-day-date');
  await day.click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await expect(page.locator('#weatherSheet [data-hourly-date][aria-pressed="true"]')).toHaveAttribute('data-hourly-date',date);
});

test('top route indicator handles rapid switches and reduced motion without shifting content', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await stubWeather(page,null);
  await page.goto('/');
  const top = await page.locator('.weather-toolbar').evaluate(el=>el.getBoundingClientRect().top);
  await page.locator('[data-weather-mode="my-sky"]').click();
  await expect(page.locator('#weatherModeLoading')).toBeVisible();
  expect(await page.locator('.weather-toolbar').evaluate(el=>el.getBoundingClientRect().top)).toBe(top);
  expect(await page.locator('#weatherModeLoading').evaluate(el=>getComputedStyle(el,'::after').animationName)).toBe('none');
  await page.locator('[data-weather-mode="horizon"]').click();
  await expect(page.locator('[data-weather-mode="horizon"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#weatherModeLoading')).toBeHidden();
  await expect(page.locator('#weatherModeSwitch')).not.toHaveAttribute('aria-busy','true');
});
