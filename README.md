# 더굿모닝치과 — Good Morning Web

## 현재 범위 — SingleClinic19 (2026-10-11)

- 사용자 요청으로 **강도욱 원장님의 더굿모닝치과 한 병원만 공개 안내**합니다. 서울특별시 동대문구 왕산로 123, 2층 · 제기동역 2번 출구 · `02-969-3776`.
- 광명 위치·시간·전화·예약·카카오·블로그·플레이스 및 공개 지점 선택 UI를 제거했습니다. Instagram은 지점명 없이 병원 계정으로 표시합니다.
- 네이버 예약 `1019716`, 플레이스 `19524548`, 카카오 `_npxibG`, 네이버 블로그 `thegoodmorningdent`, Instagram `_thegoodmorning`, 기존 YouTube/인블로그를 유지합니다.
- `/directions`, `/reservation`, `/visiting`, `/careers`, `/notice/check-clinic-hours` 및 한·영 공통 헤더/푸터/메타/JSON-LD/llms를 단일 병원으로 통일합니다. 공개 GET의 `?branch=...`는 해당 매개변수만 제거해301 이동하며 다른 검색 조건은 보존합니다.
- 내부 ID `cheongnyangni`는 기존 CMS/접수 데이터 호환성 때문에 유지합니다. 접수 양식에서는 숨김값으로 고정하고 다른 병원 ID는 서버에서 거부합니다. 과거 CMS 행·이력은 삭제하지 않고 공개 합성 모델에서 타 지점 데이터를 제외합니다.
- `0007_single_clinic.sql`은 기존 진료시간 공지 한 건의 제목·본문·수정일만 변경합니다. 기존 공개 상태·최초 게시일, 다른 게시물과 공개 수가32항목·원본PDF는 보존합니다. 운영 변경 전후 SQL은 `.sources/single-clinic-release/`에 비공개 보관합니다.
- 제공 의료진5명과 관련 진료 연결은 유지합니다. 확인 없이 다른 의료진의 진료를 강도욱 원장에게 재배정하거나 새로운 의료 사실을 만들지 않습니다.
- 단일 병원 검사: `node tests/single-clinic.mjs` (운영 읽기 전용: `TEST_URL=https://webapp-2-9y5.pages.dev node tests/single-clinic.mjs`). 공개 한·영120경로, 과거 지점 URL/저장값, Chromium/WebKit72화면폭, 수가32/PDF 보존을 검사합니다. 기존 SEO·CMS·접수·탐색·Foundations·Care 회귀도 유지합니다.
- 배포 대상은 기존 사용자 소유 Pages `webapp-2`, D1/R2입니다. 기존 도메인/DNS·공식 사이트·인블로그는 변경하지 않습니다. `PUBLIC_SITE_URL` 미설정과 검증 주소 noindex, 알림·상담집계·성능집계 OFF 유지. 실물 기기·의료 감수는 별도 확인이 필요합니다.
- 아래 다지점 안내는 **이전 릴리스 조사·구현 이력**이며 현재 공개 범위가 아닙니다.

## 이전 채널 연결 보완 (2026-10-11)
- 청량리 인스타그램 `https://www.instagram.com/_thegoodmorning/`을 공식 채널 목록/푸터에 추가. 공개 검색 인덱스의 병원명·제기동역 위치·의료진 관련 내용을 대조했습니다. 인스타그램 직접 페이지는 비로그인 접근 제한이 있어 전체 피드/로그인 후 동작을 검증한 것은 아닙니다. 외부 링크만 제공하며 게시물 자동 수집이나 임베드는 하지 않습니다. 광명 별도 계정은 확인되지 않아 임의 추가하지 않았습니다.
- 청량리 네이버 플레이스 `19524548`, 광명 `2006007864`: 기존 공식 홈페이지 및 네이버 예약 business `1019716` / `1551337`에 포함된 placeId와 대조. 양 지점 지도 버튼을 검색 URL 대신 장소 고유주소로 변경하고 Dentist hasMap/sameAs에도 동일 반영했습니다.
- 출처: https://thegoodmorningdental.com/ , https://sthegmdent.com/ , https://booking.naver.com/booking/13/bizes/1019716 , https://booking.naver.com/booking/13/bizes/1551337 . 네이버 플레이스 자동 접근은429 제한이 있어 예약 데이터와 공식 홈페이지를 교차 확인했습니다. 예약·메시지를 실제 제출하지 않았습니다.
- DB migration·운영 데이터 변경 없음. 인스타그램은 기존 channel CMS에서 수정/비활성화할 수 있으며 RSS 지원 채널이 아닙니다. WhatsApp 및 네이버 톡톡 추가는 이번 변경에 포함하지 않았습니다.

## 이전 릴리스 — Foundations18 + Care17 (2026-10-11)

