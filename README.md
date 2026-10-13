# 더굿모닝치과 — Good Morning Web

## Media34 — 진료별 치료 전후 사례·관련 영상, 임플란트 스크롤 스토리, 환자 리뷰 링크 (2026-10-13, Claude Code)

- **치료 전후 사례(진료 페이지 `#before-after`):** 원장 드라이브 `홈페이지/!!4-x-x …/비포애프터` 이미지 60장(중복 제외)을 800px WebP(EXIF 제거)로 `public/static/images/cases/ba-NN.webp`에 두고, 진료별로 6장 + ‘사례 n건 더 보기’(`<details>`). 카드 클릭 → 해당 원장 칼럼(인블로그, `thegoodmorningdental.com/blog/…`) 새 탭. 매핑은 `src/case-media-data.ts`(사이트맵 번호 4-2-1=implant-sedation … 4-5-3=gum-contouring). 환자 인물 사진이 들어간 1장(ba-49)은 사본에서 가림. 촬영 방식·개인차·결과 비보장 고지 포함. Review/AggregateRating 스키마 없음.
- **관련 영상(`#related-videos`):** 드라이브 ‘관련영상’ YouTube 바로가기 → 진료별 2~6편. 기존 정책대로 YouTube 썸네일 대신 주제 표지 카드, 클릭 시 기존 `#video-dialog`에서 youtube-nocookie 재생(클릭 전 외부 요청 없음). 기존 진료 하단 영상 2편은 새 섹션이 있는 진료에서 생략.
- **임플란트 스크롤 스토리(홈 `#implant-scroll-story`, CMS 섹션 키 `implant-scroll-story`, 기본 순서 care-priorities 다음):** sticky 스테이지에서 3D 장면 5장(GPT Image 2.5 생성, `static/images/implant-story/`)이 스크롤 진행률에 따라 크로스페이드 + 단계 카피·진행 바. `static/implant-story.js`/`media.css`. reduced-motion·Save-Data·사이트 모션 OFF면 정적 단계 목록.
- **환자 리뷰 확인(홈 `#patient-reviews`, 기본 순서 visit 앞):** 네이버 플레이스 리뷰(place 19524548)·구글 지도(cid 9331921146403260855) 링크 버튼 + 어두운 상담 CTA. 리뷰 본문·별점 인용 없음.
- 영어(/en)는 `mediaPairs`로 고정 문구·영상 제목 번역, 외부 칼럼 제목(`.external-title`)은 한국어 유지.

## Features33 — 홈페이지 예약 상담·웹 푸시 알림·수가 관리·공지 팝업·자동 색인 제출 (2026-10-13, Claude Code)

- **예약 상담 신청:** `/reservation#reservation-form`(KO, `/en/reservation` 영문 동일 폼). 이름·연락처(전화)·희망 진료(31개+상담 후 결정)·희망 날짜(오늘~60일)·시간대(오전/오후/무관, 주말 오후·휴진일 거부)·내용(선택)·동의 필수, 허니팟, IP 시간당 5회. 새 테이블 `reservation_requests`(마이그레이션 0008, additive — `service_requests`의 kind CHECK는 additive로 바꿀 수 없어 분리) → 기존 접수함에 `예약 상담` 종류로 합류, 상태 신규·연락완료·예약확정·취소, 메모·담당자, 관리자·접수 담당 권한, 90일 보유·만료 정리 동일. 동의 버전 `2026-10-13-v4`, 개인정보처리방침 시행일 2026-10-13(예약 항목·목적·보유, 웹 푸시 전달, 팝업 브라우저 저장). CTA: 공통 하단 ‘온라인 상담 신청’, 진료 페이지 사이드·모바일 문맥 바(`?treatment=<slug>` 자동 선택), 모바일 하단 바 4번째 칸 ‘예약 신청’(전화·카카오·네이버 예약 유지, ‘오시는 길’은 메뉴·푸터로).
- **웹 푸시 알림(무료):** 도담 패턴 `src/push.ts`(@block65/webcrypto-web-push), `push_subscriptions`(0009), `/admin/notifications`(‘알림 설정’ — 알림 받기·테스트 알림 보내기·기기 해제, iOS 홈 화면 추가 안내), `/admin/manifest.webmanifest`(관리자 페이지에만 링크), `/sw.js`(푸시 전용, fetch 가로채기 없음). 예약 알림 “새 예약 신청 – 이름 / 희망 진료”(연락처 제외) → 클릭 시 `/admin#request-inbox`. 채용·통역 접수도 알림. 기기 0대·키 없음·발송 실패 모두 예외 없이 로그만. VAPID 키는 Pages 시크릿(`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT`)에만 있음(Git·문서 없음).
- **수가 관리(관리자 → 홈페이지 기능 관리 → 수가 관리):** 항목 추가·수정·삭제·순서·항목별 공개, 페이지 전체 ON/OFF(`operation_settings.fee_page`, 행 없음=ON). 공개본·초안 items 동시 갱신 + CAS + content_history. OFF면 `/pricing` 금액 없는 안내(noindex)·사이트맵 제외·푸터 요약/llms-full 제외. 원본 PDF 링크 유지. 할인·이벤트·특가·% 등 가격 홍보 문구 저장 거부(일반 CMS 저장에도 적용). 운영 32항목·데이터 미변경.
- **공지 팝업(관리자 → 공지 팝업):** `site_popups`(0010) 최대 10개, 제목·내용·R2 이미지(+대체 텍스트 필수)·링크(/경로 또는 https)·기간·공개·순서. 공개 페이지 전체(관리자·안내서 제외)에 고정 오버레이(hidden→레이아웃 이동 없음), PC 계단식 카드 덱(뒤 카드 띠 클릭→앞으로), 모바일 한 장씩(스와이프·화살표·점), 닫기·모두 닫기·Esc·‘오늘 하루 보지 않기’(localStorage, KST)·이번 방문 중 닫은 팝업 미재표시, 포커스 트랩·복귀, 외부 `popups.js/css`만(인라인 스크립트 없음). 사용 중인 팝업 이미지만 `/media` 공개, 미디어 라이브러리 삭제 보호.
- **발행 시 자동 색인 제출:** 칼럼·사례·공지·건강정보·진료·의료진의 공개/수정/공개 내림/삭제와 수가 변경 시 `src/indexnow.ts`가 waitUntil로 api.indexnow.org·searchadvisor.naver.com에 키 `98fd1c7b…` 제출(진료·의료진·게시판은 /en 포함, 칼럼·사례는 KO만, 목록 페이지 포함). 운영 origin에서만 실제 제출, 미리보기·로컬은 dry-run, 실패해도 게시 무영향. 최근 30건 ‘색인 제출 기록’(`operation_settings.indexnow_log`).
- **/handover:** 05절에 예약 접수함 사용법·예약 알림을 휴대폰으로 받는 법·수가 공개 ON/OFF·공지 팝업 올리기·발행 시 자동 색인 제출 추가, ‘별도 팝업 없음/일반 상담은 외부 채널/자동 이메일 미연결이므로’ 문구 제거. 관리자 로그인 블록·결제 안내 미변경. 기존 굵게 표기 깨짐(`**방문 통계(/admin/stats)**에서`) 수정.
- 검사: typecheck/build, 신규 `tests/features.mjs`(예약 제출·검증·레이트리밋·역할, 푸시 라우트·기기 0대, 수가 토글·복원, 팝업 덱/모바일/오늘 하루/이미지 공개 범위/최대 10, IndexNow dry-run 기록, 처리방침·안내서 문구) PASS. 로컬 :3011에서 navigation·services·locales·seo-mobile·foundations·local-seo·operations·editorial·notification-unit PASS, handover·care·single-clinic·request-audit는 Chromium 전용 대체 실행 PASS(WebKit 미설치). smoke는 기존 eb19de1 히어로 네이티브 autoplay와 ‘autoplay-blocked’ 모의 검사 충돌로 실패(이번 변경과 무관, 운영 동일 HTML). studio는 비공개 `.sources` 없음. operations/editorial 테스트는 localhost 임의 포트 허용으로 변경.
- 배포: 운영 D1 마이그레이션 0008~0010 적용(추가만), Pages 시크릿 VAPID 3개, https://1f48163c.webapp-2-9y5.pages.dev . 운영 확인: 테스트 예약 1건 제출→201·푸시 `skipped:no-devices`·예외 0 → D1에서 해당 행 삭제(0건). 임시 D1 팝업 2개·수가 OFF로 PC 덱/모바일 1장/Esc·/pricing OFF(noindex, 푸터 없음) 확인 후 삭제(팝업 0·설정 없음=ON, 32항목). IndexNow 운영 키로 /reservation·/privacy·/pricing(KO/EN) 제출 200/200. 관리자 화면(팝업 관리자·수가 편집 UI)은 운영 로그인 없이 로컬에서만 검증.

