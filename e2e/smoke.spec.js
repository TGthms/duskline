const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('__duskline_test_storage_cleared')) {
      localStorage.clear();
      sessionStorage.setItem('__duskline_test_storage_cleared', '1');
    }
  });
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
  await page.route(/api\.bigdatacloud\.net/, route => route.fulfill({
    json: { locality: 'Portland', principalSubdivision: 'Oregon', countryName: 'United States', countryCode: 'US' }
  }));
});

test('home page exposes Search Console verification and SEO head', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="google-site-verification"]')).toHaveAttribute(
    'content',
    '0rE0QD0vWPSfPxelCpS8qL2_n3JGrd_ZYPJBaGwnLZQ'
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://dusklineweather.pages.dev/');
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'duskline');
  await expect(page.locator('link[rel="icon"][href="/favicon.ico"]')).toHaveCount(1);
  const favicon = await page.request.get('/favicon.ico');
  expect(favicon.ok()).toBeTruthy();
  expect(favicon.headers()['content-type']).toMatch(/image\/(x-icon|vnd\.microsoft\.icon|png)/);
  const bytes = Buffer.from(await favicon.body());
  expect(bytes.subarray(0, 4).toString('hex')).toBe('00000100');
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  const nodes = Array.isArray(jsonLd['@graph']) ? jsonLd['@graph'] : [jsonLd];
  const website = nodes.find((n) => n['@type'] === 'WebSite');
  expect(website.name).toBe('duskline');
  expect(website.url).toBe('https://dusklineweather.pages.dev/');
  expect(website.alternateName).toEqual(expect.arrayContaining(['duskline weather', 'dusklineweather.pages.dev']));
  await expect(page.locator('h1')).toHaveCount(1);
});

test('search combobox has an accessible name', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#weatherSearch')).toHaveAttribute('aria-labelledby', 'weatherSearchLabel');
  await expect(page.locator('#weatherError')).toHaveAttribute('role', 'alert');
});

test('loads the branded weather shell and all locales', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveClass(/duskline/);
  await expect(page.locator('#weatherSearch')).toBeVisible();
  await expect(page.locator('#dusklineLanguage option')).toHaveCount(30);
  await page.locator('#dusklineLanguage').selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('a chosen My Sky city becomes the personal place and survives reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });

  await page.locator('[data-weather-mode="my-sky"]').click();
  await expect(page.locator('#weatherMySkyEmpty')).toBeVisible();
  await page.locator('#weatherMySkySearch').click();
  await expect(page.locator('#weatherModeSwitch [data-weather-mode="my-sky"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#weatherSearch').fill('Boston');
  const cityOption = page.getByRole('option', { name: 'Boston Massachusetts, United States' });
  await expect(cityOption).toBeVisible({ timeout: 10000 });
  await cityOption.click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  await page.locator('#weatherDetailBack').click();

  await expect(page.locator('#weatherMyLocationBlock')).toBeVisible();
  await expect(page.locator('#weatherMyLocationList')).toContainText('Boston');
  await expect(page.locator('#weatherGreeting')).toHaveAttribute('aria-label', /Boston/);

  await page.reload();
  await expect(page.locator('#weatherModeSwitch [data-weather-mode="my-sky"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#weatherMyLocationList')).toContainText('Boston', { timeout: 15000 });
  await expect(page.locator('#weatherGreeting')).toHaveAttribute('aria-label', /Boston/);
});

test('a successful location fix opens My Sky and shows the user’s place', async ({ page }) => {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 45.5152, longitude: -122.6784 });
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });

  await page.locator('#weatherLocate').click();
  await expect(page.locator('#weatherModeSwitch [data-weather-mode="my-sky"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#weatherMyLocationList')).toContainText('Portland', { timeout: 20000 });
  await expect(page.locator('#weatherGreeting')).toHaveAttribute('aria-label', /Portland/, { timeout: 15000 });
});

test('Traditional Chinese keeps a known city name out of Simplified script', async ({ page }) => {
  await page.goto('/');
  await page.locator('#dusklineLanguage').selectOption('zh-TW');
  await page.evaluate(() => {
    localStorage.setItem('duskline-weather-mode', 'my-sky');
    localStorage.setItem('duskline-weather-greeting-city', JSON.stringify({
      name: '旧金山', admin1: 'California', lat: 37.7749, lon: -122.4194,
      tz: 'America/Los_Angeles', country: 'United States', country_code: 'US',
      names: { en: '旧金山', 'zh-TW': '旧金山' }
    }));
  });
  await page.reload();
  await expect(page.locator('#weatherGreeting')).toHaveAttribute('aria-label', /San Francisco/, { timeout: 15000 });
  await expect(page.locator('#weatherMyLocationList')).toContainText('局部多雲', { timeout: 15000 });
});