- **배포·GitHub 업로드 완료**. 앱 커밋 `ae3c03d`, 스냅샷 https://12de070f.webapp-2-9y5.pages.dev . 서비스 https://webapp-2-9y5.pages.dev/ , 관리자 `/admin`.
- GitHub: https://github.com/sodanstjrwns-max/thegoodmorningdc (`main`). 사용자 선택 저장소에 업로드했으며 비밀번호·토큰·비공개 SQL·원자료는 제외합니다.
- 진료31페이지와 `/visiting`에 상담 준비 카드32개, 인쇄/PDF 저장. 건강정보 입력·저장 없음. 금식·약 중단 등 개인별 의료 지시를 자동 생성하지 않습니다.
- 의료진5명 소개에 기존 진료의 확인 과정·한계·질문 연결. 강도욱 원장 직접 인용은 제공 설문으로 확인했고, 다른 의료진의 개인 인터뷰·고유 방침을 지어내지 않았습니다.
- 모바일 실제 사진9종의 480/800px 파생 이미지, 정확한 이미지 크기, 느린 연결의 자동 영상 로딩 제한. 입력 오류 요약·필드 연결·포커스 복귀, 입력 중 고정 CTA 숨김, 색 대비 보완.
- 페이지별 설명문에서 반복 전화번호를 제거하고 본문 기반 180자 이내 요약 사용. H1 하나·본문 제목 단계, OG/Twitter 제목·설명·이미지 대체텍스트, 구조화 데이터와 실제 FAQ 일치 확인. 검색 순위·AI 인용·리치결과는 보장하지 않습니다.
- `/column`, `/cases`는 검색/필터를 보존한 캐노니컬과 검색 결과 noindex. `/blog?q=...&page=...`, `/notice?q=...&page=...`는 서버 검색·9개 단위 페이지 나누기. 잘못된 페이지 번호는404. 영문 검색과 내부 문서 앵커는 영어 경로를 유지합니다.
- 성능 집계는 상담 집계와 별도 설정이며 **운영 기본 OFF**. POST `/api/performance`는 활성화 시 LCP/INP/CLS의 구간·공개 경로·화면 분류만 합산합니다. 원시값·DOM·입력내용·방문자ID 제외, DNT/GPC 존중. `/api/admin/performance/settings` 및 `/admin` 집계 탭에서 관리합니다. 기존 D1 operation_settings/event_daily 재사용, 새 migration 없음.
- 로컬 검증: 기존 navigation/smoke/studio/SEO/services/locales/editorial/operations 회귀 통과. `npm run test:care`: Chromium·WebKit 주요6경로 자동 접근성/48화면폭, 키보드·인쇄·폼 오류·느린 연결·no-JS·집계 제한 통과. 실제 iPhone/Android·VoiceOver/TalkBack 검사는 하지 않았습니다.
- 실제 배포 검증: `TEST_URL=https://webapp-2-9y5.pages.dev npm run test:foundations` 통과. 한·영120경로, 제목 계층/메타/캐노니컬/FAQ, 480화면폭, 영어 검색/앵커, 공개 수가32항목과 원본 PDF 일치. 실제 운영에 시험 게시물이나 환자 자료를 등록하지 않았습니다.
- 전후 운영 SQL을 독립 복원하여 CMS44건·게시물3건·접수/직원/운영설정/집계의 모든 값 동일 확인. 비공개 백업 `.sources/foundations-release/{before-deploy,after-deploy}.sql`, 검사 기록 `preservation-check.json` 및 `test-results/foundations-production.json`.
- 기존 공식 홈페이지·인블로그·도메인/DNS 보존. `PUBLIC_SITE_URL` 미설정으로 검증 주소 **noindex 유지**. 메일·상담 집계·성능 집계 OFF. 다음 단계는 병원 담당자의 실기기/의료·개인정보 문안 확인과 별도 승인 후 정식 도메인 전환입니다.
- 이전 R1 PDF/Word/ZIP은 역사 기록이며 이번 기능까지 자동 갱신된 자료가 아닙니다. 아래 Operations16·Editorial15 절은 이전 릴리스 기록입니다.

## 이전 상태 (2026-10-09)

