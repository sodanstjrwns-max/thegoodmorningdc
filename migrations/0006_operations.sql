-- Additive migration. Existing public content and bootstrap admin sessions are preserved.
CREATE TABLE staff_users (
 id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('admin','editor','reviewer','coordinator')),
 password_hash TEXT NOT NULL, salt TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1,
 revision INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
);
ALTER TABLE admin_sessions ADD COLUMN user_id TEXT NOT NULL DEFAULT '';
CREATE INDEX admin_session_user ON admin_sessions(user_id);
CREATE TABLE content_reviews (
 kind TEXT NOT NULL, key TEXT NOT NULL, content_revision INTEGER NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('pending','changes','approved','published','stale')),
 submitted_by TEXT NOT NULL, decided_by TEXT NOT NULL DEFAULT '', note TEXT NOT NULL DEFAULT '',
 updated_at TEXT NOT NULL, PRIMARY KEY(kind,key)
);
CREATE TABLE audit_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT NOT NULL, action TEXT NOT NULL,
 target TEXT NOT NULL, created_at TEXT NOT NULL
);
ALTER TABLE service_requests ADD COLUMN assigned_to TEXT NOT NULL DEFAULT '';
CREATE INDEX request_assignee ON service_requests(assigned_to,status);
CREATE TABLE operation_settings (key TEXT PRIMARY KEY,value_json TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE notification_outbox (
 id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE, state TEXT NOT NULL DEFAULT 'pending',
 attempts INTEGER NOT NULL DEFAULT 0, next_attempt INTEGER NOT NULL DEFAULT 0,
 lease_until INTEGER NOT NULL DEFAULT 0, last_result TEXT NOT NULL DEFAULT '',
 created_at INTEGER NOT NULL, sent_at INTEGER
);
CREATE TABLE event_daily (
 day TEXT NOT NULL, page TEXT NOT NULL, event TEXT NOT NULL, branch TEXT NOT NULL DEFAULT '',
 target TEXT NOT NULL DEFAULT '', total INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(day,page,event,branch,target)
);
CREATE TABLE event_limits (key TEXT PRIMARY KEY, total INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE mutation_locks (key TEXT PRIMARY KEY, token TEXT NOT NULL, expires_at INTEGER NOT NULL);
