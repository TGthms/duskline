'use strict';
/* Personal home, saved-place management, and Horizon discovery UI. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W || !W.active) return;
  W.factories.product = function (deps) {
    const {t, escapeHtml: esc, cityKey, cache, fmtTemp, condLabel} = deps;
    const home = document.getElementById('weatherHome');
    const controls = document.getElementById('weatherDiscovery');
    const region = document.getElementById('weatherRegion');
    const sort = document.getElementById('weatherSort');
    const enriching = new Set();
    function selectedCity() { return deps.getPrimary(); }
    function filter(cities) {
      let out = cities.filter(city => !region || !region.value || city.region === region.value);
      if (sort && sort.value === 'temperature') out.sort((a,b) => (cache.get(cityKey(b))?.weather?.current?.temperature_2m ?? -Infinity) - (cache.get(cityKey(a))?.weather?.current?.temperature_2m ?? -Infinity));
      if (sort && sort.value === 'local-time') out.sort((a,b) => deps.localHour(cache.get(cityKey(a)) || {city:a}) - deps.localHour(cache.get(cityKey(b)) || {city:b}));
      return out;
    }
    if (region) {
      [...new Set(deps.cities.map(city => city.region).filter(Boolean))].forEach(value => {
        const option = document.createElement('option'); option.value = value; option.textContent = t('region.' + value, value); region.append(option);
      });
      region.addEventListener('change', deps.repaint);
    }
    if (sort) sort.addEventListener('change', deps.repaint);
    const collapse = document.getElementById('weatherCollapse');
    if (collapse) collapse.addEventListener('click', deps.collapseHorizon);
    function render() {
      const personal = deps.mode() === 'my-sky';
      if (controls) controls.hidden = personal;
      if (collapse) collapse.hidden = !deps.expanded();
      if (!home) return;
      const city = selectedCity();
      home.hidden = !personal || !city;
      if (home.hidden) return;
      const pack = cache.get(cityKey(city));
      if (!pack || !pack.weather) {
        if (pack && pack.error) {
          home.innerHTML = `<div role="status" class="weather-hourly-loading"><span>${esc(t('weather.error','Could not load weather data.'))}</span><button type="button" data-home-retry>${esc(t('weather.retry','Retry'))}</button></div>`;
          home.querySelector('[data-home-retry]').addEventListener('click', function () {
            cache.set(cityKey(city), {city:city,pending:true}); render();
            deps.enrich(city).then(render).catch(function () { cache.set(cityKey(city), {city:city,error:true}); render(); });
          });
        } else home.innerHTML = `<div class="weather-home-skeleton" aria-hidden="true"><div class="weather-home-skeleton-header"><span></span><span></span></div></div><div role="status" class="weather-hourly-loading"><span class="loader" aria-hidden="true"></span><span>${esc(t('weather.loadingForecast','Loading forecast…'))}</span></div><div class="weather-home-skeleton-days" aria-hidden="true">${Array.from({length:5},()=>'<span></span>').join('')}</div>`;
        return;
      }
      const current = pack.weather.current;
      if (deps.palette) deps.palette(home,pack);
      const range = deps.range(pack);
      const hourly = pack.weather.hourly || {};
      let hours = '';
      const times = hourly.time || [];
      const start = Math.max(0, times.findIndex(time => deps.stamp(time, pack) >= Date.now() - 3600000));
      for (let i = start; i < Math.min(start+8,times.length); i++) {
        hours += `<div class="weather-hourly-item"><div>${esc(deps.shortClock ? deps.shortClock(times[i],pack) : deps.clock(times[i],pack))}</div><div class="ic">${deps.icon((hourly.weather_code || [])[i],deps.night(pack,times[i]))}</div><div class="t">${esc(fmtTemp((hourly.temperature_2m || [])[i]))}</div><div class="p">${(hourly.precipitation_probability || [])[i] != null ? Math.round(hourly.precipitation_probability[i])+'%' : '—'}</div></div>`;
      }
      const insight = deps.insight(pack);
      const daily = deps.dailyPreview ? deps.dailyPreview(pack) : '';
      home.innerHTML = `
        <div class="weather-home-current">
          <div class="weather-home-reading"><h3>${esc(deps.cityName(city))}</h3><span class="weather-home-temperature">${esc(fmtTemp(current.temperature_2m))}</span><p class="weather-home-feels">${esc(t('weather.feelsLike','Feels like'))} ${esc(fmtTemp(current.apparent_temperature))}</p></div>
          <div class="weather-home-description">
            <div class="weather-home-icon" aria-hidden="true">${deps.icon(current.weather_code,deps.night(pack))}</div>
            <p class="weather-home-condition">${esc(condLabel(current.weather_code))}</p>
            <p class="weather-home-range"><span>${esc(t('weather.high','H'))}:${esc(fmtTemp(range.hi))}</span><span>${esc(t('weather.low','L'))}:${esc(fmtTemp(range.lo))}</span></p>
          </div>
        </div>
        ${insight ? `<p class="weather-home-insight">${esc(insight)}</p>` : ''}
        <div class="weather-home-outlook"><div class="weather-home-hours">
          <span class="visually-hidden">${esc(pack.stored ? t('weather.savedHourlyForecast', 'Saved hourly forecast') : t('weather.nextHours', 'Next hours'))}</span>
          <div class="weather-hourly" tabindex="0" role="group" aria-label="${esc(pack.stored ? t('weather.savedHourlyForecast', 'Saved hourly forecast') : t('weather.nextHours', 'Next hours'))}">${hours || `<div class="weather-hourly-loading">${!pack.stored && !pack.enrichmentError ? '<span class="loader" aria-hidden="true"></span>' : ''}<span>${esc(pack.stored || pack.enrichmentError ? t('weather.hourlyUnavailable','Hourly forecast unavailable') : t('weather.loadingForecast','Loading forecast…'))}</span></div>`}</div>
        </div>
        ${daily ? `<div class="weather-home-daily">${daily}</div>` : ''}</div>
        <div class="weather-home-meta"><small>${esc(deps.updated(pack))}</small><div class="weather-home-actions"><button type="button" data-home-open>${esc(t('weather.viewForecast','View forecast'))}</button></div></div>`;
      home.querySelectorAll('[data-day-date]').forEach(function (button) {
        button.addEventListener('click',function () { deps.openDay(city,button.dataset.dayDate); });
      });
      home.querySelector('[data-home-open]').addEventListener('click', () => deps.open(city));
      home.querySelector('.weather-hourly').addEventListener('keydown', function (event) {
        const strip = event.currentTarget;
        const direction = getComputedStyle(strip).direction === 'rtl' ? -1 : 1;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          strip.scrollBy({left:event.key === 'ArrowRight' ? 70 : -70,behavior:'auto'});
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault();
          strip.scrollTo({left:event.key === 'Home' ? 0 : direction * (strip.scrollWidth-strip.clientWidth),behavior:'auto'});
        }
      });

      if (pack.needsEnrich && !pack.stored && !pack.enrichmentError && !enriching.has(cityKey(city))) {
        enriching.add(cityKey(city));
        deps.enrich(city).then(render).catch(function () { pack.enrichmentError = true; render(); }).finally(() => enriching.delete(cityKey(city)));
      }
    }
    return {render: render, filter: filter};
  };
})(window);
