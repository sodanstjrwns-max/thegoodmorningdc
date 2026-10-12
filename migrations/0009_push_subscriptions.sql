-- Additive: Web Push devices registered by signed-in staff (admin/coordinator) for new-request alerts.
CREATE TABLE IF NOT EXISTS push_subscriptions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 endpoint TEXT NOT NULL UNIQUE,
 p256dh TEXT NOT NULL,
 auth TEXT NOT NULL,
 label TEXT,
 staff_id TEXT NOT NULL DEFAULT '',
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 last_ok_at DATETIME,
 fail_count INTEGER NOT NULL DEFAULT 0
);