### Operations 16 — 7개 운영 개선 반영 완료
- 현재 앱 기준: `1a54192` (기능 커밋 `948334d`), 스냅샷 https://d8ca0fac.webapp-2-9y5.pages.dev . 아래 Editorial15/R1은 이전 이력입니다.
- **운영 배포·검증 완료**. 사용자 소유 Cloudflare Pages `webapp-2`, 운영 D1/R2 유지. 기존 공식 홈페이지·인블로그·DNS는 변경하지 않았으며 검증 주소의 noindex를 유지합니다.
- `/column?source=all|native|inblog&q=...&category=...&page=...`: 자체 칼럼과 공식 인블로그 제목을 한 목록에서 검색·출처 필터·9개 페이지로 탐색합니다. 인블로그는 RSS 최신 12개 제목/날짜/원문 URL만 사용하며 본문·환자사진은 복제하지 않습니다. 추천 체크한 자체 칼럼 또는 최신 글을 상단에 표시합니다.
- 케이스 작성 틀: 내원 고민→진단 근거→선택지→선택 이유→과정→경과/한계. 확인된 기간·횟수는 선택 입력, 사진별 설명/대체텍스트·촬영일·개별 확대 지원. `[작성 필요]`가 남은 틀은 공개 차단. 기존 동의·비식별·의료검토·촬영 조건 검사 유지. 임의의 실제 사례·채용조건·의료 감수 결과를 등록하지 않았습니다.
- `/admin`: 직원 계정(admin/editor/reviewer/coordinator), 검토 대기함, 이미지 사용처, 콘텐츠 점검, 접수 알림, 상담 동선 집계, 본인 비밀번호 변경. 소유자 로그인은 **아이디를 비우고 기존 비밀번호 사용**. 직원 아이디는 소유자가 생성하며 초기 비밀번호는 화면에서 한 번 표시하고 2분 후 지웁니다.
- 작성자는 초안/검토 요청만, 검토자는 타인이 요청한 동일 revision의 승인 원고만 공개할 수 있습니다. 수정하면 승인 무효, 삭제 후 같은 주소 재생성으로 과거 승인을 재사용할 수 없습니다. 소유자/관리자는 직접 공개 가능한 override 권한을 갖습니다. 이 승인은 실제 의료 감수 사실을 자동으로 생성하지 않습니다.
- 필드별 이전/현재 비교, 변경 이력 불러오기, PC/390px/320px 미리보기, 유형별 빈 작성 틀, 내부 링크 검색/관련 진료 우선 선택. 서버 CAS와 짧은 D1 mutation lease로 충돌을 방지합니다.
- 이미지 라이브러리는 R2 이미지의 초안·공개·이력 사용처를 표시합니다. 교체는 선택한 원고의 미저장 편집 상태에만 적용하고 재저장/재검토가 필요합니다. 사용처가 있는 파일은 삭제 차단. 동의 철회 시 다른 공개 사용처도 확인해야 하며 이력 참조는 자동 삭제하지 않습니다. 지원서 PDF는 라이브러리에서 제외합니다.
- 진료 페이지에 실제 연결된 칼럼·사례·FAQ·주제 영상 표시. 콘텐츠 점검은 공개 칼럼/사례의 누락/중복 설명, 관련 진료/내부 연결, 180일 재검토, 내부 링크·최대20개 이미지·alt를 확인합니다. 보류 이미지 수를 별도 표시하며 외부 링크 응답·검색 순위·의료정확성 검사가 아닙니다.
- 문맥별 모바일 주요/보조 CTA: 수면 준비, 재수술 기존 자료, 방문 일정 문의, 사례 관련 진료. 실제 기기 키보드·Safari 검사는 미실시이며 Chromium 화면폭 검사와 구분합니다.
- 접수함은 담당자 배정·상태/담당자 필터·미확인 및 신규 접수 24시간 경과 표시. 접수 담당자는 CMS/계정/집계/영구삭제 권한이 없습니다. 상태 확정은 실제 담당자 확인 후 수동 선택해야 합니다.
- **메일은 미연결·비활성**. 서버 `RESEND_API_KEY` 시크릿, 검증된 발신 이메일, 수신 이메일을 설정해야 발송 가능합니다. 메일 본문에는 개인정보 없이 관리자 확인 안내만 포함합니다. D1 outbox/claim/idempotency/최대5회 자동 재시도. 새 접수·접수함 요청·수동 재시도 때 처리하며 cron이 아닙니다. 활성화 시 대기 접수도 처리합니다. `sent`는 서비스 접수이지 실제 수신/열람 확인이 아닙니다. 실제 메일은 발송하지 않았습니다.
- **상담 집계는 비활성**. 관리자가 켠 경우 전화/예약/카카오 클릭, 칼럼·사례→진료 이동, 서버 접수 성공만 날짜/공개경로/지점별 합계로 기록합니다. 통화·예약 확정이나 고유 방문자 수가 아닙니다. 검색어·자유입력·방문자 쿠키 제외, DNT/GPC 존중. 집계180일·남용 방지 시간창 해시 최대1시간 후 요청 시 정리. `/privacy` 안내 반영.
- 새 D1 migration `0006_operations.sql`: staff_users, admin_sessions.user_id, content_reviews, audit_events, service_requests.assigned_to, operation_settings, notification_outbox, event_daily/event_limits, mutation_locks. 로컬/운영 모두 적용. PBKDF2-SHA256 100,000회+개별 salt, 세션의 서버 역할검사/비활성·계정변경 시 세션 폐기.
- 관리자 API 추가: `/api/admin/me`, `/users[/:id[/reset]]`, `/password`, `/review-queue`, `/reviews/:kind/:key`, `/media-library[/:key]`, `/link-options`, `/content-audit`, `/audit-events`, `/assignees`, `/notifications[/settings|/retry]`, `/metrics[/settings]`. 기존 요청 수정에 `assignedTo` 추가. 공개 `/api/event-config`와 POST `/api/events`는 최소 집계 전용입니다.
- 검증: `npm run typecheck`, build, 기존 `npm run test:all` 전체 통과. `npm run test:operations`는 로그인 UI·역할·세션·승인 원고/CAS·삭제 후 승인 재사용 차단·미디어·담당자·집계 제한·16개 관리 화면폭과 CTA 확인. 알림은 가짜 HTTP 응답을 사용한 실패/재시도/동시 claim 시뮬레이션이며 실제 발송 테스트가 아닙니다. 최종 editor 회귀 재통과. 런타임 의존성 `npm audit --omit=dev` 취약점0.
- 실제 운영 `test:operations:production`: 120 KO/EN 경로·24화면폭, 직원3역할 로그인/권한·비공개 검토/미리보기/충돌·원본 PDF/수가32·인블로그·정적 자산 일치·브라우저 오류0. QA는 공개하지 않았고 시험 계정/원고/이력/세션을 정리했습니다.
- 배포 전후 DB를 각각 독립 SQLite로 복원했습니다. **기존 content_entries 44건 및 posts 3건의 모든 값 동일**, 공개 수가32 유지. 최종 접수0·직원0·알림큐0·집계0. 증빙 `.sources/operations-release/{production-check,backup-check}.json`, 전후 SQL은 비공개 백업입니다. 기존 비밀번호는 변경하지 않았습니다.
- 다음 실제 운영 준비: 담당 직원 계정 발급, 승인된 실제 콘텐츠 입력, Resend 도메인/발신/수신 연결, 집계 활성화 여부 결정, 실기기 검수 및 별도 승인 후 정식 도메인 전환. R1 PDF/Word/ZIP은 이전 기록이며 Operations16 사용법은 본 절을 기준으로 합니다.

