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
    const days = Array.from({ length: 11 }, (_, i) => {
      const d = new Date(Date.now() + (i - 1) * 86400000);
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);
    });
    return route.fulfill({ json: { latitude: 42.36, longitude: -71.06, timezone: 'America/New_York', current: { time: times[0], temperature_2m: 22, apparent_temperature: 21, relative_humidity_2m: 55, weather_code: 2, wind_speed_10m: 3.5, wind_direction_10m: 220, surface_pressure: 1012, visibility: 10000, precipitation: 0 }, hourly: { time: times, temperature_2m: times.map(() => 22), apparent_temperature: times.map(() => 21), weather_code: times.map(() => 2), precipitation_probability: times.map(() => 10), precipitation: times.map(() => 0), wind_speed_10m: times.map(() => 3), wind_direction_10m: times.map(() => 200), relative_humidity_2m: times.map(() => 50), surface_pressure: times.map(() => 1012), uv_index: times.map(() => 3) }, daily: { time: days, weather_code: days.map(() => 2), temperature_2m_max: days.map(() => 26), temperature_2m_min: days.map(() => 14), sunrise: days.map((d) => d + 'T06:16:00'), sunset: days.map((d) => d + 'T19:24:00'), uv_index_max: days.map(() => 6), precipitation_sum: days.map(() => 0), precipitation_probability_max: days.map(() => 20) } } });
  });
});

test('home page exposes Search Console verification and SEO head', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="google-site-verification"]')).toHaveAttribute(
    'content',
    '0rE0QD0vWPSfPxelCpS8qL2_n3JGrd_ZYPJBaGwnLZQ'
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://duskline.pages.dev/');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('loads the branded weather shell and all locales', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/duskline/);
  await expect(page.locator('#weatherSearch')).toBeVisible();
  await expect(page.locator('#dusklineLanguage option')).toHaveCount(30);
  await page.locator('#dusklineLanguage').selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('long list location names stay on one line and keep high/low visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const row = page.locator('#weatherList .weather-row').first();
  await expect(row).toBeVisible({ timeout: 15000 });
  await row.evaluate((el) => {
    const name = el.querySelector('.weather-row-city-name');
    if (name) name.textContent = 'Livermore-Pleasanton';
    const meta = el.querySelector('.weather-row-meta');
    if (meta) meta.textContent = '3:29 PM · California, United States of America';
  });
  const city = row.locator('.weather-row-city');
  const hl = row.locator('.weather-row-hl');
  await expect(hl).toBeVisible();
  const [rowBox, cityBox, nameBox, tempBox, hlBox] = await Promise.all([
    row.boundingBox(),
    city.boundingBox(),
    row.locator('.weather-row-city-name').boundingBox(),
    row.locator('.weather-row-temp').boundingBox(),
    hl.boundingBox()
  ]);
  expect(nameBox.height).toBeLessThan(36);
  expect(cityBox.x + cityBox.width).toBeLessThanOrEqual(tempBox.x + 2);
  expect(hlBox.y + hlBox.height).toBeLessThanOrEqual(rowBox.y + rowBox.height + 1);
});

test('weather loading uses a sliding bar, not dashes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });

  const appJs = await page.request.get('/src/js/features/weather/app.js');
  expect(appJs.ok()).toBeTruthy();
  const src = await appJs.text();
  expect(src).toMatch(/weather-row-temp--loading[\s\S]*?class="loader"/);
  expect(src).not.toMatch(/weather-row-temp--loading[^>]*>--</);
  expect(src).toMatch(/openDetailLoading[\s\S]*?class="loader"/);

  // Measure CSS on a probe outside the list — live rows are replaced on refresh.
  await page.evaluate(() => {
    const host = document.createElement('div');
    host.id = 'wx-loader-probe';
    host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;';
    host.innerHTML = '<div class="weather-row-temp weather-row-temp--loading"><span class="loader" aria-hidden="true"></span></div>';
    document.body.appendChild(host);
  });
  const loader = page.locator('#wx-loader-probe .loader');
  await expect(loader).toBeVisible();
  const box = await loader.boundingBox();
  expect(box.width).toBeGreaterThan(80);
  expect(box.height).toBeGreaterThan(3);
  expect(box.height).toBeLessThan(16);
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

test('privacy page uses the home language picker and full translations', async ({ page }) => {
  await page.goto('/privacy.html');
  await expect(page.locator('#dusklineLanguage option')).toHaveCount(30);
  await expect(page.locator('[data-i18n="legal.privacy.title"]')).toHaveText('Privacy Policy');
  await page.locator('#dusklineLanguage').selectOption('fr');
  await expect(page.locator('[data-i18n="legal.privacy.title"]')).toHaveText('Politique de confidentialité');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr-FR');
  await expect(page.locator('[data-i18n="legal.privacy.p1"]')).toContainText('ni comptes');
  await expect(page.locator('[data-legal="english-note"]')).toHaveCount(0);
  await page.locator('#dusklineLanguage').selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('[data-i18n="legal.privacy.title"]')).toHaveText('سياسة الخصوصية');
});