## LocalSEO29 + Typography31 — 지역 허브·측정·원장 답변·타이포·영상·캐시 (2026-10-12, Claude Code)

- **지역 SEO:** 홈 title `청량리 치과 | 더굿모닝치과 — 제기동역 수면치료·임플란트`, H1 첫 줄 `청량리 치과 · 더굿모닝치과`. 한국어 전용 허브 `/area/cheongnyangni`(청량리 치과)·`/area/jegi-dong`(제기동 치과): 정확 일치 title/H1, 본문 한글 약 1,900/1,540자, FAQ 5개=FAQPage, Dentist `@id` 참조, hreflang 없음, `/en/area/*`는 한국어 원문으로 302. 정확 앵커: 홈 본문 2·푸터 1(청량리)·진료 페이지 aside 1(제기동). 사이트맵 포함, 언어 사이트맵 제외. 위치 정보는 사이트에 이미 있는 사실(왕산로 123 2층, 제기동역 2번 출구 85m, 진료시간)만 사용했고 도보시간·주차·층 정보는 새로 만들지 않았습니다.
- **측정:** `src/site-config.ts`에 GA4 `G-CNEEQ5VCH0`, Clarity `ywkymprujk`, IndexNow 키, naver-site-verification 슬롯(빈 값=미출력, env `NAVER_SITE_VERIFICATION` 우선). 외부 파일 `/static/analytics.js`(인라인 없음, DNT/GPC면 미로드)를 운영 도메인 공개 페이지에만 넣습니다(관리자·/handover·미리보기 제외). CSP에 googletagmanager/google-analytics/clarity/c.bing.com 추가. `/98fd1c7b41dc3340ee91b700aef8397d.txt` text/plain. **Amplitude 금지.** `/admin/stats`(관리자 역할만, 그 외 404)는 Pages 시크릿 `STATS_API_TOKEN`으로 중앙 대시보드를 서버에서 조회합니다(토큰은 Git·문서에 없음).
- **개인정보처리방침:** 5항을 GA4·Clarity(쿠키, 목적, 보관, DNT/GPC·쿠키 차단·GA 차단 부가기능)로, 6항에 Google LLC·Microsoft Corporation 국외 이전 추가. 시행일 2026-10-12, 접수 동의 버전 `2026-10-12-v3`.
- **/handover:** 회사 원칙에 따라 관리자 로그인 블록 복구 — 접속 주소와 env `ADMIN_PASSWORD`를 **운영 origin(또는 localhost)에서만** 요청 시 렌더(`private, no-store`, noindex 유지). “공개 안내서에는 비밀번호를 넣지 않습니다” 문구 삭제. 미리보기 호스트는 정식 안내서 링크만 표시.
- **원장 12문항 반영(`src/director.ts`):** 홈 브랜드 스토리 섹션(우선 진료 4개 바로 다음), 미션의 원장 회고(환자 식별정보 없음·개인차 고지)와 ‘시간을 더 들이는 진료’, 강도욱/강종승 원장 진료 분야, 수면치료(전향성 기억상실을 원장 설명으로, 후기 인용 아님)·장애/전신질환 준비(혈압·혈당·지혈·골다공증·콧줄·낭종·조직검사)·앞니 화이트/핑크 에스테틱·상악동 노트. 할인·가격 유연성은 의료법상 게시하지 않았습니다. 대표 영상 3개는 확인된 uploadDate로 VideoObject.
- **크롤링:** robots AI 크롤러 명시 허용+LLMs 안내, `/llms-full.txt`, 모든 사이트맵 URL에 실제 수정일 lastmod(`contentDates`, 요청 시각 아님), 공개 사례 0건이면 `/cases` noindex·사이트맵 제외, 네이버 블로그 피드는 청량리·제기동·동대문 관련 글만, `webapp-2-9y5.pages.dev`→운영 도메인 301(해시 미리보기는 noindex 유지), `/favicon.ico`·`/apple-touch-icon.png`, 의사 페이지 `Person+Physician`(사이트에 있는 전문의·학교만), 스키마 상호 `더굿모닝치과의원`·주소의 시/구.
- **Typography31:** 큰 제목의 음수 자간(-0.035~-0.08em, -2px)이 작은 자식에 px로 상속돼 수면치료 부제가 -0.12em으로 뭉개졌습니다. 제목 -0.01em, 부제·본문 0, word-spacing normal, keep-all+overflow-wrap:anywhere, 제목 행간 1.25 이상·본문 1.7. 홈·수면치료·의료진·미션·허브 1440/390 전후 스크린숏 확인.
- **영상:** 히어로 영상의 오류/지연 카드(“영상을 불러오지 못했습니다…”, 새 창 링크)와 8초 지연 타이머 제거. 실패·지연 시 포스터를 그대로 두고 작은 원형 재생 아이콘만 남깁니다. YouTube는 기존대로 클릭 시 nocookie 플레이어만 로드.
- **성능:** 운영 익명 GET 페이지를 Cache API로 120초 엣지 캐시(관리자 저장 시 주요 KO/EN 경로 퍼지, 관리자·API·미디어·영상·/handover 제외), `public/_headers`로 버전 붙은 CSS/JS·폰트 1년 immutable, 이미지·영상 7일+SWR, Google Fonts CSS를 렌더 차단하지 않게 변경.
- 검사: 타입/빌드, 신규 `tests/local-seo.mjs`, 로컬 smoke·navigation·services·locales(EN59)·seo-mobile(61 URL)·foundations·handover/hero-layout/request-audit/single-clinic/care(Chromium만 — 이 Mac에 WebKit 미설치). studio(비공개 `.sources` 필요)·editorial(localhost:3000 전용)은 이번 환경에서 실행하지 못했습니다. 운영 DB/R2 쓰기 없음.

