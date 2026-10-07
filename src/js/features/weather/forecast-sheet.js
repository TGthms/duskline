'use strict';
/* Shared date-aware forecast renderer; all hourly/daily entry points use it. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W || !W.active) return;
  W.factories.forecastSheet = function (deps) {
    const {t,escapeHtml,condIcon,condLabel,fmtTemp,fmtPrecip,formatClock,dailyFieldAt,useF} = deps;
    const chartsApi = deps.charts;
    function render(options) {
      const {daily,hourly,chartTz,selectedDayKey,selectedDayIndex,selectedDayCode,dayMode,sheetOptions,currentDateKey,unitsPickerHtml} = options;
      let body = '';
      const dayCode = selectedDayCode;
      const high = dailyFieldAt(daily, 'temperature_2m_max', selectedDayIndex);
      const low = dailyFieldAt(daily, 'temperature_2m_min', selectedDayIndex);
      const totalPrecip = dailyFieldAt(daily, 'precipitation_sum', selectedDayIndex);
      let pop = dailyFieldAt(daily, 'precipitation_probability_max', selectedDayIndex);
      const dayWindow = chartsApi.hourlyDateWindow(hourly, chartTz, String(selectedDayKey).slice(0, 10));
      const dayHours = dayWindow.end - dayWindow.start;
      const probability = hourly.precipitation_probability || [];
      const temperatures = hourly.temperature_2m || [];
      if (pop == null && dayHours > 0) {
        const values = probability.slice(dayWindow.start, dayWindow.end)
          .filter(v=>v != null && v !== '').map(Number).filter(Number.isFinite);
        if (values.length) pop = Math.max.apply(null, values);
      }
      const timeNear = function (series, target) {
        const value = Number(target);
        if (target == null || !Number.isFinite(value) || dayHours <= 0) return '';
        let nearest = null;
        let difference = Infinity;
        for (let i = dayWindow.start; i < dayWindow.end; i++) {
          if (series[i] == null || series[i] === '') continue;
          const sample = Number(series[i]);
          if (!Number.isFinite(sample)) continue;
          const delta = Math.abs(sample - value);
          if (delta < difference) { nearest = i; difference = delta; }
        }
        return nearest != null && difference <= 1.1 ? formatClock(hourly.time[nearest], chartTz) : '';
      };
      const highTime = timeNear(temperatures, high);
      const lowTime = timeNear(temperatures, low);
      const selectedChartKey = dayMode === 'feels' ? 'apparent_temperature' : 'temperature_2m';
      const selectedSeries = hourly[selectedChartKey] || [];
      const hasTemperatureHours = dayHours >= 2 && selectedSeries.slice(dayWindow.start, dayWindow.end)
        .some(function (value) { return value != null && Number.isFinite(Number(value)); });
      const hasProbabilityHours = dayHours >= 2 && probability.slice(dayWindow.start, dayWindow.end)
        .some(function (value) { return value != null && Number.isFinite(Number(value)); });

      const selectedValues = selectedSeries.slice(dayWindow.start, dayWindow.end)
        .map(function (value) { return value == null ? NaN : Number(value); })
        .filter(Number.isFinite);
      const chartRangeLow = dayMode === 'actual' && low != null
        ? Number(low) : selectedValues.length ? Math.min.apply(null, selectedValues) : null;
      const chartRangeHigh = dayMode === 'actual' && high != null
        ? Number(high) : selectedValues.length ? Math.max.apply(null, selectedValues) : null;
      const rangeReadout = chartRangeLow != null && chartRangeHigh != null
        ? fmtTemp(chartRangeLow) + ' – ' + fmtTemp(chartRangeHigh) : '';
      const isSelectedToday = String(selectedDayKey).slice(0, 10) === currentDateKey;
      body += `<div class="wx-day-condition" id="wxDayCondition">${condIcon(dayCode, false)}<span id="wxConditionsContext">${escapeHtml(condLabel(dayCode))}</span></div>`;
      body += `<div class="wx-day-facts">
        <div class="wx-day-fact"><span>${escapeHtml(t('weather.highFull', 'High'))}</span><strong>${escapeHtml(fmtTemp(high))}</strong>${highTime ? `<small>${escapeHtml(highTime)}</small>` : ''}</div>
        <div class="wx-day-fact"><span>${escapeHtml(t('weather.lowFull', 'Low'))}</span><strong>${escapeHtml(fmtTemp(low))}</strong>${lowTime ? `<small>${escapeHtml(lowTime)}</small>` : ''}</div>
        <div class="wx-day-fact"><span>${escapeHtml(t('weather.precip', 'Precipitation'))}</span><strong>${escapeHtml(fmtPrecip(totalPrecip))}</strong></div>
        <div class="wx-day-fact"><span>${escapeHtml(t('weather.chanceOfPrecipitation', 'Chance of precipitation'))}</span><strong>${pop != null && Number.isFinite(Number(pop)) ? Math.round(Number(pop)) + '%' : '—'}</strong></div>
      </div>`;
      body += `<div class="wx-day-mode" role="group" aria-label="${escapeHtml(t('settings.temperature', 'Temperature'))}">
        <button type="button" data-temp-mode="actual" aria-pressed="${dayMode === 'actual' ? 'true' : 'false'}" class="${dayMode === 'actual' ? 'active' : ''}">${escapeHtml(t('weather.actual', 'Actual'))}</button>
        <button type="button" data-temp-mode="feels" aria-pressed="${dayMode === 'feels' ? 'true' : 'false'}" class="${dayMode === 'feels' ? 'active' : ''}">${escapeHtml(t('weather.feelsLike', 'Feels Like'))}</button>
      </div>`;
      if (hasTemperatureHours) {
        body += chartsApi.buildTempChart(hourly, selectedChartKey, (v) => fmtTemp(v), chartTz, String(selectedDayKey).slice(0, 10), {
          initialMode: isSelectedToday || sheetOptions.hourIndex != null ? 'point' : 'range',
          initialIndex: sheetOptions.hourIndex,
          initialReadout: rangeReadout || fmtTemp(high) + ' – ' + fmtTemp(low),
          initialSub: isSelectedToday ? '' : t('weather.dailyRange', 'Daily range')
        });
      }
      if (hasProbabilityHours) {
        body += `<p class="weather-mod-label wx-day-chart-label">${escapeHtml(t('weather.chanceOfPrecipitation', 'Chance of precipitation'))}</p>`;
        const probabilities = probability.slice(dayWindow.start, dayWindow.end).filter(v=>v != null && v !== '' && Number.isFinite(Number(v))).map(Number);
        const minimum = Math.round(Math.min(...probabilities)), maximum = Math.round(Math.max(...probabilities));
        body += chartsApi.buildTempChart(hourly, 'precipitation_probability', (v) => Math.round(v) + '%', chartTz, String(selectedDayKey).slice(0, 10), {
          initialMode: isSelectedToday || sheetOptions.hourIndex != null ? 'point' : 'range', initialIndex:sheetOptions.hourIndex,
          initialReadout:minimum === maximum ? minimum+'%' : minimum+'% – '+maximum+'%',
          initialSub:isSelectedToday ? '' : t('weather.dailyRange','Daily range')
        });
      }
      body += unitsPickerHtml('wxTempUnitsSheet', [['c', '°C'], ['f', '°F']], useF() ? 'f' : 'c');

      return body;
    }
    return {render:render};
  };
})(window);