test('My Sky does not surface a daytime UV warning at night', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeDate = Date;
    const now = new NativeDate();
    const values = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23'
    }).formatToParts(now).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
    const asUtc = Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second);
    const zoneOffset = asUtc - now.getTime();
    const frozenTime = Date.UTC(values.year, values.month - 1, values.day, 2, 0, 0) - zoneOffset;
    class FrozenDate extends NativeDate {
      constructor(...args) { super(...(args.length ? args : [frozenTime])); }
      static now() { return frozenTime; }
    }
    window.Date = FrozenDate;
    localStorage.setItem('duskline-weather-mode', 'my-sky');
    localStorage.setItem('duskline-weather-myloc', JSON.stringify({
      name: 'Boston', admin1: 'Massachusetts', lat: 42.36, lon: -71.06,
      tz: 'America/New_York', country: 'United States', country_code: 'US',
      isMyLocation: true, locatedAt: frozenTime
    }));
  });
  await page.goto('/');
  await expect(page.locator('#weatherMyLocationList')).toContainText('Boston', { timeout: 15000 });
  const locationRow = page.locator('#weatherMyLocationList .weather-row').first();
  await expect(locationRow.locator('.weather-row-temp')).not.toHaveClass(/weather-row-temp--loading/, { timeout: 20000 });
  await expect(locationRow.locator('.weather-row-temp')).not.toHaveText('—');
  await expect(page.locator('#weatherGreeting')).toHaveAttribute('aria-label', /Good night.*°.*Boston/, { timeout: 20000 });
  await expect(page.locator('#weatherGreeting')).toHaveAttribute('aria-label', /Tomorrow:/);
  await expect(page.locator('#weatherGreeting')).not.toHaveAttribute('aria-label', /\bUV\b|sun protection/i);
});

test('Change My Sky city follows My Location by default, can use a saved city, and persists', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('duskline-weather-mode', 'my-sky');
    localStorage.setItem('duskline-weather-myloc', JSON.stringify({
      name: 'Portland', admin1: 'Oregon', lat: 45.52, lon: -122.68,
      country: 'United States', country_code: 'US', isMyLocation: true, locatedAt: Date.now()
    }));
    // A chosen fallback may be the same point as the device fix; it must keep
    // the distinct My Location label in the picker rather than being promoted.
    localStorage.setItem('duskline-weather-greeting-city', JSON.stringify({
      name: 'Portland', admin1: 'Oregon', lat: 45.52, lon: -122.68,
      country: 'United States', country_code: 'US'
    }));
    localStorage.setItem('duskline-weather-favorites', JSON.stringify([{
      name: 'Boston', admin1: 'Massachusetts', lat: 42.36, lon: -71.06,
      country: 'United States', country_code: 'US'
    }]));
  });
  await page.reload();
  await expect(page.locator('#weatherGreetingPlace')).toBeVisible();
  await expect(page.locator('#weatherGreetingPlace')).toHaveText('Change My Sky city');
  await expect(page.locator('#weatherModeSwitch [data-weather-mode="my-sky"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#weatherGreeting')).toHaveAttribute('aria-label', /Portland/, { timeout: 15000 });

  await page.locator('#weatherGreetingPlace').click();
  const locationRadio = page.getByRole('radio', { name: /Portland, My location/i });
  const bostonRadio = page.getByRole('radio', { name: /Boston, Massachusetts, United States/i });
  await expect(locationRadio).toHaveAttribute('aria-checked', 'true');
  await expect(bostonRadio).toHaveAttribute('aria-checked', 'false');
  await bostonRadio.click();
  await expect(page.locator('#weatherGreeting')).toHaveAttribute('aria-label', /Boston/, { timeout: 10000 });

  await page.locator('[data-weather-mode="horizon"]').click();
  await expect(page.locator('#weatherGreetingPlace')).toBeHidden();
  await page.locator('[data-weather-mode="my-sky"]').click();
  await expect(page.locator('#weatherGreetingPlace')).toBeVisible();
  await page.reload();
  await page.locator('#weatherGreetingPlace').click();
  await expect(page.getByRole('radio', { name: /Boston, Massachusetts, United States/i })).toHaveAttribute('aria-checked', 'true');
});