## RequestAudit28 — 원장 요청 대조와 누락 보완 (2026-10-12)

- 원장 사전설문·원본 기획안의 메뉴/진료/의료진/관리자/콘텐츠/도메인 요구와 최근 수정 요청을 현재 코드·운영 화면에 대조했습니다. `handoff/CHECKLIST.csv`에 최근 요청6개 및 원본 요구10개를 구현/운영자료/후속 지시 변경으로 구분해 기록했습니다.
- **실제 누락:** 사업자등록번호가 개인정보처리방침에만 있고 공통 푸터에는 없었습니다. 병원 제공 Drive `5번 요청사항 > 사업자 등록증` 원본을 비공개로 내려받아 OCR와 공개 항목 크롭으로 상호 **더굿모닝치과의원**, 대표 **강종승**, 번호 **204-96-61655**를 확인했습니다. 한·영 공통 푸터에 표시하고 개인정보처리방침의 확인 근거도 등록증으로 갱신했습니다. 등록증 전체/생년월일 등은 공개·Git에 넣지 않습니다.
- **추가 발견:** 영문 진료상태에서 진료중일 때만 `13:00까지` 등 한국어가 남았습니다. 동적 종료시간 번역과 낮/저녁/휴진 상태 회귀를 추가했습니다. 밤 시간대 검사만으로 발견되지 않던 조건을 보완합니다.
- `tests/request-audit.mjs`: 한·영120경로 사업자 푸터/단일병원/공식 연락·인블로그 링크, 핸드오버 결제·기술·6개월·아침 문안, 원본 수가PDF, 관리자 보호/등록증 원본 비공개, Chromium·WebKit32화면폭 검사. 초기 새 검사에서 `/encyclopedia`를 영문으로 잘못 분류한 테스트 조건을 `/en` 경계 검사로 수정했습니다.
- **전체 원안과 동일하지 않은 부분도 명시:** 사례 게시 기능은 있으나 실제 공개0건(원안 초기12건), 채용 공고0건/인재풀 가능, 실제 통역 배정·자동 이메일 알림은 미확정/미연결. 증상체커는 선택형 정보 안내이며 생성형 AI 진단이 아닙니다. 광명은 후속 제외 지시에 따라 재추가하지 않습니다. 기존 도메인·인블로그는 보존/연결이며 새 사이트로 구 도메인을 교체하지 않았습니다.
- 기존 공식 홈페이지/인블로그/RSS HTTP200 확인. 과거500 단일 원인·검색도구 소유권/실제 색인·의료/법률/실물 기기 검수는 이번 요청 대조만으로 완료가 되지 않습니다. 개인정보 원본 대신 공개 사업자정보만 반영하며 운영 DB/R2·DNS 변경 없음.
- BYOK 배포 완료: 앱 `4803386`, https://2711368f.webapp-2-9y5.pages.dev . 운영 https://thegoodmorningdc.kr/#clinic-business-info 에서 한·영 사업자 고지와 등록증 근거 문안 확인. 원본 등록증 직접 경로404·관리자 미인증401 유지.
- 검사 PASS: 타입/빌드, 로컬 요청 대조120경로32폭·영문60경로180폭(낮 시간 동적 문구 포함)·CMS 편집/검토/CAS/R2·에디터14폭. 운영 요청 대조120경로32폭·안내서10폭/결제·사진78경로144회 구도 및15개 파일 일치. 운영 DB 쓰기·실제 메시지 발송은 하지 않았습니다. 후속 운영 단일병원120경로72폭/공개 수가32항목·PDF 원본 일치 및 영문60경로180폭/낮·저녁·휴진 동적 표시 회귀도 PASS.

