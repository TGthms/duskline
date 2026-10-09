'use strict';
/* Duskline — push-notifications.js
   Severe weather alert push subscriptions. Standalone module: injects a
   "Severe weather alerts" toggle into the settings sheet next to the haptics
   row, and manages the PushManager subscription lifecycle.

   Flow: toggle on -> Notification.requestPermission() -> pushManager.subscribe()
   with the VAPID public key -> POST /api/push/subscribe with the subscription
   and the user's primary location. Toggle off -> unsubscribe + POST /api/push/unsubscribe.

   Subscription state is tracked locally (endpoint URL) so the toggle reflects
   the server state without a round trip on every settings open. */
(function (global) {
  var W = global.DusklineWeather;
  if (!W) return;

  // Filled in at build/deploy time. The public key is not secret.
  var VAPID_PUBLIC_KEY = 'BP3dIi3qXzMN8PueacJpT5wJH7Vje5o7SV8U4kqGZJcyM2yy9JWUd-OeHl7m50bXEPdWxI4JxN60qPCTBzNNbbk';
  var LS_SUB_KEY = 'duskline-push-sub';

  function t(k, f) {
    try {
      if (W.i18n && typeof W.i18n.t === 'function') return W.i18n.t(k, f);
    } catch (e) {}
    return f || k;
  }

  function pushSupported() {
    return ('serviceWorker' in navigator) && ('PushManager' in window)
      && ('Notification' in window);
  }

  function getPrimaryLocation() {
    try {
      var raw = localStorage.getItem('duskline-weather-favorites');
      var arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr) && arr.length) {
        var f = arr[0];
        if (f && isFinite(Number(f.lat)) && isFinite(Number(f.lon))) {
          return { name: f.name, lat: Number(f.lat), lon: Number(f.lon),
                   country_code: f.country_code || '' };
        }
      }
      var graw = localStorage.getItem('duskline-weather-greeting-city');
      var g = graw ? JSON.parse(graw) : null;
      if (g && isFinite(Number(g.lat)) && isFinite(Number(g.lon))) {
        return { name: g.name, lat: Number(g.lat), lon: Number(g.lon),
                 country_code: g.country_code || g.countryCode || '' };
      }
    } catch (e) {}
    return null;
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(base64);
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  async function getSubscription() {
    try {
      var reg = await navigator.serviceWorker.ready;
      return await reg.pushManager.getSubscription();
    } catch (e) { return null; }
  }

  async function subscribe(location) {
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
    var json = sub.toJSON();
    var res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
        location: {
          name: location.name || location.city || '',
          lat: location.lat,
          lon: location.lon != null ? location.lon : location.lng,
          country_code: location.country_code || location.countryCode || '',
        },
      }),
    });
    if (!res.ok) {
      try { await sub.unsubscribe(); } catch (e) {}
      throw new Error('Subscribe failed: ' + res.status);
    }
    try { localStorage.setItem(LS_SUB_KEY, json.endpoint); } catch (e) {}
    return sub;
  }

  async function unsubscribe() {
    var sub = await getSubscription();
    var endpoint = null;
    try { endpoint = localStorage.getItem(LS_SUB_KEY); } catch (e) {}
    if (sub) {
      endpoint = endpoint || sub.endpoint;
      try { await sub.unsubscribe(); } catch (e) {}
    }
    if (endpoint) {
      try {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: endpoint }),
        });
      } catch (e) {}
    }
    try { localStorage.removeItem(LS_SUB_KEY); } catch (e) {}
  }

  async function refreshToggleUI(toggle, status) {
    var sub = await getSubscription();
    var on = !!sub;
    toggle.checked = on;
    toggle.disabled = false;
    if (status) {
      status.textContent = on
        ? t('weather.pushOn', 'On — you will be notified of severe weather')
        : t('weather.pushOff', 'Off');
    }
  }

  function mountSettings() {
    if (!pushSupported()) return;
    var done = false;
    function tryMount() {
      if (done) return;
      var hapticSelect = document.querySelector('.weather-haptic-select');
      if (!hapticSelect || hapticSelect.parentNode.querySelector('.weather-push-row')) return;
      done = true;
      var title = document.createElement('p');
      title.className = 'weather-mod-label';
      title.textContent = t('weather.pushTitle', 'Severe weather alerts');
      var row = document.createElement('div');
      row.className = 'weather-push-row';
      var toggle = document.createElement('input');
      toggle.type = 'checkbox';
      toggle.className = 'weather-push-toggle';
      toggle.setAttribute('aria-label', title.textContent);
      toggle.disabled = true;
      var status = document.createElement('span');
      status.className = 'weather-push-status';
      row.append(toggle, status);
      hapticSelect.after(title, row);
      refreshToggleUI(toggle, status);
      toggle.addEventListener('change', async function () {
        toggle.disabled = true;
        try {
          if (toggle.checked) {
            if (Notification.permission === 'denied')
              throw new Error(t('weather.pushBlocked', 'Notifications are blocked in browser settings'));
            if (Notification.permission !== 'granted') {
              var perm = await Notification.requestPermission();
              if (perm !== 'granted') throw new Error(t('weather.pushDenied', 'Permission denied'));
            }
            var loc = getPrimaryLocation();
            if (!loc) throw new Error(t('weather.pushNoPlace', 'Save a place first'));
            await subscribe(loc);
          } else {
            await unsubscribe();
          }
        } catch (e) {
          toggle.checked = !toggle.checked;
          status.textContent = (e && e.message) || t('weather.pushError', 'Something went wrong');
        }
        refreshToggleUI(toggle, status);
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        tryMount();
        new MutationObserver(tryMount).observe(document.body, { childList: true, subtree: true });
      });
    } else {
      tryMount();
      new MutationObserver(tryMount).observe(document.body, { childList: true, subtree: true });
    }
  }

  mountSettings();
  W.pushNotifications = {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    getSubscription: getSubscription,
    supported: pushSupported,
  };
})(window);