- 대상은 **강도욱 원장님의 더굿모닝치과**입니다. 서울비디치과 홈페이지가 아닙니다.
- 제공 설문·제안서·실제 사진·영상에 기반한 Hono SSR + TypeScript + Cloudflare Pages 홈페이지와 D1/R2 CMS입니다.
- 작업 경로 `/home/user/webapp`, Git `main`.
- **사용자 소유 Cloudflare 계정에 별도 주소 배포 및 기능 검증 완료. 기존 홈페이지 교체·도메인/DNS 전환은 하지 않았습니다.**
- 검증 주소: https://webapp-2-9y5.pages.dev/
- 영어: https://webapp-2-9y5.pages.dev/en
- 관리자: https://webapp-2-9y5.pages.dev/admin
- 수가: https://webapp-2-9y5.pages.dev/pricing
- 최초 배포 스냅샷: https://3f98f561.webapp-2-9y5.pages.dev/
- 샌드박스: https://3000-iea4n2skk8l8g2o6tat4s-dfc00ec5.sandbox.novita.ai/
- 현재 `PUBLIC_SITE_URL` 미설정으로 **검증 주소 전체 noindex 유지**. noindex는 접근 암호가 아니며 URL을 아는 사람은 공개 화면을 볼 수 있습니다.
- 기능 구현·브라우저 검증은 의료 감수·병원 운영 사실 확인을 대신하지 않습니다.

## 최신 변경 — Editorial 15 · 칼럼/케이스·시각 편집기
- 사용자의 추가 요청으로 R1 이후 개선한 버전입니다. 아래 R1 문서/태그/ZIP은 **이전 납품 기준 기록**이며, 이번 기능까지 포함한 최신 패키지로 오인하지 마세요.
- `/column`: 병원 직접 게시 칼럼 + 기존 공식 인블로그 목록을 구분해 표시. 인블로그 원문·도메인·DNS는 변경하지 않습니다.
- `/column/:key`, `/cases/:key`: 공개 승인된 독립 상세 페이지. 게시판 서버 검색(q)/주제(category)/9개 단위 페이지(page), 실제 링크·이전/다음·없는 페이지404.
- 본문 핵심 요약·자동 목차·읽기시간·글자 확대·링크 공유·관련 진료·관련 글·참고 출처·FAQ. 케이스 동의관리번호와 내부 검토자는 공개하지 않습니다.
- 검색제목/설명, Article·ItemList·실제 FAQ 구조화 데이터, 게시/수정 시각, OG 공유정보, 동적 sitemap 및 llms 링크. 검색/필터 noindex, 페이지별 canonical. 게시 시각은 서버가 관리하며 초안 수정으로 공개 lastmod가 바뀌지 않습니다.
- 신규 칼럼/케이스 본문은 한국어 원문입니다. 미번역 상세를 영문 hreflang/사이트맵에 넣지 않으며 `/en/column/:key`·`/en/cases/:key`는 원문으로302 이동합니다. 기존 영어60페이지와 기존 사전은 유지합니다.
- Tiptap core3.31.4 자체 호스팅 시각 편집기: H2/H3·굵게/기울임/취소선·목록·인용·링크·표(행/열 편집)·이미지·실행취소/재실행·마크다운 전환·집중 모드·Ctrl/Cmd+S. 칼럼/케이스 및 기존 공지·건강정보 본문에 적용합니다.
- Tiptap Markdown3.31.4는 upstream 문서상 beta입니다. 지원하는 서식/표/링크/이미지 왕복을 테스트했으며 모든 외부 HTML/확장 Markdown의 완전 보존을 주장하지 않습니다. 서버는 Marked18.1.0 토큰을 허용목록으로 직접 렌더링하고 입력 HTML·javascript 링크·외부 이미지를 실행/노출하지 않습니다.
- 칼럼/케이스는 첫 저장 후 선택형 서버 초안 자동저장(입력 멈춤5초). D1 revision CAS 유지, 네트워크/충돌 오류 시 자동저장 중지·현재 창 원고 보존. 브라우저 영속저장/오프라인 복구를 구현한 것은 아닙니다.
- 이미지 업로드는 시각 편집기에서 WebP·최대1600px로 재인코딩, 대체텍스트 입력. 직접 API/구형 업로드 모든 경로에 서버 이미지 변환이 적용되는 것은 아닙니다. 공개 시 실제 R2/정적파일 및 대체텍스트 검사. 철회 후 참조 없는 미디어 익명404.
- 칼럼 공개에는 핵심요약·작성 의료진·검토 확인/날짜 필요. 케이스 기존 동의·비식별·검토·촬영일/조건 검증 유지. 실제 칼럼·사례는 자동 생성/공개하지 않았습니다.
- 편집기 번들 약502KB(비압축)는 관리자에서만 로드. 환자용 페이지에는 해당 번들 없음. Worker 약910KB/gzip290KB. 전용 CSS/읽기 스크립트는 해당 게시판에서만 로드합니다.
- DB schema 변경 없이 기존 content_entries/content_history를 재사용합니다. 운영 DB에 로컬 QA 콘텐츠를 이전하지 않습니다. 새 column kind와 기존 showcase 확장필드는 기본값을 합성해 이전 자료 호환을 유지합니다.
- 검증: 기존 전체 회귀 통과. 추가 `npm run test:editorial`: 로컬 공개/철회·미디어 권한·실제 시각 편집/마크다운/표·이미지1600px·대체텍스트 대화상자·서버 자동저장/실패복구·목차/schema·페이지네이션·신규14화면폭 통과. 최종 영어180폭/한국어360폭 재검사·TypeScript/build·npm audit 통과.
- 운영 배포 전 `.sources/editorial-release/before-editorial.sql`을 백업하고 독립 SQLite 복원 확인(게시물3/CMS44/접수0).
- **운영 반영 완료**: 앱 커밋 `696e4cd`, 배포 스냅샷 `https://d01ef734.webapp-2-9y5.pages.dev`. 기존 운영 주소 `https://webapp-2-9y5.pages.dev`에 반영했습니다. 기존 도메인/DNS 전환은 하지 않았습니다.
- 실제 운영 검증: 공개120경로·16화면폭, 관리자 Tiptap DOM·비공개 초안 저장/미리보기/충돌409/미승인 공개400/익명404, 정적자산 일치·환자화면 편집기 번들 미포함·원본 수가PDF 일치 확인. 브라우저 오류0. 시험용 초안 삭제·로그아웃 완료. 상세 기록 `.sources/editorial-release/production-check.json`.
- 참고: https://tiptap.dev/docs/editor/markdown / https://developers.google.com/search/docs/appearance/ai-features . AEO 체크는 작성 보조이며 검색 순위·AI인용·리치결과 보장이 아닙니다. 현재 별도 운영 주소의 noindex 유지, 실제 기기/의료진 감수·일본어/중국어·정식 도메인 전환은 이전과 같이 미완료입니다.

