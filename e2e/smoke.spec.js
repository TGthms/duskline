const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.route(/api\.weather\.gov|api\.open-meteo\.com|air-quality-api\.open-meteo\.com|geocoding-api\.open-meteo\.com/, async route => {
    const url = route.request().url();
    if (url.includes('geocoding')) return route.fulfill({ json: { results: [{ name: 'Boston', latitude: 42.36, longitude: -71.06, admin1: 'Massachusetts', country: 'United States', country_code: 'US', timezone: 'America/New_York' }] } });
    if (url.includes('alerts')) return route.fulfill({ json: { features: [] } });
    if (url.includes('points')) return route.fulfill({ json: { properties: { gridId: 'OKX', gridX: 33, gridY: 37, timeZone: 'America/New_York', forecast: 'https://api.weather.gov/gridpoints/OKX/33,37/forecast', forecastHourly: 'https://api.weather.gov/gridpoints/OKX/33,37/forecast/hourly' } } });
    if (url.includes('air-quality')) return route.fulfill({ json: { current: { us_aqi: 42, pm2_5: 8, pm10: 12, european_aqi: 30 } } });
    const times = Array.from({ length: 24 }, (_, i) => new Date(Date.now() + i * 3600000).toISOString());
    return route.fulfill({ json: { latitude: 42.36, longitude: -71.06, timezone: 'America/New_York', current: { time: times[0], temperature_2m: 22, apparent_temperature: 21, relative_humidity_2m: 55, weather_code: 2, wind_speed_10m: 3.5, wind_direction_10m: 220, surface_pressure: 1012, visibility: 10000, precipitation: 0 }, hourly: { time: times, temperature_2m: times.map(() => 22), apparent_temperature: times.map(() => 21), weather_code: times.map(() => 2), precipitation_probability: times.map(() => 10), precipitation: times.map(() => 0), wind_speed_10m: times.map(() => 3), wind_direction_10m: times.map(() => 200), relative_humidity_2m: times.map(() => 50), surface_pressure: times.map(() => 1012), uv_index: times.map(() => 3) }, daily: { time: times.slice(0, 10).map(t => t.slice(0, 10)), weather_code: times.slice(0, 10).map(() => 2), temperature_2m_max: times.slice(0, 10).map(() => 26), temperature_2m_min: times.slice(0, 10).map(() => 14), sunrise: times.slice(0, 10), sunset: times.slice(0, 10), uv_index_max: times.slice(0, 10).map(() => 6), precipitation_sum: times.slice(0, 10).map(() => 0), precipitation_probability_max: times.slice(0, 10).map(() => 20) } } });
  });
});

test('loads the branded weather shell and all locales', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/duskline/);
  await expect(page.locator('#weatherSearch')).toBeVisible();
  await expect(page.locator('#dusklineLanguage option')).toHaveCount(30);
  await page.locator('#dusklineLanguage').selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('renders mocked weather and opens detail', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherDetailBack').click();
  await expect(page.locator('#weatherDetail')).not.toHaveClass(/open/);
});

test('selects Portuguese Brazil and Traditional Chinese', async ({ page }) => {
  await page.goto('/');
  await page.locator('#dusklineLanguage').selectOption('pt-BR');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await page.locator('#dusklineLanguage').selectOption('zh-TW');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('privacy page loads and can switch language chrome', async ({ page }) => {
  await page.goto('/privacy.html');
  await expect(page.locator('[data-legal="title"]')).toBeVisible();
  await page.locator('#dusklineLegalLanguage').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('[data-legal="english-note"]')).toBeVisible();
});

test('units sheet opens', async ({ page }) => {
  await page.goto('/');
  await page.locator('#weatherUnitsBtn').click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await expect(page.locator('#wxTempUnits')).toBeVisible();
  await page.locator('#weatherSheetClose').click();
  await expect(page.locator('#weatherSheet')).not.toHaveClass(/open/);
});

test('search suggestions are keyboardable', async ({ page }) => {
  await page.goto('/');
  const search = page.locator('#weatherSearch');
  await search.fill('Bo');
  await expect(page.locator('#weatherSuggest button[role="option"]').first()).toBeVisible({ timeout: 10000 });
  await search.press('ArrowDown');
  await expect(page.locator('#weatherSuggest button[role="option"]').first()).toHaveAttribute('aria-selected', 'true');
});

test('non-US featured cities do not call NWS', async ({ page }) => {
  const nws = [];
  page.on('request', (req) => {
    if (req.url().includes('api.weather.gov')) nws.push(req.url());
  });
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1500);
  const tokyoHits = nws.filter((u) => /35\.67|139\.65/.test(u));
  expect(tokyoHits, nws.join('\n')).toEqual([]);
});
