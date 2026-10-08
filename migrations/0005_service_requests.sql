-- Private recruitment and language-support requests. No public read endpoint.
CREATE TABLE service_requests (
 id TEXT PRIMARY KEY,
 kind TEXT NOT NULL CHECK(kind IN ('career','interpretation')),
 data_json TEXT NOT NULL,
 attachment_key TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','confirmed','closed')),
 note TEXT NOT NULL DEFAULT '',
 revision INTEGER NOT NULL DEFAULT 1,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX service_requests_expiry ON service_requests(expires_at);
CREATE TABLE request_limits (
 key TEXT PRIMARY KEY,
 attempts INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
