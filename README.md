# 더굿모닝치과 — Good Morning Web

## 현재 상태
- 대상: 강도욱 원장님의 더굿모닝치과. 서울비디치과 홈페이지가 아닙니다.
- 목표: 제공 설문·제안서·사진·영상에 기반한 홈페이지와 운영 가능한 CMS.
- Hono SSR + TypeScript + Cloudflare Pages, D1/R2, `/home/user/webapp`, `main`.
- **샌드박스 제작 미리보기입니다. 정식 배포·기존 홈페이지 교체·도메인/DNS 변경 없음.**
- 미리보기: https://3000-iea4n2skk8l8g2o6tat4s-dfc00ec5.sandbox.novita.ai/?v=14
- 영어: 위 주소의 `/en`. 관리자: `/admin`. 수가표: `/pricing`.
- 최종 작업: 2026-10-08. 아래는 구현·검증 상태이며 의료 감수나 운영 사실 확인을 대신하지 않습니다.

## 펼친 메뉴·영문 첫 화면 수정 (2026-10-08, v14)
- 원인: `.nav-item{position:relative}` 때문에 너비100%인 메가메뉴가 헤더가 아닌 약98px짜리 링크를 기준으로 펼쳐졌습니다. 배경 밖으로 글자가 넘쳐 영상과 겹쳤습니다.
- 메가메뉴가 있는 항목만 static으로 바꾸고, 메뉴는 sticky 헤더 전체 너비를 기준으로 배치합니다. 불투명 배경·4열 최소 너비·명확한 대비·viewport 내 최대높이·내부 세로스크롤을 적용했습니다.
- 영문은1390px 이하에서 좁은 데스크톱 메뉴 대신 전체 메뉴 버튼을 사용합니다. 기존 한국어1020px 기준은 유지합니다. Escape·키보드 진입·aria-expanded·외부 클릭·resize 잠금 해제를 보완했습니다.
- 영문 홈 제목은 “A dental clinic that / listens once more.”로 자연스럽게 구성하고 minmax(0,…) 열과 제목 너비 제한으로 본문을 옆으로 밀지 않게 했습니다. 한국어 핵심 문구와 무자막 영상은 유지합니다.
- `tests/navigation.mjs`에 펼친 메뉴 회귀 추가: KO/EN 데스크톱16조합, 진료31개 링크 접근, 배경 전체 너비·불투명도·열 너비·낮은 높이 스크롤·Escape·키보드·실제 링크 이동. 영문 compact6폭과 resize, 첫 화면 제목/본문 겹침 검사.
- `npm run test:all` 전체 통과: 확장 navigation → smoke → studio → seo → services → locales. 기존92회 탐색·한국어360폭 조합·영어180폭 조합·CMS·수가·접수 검사도 유지했습니다. 브라우저 오류0건.
- 외부 HTTPS `/en?v=14`에서도 펼친 메뉴 너비1440px, 진료31링크, 화면 내 높이 및 브라우저 오류0건을 확인했습니다. 실제 Safari/iPhone 기기 검수는 아닙니다.

## 이번 추가 구현
### 1. 실제 지도
- 홈·오시는 길·예약의 지점 패널에서 ‘실제 지도 보기’를 누르면 Google Maps iframe이 열립니다.
- 클릭 전에는 외부 지도에 접속하지 않습니다. 클릭 시 외부 서버에 접속 정보가 전달될 수 있음을 개인정보 안내에 반영했습니다.
- 두 지점 각각의 공식 주소를 사용하며 기존 네이버 지도 링크·주소 복사도 유지합니다.
- 실제 지도 타일과 위치 표시가 로드되는 것을 브라우저로 확인했습니다. 지도 API 키는 사용하지 않습니다.

### 2. 인블로그 자동 목록
- 기존 공식 `/blog/`가 안내하는 RSS와 inblog subdomain `tgm-dental`을 확인했습니다.
- 커스텀 도메인의 서버 연결 지연 때문에 같은 블로그의 공식 원본 `https://inblog.ai/tgm-dental/rss`에서 수집합니다.
- `/column`: 실제 제목·게시일·원문 링크 12개 자동 표시. 본문·환자사진은 복제하지 않습니다.
- 방문 요청 시 1시간 간격 D1 캐시 갱신, 실패 시 기존 목록 유지 및 5분 재시도 간격. 관리자에서 상태 확인 가능.
- 고정 호스트, 리다이렉트 차단, XML DOCTYPE/ENTITY 금지. 인블로그 응답은 최대6MB/12초, 파싱은 최신12개까지만 처리. 네이버·YouTube는 기존1MB/6초 제한 유지.

