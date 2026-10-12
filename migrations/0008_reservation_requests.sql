-- Additive: on-site reservation/consultation requests. Same private inbox, roles and
-- retention model as service_requests (whose kind CHECK cannot be altered additively).
-- Statuses: new=신규, contacted=연락완료, confirmed=예약확정, cancelled=취소.
CREATE TABLE IF NOT EXISTS reservation_requests (
 id TEXT PRIMARY KEY,
 data_json TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','confirmed','cancelled')),
 note TEXT NOT NULL DEFAULT '',
 assigned_to TEXT NOT NULL DEFAULT '',
 revision INTEGER NOT NULL DEFAULT 1,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS reservation_requests_expiry ON reservation_requests(expires_at);
CREATE INDEX IF NOT EXISTS reservation_requests_assignee ON reservation_requests(assigned_to,status);
