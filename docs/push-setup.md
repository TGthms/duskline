# Background weather notifications

Notifications use Cloudflare D1, Pages Functions, one scheduled Worker, and Web Push. No paid resource or third-party notification platform is required. The browser app remains static and works without enabling notifications.

## Production resources

- Pages project: `dusklineweather` (production branch `main`).
- Worker: `duskline-alert-poller`, configured in `workers/alert-poller/wrangler.toml`.
- D1: `duskline-notifications`, binding `PUSH_DB` in **both** Pages and Worker.
- Pages service binding: `PUSH_SENDER` → `duskline-alert-poller`, entrypoint **Default** (the `PushService` class).
- Existing Worker secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.

The private key stays in the Worker. Pages gets the public key and validated configuration through the service binding; no key is hardcoded in browser code. `getConfig()` verifies the keypair before advertising availability. Test notifications also use the service binding, not a public sender endpoint. The Worker needs no public `workers.dev` or preview URL.

Production bindings must not be copied into public preview environments. Use a separate test database/Worker/keypair for previews, or leave notifications unavailable there. Do not attach production data to arbitrary branch deployments.

## Installation / repeatable deployment

Use Node.js 22 or newer and `npm ci`. For a new installation, create a dedicated database with `npx wrangler d1 create duskline-notifications` and put its returned ID in the Worker config. Do not recreate the existing production database above.

Apply migrations before deploying code:

```sh
npx wrangler d1 migrations apply duskline-notifications --remote --config workers/alert-poller/wrangler.toml
```

For dashboard SQL installation, execute migrations in filename order and record their names in the standard `d1_migrations` table. Do not run the `ALTER TABLE` migration a second time. Wrangler uses `id INTEGER PRIMARY KEY AUTOINCREMENT`, `name TEXT UNIQUE`, and `applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL` for that table.

Keep the existing VAPID keypair when upgrading. Rotating it requires browser resubscription; the app detects a changed application-server key and offers Reconnect. For a fresh installation, generate an EC P-256 keypair and set all three Worker secrets through Cloudflare's secret controls or `wrangler secret put`. The public key is the 65-byte uncompressed point encoded as base64url; the private key is the 32-byte private scalar encoded as base64url. The subject is a maintainer `mailto:` or HTTPS contact URI. Never put the private key in Git, the browser, a build variable, or a public API response.

Deploy the Worker before the Pages release:

```sh
npx wrangler deploy --config workers/alert-poller/wrangler.toml
```

Confirm its D1 binding and existing secrets, add the production Pages D1 and service bindings, then deploy Pages normally. Settings → Notifications should report service availability. Accept the PWA's Update prompt to load shell v83.

## Retired KV setup

The owner confirmed that no existing users need migration; the aggregate check also showed zero registered subscriptions. The old KV index, migration/claim code and runtime KV bindings are retired. D1 is the only notification store, and each subscription requires its installation capability. An unbound KV namespace may be retained as an inert backup; it runs no jobs and consumes no operation quota. Deleting the namespace is optional and permanent.

Keep only one cron, `* * * * *`, on the existing Worker. Update the previous five-minute trigger in place; do not create a second poller. The Worker needs no queue consumers, paid database, public sender route or external log destination. Logs contain aggregate counts and error codes, never endpoints, keys, capabilities or city coordinates.

## Free-tier bounds and quality

Cloudflare Free currently allows 50 D1 queries per invocation, 5 million rows read and 100,000 rows written daily, and 100,000 Worker requests daily. Worker CPU is also limited. See the [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), and [Worker limits](https://developers.cloudflare.com/workers/platform/limits/).

The implementation:

- performs no scheduler/ledger writes when unused; an empty poll makes two bounded indexed reads and deletes rate-limit buckets only when they have expired;
- rotates through at most 50 subscriptions per run, with a strict query budget including leases, cleanup and status updates;
- makes one NWS request per distinct point in a batch and caps network waits and total batch work;
- sends at most five notifications per run to bound cryptographic work and burst load;
- updates provider-health timestamps at most once per five minutes unless the error state changes;
- writes delivery records only for eligible attempts, and remembers each accepted attempt immediately;
- uses indexed expiry cleanup and deletes expired endpoints and their delivery records together;
- expires subscriptions after 90 days without app renewal; delivery activity after seven days; temporary rate-limit buckets after at most two hours.

The one-minute cron is a polling interval, not a delivery guarantee. Larger subscriber populations or alert bursts can take multiple rounds. Monitor `push_poll_complete`, D1 daily row usage, Worker CPU/errors, and the age of `last_checked_at`; reduce unnecessary retained subscriptions or reconsider capacity before saturation. Do not silently raise these bounds or promise emergency-grade delivery to fit the free tier. No automatic paid upgrade is configured.

## User behavior

Settings supports following My Sky's actual primary city (including My Location) or selecting up to five saved US places. Users can choose minimum severity, alert type, significant updates, quiet hours/timezone, and an explicit extreme-alert override. Changes are committed with Save preferences. Quiet hours pause eligible delivery; an alert still active when quiet hours end may then be delivered.

Permission, browser subscription, desired preferences and confirmed server registration are separate states. Failed enable/disable intent survives reconnect; removing the last eligible place pauses server monitoring. Unsupported countries never appear actively monitored. Permission denial stays visible with recovery guidance. iOS requires an installed Home Screen app and a direct user gesture for the initial permission request.

NWS actual alerts and updates are considered; tests, cancellations, future-effective and expired warnings are excluded. Significant content changes have separate delivery identities when updates are enabled. VTEC/reference identity links an incident's revisions. TTL is bounded by expiry and at most one hour. Stable notification tags and `renotify:false` mitigate a duplicate after a crash; Web Push cannot guarantee exactly-once receipt.

Tapping a warning opens that city and expands a current matching warning, including a newer revision of the same event. Expired notifications explain that current alerts are being shown. Notification URLs remain inside duskline. System sound, Focus and notification presentation are controlled by the device, not fabricated app settings.

## Verification

```sh
npm run check
npm run test:unit
npm run test:push-runtime
npm test
npm run test:cross
```

The runtime gate builds the actual Pages routes and Worker, then exercises default-entrypoint RPC, VAPID health, D1 ownership/deletion and an encrypted test send using disposable local keys/database and an intercepted push-service response. It also verifies a redirect is treated as failed delivery without contacting its target. Workers fetch supports `redirect:'manual'`, not `redirect:'error'`; do not regress this to browser-only behavior. Independent tests verify JWT signatures and decrypt RFC 8291 payloads, plus failure, quota, deduplication and retention cases. Browser tests mock permission and provider APIs; they cannot certify physical notification receipt.

On the reported installed iOS PWA: accept Update, open Settings → Notifications, enable for a supported city, then Send test notification. Confirm it arrives with the app backgrounded and that a warning opens the intended city. “Accepted by push service” means transport acceptance, not confirmed device delivery. Disabling online must remove the server registration.