## 납품 준비 — GM-HANDOFF-2026-10-08-R1
- 앱 기준본은 `daaa9be509f7b743154989a4de8f1d66bfa2851b`, 배포 스냅샷은 `https://7543d6e6.webapp-2-9y5.pages.dev`로 기록합니다. 이번 납품 준비에서는 앱 수정·재배포·DNS 변경·운영 데이터 쓰기를 하지 않았습니다.
- `handoff/DELIVERY.md`: 7쪽 납품·운영 인계서 원본. PDF, 수정 가능한 Word, 단일 HTML로 생성합니다.
- `handoff/CHECKLIST.csv`: 기술 검증/병원 확인/실기기/운영/전환/수령을 구분한 34개 항목. 담당자·확인일·승인란은 임의로 채우지 않았습니다.
- `handoff/MESSAGE.txt`: 강도욱 원장님께 전달할 문안. 실제 발송하지 않았습니다.
- `handoff/release-verification.json`: 납품 직전 읽기 전용 재검사. 한·영120경로200/noindex·수가32·원본PDF·관리자401·영상Range206 확인.
- 자료 재생성: `node handoff/build.mjs` (pandoc, python-docx, Playwright 필요). 산출물은 `.sources/handoff/`에 생성되어 웹/Git에 자동 공개되지 않습니다.
- 일반 자료 ZIP에는 비밀번호·운영 SQL·비공개 검토 콘텐츠를 포함하지 않습니다. 기술 백업과 관리자 접근정보는 각각 별도 전달합니다. 수령 및 정식 오픈 승인은 미확인입니다.

## 배포 구성 — 로컬과 운영을 분리
| 항목 | 운영 설정 |
|---|---|
| Pages 프로젝트 | `webapp-2`, production branch `main` |
| 실제 Pages hostname | `webapp-2-9y5.pages.dev` (프로젝트 이름과 다름) |
| 운영 config | `deployment/wrangler.jsonc` |
| D1 binding | `DB` |
| D1 이름 | `webapp-2-goodmorning-production` |
| D1 UUID | `f5b6c1d7-f476-4fee-ae72-e2b864b39e98` |
| R2 binding / bucket | `R2` / `webapp-2-goodmorning-media` |
| 관리자 비밀값 | Pages production secret `ADMIN_PASSWORD` |
| 공개 origin | 정식 도메인 전환 전까지 `PUBLIC_SITE_URL` 미설정 |

루트 `wrangler.jsonc`는 기존 로컬 dummy DB/R2 설정을 유지합니다. **그 파일로 직접 운영 배포하지 마세요.** Pages는 `--config` 대신 `--cwd deployment`로 운영 설정을 선택합니다. 기존 계정의 `webapp-production` DB는 사용하거나 변경하지 않았습니다.

```sh
cd /home/user/webapp
# 프로젝트 Deploy 패널에서 인증 설정 후 실행. wrangler login/OAuth 사용 금지.
npx wrangler whoami
npm run db:migrate:production
npm run deploy
```

- 운영 migration `0001`~`0005` 적용 완료.
- 로컬 실제 콘텐츠만 대조·이전: 게시물3개, 운영 검토44개(수가1개 공개, 43개 비공개).
- 실제 콘텐츠에 `/media/` 참조0건이므로 기존 로컬 시험 이미지는 옮기지 않았습니다. 사진·영상·수가PDF는 정적 배포 자산입니다.
- 로컬 세션·로그인 시도·QA 이력·지원서는 이전하지 않았습니다.
- 운영 시크릿은 새 무작위 비밀번호이며 로컬 비밀번호와 다릅니다. 코드·Git·공개 파일에 포함하지 않습니다. 사용자 인증이 필요한 별도 인계 파일로 전달합니다.
- 변경 시 `npx wrangler pages secret put ADMIN_PASSWORD --project-name webapp-2`의 표준입력으로 전달한 뒤 재배포하세요. 기존 세션을 모두 끊어야 한다면 운영 DB의 세션을 별도로 폐기해야 합니다.

