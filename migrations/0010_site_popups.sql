-- Additive: admin-managed notice popups (max 10, enforced in the application).
CREATE TABLE IF NOT EXISTS site_popups (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 body TEXT NOT NULL DEFAULT '',
 image TEXT NOT NULL DEFAULT '',
 image_alt TEXT NOT NULL DEFAULT '',
 link_url TEXT NOT NULL DEFAULT '',
 start_date TEXT NOT NULL DEFAULT '',
 end_date TEXT NOT NULL DEFAULT '',
 enabled INTEGER NOT NULL DEFAULT 0,
 sort_order INTEGER NOT NULL DEFAULT 0,
 revision INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS site_popups_active ON site_popups(enabled,sort_order);