### 3. 치료사례·환자 후기 CMS
- 관리자 ‘치료사례·환자 후기’ 탭: 제목·본문·관련 진료, 전후 사진과 촬영일, 촬영 조건·기간, 주의사항 입력.
- 동의 관리번호·웹 공개 동의·비식별 확인·검토 담당자/검토일이 있어야 공개됩니다. 실제 이미지 파일 존재도 검사합니다.
- 동의 관리번호·검토 담당자는 공개 화면에 노출하지 않습니다. 동의서나 환자 이름을 등록하는 기능이 아닙니다.
- `/cases`에 전후 이미지와 설명·개인차 고지, 사례/후기 필터 표시.
- 초안→미리보기→공개→공개 내림, revision 충돌 방지·변경 이력. 공개 내림 후 사례 전용 이미지의 익명 접근도 차단됩니다.
- **공개 기능은 구현 완료. 실제 환자 사례나 후기를 임의로 만들거나 미확인 자료를 공개하지 않았습니다. 현재 실제 공개 사례는 없습니다.**

### 4. 채용 공고·온라인 지원서
- 관리자 ‘채용 공고’에서 직무·지점·고용형태·시간·급여·자격·복지·마감일·접수 상태 설정.
- 확인된 조건과 근거가 있어야 공고를 공개합니다. 마감·접수 종료 공고에는 서버에서도 지원을 거부합니다.
- `/careers`: 공고별 지원 또는 별도 인재풀 지원. 실제 공고가 없으면 이를 분명히 표시합니다.
- 지원자 이름·연락처·지점·직무·선택 메시지, 선택 이력서 PDF(3MB 이하) 접수.
- PDF는 MIME·시그니처를 검사하고 R2 비공개 경로에 저장. 관리자만 다운로드할 수 있습니다. 파일의 무해성을 보장하는 백신 검사는 아니므로 신뢰할 수 있는 뷰어를 사용하세요.
- 실제 급여·채용 조건은 만들어 쓰지 않았으며 현재 활성 공고는 없습니다. 인재풀 접수 기능은 작동합니다.

### 5. 해외 환자·통역 요청
- `/visiting#language-request`: 이름·연락처·지점·필요 언어·희망 방문일·선택 메시지 접수.
- 관리자 접수함에서 신규→연락 진행→담당자 확인·확정→종료 상태와 업무 메모 관리.
- 요청 접수 자체로 통역사 배정·예약·진료가 확정되지는 않습니다. 병원 담당자가 가능 여부와 비용을 확인 후 연락해야 합니다.
- 자동 이메일 발송이나 외부 통역사 예약 연동은 없습니다. 실제 통역 인력 확보를 했다는 주장이 아닙니다.

### 6. 다국어 — 완료 범위를 구분
- **영어: 공개 기본60경로, 진료31개·FAQ·의료진·수가·지원서·방문 안내를 포함한 2,591개 문자열 번역 사전과 SSR 화면 구현.**
- `/en`, `/en/treatments/:slug` 등 언어별 주소, 내부 링크, 검색, 양식, FAQ 앵커, canonical·hreflang·구조화 데이터 연결.
- 영어60경로 × 320/768/1440px =180조합 검사 통과. 영문 긴 제목·지점 탭·긴 의학용어 줄바꿈 수정.
- 기계 보조 번역임을 표시하며 의료진 번역 감수 완료를 주장하지 않습니다. 새 CMS 글·새 RSS 제목 등 사전에 없는 문장은 한국어로 남을 수 있습니다.
- **일본어·중국어: 번역 API가 사용자 동시 요청20개 제한(HTTP429)을 반복 반환하여 미완료. 메뉴·hreflang·사이트맵에 노출하지 않으며 해당 언어 경로는404입니다.**
- `build-translations.mjs`: 공개 문장만 수집하는 개발 도구. OPENAI_API_KEY/OPENAI_BASE_URL 환경변수 사용, 비밀키는 소스·브라우저에 없음. 실제 접수 개인정보를 번역 API에 보내지 않습니다.
- 재개: `node build-translations.mjs --collect` → `node build-translations.mjs`. `.sources/public-translation-source.json`에서 필요한 문장만 번역하며 기존 번역을 재사용합니다. 일본어/중국어 사전 완성·감수·검증 후 `src/locales.ts`의 활성 언어에 추가해야 합니다.

