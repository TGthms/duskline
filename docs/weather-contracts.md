# Weather runtime contracts

The app remains a static HTML/CSS/classic-JavaScript application. Script order is explicit in `index.html` and tested against the module table in `src/js/features/weather/README.md`. Every first-party runtime dependency must be included in the versioned worker shell.

## Forecast records

A successful pack has a `city`, `weather.current`, `weather.daily`, and `fetchedAt` in epoch milliseconds. `weather.hourly` may be absent in a light list pack. `light` and `needsEnrich` must accurately describe that absence. A missing provider value is `null` or absent, never an invented zero; validate before numeric conversion. Zero temperature, probability and AQI are valid readings.

City identity uses rounded coordinates; geocoder deduplication additionally preserves provider IDs and administrative differences. Names, countries and administrative regions from providers are escaped before entering markup. Search selection validates a finite current temperature before changing the primary place.

Internal temperatures are Celsius, wind speeds are metres/second, precipitation is millimetres, pressure is hPa and visibility is metres. Formatters own all display-unit conversion. Daily NWS values have precedence where valid; Open-Meteo fills gaps and supplies extended dates. Hourly detail uses the Open-Meteo calendar grid. A multi-provider daily range is not synthesized from cross-provider extrema.

Open-Meteo timestamps without an offset are city-local wall-clock values when `timezone=auto`. NWS timestamps include their offsets. All comparisons pass through `DusklineWxMath` helpers with the city timezone. The map requests GMT and matches cached sample timestamps explicitly. Elapsed saved hours and exhausted saved days are never presented as upcoming weather.

## Request and view ownership

`city-refresh.js` owns a cancellable full-city refresh and waits for forecast, optional air enrichment and alerts to settle. Usable weather paints before optional AQI. List refresh is separate. Each forecast/air request generation prevents a late response from overwriting newer city data. An old view's success and failure are both gated by city identity and current intent.

`aqi.js` owns detailed air-quality TTL, missing-value handling and patching onto the latest city record. Its responses never replace an entire newer forecast. Alerts are network-only and are never persisted in offline snapshots. Empty successful and unsupported-coverage results produce no alert card; actionable alerts remain prominent and failed checks retain compact recovery controls.

`forecast-sheet.js` renders the shared date-aware temperature/precipitation body. All hourly/day/feels-like entry points use that contract. Future days start at ranges unless an hour was explicitly selected. Precipitation probability always uses 0–100%; AQI is not a percentage. Actual/Feels Like, date selection, units, focus and scroll survive appropriate refreshes.

`navigation.js` owns city, sheet and map history. View dismissal must respect pending navigation, restore focus and release the corresponding scroll lock. Button activation belongs to the original input event; native iOS feedback is optional and cannot swallow or duplicate the action. Native switch hosts are retained across icon replacement.

## Persistence and map bounds

Snapshots contain forecast data, air data, city metadata and original fetch time, never alerts. They are bounded to 34 records and seven days. Writes coalesce during idle time, and flush on pagehide/backgrounding. Favorites have an explicit 24-place limit; saving beyond capacity does not evict user-curated places.

Weather maps use a stable, quantized geographic lattice capped at 64 samples per request. Four-corner interpolation is local; missing cells remain transparent. Individual sample and viewport caches are bounded and expire after eight minutes. A map estimate is a model estimate, not an observation. The global AQI map uses CAMS global/US AQI and discloses approximately 45km model resolution.

The atlas remains visible until a frame paints geographic features; startup does not wait for all optional sources, labels and tiles. Isolated source failures do not destroy a usable renderer. A ready renderer is retained for at most two minutes while closed, and released when the app backgrounds. Returning from city detail puts the opaque map behind its exit immediately. Retryable map failures recover in place after three and twelve seconds, with at most two retries per open; close cancels recovery. Cold-load deadlines, close/reopen generations, context-loss recovery, visibility suspension and request throttling must remain paired with cleanup. Layer switches must not show temperature pixels under an AQI legend.

## Validation

Run `npm run check`, `npm run test:unit`, `npm test`, and `npm run test:cross`. `npm run test:visual` compares pinned macOS Chromium images; other engines receive semantic/layout tests. CI runs visual baselines in a separate macOS job so platform font/rendering differences do not silently redefine expectations. Update baselines deliberately after reviewing every changed image.

Run `npm run weather:i18n` after editing catalogs. New literal UI keys require real source translations in all 30 locales. Bundled Public Sans subsets and maskable icons are included in the shell. Script-specific Noto fonts load on demand, with system fallbacks offline.

## Background notifications

`push-notifications.js` owns durable desired preferences, browser permission/subscription, confirmed server registration and pending disable cleanup separately. Settings mounts it explicitly; no body-wide observer owns rendering. Edits stay in a draft until saved or enabled. Permission is requested in the original gesture after place/setting validation. Browser storage failure cannot prevent disabling delivery. Reconnect, foreground resume, primary-place changes and application-server-key rotation reconcile the existing subscription without silently requesting permission or claiming unsupported coverage.

Notification APIs require an installation capability and validate endpoint providers, key material, places and preferences. Only US background coverage is offered. D1 stores bounded places/preferences and expiring subscriptions/delivery attempts; no shared mutable index is authoritative. The scheduled Worker's cursor and delivery leases are atomic. Successful sends persist immediately, stable tags suppress duplicate renotification after crash retries, and expiry bounds TTL. Critical warnings lead a batch. Free-tier query, work, send and retention bounds remain paired with cleanup. An unused service performs no recurring writes.

Pages talks to the named `PushService` entrypoint through a service binding; the VAPID private key stays in the Worker. Configuration health verifies the pair, and the delivery test uses this same transport. Notification links stay on the app's origin, open the intended city and match a current warning or explain expiry. Optional background alerts never block usable forecast rendering or navigation.
