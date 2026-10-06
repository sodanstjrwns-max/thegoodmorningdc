-- Draft and live snapshots are separate: saving work never alters published content.
CREATE TABLE content_entries (
 kind TEXT NOT NULL,
 key TEXT NOT NULL,
 draft_json TEXT NOT NULL,
 live_json TEXT,
 revision INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL,
 PRIMARY KEY(kind,key)
);
CREATE TABLE content_history (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 kind TEXT NOT NULL,
 key TEXT NOT NULL,
 action TEXT NOT NULL,
 snapshot TEXT NOT NULL,
 created_at TEXT NOT NULL
);
CREATE INDEX content_history_lookup ON content_history(kind,key,id);
CREATE TABLE channel_cache (
 key TEXT PRIMARY KEY,
 items_json TEXT NOT NULL DEFAULT '[]',
 fetched_at INTEGER NOT NULL DEFAULT 0,
 next_attempt INTEGER NOT NULL DEFAULT 0,
 error TEXT NOT NULL DEFAULT ''
);