## 접수 개인정보·보안
- D1 `service_requests`: 무작위ID, 종류, 입력JSON, 첨부키, 상태, 메모, revision, 접수/만료 시각.
- D1 `request_limits`: 해시 접속 식별값과 시간당 최대5건 제한. Origin 검사·허니팟·입력 길이/날짜/연락처 검증·명시적 수집 동의.
- 채용90일, 방문·통역30일 보유. 기간 경과 즉시 읽기 차단, 이후 접수/관리자 요청 시 최대25건씩 기록과 파일 삭제. cron을 사용하지 않으므로 무방문 상태에서 정확한 시각의 물리 삭제를 보장하지 않습니다.
- 관리자 접수함만 열람·수정·첨부 다운로드·영구 삭제 가능. 제출 성공 후 공개조회로 개인정보를 돌려주는 엔드포인트는 없습니다.
- 동의 버전 `2026-10-08-v1`. 목적·항목·기간·거부 및 삭제 방법을 양식과 개인정보 안내에 표시.
- 주민등록번호·여권·건강정보 등 민감정보를 입력하지 않도록 안내합니다.
- 실제 운영 전 개인정보처리방침의 책임자·위탁/국외처리 등의 법률 검토는 필요합니다.

## 기존 완료 기능 유지
- 차콜·노랑, 기존 CI, 제공된 실제 사진·16초 무음·추가 자막 없는 오프닝.
- 수면·재수술·앞니·장애인 진료 우선 배치, 원장 스토리와1990년 개원 계승.
- 기본60경로, 진료31·의료진5 전체 제공 약력, 진료FAQ285·일반FAQ6·증상182·설명96·용어66.
- 7스토리 인터랙션, 모션 OFF/reduced-motion/Save-Data, 키보드·정적 대체 화면.
- 영상 실제2썸네일+내용별4표지. 원본 환자 전후·수술 사진 썸네일은 복제하지 않았습니다.
- CMS 초안/live 분리, 요청 단위 Content, CAS, 이력·미리보기·참조 삭제 보호.
- 네이버2·YouTube·인블로그 RSS 각12항목, 지점별 공식 예약·카카오 연결.
- `/pricing` 비급여32항목 및 `/static/fees-0324.pdf` 원본 공개. 적용일·지점을 추정하지 않으며 다시 승인대기로 되돌리지 않았습니다.
- 초기 운영 검토44개 중 수가1개 공개·나머지43개 비공개. 새 사례·채용은 별도 콘텐츠 종류입니다.
- 두 지점 검색엔진 엔터티·페이지별 설명·31핵심답변·FAQ앵커·사이트맵·llms.
- 미리보기는 noindex. 검색 순위·AI인용·실제 색인 성과를 달성했다는 주장은 하지 않습니다.
- Google FAQ 리치결과는2026-05-07부터 종료 안내, llms.txt는 Google 순위 가산점이 아님: https://developers.google.com/search/updates
- 경량 GoodMorningSans 약458KB, 원본 폰트 약2.06MB는 드문 글자 fallback. OFL 파생 이름·LICENSE 유지. `python build-font-subset.py`는 선택적 개발 도구입니다.