test('greetings reroll on refresh, re-entry, and mode changes', async ({ page }) => {
  await page.addInitScript(() => {
    let next = Number(sessionStorage.getItem('__duskline_greeting_seed') || '100');
    Object.defineProperty(window.crypto, 'getRandomValues', {
      configurable: true,
      value: array => {
        array[0] = next;
        sessionStorage.setItem('__duskline_greeting_seed', String(++next));
        return array;
      }
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const heading = page.locator('#weatherGreeting');
  const visibleCopy = page.locator('#weatherGreetingText');
  await expect(heading).toHaveAttribute('aria-label', /Good (morning|afternoon|evening|night)/);
  let fullCopy = await heading.getAttribute('aria-label');
  await expect(visibleCopy).toHaveText(fullCopy, { timeout: 5000 });
  const firstCopy = fullCopy;

  await page.locator('#weatherRefresh').click();
  await expect(heading).not.toHaveAttribute('aria-label', firstCopy);
  fullCopy = await heading.getAttribute('aria-label');
  await expect(visibleCopy).toHaveText(fullCopy, { timeout: 5000 });
  const refreshedCopy = fullCopy;

  await page.reload();
  await expect(heading).toHaveAttribute('aria-label', /Good (morning|afternoon|evening|night)/);
  fullCopy = await heading.getAttribute('aria-label');
  expect(fullCopy).not.toBe(refreshedCopy);
  await expect(visibleCopy).toHaveText(fullCopy, { timeout: 5000 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const reenteredCopy = fullCopy;
  await page.locator('[data-weather-mode="my-sky"]').click();
  await expect(heading).not.toHaveAttribute('aria-label', reenteredCopy);
  const mySkyCopy = await heading.getAttribute('aria-label');
  await expect(visibleCopy).toHaveText(mySkyCopy, { timeout: 5000 });

  await page.locator('[data-weather-mode="horizon"]').click();
  await expect(heading).not.toHaveAttribute('aria-label', mySkyCopy);
  fullCopy = await heading.getAttribute('aria-label');
  await expect(visibleCopy).toHaveText(fullCopy, { timeout: 5000 });
});

test('checking copy is immediate, then the real greeting types inside a stable layout', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    localStorage.setItem('duskline-weather-mode', 'my-sky');
    localStorage.setItem('duskline-motion', 'full');
  });
  await page.goto('/');
  const heading = page.locator('#weatherGreeting');
  const visibleCopy = page.locator('#weatherGreetingText');
  await expect(heading).toHaveAttribute('aria-label', /choose a city/i);
  await expect(visibleCopy).toHaveText(await heading.getAttribute('aria-label'), { timeout: 5000 });
  await expect(heading).not.toHaveAttribute('data-typing', 'true');
  await page.locator('[data-weather-mode="horizon"]').click();
  await expect(heading).toHaveAttribute('data-typing', 'true');
  await expect(page.locator('#weatherGreetingSizer')).toHaveText(await heading.getAttribute('aria-label'));
  await expect(visibleCopy).toHaveText(await heading.getAttribute('aria-label'), { timeout: 5000 });
  const fits = async () => page.evaluate(() => {
    const heading = document.querySelector('#weatherGreeting');
    const text = document.querySelector('#weatherGreetingText');
    return text.scrollWidth <= heading.clientWidth + 1 && text.scrollHeight <= heading.clientHeight + 1;
  });
  expect(await fits()).toBe(true);
  await page.setViewportSize({ width: 1280, height: 844 });
  expect(await fits()).toBe(true);
  await page.setViewportSize({ width: 360, height: 844 });
  expect(await fits()).toBe(true);
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

test('U.S. AQI detail follows all six official bands and boundaries', async ({ page }) => {
  let aqiValue = 0;
  await page.route(/air-quality-api\.open-meteo\.com/, route => route.fulfill({
    json: { current: { us_aqi: aqiValue, pm2_5: 8.2, pm10: 12.1, european_aqi: 34 } }
  }));
  const cases = [
    [0, 'Good', '0–50'], [50, 'Good', '0–50'],
    [51, 'Moderate', '51–100'], [100, 'Moderate', '51–100'],
    [101, 'Unhealthy for Sensitive Groups', '101–150'], [150, 'Unhealthy for Sensitive Groups', '101–150'],
    [151, 'Unhealthy', '151–200'], [200, 'Unhealthy', '151–200'],
    [201, 'Very unhealthy', '201–300'], [300, 'Very unhealthy', '201–300'],
    [301, 'Hazardous', '301+']
  ];

  for (const [value, label, range] of cases) {
    aqiValue = value;
    if (value === 0) await page.goto('/');
    else await page.reload();
    await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
    await page.locator('#weatherList .weather-row').first().click();
    await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
    await page.locator('#weatherModules [data-sheet="aqi"]').click();
    const sheet = page.locator('#weatherSheetBody');
    await expect(sheet).toContainText(label);
    await expect(sheet).toContainText(range);
    if (value === 151) {
      await expect(sheet).toContainText('Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.');
    }
  }
});

test('selects Portuguese Brazil and Traditional Chinese', async ({ page }) => {
  await page.goto('/');
  await page.locator('#dusklineLanguage').selectOption('pt-BR');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await page.locator('#dusklineLanguage').selectOption('zh-TW');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('all languages render the full weather flow, detail sheets, charts, units, and RTL layout', async ({ page }) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => {
    const city = {
      name: 'Boston', admin1: 'Massachusetts', lat: 42.36, lon: -71.059,
      tz: 'America/New_York', country: 'United States', country_code: 'US'
    };
    localStorage.setItem('duskline-weather-mode', 'my-sky');
    localStorage.setItem('duskline-weather-greeting-city', JSON.stringify(city));
  });
  await page.reload();
  await expect(page.locator('#weatherMyLocationList .weather-row').first()).toBeVisible({ timeout: 15000 });

  const locales = ['en','es','fr','de','it','pt-BR','pt-PT','nl','da','sv','nb','fi','pl','cs','hu','ro','el','tr','ru','uk','ar','he','hi','th','vi','id','ja','ko','zh','zh-TW'];
  const sheets = ['aqi','feels','humidity','wind','uv','vis','pressure','precip','sun','conditions'];
  let detailedAqiRequests = 0;
  page.on('request', request => {
    const url = request.url();
    if (url.includes('air-quality-api.open-meteo.com') && url.includes('us_aqi_pm2_5')) detailedAqiRequests++;
  });

  for (const locale of locales) {
    await page.locator('#dusklineLanguage').selectOption(locale);
    await expect(page.locator('html')).toHaveAttribute('data-lang', locale);
    await page.locator('[data-weather-mode="horizon"]').click();
    await expect(page.locator('#weatherModeSwitch [data-weather-mode="horizon"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-weather-mode="my-sky"]').click();
    await expect(page.locator('#weatherModeSwitch [data-weather-mode="my-sky"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#weatherGreetingPlace')).toBeVisible();

    const view = await page.evaluate(() => ({
      direction: document.documentElement.dir,
      overflow: document.documentElement.scrollWidth > innerWidth,
      toolbarOverflow: document.querySelector('.weather-toolbar').scrollWidth > document.querySelector('.weather-toolbar').clientWidth,
      greeting: document.querySelector('#weatherGreeting').getAttribute('aria-label') || '',
      weatherCondition: document.querySelector('#weatherMyLocationList .weather-row-cond')?.innerText.trim() || '',
      text: [
        document.querySelector('#weatherSearch').getAttribute('placeholder'),
        document.querySelector('#weatherModeSwitch').getAttribute('aria-label'),
        document.querySelector('#weatherLocate').getAttribute('aria-label'),
        document.querySelector('#weatherRefresh').getAttribute('aria-label'),
        document.querySelector('#weatherGreetingPlace').textContent.trim()
      ].join(' '),
      rawKeys: Array.from(document.querySelectorAll('body *')).filter(el => el.children.length === 0)
        .map(el => el.textContent.trim()).filter(text => /^(weather|settings|region|legal)\./.test(text))
    }));
    expect(view.overflow, locale + ' page overflow').toBe(false);
    expect(view.toolbarOverflow, locale + ' toolbar overflow').toBe(false);
    expect(view.direction, locale + ' direction').toBe(locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr');
    expect(view.greeting, locale + ' greeting').not.toMatch(/^weather\./);
    expect(view.weatherCondition, locale + ' weather condition label').not.toBe('');
    expect(view.rawKeys, locale + ' raw translation keys').toEqual([]);
    if (locale !== 'en') expect(view.weatherCondition, locale + ' weather condition should be localized').not.toBe('Partly cloudy');
    if (locale === 'zh-TW') expect(view.greeting, 'Traditional Chinese should keep reviewed city names in the right script').toContain('Boston');

    await page.locator('#weatherGreetingPlace').click();
    await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
    await expect(page.locator('#weatherSheetBody [role="radio"]')).toHaveCount(1);
    await expect(page.locator('#weatherSheet .wx-sheet-title')).not.toBeEmpty();
    await page.keyboard.press('Escape');
    await expect(page.locator('#weatherSheet')).not.toHaveClass(/open/);

    await page.locator('#weatherUnitsBtn').click();
    await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
    for (const id of ['wxTempUnits','wxDistUnits','wxWindUnits2','wxPrecipUnits2','wxPressUnits2']) {
      await expect(page.locator('#' + id + ' [role="radio"]')).not.toHaveCount(0);
    }
    if (locale === 'en') {
      await page.locator('#wxTempUnits [data-unit="f"]').click();
      await expect(page.locator('#wxTempUnits [data-unit="f"]')).toHaveAttribute('aria-checked', 'true');
      await expect(page.locator('#wxUnitsResolvedHint')).toContainText('°F');
      await page.locator('#wxTempUnits [data-unit="auto"]').click();
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('#weatherSheet')).not.toHaveClass(/open/);

    await page.locator('#weatherMyLocationList .weather-row').first().click();
    await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
    await expect(page.locator('#weatherModules [data-sheet]')).toHaveCount(10);
    for (const key of sheets) {
      await page.locator('#weatherModules [data-sheet="' + key + '"]').click();
      await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
      await expect(page.locator('#weatherSheet .wx-sheet-title')).not.toBeEmpty();
      const sheetBody = page.locator('#weatherSheetBody');
      await expect(sheetBody).toBeVisible();
      await expect(sheetBody).toContainText(/\S/);
      const content = await sheetBody.innerText();
      expect(content.trim().length, locale + ' empty ' + key + ' sheet').toBeGreaterThan(3);
      expect(content, locale + ' untranslated ' + key + ' sheet').not.toMatch(/weather\.[a-z.]+/i);
      const chartCount = await page.locator('#weatherSheetBody .weather-chart').count();
      if (['feels','humidity','wind','uv','pressure','precip','conditions'].includes(key)) {
        expect(chartCount, locale + ' missing ' + key + ' chart').toBeGreaterThan(0);
      }
      if (key === 'sun') await expect(page.locator('#weatherSheetBody .weather-sun-day .wx-sun-line')).toHaveCount(1);
      const invalidSvgPaths = await page.locator('#weatherSheetBody svg path').evaluateAll(paths =>
        paths.map(path => path.getAttribute('d') || '').filter(d => /NaN|undefined/.test(d))
      );
      expect(invalidSvgPaths, locale + ' invalid ' + key + ' chart geometry').toEqual([]);
      await page.keyboard.press('Escape');
      await expect(page.locator('#weatherSheet')).not.toHaveClass(/open/);
    }
    await page.locator('#weatherDetailBack').click();
    await expect(page.locator('#weatherDetail')).not.toHaveClass(/open/);
  }
  expect(detailedAqiRequests, 'AQI detail fetch should be cached even where optional fields are unavailable').toBe(1);
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
  let prevTitle = '';
  for (const code of codes) {
    const packWait = page.waitForResponse((res) => res.url().includes('/legal/packs/' + encodeURIComponent(code) + '.json') && res.ok(), { timeout: 8000 }).catch(() => null);
    await page.locator('#dusklineLanguage').selectOption(code);
    if (code !== 'en') await packWait;
    await expect.poll(async () => (await page.locator('[data-i18n="legal.terms.title"]').textContent() || '').trim()).not.toBe('');
    const title = (await page.locator('[data-i18n="legal.terms.title"]').textContent() || '').trim();
    const body = (await page.locator('[data-i18n="legal.terms.p1"]').textContent() || '').trim();
    expect(title.length, `terms title empty for ${code}`).toBeGreaterThan(2);
    expect(body.length, `terms body empty for ${code}`).toBeGreaterThan(20);
    if (prevTitle && code !== 'en') expect(title, `terms title unchanged for ${code}`).not.toBe(prevTitle);
    prevTitle = title;
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

test('weather unit choices persist and carry into their detail sheets', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherUnitsBtn').click();

  const preferences = [
    ['wxTempUnits', 'f'], ['wxDistUnits', 'mi'], ['wxWindUnits2', 'kn'],
    ['wxPrecipUnits2', 'cm'], ['wxPressUnits2', 'kPa']
  ];
  for (const [id, unit] of preferences) {
    const choice = page.locator('#' + id + ' [data-unit="' + unit + '"]');
    await choice.click();
    await expect(choice).toHaveAttribute('aria-checked', 'true');
  }
  const selectedKnots = page.locator('#wxWindUnits2 [data-unit="kn"]');
  await selectedKnots.focus();
  await selectedKnots.press('ArrowRight');
  await expect(page.locator('#wxWindUnits2 [data-unit="mph"]')).toHaveAttribute('aria-checked', 'true');
  await selectedKnots.click();
  await expect(selectedKnots).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Escape');
  await expect(page.locator('#weatherSheet')).not.toHaveClass(/open/);

  await page.reload();
  await page.locator('#weatherUnitsBtn').click();
  for (const [id, unit] of preferences) {
    await expect(page.locator('#' + id + ' [data-unit="' + unit + '"]')).toHaveAttribute('aria-checked', 'true');
  }
  await page.keyboard.press('Escape');
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);

  for (const [kind, id, unit] of [
    ['feels', 'wxTempUnitsSheet', 'f'], ['wind', 'wxWindUnits', 'kn'],
    ['precip', 'wxPrecipUnits', 'cm'], ['pressure', 'wxPressUnits', 'kPa'],
    ['vis', 'wxVisUnits', 'mi']
  ]) {
    await page.locator('#weatherModules [data-sheet="' + kind + '"]').click();
    await expect(page.locator('#' + id + ' [data-u="' + unit + '"]')).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Escape');
    await expect(page.locator('#weatherSheet')).not.toHaveClass(/open/);
  }
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
  // The enter animation defers `.open` by two frames. Interacting before it settles is not
  // something a person can do, and doing it here is what made this test flaky.
  await expect(sheet).toHaveClass(/is-raised/);
  await expect(close).toBeVisible();
  await expect.poll(async () => {
    const box = await close.boundingBox();
    return box && box.y > 8 && box.y < 400;
  }).toBeTruthy();
  const [closeBox, panelBox] = await Promise.all([close.boundingBox(), panel.boundingBox()]);
  expect(closeBox.x).toBeGreaterThan(panelBox.x + panelBox.width / 2);
  const uvH = panelBox.height;
  expect(uvH).toBeLessThan(page.viewportSize().height * 0.95);

  await close.click();
  await expect(sheet).not.toHaveClass(/open/, { timeout: 4000 });
  // Closed must also mean inert: a sheet left painted-but-inert (or inert-but-open) is the
  // failure mode this guards against, and `.open` alone would not catch it.
  await expect(sheet).toHaveAttribute('aria-hidden', 'true');
  expect(await sheet.evaluate((el) => el.inert)).toBe(true);
  expect(await sheet.evaluate((el) => el.style.pointerEvents)).toBe('none');

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
  await expect(page.locator('#weatherSheetBody .wx-sheet-about p')).toContainText(/crépuscule civil|bord supérieur/);
  await expect(page.locator('#weatherSheetBody .wx-sheet-about p')).not.toContainText('weather.about');
});

test('hourly forecast tile opens the temperature chart', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#weatherList .weather-row').first()).toBeVisible({ timeout: 15000 });
  await page.locator('#weatherList .weather-row').first().click();
  await expect(page.locator('#weatherDetail')).toHaveClass(/open/);
  const hourly = page.locator('.weather-mod[data-sheet="conditions"]');
  await expect(hourly).toBeVisible();
  await hourly.locator('.weather-hourly-item').first().click();
  await expect(page.locator('#weatherSheet')).toHaveClass(/open/);
  await expect(page.locator('#weatherSheetBody .weather-chart').first()).toBeVisible();
  await expect(page.locator('#weatherSheetBody .wx-sheet-about p')).toContainText(/calendar day|temperature through/i);
  await expect(page.locator('#weatherSheetBody .wx-sheet-about p')).not.toContainText('weather.about');
});