## Portrait27 — 의료진 상반신 썸네일 수정 (2026-10-12)

- 의료진5명 사진을 가슴~머리카락 끝까지 보이는 4:5 상반신으로 재구성했습니다. 머리 위 여백을 남기며 얼굴 생성·교체·리터칭 없이 원본 픽셀을 크롭/리사이즈했습니다. 1000×1250 및 800/480폭 WebP 총15개 동시 갱신.
- 신현숙 원장(`portrait-2`)은 병원 제공 Drive의 `신현숙원장님.png` RGBA 원본을 내려받아 투명도를 흰 배경에 정상 합성했습니다. 기존 검은 배경에 CSS 효과를 씌우거나 머리카락을 지운 것이 아닙니다. 원본과 이전 사진/크롭 좌표는 `.sources/`에 비공개 보존합니다.
- 공통 이미지 helper의 비율·전용 클래스·캐시버전을 갱신했습니다. 홈 의료진 덱/일반 카드/의료진 목록·개별 프로필/약속 페이지·홈 철학 사진/진료 사이드 카드에 같은 사진을 적용합니다. 카드 비율4:5/contain/상단정렬, hover 확대·multiply·필터 제거로 재잘림을 막습니다.
- 로컬 타입/빌드 및 `tests/portraits.mjs` PASS: 공개 한·영120경로 중 사진이 있는78경로의 새 이미지 적용, Chromium/WebKit320·390·768·1440폭144회 비율/잘림 방지 검사, hover/no-JS, 홈5명 선택과 이미지15개 바이트 확인. 5장 모두 이미지 상단35픽셀 안전 여백 확인. 실제 렌더 캡처에서 머리·가슴 구도와 신현숙 흰 배경 확인.
- 이 변경은 사진/스타일/검사에 한정합니다. 사업자등록증 대조·의료 감수 완료를 주장하지 않습니다. 기존 운영 데이터·수가32항목/PDF·DNS·검색 공개 설정 유지.
- BYOK 배포 완료: 앱 `8b374ee`, https://ed3f9880.webapp-2-9y5.pages.dev . https://thegoodmorningdc.kr/doctors 의 PC·모바일 실제 캡처에서5명 머리카락/가슴 구도·신현숙 흰 배경을 확인했습니다. 홈/개별/관련 진료도 같은 버전 URL을 사용하며 기존 브라우저 이미지·CSS 캐시를 갱신합니다.
- 운영 Portrait27 검사 PASS: 한·영120경로/사진78경로, Chromium·WebKit144회 구도 검사, 새 이미지15개 바이트 일치, hover 재잘림 방지, 홈5명 선택·영문/no-JS. 원본 PNG의 비공개 보존과 웹용 합성본만 공개하는 구분 유지.

## Handover26 — 기술 가치와 6개월 검색 성장 안내 (2026-10-11)

- 공개 안내서: https://thegoodmorningdc.kr/handover . 04절을 9개 기술 강점으로 확장했습니다. SSR/Hono/TypeScript/Vite, canonical/hreflang/JSON-LD/사이트맵/llms, Cloudflare Pages·Workers/D1/R2, 역할별 권한/초안·공개 분리/버전 CAS/검토·이력, 접수 접근 보호, 영상 Range/반응형 이미지, 키보드/no-JS, 외부 캐시 장애 격리를 병원 운영 가치로 설명합니다.
- 06절은 수집→색인→노출의 차이와 새 도메인의 신호 축적, 1~2/3~4/5~6개월 운영 로드맵으로 전면 개편했습니다. 약6개월은 충분한 색인과 경쟁 검색어 노출을 키우는 계획이며 확정 상위노출 기한이 아닙니다. 검색도구 등록 완료나 실제 성과를 만들지 않습니다.
- 첫 화면·도입·전달문안도 기술/환자 안내/운영 자산 중심으로 강화했습니다. 공개 승인 결제조건·영원한 무상 수정, 목차11개, DB독립/noindex 유지. 자동검사와 실제 의료·법률·실물기기 확인은 구분합니다.
- `tests/handover.mjs`에 9개 기술 강점·검색 단계/기간·보장 오해 방지·오래된 보류 문구 제거 검사와 기술/검색 모바일 캡처 추가. 타입·빌드·로컬 Chromium/WebKit10폭·axe·인쇄/PDF·복사·no-JS PASS. V26 PDF8페이지/DOCX/HTML 생성 및 기술·검색·결제 문구 대조 PASS.
- 배포 후 읽기 전용 회귀 PASS: 한·영120경로 HTTP200/정식 색인 설정, 단일 병원 범위, Chromium·WebKit72화면폭, 공개 수가32항목과 원본 PDF 바이트 일치. 등록증 확인이나 사진 크롭 검사를 이 결과에 포함하지 않습니다.
- 변경 범위는 안내서/전달문안/검사·기술 기록입니다. 의료진 사진의 별도 크롭 요청과 드라이브 사업자등록증 대조를 이 작업의 완료 항목으로 표시하지 않습니다. DB/R2 데이터·기존 DNS/공식 홈페이지·인블로그·공개 수가32/PDF는 변경하지 않습니다.
- BYOK 배포 완료: 앱 `851a970`, https://3ac22b10.webapp-2-9y5.pages.dev . 실제 https://thegoodmorningdc.kr/handover 의 기술/검색/결제 문구와 GET·HEAD200/상시noindex/11목차/Chromium·WebKit10폭/axe/인쇄·PDF/복사/no-JS PASS. 미리보기 noindex·비인증 관리자401·비공개 환경파일404 확인. 알려진 인증값 공개 포함 검사 및 비공개 파일 Git추적 검사 PASS. 과거 릴리스 설명은 해당 시점의 기록입니다.