## 완료 기능
- 차콜·노랑, 기존 CI, 실제 제공 사진과 16초 무음·추가 자막 없는 오프닝.
- 수면·재수술·앞니·장애인 진료 우선 배치, 원장 스토리와 1990년 개원 계승.
- 한국어 기본60경로, 진료31·의료진5 전체 제공 약력, 진료FAQ285·일반FAQ6·증상182·설명96·용어66.
- 7스토리 인터랙션, 모션 OFF/reduced-motion/Save-Data, 키보드·정적 대체 화면.
- 실제 YouTube 썸네일2편 + 내용별 HTML/CSS 표지4편. 환자 전후·수술 사진 썸네일은 복제하지 않았습니다.
- CMS 초안/live 분리, 요청 단위 Content, revision CAS, 이력·미리보기·참조 삭제 보호.
- **`/pricing` 비급여32항목과 `/static/fees-0324.pdf` 원본 공개 유지.** 원본에 없는 적용일·지점을 추정하지 않습니다.
- 두 지점 공식 전화·예약·카카오 링크, 주소 복사, 지점별 진료시간.
- 한국어·영어 PC/모바일 탐색, 검색·영상 필터·FAQ 앵커·safe-area.

### 실제 지도와 공식 채널
- ‘실제 지도 보기’ 클릭 후 Google Maps iframe 로드. 클릭 전 외부 지도 요청 없음, 닫기 가능. 네이버 지도 링크 유지.
- 네이버2·YouTube·인블로그 RSS 각 최신12항목.
- 인블로그 공식 원본 `https://inblog.ai/tgm-dental/rss`에서 제목·날짜·원문 링크만 동기화. 원문은 기존 `thegoodmorningdental.com/blog/...`로 연결하며 본문·환자사진을 복제하지 않습니다.
- D1 캐시1시간, 실패 시 이전 목록 유지 및5분 재시도 간격. 관리자 수동 갱신 가능.
- 고정 호스트·리다이렉트 차단·DOCTYPE/ENTITY 차단. 인블로그 최대6MB/12초 후 최신12item 파싱, 기타 RSS1MB/6초.

### 사례·후기, 채용, 통역 요청
- `showcase`: 제목·관련 진료·본문·전후사진·촬영일/조건·주의사항, 동의관리번호·공개동의·비식별·의료검토·검토자/날짜.
- 사례 공개 시 동의·검토·날짜·R2 이미지 존재 검사. 동의관리번호와 검토자 등 내부정보는 공개 HTML에서 제외.
- `/cases` 사례/후기 필터, 초안→미리보기→공개→공개 내림. 공개 참조가 사라진 이미지는 익명404.
- `vacancy`: 지점·직무·고용형태·시간·급여·자격·복지·마감·접수 상태·확인 근거. 필수조건 없는 공개 차단, 마감/종료 공고 지원 차단.
- `/careers`: 공고별 지원 또는 인재풀. 이름·연락처·지점·직무·선택 메시지·선택PDF3MB 이하.
- `/visiting#language-request`: 이름·연락처·지점·필요 언어·희망 방문일·선택 메시지.
- `/admin` 접수함: 신규→연락 진행→담당자 확인·확정→종료, 메모·첨부 다운로드·삭제·revision 충돌 방지.
- **실제 사례/후기·채용 공고를 임의 생성하지 않았습니다.** 현재 실제 공개 사례 및 활성 채용 공고는 없습니다.
- **통역 요청 접수는 예약/통역사 배정 확정이 아닙니다.** 담당자 확인·연락이 필요하며 자동 이메일·외부 통역 예약 연동은 없습니다.

### 개인정보와 권한
- 양식 동의 버전 `2026-10-08-v1`: 목적·항목·기간·거부/삭제 방법 표시, 주민등록번호·여권·건강정보 입력 금지 안내.
- 동일 Origin, honeypot, 필드 길이·연락처·날짜·언어·지점·명시적 동의 검사.
- 시크릿을 포함한 해시 IP 식별자로 시간당5건 제한. 로그인은5회/15분.
- 채용90일·통역30일. 만료 즉시 읽기 차단, 접수/관리자 요청 시 최대25건씩 lazy 삭제. cron이 없어 무방문 상태의 정확한 시각 물리 삭제를 보장하지 않습니다.
- PDF는 MIME와 `%PDF-` 검사, R2 비공개 경로, 관리자만 attachment/no-store 다운로드. 백신 검사나 파일 무해성 보장은 아닙니다.
- 관리자 해시 세션8시간, HttpOnly/SameSite=Strict/Secure(HTTPS). 접수 개인정보 공개조회 API 없음.
- 실제 운영 전 개인정보 책임자·위탁/국외처리 및 보유정책 법률 검토가 필요합니다.

