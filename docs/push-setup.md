# Duskline push notifications — setup

Severe weather alert push notifications via Web Push. All code is in the repo;
this doc covers the Cloudflare-side setup (dashboard/CLI steps).

## What was built

- `functions/api/push/subscribe.js` + `unsubscribe.js` — Pages Functions that
  store/remove push subscriptions in KV (bound as `PUSH_KV`).
- `workers/alert-poller/` — standalone Worker on a 5-minute cron. Reads every
  subscription from KV, checks NWS active alerts for each US location, and
  sends Web Push for new severe/extreme alerts (deduped per subscription).
- `sw.js` — `push` handler (shows the notification) and `notificationclick`
  handler (focuses/opens the app).
- `src/js/features/weather/push-notifications.js` — frontend: a "Severe weather
  alerts" toggle injected into the settings sheet next to Haptics, managing
  the PushManager subscription lifecycle against the primary saved place.

## Cloudflare setup (your steps)

### 1. KV namespace

Create one KV namespace and bind it in **both** places:

```
wrangler kv namespace create PUSH_KV
```

- Pages: dashboard → your Pages project → Settings → Functions → KV namespace
  bindings → add `PUSH_KV` → select the namespace. (Also add it to the
  Preview environment if you want it on preview deploys.)
- Worker: put the namespace `id` from the command output into
  `workers/alert-poller/wrangler.toml`.

### 2. VAPID keys

A keypair was generated for you (Muse has the private key — ask for it when
you reach this step; the public key is already in `push-notifications.js`).

Set these as **Worker secrets** (never commit them):

```
cd workers/alert-poller
wrangler secret put VAPID_PUBLIC_KEY
wrangler secret put VAPID_PRIVATE_KEY
wrangler secret put VAPID_SUBJECT   # e.g. mailto:you@example.com
```

The Pages Functions only need the `PUSH_KV` binding — no secrets there.

### 3. Deploy the poller

```
cd workers/alert-poller
wrangler deploy
```

The cron trigger (`*/5 * * * *`) is in `wrangler.toml` and activates on
deploy. Check Workers → duskline-alert-poller → Triggers to confirm the
cron is listed.

### 4. Deploy the site

Commit and push as usual — the Pages Functions and `sw.js` changes deploy
with the site. The service worker version bump happens automatically on
the next deploy that changes `sw.js` (it's already changed in this commit).

## Trying it

1. Open the deployed site, go to Settings (gear icon).
2. Below Haptics you'll see "Severe weather alerts" — toggle it on.
3. Grant the notification permission when asked. (Requires a saved place;
   iOS needs 16.4+ with the PWA installed to Home Screen.)
4. To force a test: temporarily change the Worker's cron to `* * * * * *`
   — no, use `* * * * *` (every minute) — redeploy, wait for a run, then
   set it back. Or trigger a push directly from the Worker dashboard's
   "Test cron trigger". A faster local check: in DevTools console,
   `DusklineWeather.pushNotifications.getSubscription()` should resolve
   to a subscription object after toggling on.
5. Real alerts only fire on actual NWS severe/extreme alerts for your
   subscribed location.

## Notes

- Non-US locations are currently skipped by the poller (NWS only). IFRC
  polling can be added later following the same pattern.
- Expired subscriptions (410/404 from the push service) are cleaned up
  automatically by the poller.
- The sent-alert ledger keeps the last 50 alert ids per subscription.