## Launch25 — 검색 공개·개인정보 정비·장애 방어 (2026-10-11)

- 사용자 요청 ‘이건 지금 다 해’를 검색 공개 승인으로 반영했습니다. `deployment/wrangler.jsonc`의 PUBLIC_SITE_URL을 `https://thegoodmorningdc.kr`로 지정하고 소유한 www 호스트의 GET/HEAD를 경로·쿼리를 보존하여301합니다. Pages 미리보기·관리자·API·안내서·필터·오류 noindex는 유지합니다. 기존 공식 도메인/DNS 변경 없음.
- 공식 홈페이지(https://thegoodmorningdental.com/) 주소·전화·정규시간·공휴일 안내를 대조했습니다. 공식 고지 사업자 대표 강종승/204-96-61655와 임상 대표 강도욱을 구분합니다. 제공 의료진5명 유지. 주차/접근성·당일일정은 확인 없는 확정값을 추가하지 않습니다.
- 기존 공식 개인정보 페이지 `https://thegoodmorningdental.com/bbs/content.php?co_id=privacy`는 빈 템플릿이어서 복제하지 않았습니다. `src/legal.ts`에 실제 접수 항목/동의/90·30일보유/만료접근차단·요청시삭제/관리자쿠키8시간/집계OFF/Cloudflare D1·R2·글꼴·지도·영상/국외처리/권리행사 대표전화와 접수창구를 설명했습니다. KO/EN 문안과 양식 고지·동의버전 v2를 동기화했습니다. 보호책임자 실명 지정·계약·국외이전 법률 적합성·의료 감수 완료를 창작하거나 인증하지 않습니다.
- 안정성: 변경 전150요청(동시성4)에서500 재현 없음. 과거500의 단일 원인은 여전히 미확정입니다. 코드상 재현 가능한 외부목록 캐시 장애/JSON손상/잘못된시간값을 격리하여 본문을 유지하며, D1의 알려진 일시적 읽기 실패만1회 재시도합니다. 쓰기 재시도나 CMS데이터를 기본값으로 대체하는 처리는 없습니다. 본문 DB 지속 실패는500/noindex·오류식별번호를 반환하고 개인정보 없는 분류/경로/추적ID로 기록합니다.
- 검사: `tests/launch.mjs`는 장애 주입20조합·읽기재시도·중요데이터 실패500유지·www301·정식/미리보기/비공개색인·KO/EN처리방침을 검증합니다. `EXPECT_INDEXABLE=1`로 기존 Foundations/SingleClinic 검사의 정식 공개 상태를 검사할 수 있습니다.
- `handoff/DELIVERY.md`, MESSAGE/CHECKLIST, V25 선택출력을 현재 상태로 갱신합니다. 결제1500만원/VAT포함·계좌·2주계산서·영원한무상수정 유지. 자동검사와 실제 병원 운영/실물기기 검수는 구분합니다.
- BYOK 배포 완료: 앱 `d4f068d`, https://dcc32775.webapp-2-9y5.pages.dev . 대표 도메인 index/robots Allow·canonical·www301 확인. 기존 ADMIN_PASSWORD 바인딩 보존, 미리보기/관리자/안내서 noindex 유지. 아래 Payment24/FinalAudit22 등은 당시의 역사 기록이며 검색 차단 설명은 현재 상태가 아닙니다.
- 검사 PASS: 타입/빌드/장애주입; 로컬 영문60경로180폭·접수25폭/동의v2/비공개첨부/만료/CAS·CMS/원본수가/알림모의; 운영100회 저동시성 요청·Foundations120경로480폭·영문60경로180폭·단일병원120경로72폭·안내서10폭/인쇄/no-JS. 최초 로컬 번역고지 누락과 동의버전검사 기대값 불일치는 보완 후 재검사했습니다.
- 운영 추적 표본380이벤트(ok378/canceled2), 예외0/HTTP500 0. 변경 전34이벤트도 예외0. 진단 tail은 종료했으며 상시 감시 중이 아닙니다. 과거500 원인을 확정한 근거는 아니며 원인 미확정 기록을 유지합니다.
- 기존 FinalAudit22 비공개 SQL과 현재 핵심6테이블 비교: posts3/CMS44/이력1/접수0/직원0/운영설정0 모두 동일. 공개 수가32/PDF원본 일치. 알려진 실제 인증값 공개 포함0 및 비공개 파일 Git추적0 확인.
- 미완료 사실 확인: 과거500 단일 근본원인, 병원 개인정보 보호책임자 임명·국외처리 계약/법률 검토, 실물기기·당일일정/장비/접근성·의료 감수, 검색도구 소유권확인/실제색인. 사용자 검색공개 승인이 이 검수들의 완료를 뜻하지는 않습니다.

## Payment24 — 동일 결제·지원 조건 반영 (2026-10-11)

- 사용자 명시 승인: 다른 병원과 동일 조건으로 결제 안내를 공개 안내서에 포함합니다. 공통 조건은 VAT포함1,500만원, NH농협 입금계좌·문석준 예금주, 계좌이체, 입금 확인 후2주 이내 세금계산서 발급, 영원한 무상 수정입니다.
- 고수·서울도담·연세온·마곡베스트의 공통 조건을 확인했습니다. 검단퍼스트에만 있는 월500만원×3회/최종회차 계산서 조건은 더굿모닝에 추가하지 않았습니다. 실제 입금·발급 완료를 주장하지 않습니다.
- 공개본문11절·08절, 전달문안·체크리스트, 선택형V24출력을 함께 갱신합니다. 인증정보·환자 개인정보는 계속 제외하며 기존 오류·정식오픈 보류 상태는 변경하지 않습니다.
- 배포 완료: 앱 `4bcb2bb`, https://fa3bcabf.webapp-2-9y5.pages.dev . 실제 `/handover` GET/HEAD200, 결제조건·목차·noindex·Chromium/WebKit10화면폭·접근성·인쇄/PDF·복사·no-JS 검사 PASS. 로컬 타입검사/빌드 및 V24 PDF/DOCX 결제내용 대조 PASS. 홈/수가200·관리자 비인증401·수가PDF바이트 일치 확인. 운영 데이터·DNS·검색공개 변경 없음.

## Handover23 — 원장·직원용 공개 운영 안내서 (2026-10-11)

- 공개 주소: https://thegoodmorningdc.kr/handover . 사용자 제공 안내서7개의 논지를 참고해 SEO·AEO·환자 이해/상담·장기 콘텐츠 자산의 의의, 실제 관리자 사용법, 콘텐츠 운영과 인수 순서로 재구성했습니다. 성과·비밀번호는 복제하지 않습니다. 결제·지원 조건은 후속 Payment24 사용자 승인에 따라 공통 조건을 반영했습니다.
- 단일 본문 `handoff/DELIVERY.md`를 `src/handover.ts`에서 빌드 시 포함합니다. `/handover`는 DB/CMS·로그인·외부 서비스 없이 제공하며, 항상 noindex/nofollow이고 환자 메뉴·사이트맵에서는 제외합니다. `/en/handover`는 한국어 안내서로302, 끝 슬래시는301입니다.
- 독립 반응형 CSS/JS, 주요 목차11개, 링크 복사, 인쇄/PDF, no-JS 읽기를 제공합니다. 공개 안내서에 환자·직원 개인정보·비밀번호·토큰·내부 백업 경로를 넣지 않습니다. 제작자 승인 입금계좌·예금주는 결제 안내에 표시합니다.
- `handoff/MESSAGE.txt`, `CHECKLIST.csv`, 기술 인계 README를 갱신했습니다. `node handoff/build.mjs`의 V23 PDF/DOCX/HTML은 선택형 비공개 출력이며 기존 R1을 덮어쓰지 않습니다. 전달 문안의 실제 발송은 하지 않았습니다.
- 타입검사·빌드 및 로컬 `node tests/handover.mjs` PASS: DB조회0회/HTTP200/검색 제외, Chromium·WebKit320~1440px 총10화면폭, WCAG 자동검사, 목차11개, 인쇄/PDF, 복사 성공·실패 대안, no-JS. PC/모바일 화면과 인쇄 본문을 확인했습니다. 실물 기기 검수와 다릅니다.
- BYOK 배포 완료: 앱 `2e19794`, 스냅샷 https://00830e7b.webapp-2-9y5.pages.dev . 실제 https://thegoodmorningdc.kr/handover 에서 GET/HEAD200·noindex 및 안내서 운영 검사 전체 PASS. CSS/JS200, 비인증 관리자 API3경로401, 비공개 환경/본문 파일 직접 경로404 확인. 알려진 실제 인증값의 공개본문/에셋/worker 포함 검사0, 비공개 자료 Git추적0. 전체 비밀유출·보안 인증을 뜻하지 않습니다.
- 배포 후 기존 단일 병원 운영 회귀 PASS: 한·영120경로, Chromium·WebKit72화면폭, 과거 지점 쿼리/저장값 처리, 공개 수가32항목·원본 PDF 바이트 일치. 공개 안내서 내부 링크11개200 및 본문 끝 서명까지 확인했습니다. 운영 게시물·접수·계정 생성이나 실제 메시지 발송은 없습니다.
- 기존 운영 간헐500의 원인은 미확정이며 최종 납품 승인·정식 오픈 보류를 그대로 안내합니다. 이번 공개 안내서 검증은 해당 장애의 해결 확인이 아닙니다. 공개 수가32/PDF·운영 데이터·기존 공식 사이트/인블로그/DNS·검색 비공개 상태를 유지합니다.

## FinalAudit22 — 납품 전 최종 점검 (2026-10-11)

### 판정
- 핵심 기능은 인수 검토 가능한 수준이지만 **최종 납품 승인/정식 오픈은 보류**합니다. 운영 영문 경로에서 간헐 HTTP500을 한 차례 확인했고 원인을 확정하지 못했습니다. 후속 검사가 정상이어도 해결 완료로 표시하지 않습니다. 자동검사 통과를 법률·의료 감수·실물 기기 인증 또는 전환율 성과로 표현하지 않습니다.
- 신규 도메인 https://thegoodmorningdc.kr/ 및 https://www.thegoodmorningdc.kr/ : Cloudflare zone/Pages 모두 active, Google/Cloudflare 공용 DNS NOERROR, TLS 정상·HTTP200 확인. 기존 공식 사이트와 그 도메인/DNS는 변경하지 않았습니다.
- `PUBLIC_SITE_URL` 미설정, apex/www/Pages 모두 noindex 유지. 대표 URL/검색 공개 전환·www 정규화는 이번 점검에서 임의 적용하지 않았습니다.

### 점검과 수정
- 타입검사·빌드, 로컬 smoke/studio/services/editorial/operations 회귀 통과. 관리자 쓰기 검사는 로컬에서만 실행했습니다. 운영 환자자료·직원계정·게시물·실제 메시지는 생성하지 않았습니다.
- 운영 Foundations: 한·영120경로·480화면폭, 제목계층/메타/canonical/FAQ/페이지네이션/수가/PDF 통과. 초기 1회 브라우저의 schema 읽기 실패는 경로/상태 진단을 추가하고 재검사하여 통과했습니다. 이를 숨기거나 초기 실행을 PASS로 기록하지 않습니다.
- 신규 도메인120경로의 내부 링크·앵커·정적에셋/추가 링크30개 정상. 이미지 alt 누락 없음. 비인증 관리자4경로401, 비공개파일·직접 첨부경로404, 교차 출처 로그인403, CSP/HSTS/nosniff/frame보호 확인. 포괄적 침투시험 인증은 아닙니다.
- 신규 도메인 Care: 준비카드32개/의료진5명, Chromium/WebKit 주요6경로 WCAG 자동검사·키보드·인쇄·폼 오류·모의 서버장애·느린 연결·no-JS/영문 검사 통과. 실제 제출 요청은 가로채어 모의 응답만 사용했습니다.
- `npm audit` 런타임 및 개발도구 포함 보고: 알려진 취약점0. 현재 추적 파일/worker의 실제 인증값 포함 여부 검사0, 비공개 원자료·환경파일 Git추적0. 전체 Git역사/모든 유형의 비밀 유출을 보증하는 검사는 아닙니다.
- 장비 안내 조사 오타2곳 수정. 영문 게시판 검색/분류/이동, 동적 글 수/페이지/FAQ개수/수정일/브랜드 제목 번역 보완. 공통 질문 ‘얼마나 유지되나요?’를 특정 미백으로 오역하던 영어를 중립적 지속기간 질문으로 수정. 의료 사실은 추가하지 않았습니다.
- 영문 회귀는 폐기된 다지점 원자료 대신 현재 렌더링 UI를 기준으로 강화했습니다. 공식 RSS 제목·새 게시물 원문은 의도된 한국어이며 제외합니다. 클라이언트 번역 완료 전 순간 상태에 의한 검사 실패를 피하도록 네트워크 안정 후 확인합니다. 로컬60경로·180화면폭 통과.

### 성능 표본과 개선 여지
- 실제 도메인에서 Chromium390×844, cold cache, CPU4배 지연,150ms/1.6Mbps,6초 관찰+메뉴 조작으로 측정했습니다. 실사용자 p75/실물기기/CWV 합격 인증이 아닙니다.
- 최초 표본: 홈 LCP3.764초/CLS0/INP144ms/전송1.38MB, 수면진료 LCP2.444초/CLS0.150/INP104ms, 강도욱 프로필 LCP2.132초/CLS0.002/INP88ms, 내원안내 LCP2.068초/CLS0.025/INP88ms.
- 수면진료의 별도 관찰에서 글꼴 교체 시 제목·본문 줄바꿈과 사진/버튼 위치 이동 약0.150이 재현되었습니다. 저속환경 홈 초기표시 및 글꼴 대체 metrics 최적화는 후속 개선 항목입니다. 기존 디자인을 임의로 바꾸거나 점수를 합격으로 과장하지 않았습니다.

### 출시 전 확인 사항
0. **우선 안정화:** 첫 수정 배포 후 `/en/blog`에서 HTTP500, 동시 영문 검사에서 canonical 요소 대기 실패를 기록했습니다. 이어진 직접10요청·동시성3의35요청과 순차 단일병원/영문 검사는 정상입니다. 진단 로그를 연결한 시점부터 서버 예외가 재현되지 않아 원인은 미확정입니다. `test-results/final-incidents.json`과 비공개 추적 로그를 보존하고 납품 전 원인 규명·지속 안정성 확인이 필요합니다. 단순 재시도 성공을 근본 해결로 간주하지 않습니다.
1. 병원 운영 주체·개인정보 책임자·권리행사 창구·수집/보유/위탁 내역을 확정하고 현재 미리보기 개인정보/이용 문안을 정식화.
2. 대표 URL·검색 공개 승인 후 PUBLIC_SITE_URL/canonical/robots/sitemap 및 www 정규화·검색도구 등록 확인.
3. 병원 담당자의 의료진 일정·장비 모델·주차/접근성·휴일·외국어 의료표현 검수. 공개 승인 수가32/PDF는 계속 유지.
4. 접수 담당자/응답 기준 인수. 현재 직원계정0·이메일 알림 미연결·상담/성능 집계 OFF. 수동 접수함 확인을 운영 규칙으로 두거나 승인 후 알림 설정.
5. 실물 iPhone/Android·스크린리더와 전화/예약/카카오/톡톡 실제 연결·송수신 확인. 이번 자동검사로 대체되지 않습니다.

- 상세 인수 안내: `handoff/README.md`를 최신화했습니다. 기존 R1 PDF/Word/ZIP은 역사 자료이며 이번 결과를 포함한 것처럼 취급하지 않습니다.
- 수정 앱 `95f7676` 배포: https://b9b8b778.webapp-2-9y5.pages.dev . 기존 BYOK main 및 사용자 GitHub에 반영했습니다. 한·영 검증과 간헐 장애 관찰 결과를 함께 기록합니다.
- 운영 전후 SQL 독립 복원: posts3건/CMS44건/이력1건 및 접수·직원·설정·승인·알림·집계·세션·마이그레이션 총15테이블 완전 동일. 자동 채널 캐시/일시잠금은 비교 대상에서 제외했습니다. 비공개 SQL은 `.sources/final-audit/`, 일반 검사 로그/화면은 `test-results/final-*`에 저장합니다.
- 수정 배포 후 실제 도메인 단일병원120경로/72화면폭·수가32/PDF 보존, 영문60경로/180화면폭, 방송/톡톡80화면폭 재검사 PASS. 후속 추적617개 이벤트 표본(중복 포함)에서 서버 예외/500은 재현되지 않았습니다. 앞선500 검출 이력은 별도로 남기며 현재 정상 응답과 근본원인 해결을 구분합니다. 진단용 tail은 종료했으며 상시 감시 중이라고 주장하지 않습니다.

## Broadcast21 — 방송 출연 영상·네이버 톡톡 (2026-10-11)

- `/video#broadcast-appearances`, `/doctors/kang-dowook#broadcast-appearances` 및 영문 대응 경로에 한국경제TV `EIBOfm2xcOM`, 의학채널 비온뒤 `MPPSAHAajHc`의 공식 YouTube 링크 카드 2개를 추가했습니다. 기존 병원 제공 영상·플레이어·필터는 유지하며 방송 썸네일·영상 파일·환자사진을 복제하지 않습니다. 전체 영상 의료 검수나 방송사 추천·보증을 주장하지 않습니다.
- 네이버 톡톡 `https://talk.naver.com/w4s3ry?frm=mnmb&frm=nmb_detail`: 기존 공식 홈페이지 링크를 바탕으로 HTTPS GET에서 `/ct/w4s3ry` 이동·200 응답과 `더굿모닝치과의원 - 네이버톡톡` 메타를 확인했습니다. HEAD는404이지만 GET은 정상입니다. 채팅·예약 제출 및 실제 응답 시간 검사는 하지 않았습니다.
- 톡톡은 `/reservation`, `/directions`, 홈의 병원 안내 버튼, 공통 PC 빠른 상담·모바일 메뉴·푸터에 연결합니다. 모바일 고정 하단 4버튼은 밀집을 피하기 위해 늘리지 않았습니다. 외부 서비스·민감정보 전송 금지·응답시간 확인 안내를 포함합니다.
- 링크는 새 창에서 열리고 `noopener noreferrer`를 적용합니다. 자동 임베드나 채팅 스크립트는 없으며 JavaScript 없이도 연결됩니다. 한·영 번역을 함께 반영했습니다.
- 출처: https://thegoodmorningdental.com/ , https://www.youtube.com/watch?v=EIBOfm2xcOM , https://www.youtube.com/watch?v=MPPSAHAajHc . 링크 데이터는 `src/content.ts`, 렌더링은 `src/pages.ts`·`src/ui.ts`입니다. CMS 데이터 모델/DB 마이그레이션·운영 데이터 쓰기·DNS 변경은 없습니다.
- 검증: `node tests/broadcast-talk.mjs` — 한·영 Chromium/WebKit 80화면폭, 새 창 목적지(가로채기 검사), 방송 섹션 접근성, no-JS. 운영 검사에는 `TEST_URL=https://webapp-2-9y5.pages.dev`를 지정합니다.
- 로고 교체·칼럼 전체 아카이브·장비 이미지 추가는 이번 범위에 포함하지 않습니다. 공개 수가32항목/PDF·의료진5명·단일 병원·noindex·집계 OFF를 유지합니다. 신규 도메인 활성화/검색 공개 전환은 별도 작업입니다.
- 배포·검증 완료: 앱 `64c1dbd`, 스냅샷 https://b5b0db45.webapp-2-9y5.pages.dev , 운영 https://webapp-2-9y5.pages.dev . 기존 BYOK Pages `webapp-2`, GitHub `sodanstjrwns-max/thegoodmorningdc` main 반영 완료.
- 로컬 타입검사·빌드·`npm test` 전체 PASS. 방송/톡톡 검사는 로컬·운영 각각 한·영 Chromium/WebKit 80화면폭·외부 링크 목적지·접근성·no-JS PASS. 단일 병원 검사는 로컬·운영 각각120경로·72화면폭·수가32항목·PDF 원본 일치 PASS. 실물 iPhone/Android 및 실제 톡톡 메시지 송수신 검사는 하지 않았습니다.

## Hero20 — 메인 영상 하단 여백 정리 (2026-10-11)

- 배포 앱 `dbb39ba`, 스냅샷 https://097855aa.webapp-2-9y5.pages.dev . 검증 사이트 https://webapp-2-9y5.pages.dev/ 및 GitHub main 반영 완료.
- `/`, `/en`의 장면 선택을 절대 위치에서 빼고 하단 재생 제어 줄에 배치했습니다. 본문/상담 버튼과 조작부는 PC40~52px, 모바일32px 간격으로 분리됩니다.
- 영상 안내 버튼 크기를 정리하고 설명 줄간격과 버튼 간격을 확대했습니다. 모바일은 본문→상담 버튼→장면 선택→재생 제어 순서로 배치하며 영문 장면명은 좁은 화면에서 줄바꿈합니다.
- `node tests/hero-layout.mjs`: Chromium/WebKit·한/영·320~1920px 44조합의 겹침/잘림/44px 터치영역·장면 선택/정지/앵커/no-JS 검사. 로컬 및 실제 배포 주소 모두 통과. 기존 `npm test` 전체 통과. 운영 수가32/PDF·단일 병원·noindex 보존도 확인했습니다.
- H1·의료 문구·영상 원본·상담 링크·단일 병원 범위·수가32/PDF는 변경하지 않았습니다. 운영 DB 쓰기/마이그레이션과 DNS 변경 없음. 검증 주소 noindex 유지.

## 단일 병원 범위 — SingleClinic19 (2026-10-11)

- **배포·GitHub main 반영 완료**. 앱 `9f9f4fb`, 스냅샷 https://78bf57b4.webapp-2-9y5.pages.dev , 현재 검증 사이트 https://webapp-2-9y5.pages.dev/ . 운영 단일 병원 검사: 한·영120경로·Chromium/WebKit72화면폭·수정 공지·수가32/PDF 통과. 운영 Foundations120경로480화면폭 메타·제목·캐노니컬 검사도 통과. 로컬 SEO/CMS/접수/탐색/Foundations/Care/smoke/operations/editorial 회귀 통과.
- 운영 전후 SQL 대조: CMS44건·이력1건 동일, 공지 `initial-hours`의 제목/본문/수정일만 변경, 다른 게시물2건 및 접수·직원·설정·집계·알림큐 동일. 실제 접수나 외부 메시지 발송 없음.

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