### SEO/AEO·다국어
- 경로별 description/canonical, 두 지점 Dentist 엔터티·Organization/WebSite/WebPage, 실제 breadcrumbs/FAQ 구조화 데이터, 진료31 핵심답변, sitemap/llms.
- 유효한 HTTPS `PUBLIC_SITE_URL`과 요청 origin이 정확히 같은 공개 정상 화면만 index. 관리자/API/media/error/preview noindex.
- 임의 별점·후기·감수일 없음. 실제 게시물 updated_at만 sitemap lastmod.
- 영어2,591문자열 사전, 기본60페이지 SSR, 언어별 URL·내부 링크·검색·양식·canonical·hreflang·구조화 데이터.
- 의료진 감수 완료가 아닌 기계 보조 번역임을 표시합니다. 새 CMS/RSS 문장은 한국어가 남을 수 있습니다.
- 일본어·중국어 사전은 미완성·비활성404. API 사용자 동시요청20개 제한 HTTP429로 중단되었으며 완료로 보고하지 않습니다.
- 재개 도구: `node build-translations.mjs --collect` → `node build-translations.mjs`. 공개문장만 수집하며 `OPENAI_API_KEY/OPENAI_BASE_URL`은 환경변수 사용. 개인 접수는 번역 API로 보내지 않습니다. 완성·검증 후 `src/locales.ts` 활성 언어를 변경합니다.
- llms.txt는 보조 색인 자료이며 순위/AI인용 보장 아님. 검색 등록·실제 색인·AI인용 성과는 미확인. Google FAQ 리치결과 관련 변경: https://developers.google.com/search/updates

### 펼친 메뉴·영문 첫 화면 v14
- `.nav-item{position:relative}`의 약98px 폭 기준 오류를 `.nav-item-mega{position:static}`으로 수정. 헤더 전체너비·불투명 배경·4열·최대높이·내부스크롤.
- 영어1390px 이하 compact 메뉴, 한국어 기존1020px 기준. Escape/ArrowDown/aria-expanded·외부클릭·resize·모바일 focus trap.
- 영어 hero “A dental clinic that / listens once more.”, minmax(0,…) grid와 너비 제한. 한국어 핵심 문구와 무자막 영상 유지.
- 경량 GoodMorningSans 약458KB, 원본 약2.06MB는 드문 글자 fallback. OFL 파생이름·LICENSE 유지. `python build-font-subset.py`로 재생성.

## 주요 URI와 사용법
| URI | 용도 |
|---|---|
| `/`, `/en`, `/en/...` | 한국어·영어 공개 화면 |
| `/treatments/:slug`, `/doctors/:slug` | 진료·의료진 상세 |
| `/mission`, `/tour`, `/directions`, `/reservation` | 철학·공간·지도·예약 |
| `/column`, `/video`, `/blog`, `/notice`, `/contents` | 칼럼·영상·자체 게시물·소식 |
| `/faq`, `/encyclopedia`, `/symptom-checker` | FAQ·용어·비진단 정보 |
| `/pricing`, `/cases`, `/careers`, `/visiting` | 수가·사례·지원·통역요청 |
| `/admin` | 별도 인계 비밀번호로 CMS·비공개 접수함 로그인 |
| `POST /api/requests/career`, `/api/requests/interpretation` | multipart 동의 기반 접수 |
| `/api/admin/requests`, `/api/admin/requests/:id` | 인증 목록·상태/메모·삭제 |
| `/api/admin/requests/:id/attachment` | 인증 PDF 다운로드 |
| `/api/admin/content/:kind/:key` | 초안·공개·삭제 |
| `POST /api/admin/content/:kind/:key/withdraw` | 사례·채용 공개 내림 |
| `/api/search?q=...&lang=en` | 공개 검색 |
| `/api/health` | 상태 확인 |
| `/sitemap.xml`, `/sitemap-languages.xml`, `/robots.txt`, `/llms.txt`, `/feed.xml` | 검색·RSS |
| `/films/clinic-opening.mp4`, `/films/clinic-opening-mobile.mp4` | Range/HEAD 영상 |
| `/media/:key` | 공개 참조 또는 관리자 권한 이미지 |

관리자는 초안 저장 후 미리보기로 검토하고 ‘공개’를 선택합니다. 저장만으로 live가 바뀌지 않습니다. 사례·채용은 ‘공개 내림’으로 철회하며 접수함 상태 ‘확정’은 실제 담당자 확인 후 사용합니다.

## 데이터 구조
- D1: `posts`, `admin_sessions`, `admin_attempts`, `content_entries`, `content_history`, `channel_cache`, `service_requests`, `request_limits`.
- R2: 공개 참조 이미지 및 비공개 `applications/<uuid>.pdf`. filesystem/메모리를 영속 저장소로 사용하지 않습니다.
- 기본 콘텐츠 `src/data.ts`와 D1 live_json을 요청마다 독립 합성, imported 전역 배열 mutate 금지.
- CMS 종류: treatment/doctor/video/faq/section/branch/channel/site/showcase/vacancy/operation.
- 기존 operation case/approval은 비공개 검토 전용이고 신규 공개 사례는 showcase입니다.
- `.dev.vars*`, `.env*`, `.sources/`, `.wrangler/`, node_modules, dist, test-results, tar.gz는 Git 제외.

## 검증 결과
### 기존 로컬 회귀
- `npm run test:all`: navigation/smoke/studio/seo/services/locales 전체 통과.
- 한국어60경로×6폭360조합, 영어60경로×3폭180조합, FAQ285/schema, 수가32/PDF동일·43비공개.
- 동의 없는 사례 공개 차단·미디어 철회·채용마감·PDF·Origin·CAS·보유기간·삭제·빈도제한·RSS·서비스25폭.
- 펼친 메뉴16조합·진료31링크·낮은높이·Escape/키보드·영문compact6폭, 기존92회 탐색.