test('terms page translates body copy for every picker language', async ({ page }) => {
  await page.goto('/terms.html');
  await expect(page.locator('#dusklineLanguage option')).toHaveCount(30);
  const codes = await page.locator('#dusklineLanguage option').evaluateAll((opts) => opts.map((el) => el.value));
  for (const code of codes) {
    await page.locator('#dusklineLanguage').selectOption(code);
    const title = (await page.locator('[data-i18n="legal.terms.title"]').textContent() || '').trim();
    const body = (await page.locator('[data-i18n="legal.terms.p1"]').textContent() || '').trim();
    expect(title.length, `terms title empty for ${code}`).toBeGreaterThan(2);
    expect(body.length, `terms body empty for ${code}`).toBeGreaterThan(20);
  }
  await page.locator('#dusklineLanguage').selectOption('ja');
  await expect(page.locator('[data-i18n="legal.terms.title"]')).toHaveText('利用規約');
});

test('units sheet opens', async ({ page }) => {
  await page.goto('/');
  await page.locator('#weatherUnitsBtn').click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await expect(page.locator('#wxTempUnits')).toBeVisible();
  await page.locator('#weatherSheetClose').click();
  await expect(page.locator('#weatherSheet')).not.toHaveClass(/open/, { timeout: 4000 });
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

test('NWS outage still renders via Open-Meteo', async ({ page }) => {
  await page.route(/api\.weather\.gov/, (route) => route.fulfill({ status: 500, body: 'unavailable' }));
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
});

test('favorite persists across reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherDetailFav').click();
  await expect(page.locator('#weatherDetailFav')).toHaveAttribute('aria-pressed', 'true');
  const favRaw = await page.evaluate(() => localStorage.getItem('duskline-weather-favorites'));
  expect(favRaw).toBeTruthy();
  await page.addInitScript((raw) => {
    try { localStorage.setItem('duskline-weather-favorites', raw); } catch (e) { /* ignore */ }
  }, favRaw);
  await page.reload();
  await expect(page.locator('#weatherFavoritesList .weather-row').first()).toBeVisible({ timeout: 15000 });
});

test('detail sky mounts layered weather ornaments', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await expect(page.locator('#weatherDetailSky .wx-ornaments')).toBeVisible();
  await expect(page.locator('#weatherDetailFx .wx-rain-near')).toHaveCount(1);
  await expect(page.locator('#weatherDetailSky .wx-fog')).toHaveCount(3);
});

test('sun tile is compact on a normal card and rich when wide', async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  const sun = page.locator('.weather-mod[data-sheet="sun"]');
  await expect(sun).toBeVisible();
  await expect(sun.locator('.wx-sun-tile-compact')).toBeVisible();
  await expect(sun.locator('.wx-sun-tile-wide')).toBeHidden();
  await expect(sun.locator('.weather-mod-label')).toBeVisible();

  await page.setViewportSize({ width: 1400, height: 900 });
  await expect(sun.locator('.wx-sun-tile-wide')).toBeVisible();
  await expect(sun.locator('.wx-sun-tile-compact')).toBeHidden();
  await expect(sun.locator('.weather-sun-arc--tile')).toBeVisible();
  await expect(sun.locator('.wx-sun-tile-stats')).toBeVisible();
});

test('daily forecast is 10 days when the API provides them', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await expect(page.locator('.weather-daily-row')).toHaveCount(10);
  await expect(page.locator('.weather-mod-wide .weather-mod-label').filter({ hasText: /10-Day Forecast/ })).toBeVisible();
});

test('mobile sheet close is top-right and short sheets stay short', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);

  await page.locator('.weather-mod[data-sheet="uv"]').click();
  const sheet = page.locator('#weatherSheet');
  const close = page.locator('#weatherSheetClose');
  const panel = page.locator('#weatherSheetPanel');
  await expect(sheet).toHaveClass(/open/);
  await expect(close).toBeVisible();
  await expect.poll(async () => {
    const box = await close.boundingBox();
    return box && box.y > 8 && box.y < 400;
  }).toBeTruthy();
  const [closeBox, panelBox] = await Promise.all([close.boundingBox(), panel.boundingBox()]);
  expect(closeBox.x).toBeGreaterThan(panelBox.x + panelBox.width / 2);
  const uvH = panelBox.height;
  expect(uvH).toBeLessThan(page.viewportSize().height * 0.95);

  await close.click({ force: true });
  await expect(sheet).not.toHaveClass(/open/, { timeout: 4000 });

  await page.locator('.weather-mod[data-sheet="vis"]').click();
  await expect(sheet).toHaveClass(/open/);
  const visH = (await panel.boundingBox()).height;
  expect(visH).toBeLessThan(uvH);
});

test('French sun-sheet strings are translated', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('duskline-lang', 'fr'));
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('.weather-mod[data-sheet="sun"]').click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await expect(page.locator('#weatherSheetBody')).toContainText(/Premières lueurs|Durée du jour|Lever du soleil/);
});