## 주요 URI
| URI | 기능 |
|---|---|
| `/`, `/en` | 한국어·영어 홈 |
| `/treatments`, `/treatments/:slug`, `/doctors`, `/doctors/:slug` | 진료·의료진 |
| `/mission`, `/tour`, `/directions`, `/reservation` | 철학·공간·지도·예약 |
| `/column`, `/video`, `/blog`, `/contents` | 공식 칼럼·영상·블로그·콘텐츠 |
| `/faq`, `/encyclopedia`, `/symptom-checker` | FAQ·용어·비진단 정보 |
| `/pricing`, `/cases`, `/careers`, `/visiting` | 수가·사례·지원·통역 요청 |
| `/en/...` | 해당 공개 화면 영어 버전 |
| `/admin` | 콘텐츠 CMS·비공개 접수함 |
| `POST /api/requests/career`, `/api/requests/interpretation` | 동의 기반 접수 |
| `/api/admin/requests` | 인증된 접수 목록 |
| `/api/admin/requests/:id` | 상태/메모 변경·삭제 |
| `/api/admin/requests/:id/attachment` | 인증된 PDF 다운로드 |
| `/api/admin/content/:kind/:key` | 기존 CMS 초안·공개·삭제 |
| `POST /api/admin/content/:kind/:key/withdraw` | 사례·채용 공개 내림 |
| `/api/search?q=...&lang=en` | 공개 검색 |
| `/sitemap.xml`, `/sitemap-languages.xml`, `/robots.txt`, `/llms.txt`, `/feed.xml` | 검색·RSS |
| `/films/clinic-opening.mp4`, `/films/clinic-opening-mobile.mp4` | Range 영상 |
| `/media/:key` | 공개 참조 또는 관리자 권한이 있는 이미지 |

## 실행·검증
```sh
cd /home/user/webapp
npm run db:migrate:local
npm run typecheck
npm run build
# 최초 시작/재시작은3000포트 정리 후 PM2
pm2 start ecosystem.config.cjs
npm run test:all
node tests/locales.mjs
```
- 2026-10-08 TypeScript·프런트4개 JS 문법·빌드 통과.
- 기존 navigation92회·smoke·studio·seo 전체 회귀와 신규 services 통과. 한국어60경로×6폭360조합, 영상11폭, FAQ285/schema 일치, 수가32/PDF동일·43비공개 유지.
- 신규 services: 동의 없는 사례 공개 차단·전후이미지 권한/철회·공고 조건/마감·지원서PDF·통역 접수·CSRF·CAS·보유기간·삭제·빈도제한·관리자UI·실제RSS·25화면폭 검사 통과.
- 최종 영문 수정 후 `tests/locales.mjs`: 2,591문자열, 영어60경로·180폭 조합, 제목·canonical·schema·hreflang·검색·양식·FAQ앵커 통과. 브라우저 오류0.
- 실제 지도 타일 로드 확인. 테스트용 사례·공고·접수는 삭제했습니다. 검증용 이미지가 남더라도 공개 참조가 없어 비공개입니다.
- Playwright Chromium/모바일 에뮬레이션이며 실제iPhone/Safari·실사용자CWV 검수는 아닙니다.
- 최종 Worker 약848KB/gzip269KB. 미완료 일본어·중국어는 완료 목록에 포함하지 않습니다.

## 데이터·운영 주의
- D1: posts, admin_sessions, admin_attempts, content_entries, content_history, channel_cache, service_requests, request_limits.
- R2: 공개 참조 이미지와 비공개 지원서 PDF. filesystem·메모리를 영속 저장소로 사용하지 않습니다.
- 인증: 해시 세션8시간, HttpOnly/SameSite=Strict/Secure(HTTPS), 로그인5회/15분, 변경 Origin 검사.
- `.dev.vars`, `.sources`, `.wrangler`, node_modules, dist, QA 결과는 Git 제외.
- 공개 원문 번역 사전만 public에 저장. 접수·동의 내부 관리정보·개인 연락처는 포함하지 않습니다.
- 미션/의료답변 조정본 감수, 실제 사례 동의·검토, 채용 조건, 의료진 근무일·장비 모델·주차 등 병원 사실 확인은 계속 필요합니다.
- 기존 인블로그 `/blog/`를 새 자체 게시판으로 덮어쓰지 않습니다. 정식 전환 승인 후 기존URL 보존·production D1/R2·시크릿·검색 등록을 별도로 처리해야 합니다.

## 원본 자료
- 사용자 제공 Drive: https://drive.google.com/drive/folders/1nHFzdlo9_6hEZS-GOhcHdhqbtDYiyHZ9?usp=sharing
- 기존 공식 홈페이지: https://thegoodmorningdental.com/
- 위 주소는 제작 산출물이 아닌 원본·조사 출처입니다.