### 실제 Cloudflare HTTPS 검사 (2026-10-08)
- `tests/production.mjs` 통과: KO/EN120경로 HTTP200/noindex, 수가32행·PDF바이트 동일, 두 영상 Range206/HEAD200/잘못된 범위416.
- 관리자 Secure/HttpOnly/Strict 쿠키, 미인증401, 다른 Origin403, CMS44/공개1/비공개43, 동의 없는 공개400, revision409.
- 실제 운영 R2 이미지/PDF 저장·관리자 다운로드·익명차단, 지원/통역 테스트 접수·수정·삭제.
- QA는 **비공개 초안/가상 접수만 사용**하고 사례나 채용 공고를 공개하지 않았습니다. 시험용 접수·초안·이력·R2이미지 삭제, 로그아웃 후 접수0/세션0/CMS44 확인.
- 인블로그 실제 수집, 지도 클릭 opt-in, 주요6페이지×4폭24조합 통과.
- 같은 실제 주소에서 navigation92회+메뉴16조합+compact6폭, 영어60페이지/180폭 재검사 통과. 브라우저 오류0.
- `npm run typecheck`, production build 통과. Worker 약848KB/gzip269KB.
- **Playwright Chromium 에뮬레이션입니다. 실제 iPhone Safari/Android·네이버/카카오 인앱·실사용자 CWV 검수는 아닙니다.**

```sh
cd /home/user/webapp
npm run db:migrate:local
npm run typecheck
fuser -k 3000/tcp 2>/dev/null || true
npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
npm run test:all
# 운영 공개 화면만 검사
TEST_URL=https://webapp-2-9y5.pages.dev npm run test:navigation
TEST_URL=https://webapp-2-9y5.pages.dev npm run test:locales
# 비공개 가상 접수 생성에 명시적 opt-in 필요. 운영 게시물을 공개하지 않음.
TEST_URL=https://webapp-2-9y5.pages.dev TEST_ADMIN_PASSWORD_FILE=.sources/deployment/admin-password.txt RUN_PRIVATE_PRODUCTION_QA=yes npm run test:production
```
운영 검사 후 `.sources/deployment/qa-media.json`에 기록된 시험 이미지 키만 R2에서 삭제하세요. 삭제된 시험 초안의 이력은 `deployment-qa-*` 키로 구분됩니다. 실제 운영 기록을 일괄 삭제하지 마세요.

## 백업·복구
- 운영 첫 배포 전 SQL export 완료. **그 원격 백업을 독립 SQLite에 복원하여 로컬의 게시물3개·CMS44개와 전체 행 일치 및 세션/접수0 확인**. 실제 운영 DB를 파괴적으로 되돌리는 검사는 하지 않았습니다.
- 인계 백업은 소스/Git 커밋, 운영 SQL, 복구 검증 결과를 분리 보관합니다. 시크릿은 소스/DB 백업과 분리 전달합니다.
- 현재 실제 저장이 필요한 R2 콘텐츠0건. 배포 QA 이미지/PDF는 삭제했습니다. 향후 업로드가 생기면 **SQL만으로 파일이 복구되지 않으므로** R2 객체/키/메타데이터를 함께 백업해야 합니다.
- 정기 자동 백업 스케줄은 설정하지 않았습니다. 운영 담당자의 백업 보관·주기 확정이 필요합니다.

```sh
# .sources/deployment는 비공개/Git 제외. 파일명은 매번 고유하게 지정.
umask 077
npx wrangler d1 export webapp-2-goodmorning-production --remote --config deployment/wrangler.jsonc --output .sources/deployment/production-YYYY-MM-DD.sql
```
복구는 먼저 빈 별도 SQLite/D1에 SQL을 적용해 테이블·행·미디어 참조를 검증하고, 쓰기 중단/최신 백업/대상UUID를 확인한 후 진행합니다. 기존 운영 DB에 CREATE/INSERT export를 무작정 실행하거나 기존 다른 프로젝트 DB를 덮어쓰지 마세요. `0001`~`0005` migration은 초기 구축용이며 전체 백업 복구와 중복 적용하지 않습니다. 공개 자산/앱 복구는 해당 Git 커밋을 빌드하고 위 운영 config로 재배포합니다.

## 남은 운영 확인과 기존 URL 보존
- 일본어·중국어 번역·검증, 실제 iPhone/Safari·Android·인앱 기기 검수.
- 의료진 지점/요일·주차/접근성·장비 모델·진정정책·의료문구/영어 의료 감수.
- 실제 사례 동의·검토, 채용조건, 실제 통역 인력/담당자 배정.
- 개인정보 책임자·위탁/국외처리·접수 담당자·정기 백업 정책 확정.
- Search Console/네이버 Search Advisor 등록·실제 색인/CWV/AI인용 성과 확인.
- **기존 공식 도메인과 인블로그 `/blog/`는 그대로 유지합니다.** 새 사이트의 자체 `/blog`를 기존 인블로그 경로에 그대로 덮어쓰면 안 됩니다.
- 정식 전환 전에 기존 URL 목록/리다이렉트 표, 기존 `/blog/*` 라우팅 유지 방법, 자체 게시판 충돌 해소, DNS 롤백, 최종 canonical을 확정해야 합니다. 이 전환은 아직 실행하지 않았습니다.

## 사용자 제공 원본·조사 출처
- https://drive.google.com/drive/folders/1nHFzdlo9_6hEZS-GOhcHdhqbtDYiyHZ9?usp=sharing
- https://thegoodmorningdental.com/
- 위 두 URL은 생성 산출물이 아닌 원본 자료입니다. 원본 개인 연락처·동의 내부정보·199MB 원본영상은 공개/Git에 포함하지 않습니다.
