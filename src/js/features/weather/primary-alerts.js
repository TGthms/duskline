'use strict';
(function (global) {
  const W = global.DusklineWeather;
  if (!W || !W.active) return;
  W.factories.primaryAlerts = function (deps) {
    const {t,escapeHtml:esc} = deps;
    let checked = new WeakSet();
    let expiryTimer;
    function markup(pack) {
      clearTimeout(expiryTimer);
      if (!pack) return '';
      if (navigator.onLine === false) return '<p class="weather-home-alert-note">'+esc(t('weather.alertsOffline','Connect to check public alerts'))+'</p>';
      const alerts = deps.current(pack.alerts);
      if (alerts.length) {
        const first = alerts[0];
        const ends = alerts.map(alert=>Date.parse(alert.ends || '')).filter(value=>Number.isFinite(value) && value>Date.now());
        if (ends.length) expiryTimer = setTimeout(deps.repaint,Math.min(2147483647,Math.max(1,Math.min(...ends)-Date.now()+20)));
        const severity = /^(extreme|severe|moderate)$/i.test(first.severity) ? first.severity.toLowerCase() : 'minor';
        const count = alerts.length>1 ? ' · '+t('weather.alertsCount','{count} alerts').replace('{count}',String(alerts.length)) : '';
        return '<button type="button" class="weather-home-alert" data-primary-alert data-severity="'+severity+'"><span>'+esc(t('weather.alerts','Public Alerts')+count)+'</span><strong>'+esc(first.event || t('weather.alert','Alert'))+'</strong><span aria-hidden="true">→</span></button>';
      }
      if (pack.alertsError && pack.alertsUnavailableReason !== 'unsupported') {
        return '<div class="weather-home-alert-note"><span>'+esc(t('weather.alertsUnavailable','Could not check public alerts'))+'</span><button type="button" data-primary-alert-retry>'+esc(t('weather.retry','Retry'))+'</button></div>';
      }
      const key = pack._alertsLoading ? 'weather.alertsLoading' : pack.alertsPartial ? 'weather.alertsPartial' : null;
      return key ? '<p class="weather-home-alert-note" role="status">'+esc(t(key,key==='weather.alertsLoading'?'Checking public alerts…':'Alert coverage is incomplete'))+'</p>' : '';
    }
    function bind(home,pack) {
      const view = home.querySelector('[data-primary-alert]');
      if (view) view.addEventListener('click',()=>deps.open(pack,deps.current(pack.alerts)[0]));
      const retry = home.querySelector('[data-primary-alert-retry]');
      if (retry) retry.addEventListener('click',()=>{
        retry.disabled=true;
        Promise.resolve(deps.ensure(pack,{force:true,retryFailed:true})).finally(deps.repaint);
      });
      if (!checked.has(pack) && navigator.onLine !== false) {
        checked.add(pack);
        Promise.resolve(deps.ensure(pack)).finally(deps.repaint);
      }
    }
    global.addEventListener('offline',deps.repaint);
    global.addEventListener('online',function () { checked=new WeakSet(); deps.repaint(); });
    document.addEventListener('visibilitychange',function () { if (document.visibilityState==='visible') deps.repaint(); });
    return {markup,bind};
  };
})(window);
