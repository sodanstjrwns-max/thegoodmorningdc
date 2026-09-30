CREATE TABLE IF NOT EXISTS posts (
 id TEXT PRIMARY KEY,
 slug TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL,
 body TEXT NOT NULL,
 type TEXT NOT NULL CHECK(type IN ('blog','notice')),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published')),
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_public ON posts(status,type,updated_at);
CREATE TABLE IF NOT EXISTS admin_sessions(token_hash TEXT PRIMARY KEY,expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS admin_attempts(id INTEGER PRIMARY KEY AUTOINCREMENT,ip_hash TEXT NOT NULL,attempted_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_attempts_ip ON admin_attempts(ip_hash,attempted_at);
INSERT OR IGNORE INTO posts VALUES('initial-visit','before-your-visit','처음 방문하실 때 준비하면 좋은 것들','## 이전 치료 경험을 알려주세요

현재 불편한 증상뿐 아니라 이전 치료에서 어려웠던 부분도 말씀해 주세요. 통증, 구역반사, 소리나 냄새에 대한 불안은 진료 계획에 도움이 되는 정보입니다.

## 복용 중인 약을 확인해 주세요

신분증과 복용 약 목록 또는 처방전을 준비하세요. 약을 임의로 중단하지 말고 의료진에게 알려주세요. 이전 치료 영상이나 기록이 있다면 함께 가져오셔도 좋습니다.

## 수면치료는 별도 준비가 필요합니다

의식하진정이 필요한지 먼저 평가합니다. 금식과 보호자 동반 등은 예약 시 개별 안내를 따르세요. 사전 평가 없이 당일 수면치료를 보장하지 않습니다.','blog','published','2026-09-30T00:00:00.000Z','2026-09-30T00:00:00.000Z');
INSERT OR IGNORE INTO posts VALUES('initial-gum','daily-gum-care','치아를 지키는 잇몸 관리, 작은 습관부터','## 양치할 때 피가 난다면

반복적인 잇몸 출혈이나 부종은 진료가 필요한 신호일 수 있습니다. 통증이 없더라도 계속되는 증상을 방치하지 마세요. 출혈 원인은 검사를 통해 확인해야 합니다.

## 치아 사이 관리도 함께

칫솔이 닿기 어려운 치아 사이에는 치실이나 치간칫솔을 사용할 수 있습니다. 맞는 크기와 사용 방법을 의료진에게 확인하고, 무리하게 밀어 넣지 마세요.

## 검진 주기는 상태에 따라

치주치료 이력, 흡연, 전신질환, 관리 상태 등을 고려해 개인별 검진 주기를 정합니다. 임플란트도 주변 잇몸 관리가 필요합니다.','blog','published','2026-09-30T00:00:00.000Z','2026-09-30T00:00:00.000Z');
INSERT OR IGNORE INTO posts VALUES('initial-hours','check-clinic-hours','내원 전 지점별 진료시간을 확인해 주세요','## 청량리 본점

평일 09:30~18:30, 토요일 09:30~14:00, 일요일 10:00~14:00입니다. 평일 점심시간은 13:00~14:30이며 수요일은 13:00~15:30입니다. 문의: 02-969-3776.

## 광명사거리점

월요일 09:30~20:30, 화·수·목·금 09:30~18:30, 토요일 09:30~14:00입니다. 점심시간은 13:00~14:00이며 일요일·대체공휴일은 휴진입니다. 문의: 02-6013-2828.

## 일정 확인

토요일 및 청량리 본점 일요일은 점심시간 없이 진료합니다. 위 시간은 제공받은 정규 일정이며 공휴일·임시휴진은 다를 수 있습니다. 원장별 진료 지점과 당일 일정은 내원 전 전화로 확인해 주세요.','notice','published','2026-09-30T00:00:00.000Z','2026-09-30T00:00:00.000Z');
