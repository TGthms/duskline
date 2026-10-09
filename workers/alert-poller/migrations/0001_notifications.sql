PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id TEXT PRIMARY KEY, endpoint TEXT NOT NULL UNIQUE, token_hash TEXT NOT NULL,
  keys_json TEXT NOT NULL, locations_json TEXT NOT NULL, preferences_json TEXT NOT NULL,
  created_at INTEGER NOT NULL, renewed_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
  last_checked_at INTEGER, last_error TEXT
);
CREATE INDEX IF NOT EXISTS push_subscriptions_expiry ON push_subscriptions(expires_at,id);
CREATE TABLE IF NOT EXISTS push_deliveries (
  subscription_id TEXT NOT NULL REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  delivery_key TEXT NOT NULL, kind TEXT NOT NULL, status TEXT NOT NULL,
  created_at INTEGER NOT NULL, accepted_at INTEGER, error_code TEXT,
  lease_until INTEGER NOT NULL DEFAULT 0, attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(subscription_id,delivery_key)
);
CREATE INDEX IF NOT EXISTS push_delivery_retention ON push_deliveries(created_at);
CREATE TABLE IF NOT EXISTS push_limits (key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS push_limits_expiry ON push_limits(expires_at);
CREATE TABLE IF NOT EXISTS push_scheduler (name TEXT PRIMARY KEY,cursor TEXT NOT NULL DEFAULT '',lease_until INTEGER NOT NULL DEFAULT 0);
