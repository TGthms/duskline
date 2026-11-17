'use strict';
/* Background-alert views share permission, subscription ownership and retry intent. */
(function (global) {
  const W = global.DusklineWeather;
  if (!W) return;
  W.factories.pushNotifications = function (deps) {
    const KEY = 'duskline-push-settings-v2';
    const defaults = {
      version: 3,
      severity: 'all',
      categories: ['all'],
      updates: true,
      quiet: {
        enabled: false,
        start: '22:00',
        end: '07:00',
        timeZone: 'UTC',
        overrideExtreme: true,
      },
    };
    const t = (key, fallback) => deps.t('weather.push.' + key, fallback);
    const views = new Set();
    let config = null,
      remote = null,
      busy = false,
      message = '',
      deliveryMessage = '',
      phase = 'off',
      timer,
      checkedAt = 0,
      pendingEnabled = null,
      controlId = 0,
      queuedReconcile = null,
      settingsDraft = null,
      enrollmentPending = false;
    let state = {
      enabled: false,
      follow: true,
      selected: [],
      preferences: structuredClone(defaults),
      capability: '',
      endpoint: '',
      synced: '',
      renewedAt: 0,
    };
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved)
        state = {
          ...state,
          ...saved,
          preferences: {
            ...defaults,
            ...(saved.preferences?.version === 3 ? saved.preferences : {}),
            quiet: { ...defaults.quiet },
          },
        };
    } catch {}
    function supported() {
      return !!(
        global.isSecureContext &&
        'serviceWorker' in navigator &&
        'PushManager' in global &&
        'Notification' in global
      );
    }
    function persist() {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {
        throw Error('storage');
      }
    }
    function token() {
      if (!state.capability) {
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        state.capability = btoa(String.fromCharCode(...bytes))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        persist();
      }
      return state.capability;
    }
    function bounded(promise, ms = 12000) {
      return new Promise((resolve, reject) => {
        const id = setTimeout(() => reject(Error('timeout')), ms);
        Promise.resolve(promise).then(
          (v) => {
            clearTimeout(id);
            resolve(v);
          },
          (e) => {
            clearTimeout(id);
            reject(e);
          },
        );
      });
    }
    async function registration() {
      return bounded(navigator.serviceWorker.ready);
    }
    async function getSubscription() {
      if (!supported()) return null;
      return bounded((await registration()).pushManager.getSubscription());
    }
    async function request(path, body) {
      const response = await fetch('/api/push/' + path, {
        method: body ? 'POST' : 'GET',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store',
        signal: AbortSignal.timeout(12000),
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw Error('not_configured');
      }
      if (!response.ok) throw Error(data.error || 'network');
      return data;
    }
    function identity() {
      return { endpoint: state.endpoint, capability: token() };
    }
    function known() {
      return deps
        .places()
        .filter(
          (p) => p && p.name && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon)),
        );
    }
    function key(p) {
      return Number(p.lat).toFixed(2) + ',' + Number(p.lon).toFixed(2);
    }
    function countryCode(place) {
      return String(place.country_code || place.countryCode || '')
        .trim()
        .toUpperCase();
    }
    function selected(draft = state) {
      const all = known(),
        wanted = draft.follow
          ? [deps.primary()].filter(Boolean)
          : all.filter((p) => draft.selected.includes(key(p)));
      return [...new Map(wanted.map((p) => [key(p), p])).values()];
    }
    function desired(draft = state) {
      const all = selected(draft);
      if (!all.length) throw Error('choose');
      if (all.some((p) => countryCode(p) !== 'US')) throw Error('coverage');
      if (all.length > 5) throw Error('limit');
      return {
        locations: all.map((p) => ({
          name: p.name,
          lat: Number(p.lat),
          lon: Number(p.lon),
          tz: p.tz || 'UTC',
          country_code: countryCode(p),
        })),
        preferences: draft.preferences,
      };
    }
    function errorText(error) {
      const code = error?.message || error;
      return (
        {
          choose: t('choose', 'Choose a saved place first.'),
          coverage: t('coverage', 'Background alerts are available for US places only.'),
          limit: t('limit', 'Choose up to five places.'),
          denied: t(
            'blocked',
            'Notifications are blocked. Allow them in your device or browser settings.',
          ),
          not_configured: t('unavailable', 'The notification service is unavailable.'),
          rate_limited: t('rateLimit', 'Please wait before trying again.'),
          ownership_conflict: t('repair', 'Reconnect notifications.'),
          timeout: t('error', 'Could not connect. Your changes will retry when you reconnect.'),
          storage: t('storage', 'Allow local storage to save notification settings.'),
        }[code] || t('error', 'Could not connect. Your changes will retry when you reconnect.')
      );
    }
    function statusText() {
      if (message) return message;
      if (deliveryMessage) return deliveryMessage;
      if (!supported())
        return t(
          'unsupported',
          'Install duskline on your Home Screen to receive notifications, or use a browser with Web Push support.',
        );
      if (busy) return t('connecting', 'Connecting…');
      if (phase === 'blocked') return errorText('denied');
      if (phase === 'unavailable') return errorText('not_configured');
      if (phase === 'choose' || phase === 'coverage') return errorText(phase);
      if (phase === 'repair') return t('repair', 'Reconnect notifications.');
      if (phase === 'active') return t('active', 'On · monitoring your selected places');
      return t('off', 'Off');
    }
    function paint() {
      for (const view of views) {
        if (!view.root.isConnected) {
          views.delete(view);
          continue;
        }
        if (view.subscribe) {
          const city = deps.primary();
          const enrolled = state.enabled && state.synced && !enrollmentPending
            && !['repair', 'blocked'].includes(phase) && global.Notification?.permission !== 'denied';
          view.root.hidden = !view.visible() || !city || countryCode(city) !== 'US' || !!enrolled;
          view.caption.textContent = state.enabled && !state.follow
            ? t('places', 'Monitored places')
            : t('cityAlerts', 'Weather alerts for {place}').replace('{place}', city ? deps.cityName(city) : '');
          view.subscribe.textContent = state.enabled
            ? t('title', 'Notifications')
            : !supported()
              ? deps.t('weather.install', 'Install duskline')
              : t('subscribe', 'Subscribe');
          view.status.hidden = !state.enabled && phase === 'off' && !busy && !message;
        }
        view.status.textContent = statusText();
        if (view.subscribe) {
          view.root.querySelector('strong').textContent = t('enable', 'Weather notifications');
          view.root.querySelector('summary').textContent = deps.t('legal.privacyLink', 'Privacy Policy');
          view.disclosure.firstChild.textContent = privacyText();
          view.disclosure.querySelector('a').textContent = deps.t('legal.privacyLink', 'Privacy Policy');
        }
        view.root.setAttribute('aria-busy', String(busy));
        view.root.querySelectorAll('button,input,select').forEach((e) => {
          e.disabled = busy || !!e.dataset.unsupported;
        });
        if (view.toggle) {
          view.toggle.checked = pendingEnabled === null ? state.enabled : pendingEnabled;
          view.toggle.disabled = busy || !supported() || !config?.available;
        }
        if (view.subscribe) view.subscribe.disabled = busy;
        if (view.test) view.test.disabled = busy || phase !== 'active';
        if (view.retry)
          view.retry.hidden =
            busy ||
            !['repair', 'error', 'unavailable', 'blocked', 'choose', 'coverage'].includes(phase);
        if (view.activity) paintActivity(view.activity);
      }
    }
    function paintActivity(root) {
      root.replaceChildren();
      if (remote?.lastCheckedAt) {
        const p = document.createElement('p');
        p.textContent =
          t('lastCheck', 'Last provider check') +
          ' · ' +
          new Date(remote.lastCheckedAt).toLocaleString(deps.locale());
        root.append(p);
      }
      if (remote?.lastError) {
        const p = document.createElement('p');
        p.textContent = t('providerError', 'The last check failed. Retrying automatically.');
        root.append(p);
      }
      for (const item of remote?.activity || []) {
        const p = document.createElement('p');
        p.textContent =
          (item.label ||
            (item.kind === 'test'
              ? t('test', 'Send test notification')
              : t('title', 'Notifications'))) +
          ' · ' +
          (item.status === 'accepted'
            ? t('accepted', 'Accepted by push service')
            : t('failed', 'Pending or failed')) +
          ' · ' +
          new Date(item.accepted_at || item.created_at).toLocaleString(deps.locale());
        root.append(p);
      }
      if (!root.children.length) {
        const p = document.createElement('p');
        p.textContent = t('none', 'No recent activity.');
        root.append(p);
      }
    }
    async function loadConfig() {
      config = await request('config');
      if (!config.available) throw Error('not_configured');
      return config;
    }
    async function removeServer() {
      if (state.endpoint) {
        await request('unsubscribe', identity());
        state.synced = '';
        remote = null;
        persist();
      }
    }
    function matchesKey(sub) {
      if (!sub.options?.applicationServerKey) return true;
      const actual = new Uint8Array(sub.options.applicationServerKey);
      const expected = Uint8Array.from(
        atob(config.publicKey.replace(/-/g, '+').replace(/_/g, '/')),
        (c) => c.charCodeAt(0),
      );
      return actual.length === expected.length && actual.every((v, i) => v === expected[i]);
    }
    async function upload(sub) {
      const wanted = desired(),
        sig = JSON.stringify(wanted);
      await request('subscribe', { ...sub.toJSON(), ...identity(), ...wanted });
      state.synced = sig;
      state.renewedAt = Date.now();
      persist();
      phase = 'active';
    }
    function finishOperation() {
      busy = false;
      paint();
      if (queuedReconcile !== null) {
        const force = queuedReconcile;
        queuedReconcile = null;
        queueMicrotask(() => reconcile(force));
      }
    }
    async function reconcile(force = false) {
      if (busy) {
        queuedReconcile = queuedReconcile === true || force;
        return;
      }
      const preserveBlocked = phase === 'blocked' && global.Notification?.permission === 'denied';
      busy = true;
      message = '';
      paint();
      try {
        if (!supported()) {
          phase = 'off';
          return;
        }
        if (!navigator.onLine) throw Error('offline');
        if (!config || force) await loadConfig();
        const sub = await getSubscription();
        if (!state.enabled) {
          await removeServer();
          if (sub && !(await sub.unsubscribe())) throw Error('cleanup');
          state.endpoint = '';
          persist();
          phase = preserveBlocked ? 'blocked' : 'off';
          return;
        }
        if (Notification.permission === 'denied') {
          phase = 'blocked';
          await removeServer();
          return;
        }
        if (!sub || Notification.permission !== 'granted') {
          phase = 'repair';
          return;
        }
        if (!matchesKey(sub)) {
          await removeServer();
          phase = 'repair';
          return;
        }
        if (state.endpoint && state.endpoint !== sub.endpoint) await removeServer();
        state.endpoint = sub.endpoint;
        token();
        persist();
        let wanted;
        try {
          wanted = desired();
        } catch (e) {
          await removeServer();
          phase = e.message;
          return;
        }
        try {
          remote = await request('status', identity());
        } catch (e) {
          if (e.message !== 'not_registered') throw e;
          remote = null;
        }
        if (
          !remote?.registered ||
          state.synced !== JSON.stringify(wanted) ||
          Date.now() - state.renewedAt > 86400000
        )
          await upload(sub);
        phase = 'active';
        checkedAt = Date.now();
      } catch (e) {
        phase = e.message === 'not_configured' ? 'unavailable' : 'error';
        message = errorText(e);
      } finally {
        finishOperation();
      }
    }
    async function enable(draft, afterEnabled) {
      if (busy) return;
      message = '';
      deliveryMessage = '';
      try {
        desired(draft);
        token();
        persist();
      } catch (e) {
        message = errorText(e);
        phase = 'error';
        paint();
        return;
      }
      if (!config?.available) {
        phase = 'unavailable';
        paint();
        return;
      }
      // Set ownership before the native prompt can dispatch foreground events.
      // No await occurs before requesting permission in the original gesture.
      busy = true;
      pendingEnabled = true;
      paint();
      try {
        const permission =
          Notification.permission === 'default'
            ? Notification.requestPermission()
            : Promise.resolve(Notification.permission);
        if ((await permission) !== 'granted') throw Error('denied');
        state = { ...state, ...structuredClone(draft), enabled: true };
        persist();
        const reg = await registration();
        let sub = await bounded(reg.pushManager.getSubscription());
        if (sub && !matchesKey(sub)) {
          await removeServer();
          if (!(await sub.unsubscribe())) throw Error('cleanup');
          sub = null;
        }
        if (!sub)
          sub = await bounded(
            reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: Uint8Array.from(
                atob(config.publicKey.replace(/-/g, '+').replace(/_/g, '/')),
                (c) => c.charCodeAt(0),
              ),
            }),
          );
        if (state.endpoint && state.endpoint !== sub.endpoint) await removeServer();
        state.endpoint = sub.endpoint;
        persist();
        await upload(sub);
        remote = await request('status', identity());
        if (afterEnabled) await afterEnabled();
      } catch (e) {
        phase = e.message === 'denied' ? 'blocked' : 'error';
        message = errorText(e);
      } finally {
        pendingEnabled = null;
        finishOperation();
      }
    }
    async function disable() {
      if (busy) return;
      deliveryMessage = '';
      state.enabled = false;
      // Storage failure must never prevent stopping browser/server delivery.
      let storageFailure;
      try {
        persist();
      } catch (e) {
        storageFailure = e;
      }
      busy = true;
      message = '';
      paint();
      let failure = storageFailure;
      try {
        await removeServer();
      } catch (e) {
        failure = e;
      }
      try {
        const sub = await getSubscription();
        if (sub && !(await sub.unsubscribe())) throw Error('cleanup');
      } catch (e) {
        failure = failure || e;
      }
      if (!failure) {
        state.endpoint = '';
        state.synced = '';
        try {
          persist();
        } catch {
          failure = Error('storage');
        }
      }
      phase = failure ? 'error' : 'off';
      message = failure ? errorText(failure) : '';
      finishOperation();
    }
    async function save(draft) {
      if (busy) return;
      deliveryMessage = '';
      try {
        if (state.enabled) desired(draft);
        state = { ...state, ...structuredClone(draft) };
        persist();
      } catch (e) {
        message = errorText(e);
        phase = 'error';
        paint();
        return;
      }
      await reconcile();
      if (phase === 'active' || phase === 'off') {
        const saved = t('saved', 'Preferences saved.');
        message = saved;
        paint();
        setTimeout(() => {
          if (message === saved && !busy) {
            message = '';
            paint();
          }
        }, 2000);
      }
    }
    function placesChanged() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (state.enabled) reconcile();
      }, 750);
    }
    function element(tag, cls, text) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text) e.textContent = text;
      return e;
    }
    function labelled(root, text, input) {
      const label = element('label', 'weather-push-control'),
        name = element('span', '', text);
      name.id = 'wxPushLabel' + ++controlId;
      input.setAttribute('aria-labelledby', name.id);
      label.append(name, input);
      root.append(label);
      return input;
    }
    function check(root, text, value, onchange, switchStyle = false) {
      const input = element('input');
      input.type = 'checkbox';
      input.checked = value;
      input.addEventListener('change', () => onchange(input.checked));
      const label = element(
        'label',
        switchStyle ? 'weather-push-control weather-push-switch' : 'weather-push-control',
      );
      label.append(element('span', '', text), input);
      if (switchStyle) label.append(element('span', 'weather-push-track'));
      root.append(label);
      return input;
    }
    function select(root, text, options, value, onchange) {
      const input = element('select');
      options.forEach(([v, label]) => {
        const o = element('option', '', label);
        o.value = v;
        input.append(o);
      });
      input.value = value;
      input.addEventListener('change', () => onchange(input.value));
      return labelled(root, text, input);
    }
    function section(root, title) {
      const field = element('fieldset', 'weather-push-section');
      field.append(element('legend', '', title));
      root.append(field);
      return field;
    }
    function mountSummary(root, open) {
      const button = element('button', 'weather-push-summary');
      button.type = 'button';
      button.append(element('span', '', t('title', 'Notifications')));
      const status = element('span', 'weather-push-summary-status');
      button.append(status, element('span', 'weather-push-chevron', '›'));
      button.lastChild.setAttribute('aria-hidden', 'true');
      button.addEventListener('click', open);
      root.append(button);
      views.add({ root: button, status });
      paint();
    }
    async function sendTest() {
      try {
        await request('test', {
          ...identity(),
          message: t('testBody', 'Notifications are connected on this device.'),
        });
        deliveryMessage = t('testAccepted', 'Test accepted by the push service. Check your device for the notification.');
        try {
          remote = await request('status', identity());
        } catch {
          /* Transport acceptance remains true if activity refresh fails. */
        }
        return true;
      } catch (e) {
        deliveryMessage = e.message === 'delivery_failed'
          ? t('testFailed', 'The test could not be sent. Try again.') : errorText(e);
        return false;
      }
    }
    function privacyText() {
      return t(
        'privacy',
        'Enabling notifications stores your selected places and subscription securely on duskline’s server for 90 days, renewed when you use the app. Turning notifications off removes the server record.',
      );
    }
    function privacyDisclosure() {
      const disclosure = element('p', 'wx-sheet-context', privacyText());
      disclosure.id = 'weatherPushPrivacy' + ++controlId;
      const link = element('a', '', deps.t('legal.privacyLink', 'Privacy Policy'));
      link.href = 'privacy.html';
      disclosure.append(' ', link);
      return disclosure;
    }
    function mountMySky(root, options) {
      const copy = element('div', 'weather-push-enroll-copy'),
        caption = element('p'),
        button = element('button', 'weather-btn weather-push-subscribe'),
        status = element('p', 'weather-push-enroll-status');
      copy.append(element('strong', '', t('enable', 'Weather notifications')), caption);
      button.type = 'button';
      status.id = 'weatherPushEnrollStatus';
      status.setAttribute('role', 'status');
      const privacy = element('details', 'weather-push-enroll-privacy'),
        disclosure = privacyDisclosure();
      privacy.append(element('summary', '', deps.t('legal.privacyLink', 'Privacy Policy')), disclosure);
      button.setAttribute('aria-describedby', status.id + ' ' + disclosure.id);
      button.addEventListener('click', () => {
        if (state.enabled || phase === 'blocked' || phase === 'unavailable') {
          options.openSettings();
        } else if (!supported()) {
          options.install();
        } else {
          settingsDraft = null;
          const startingFocus = document.activeElement;
          enrollmentPending = true;
          enable({ follow: true, selected: [], preferences: structuredClone(state.preferences) }, async () => {
            const accepted = await sendTest();
            const hint = t('manageHint', 'Manage alerts or unsubscribe in Settings → Notifications.');
            options.notify((accepted ? '' : deliveryMessage + ' ') + hint, accepted ? undefined : 'error');
          }).finally(() => {
            const restoreFocus = root.contains(document.activeElement) || document.activeElement === document.body || document.activeElement === startingFocus;
            enrollmentPending = false;
            paint();
            if (restoreFocus && root.hidden && options.visible()) options.focusAfter();
          });
        }
      });
      root.append(copy, button, status, privacy);
      views.add({ root, status, caption, subscribe: button, disclosure, visible: options.visible });
      paint();
    }
    function mountSettings(root) {
      const draft =
        settingsDraft ||
        (settingsDraft = {
          follow: state.follow,
          selected: state.selected.slice(),
          preferences: structuredClone(state.preferences),
        });
      const container = element('section', 'weather-push-settings'),
        status = element('p', 'weather-push-status');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      root.append(container);
      const overview = element('div', 'weather-push-overview');
      container.append(overview);
      const toggle = check(
        overview,
        t('enable', 'Weather notifications'),
        state.enabled,
        (value) => (value ? enable(draft) : disable()),
        true,
      );
      toggle.className = 'weather-push-toggle';
      overview.append(status);
      const disclosure = privacyDisclosure();
      toggle.setAttribute('aria-describedby', disclosure.id);
      const places = section(container, t('places', 'Monitored places'));
      check(places, t('follow', 'Follow My Sky primary city'), draft.follow, (v) => {
        draft.follow = v;
        cityBox.hidden = v;
        primaryHint.hidden = !v;
      });
      const primary = deps.primary();
      const primaryHint = element(
        'p',
        'wx-sheet-context',
        primary ? deps.cityName(primary) : t('choose', 'Choose a saved place first.'),
      );
      primaryHint.hidden = !draft.follow;
      places.append(primaryHint);
      const cityBox = element('div', 'weather-push-cities');
      cityBox.hidden = draft.follow;
      places.append(cityBox);
      const all = known();
      all.forEach((city) => {
        const supportedPlace = countryCode(city) === 'US';
        const input = check(
          cityBox,
          deps.cityName(city) + (supportedPlace ? '' : ' · ' + t('coverageShort', 'US only')),
          draft.selected.includes(key(city)),
          (v) => {
            draft.selected = v
              ? [...new Set(draft.selected.concat(key(city)))]
              : draft.selected.filter((k) => k !== key(city));
          },
        );
        if (!supportedPlace) {
          input.disabled = true;
          input.dataset.unsupported = 'true';
        }
      });
      places.append(
        element(
          'p',
          'wx-sheet-context',
          t('limit', 'Choose up to five places.') +
            ' ' +
            t('coverage', 'Background alerts are available for US places only.'),
        ),
      );
      const rules = section(container, t('rules', 'Alert preferences'));
      select(
        rules,
        t('severity', 'Minimum severity'),
        [
          ['all', t('allSeverities', 'All severities')],
          ['moderate', t('moderate', 'Moderate and above')],
          ['severe', t('severe', 'Severe and extreme')],
          ['extreme', t('extreme', 'Extreme only')],
        ],
        draft.preferences.severity,
        (v) => (draft.preferences.severity = v),
      );
      select(
        rules,
        t('types', 'Alert type'),
        [
          ['all', t('all', 'All types')],
          ['storm', t('storm', 'Storms')],
          ['flood', t('flood', 'Flooding')],
          ['winter', t('winter', 'Winter and cold')],
          ['heat', t('heat', 'Heat')],
          ['wind', deps.t('weather.wind', 'Wind')],
          ['other', t('other', 'Other')],
        ],
        draft.preferences.categories[0],
        (v) => (draft.preferences.categories = [v]),
      );
      check(
        rules,
        t('updates', 'Include significant updates'),
        draft.preferences.updates,
        (v) => (draft.preferences.updates = v),
      );
      const actions = element('div', 'weather-push-actions'),
        saveButton = element('button', 'weather-btn', t('save', 'Save preferences')),
        retry = element('button', 'weather-btn', deps.t('weather.retry', 'Retry')),
        test = element('button', 'weather-btn', t('test', 'Send test notification'));
      for (const b of [saveButton, retry, test]) b.type = 'button';
      saveButton.addEventListener('click', () => save(draft));
      retry.addEventListener('click', () =>
        phase === 'unavailable'
          ? reconcile(true)
          : state.enabled
            ? phase === 'blocked' || phase === 'repair'
              ? enable(draft)
              : reconcile(true)
            : disable(),
      );
      test.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        message = '';
        deliveryMessage = '';
        paint();
        try {
          await sendTest();
        } finally {
          finishOperation();
        }
      });
      actions.append(saveButton, retry, test);
      container.append(
        actions,
        element(
          'p',
          'wx-sheet-context',
          t(
            'deliveryNote',
            'Delivery depends on your connection and device settings. Alerts are checked about once a minute; a push-service acceptance does not confirm delivery.',
          ),
        ),
      );
      const activity = section(container, t('activity', 'Recent activity'));
      const activityItems = element('div');
      activity.append(activityItems);
      container.append(disclosure);
      views.add({ root: container, status, toggle, retry, test, activity: activityItems });
      paint();
      container.querySelectorAll('[data-unsupported]').forEach((e) => (e.disabled = true));
      if (!busy) reconcile();
    }
    function init() {
      if (supported()) reconcile();
      global.addEventListener('online', () => reconcile(true));
      global.addEventListener('pageshow', () => {
        if (Date.now() - checkedAt > 60000) reconcile();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && Date.now() - checkedAt > 60000) reconcile();
      });
      navigator.serviceWorker?.addEventListener('message', (event) => {
        if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') reconcile(true);
      });
    }
    return {
      init,
      mountSummary,
      mountMySky,
      refreshViews: paint,
      mountSettings,
      reconcile,
      placesChanged,
      supported,
      getSubscription,
      getState: () => ({ ...state, phase, busy }),
    };
  };
})(window);
