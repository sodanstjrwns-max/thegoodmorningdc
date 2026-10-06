# 더굿모닝치과 — Good Morning Web

## 프로젝트 / 현재 상태
- **대상:** 강도욱 원장님의 더굿모닝치과. 서울비디치과 홈페이지가 아닙니다.
- **목표:** 원장 사전설문·개편 제안서·실제 의료진/공간/영상 자료를 반영한 진료 정보와 운영 가능한 콘텐츠 관리.
- **환경:** Hono SSR + TypeScript + Vite + Cloudflare Pages. 바닐라 JS, self-host Pretendard Variable, 차콜·노랑.
- **작업 경로 / 브랜치:** `/home/user/webapp` / `main`.
- **상태:** 제작 미리보기. 정식 배포·기존 도메인·DNS 변경 없음. `PUBLIC_SITE_URL` 미설정 상태는 noindex.
- **미리보기:** https://3000-iea4n2skk8l8g2o6tat4s-dfc00ec5.sandbox.novita.ai/?v=8
- **관리자:** 위 주소의 `/admin`. 비밀번호는 `.dev.vars`의 보안 변수로 관리하며 소스·문서·브라우저에 공개하지 않습니다.
- **최종 개편:** 2026-10-06. 이전의 ‘원장 요청 최대 반영’ 설명에 있었던 약력 축약·CMS 제한·공식 채널 미연결을 이번 작업에서 보완했습니다.

## 완료한 기능

### 원장 요청과 콘텐츠
- 공개 기본 **60경로**, 진료 상세 31개, 의료진 상세 5개.
- 원본 기반 진료 FAQ 285개, 일반 FAQ 6개, 증상 182개, 설명 소섹션 96개, 용어 66개.
- 첫 화면은 제공 원내 소개 MP4를 편집한 **무자막 16초 영상** 유지. 영상 다음에 **수면·재수술·앞니·장애인 진료** 4개를 배치했습니다.
- 원장 설명 영상도 수면·앞니·재수술·장애인 4편으로 변경. 수면 전용 섹션과 장애인 메시지를 원장 철학·기타 스토리보다 앞으로 옮겼습니다.
- 5인 전체 제공 약력 복원. 원본의 명백한 영문/한글 오탈자는 기존 공식 홈페이지와 대조한 경우에만 수정했습니다. 학위·전문의 자격을 추정하지 않았습니다.
- 강도욱·이상훈 2인만 더블보드 표기. 나머지 소개 문구는 원장 직접 인용이 아닌 홈페이지 소개 문구임을 표시합니다.
- 미션의 지역 내 폭넓은 진료 의도를 살리되, 모든 치료 가능·상급병원 불필요라는 보장을 하지 않습니다. 미션 원문과 조정문은 관리자 비공개 승인 자료에 나란히 보관했습니다.
- 해외·타지역 내원 준비 안내와 짧은 영문 안내 추가. 통역·원데이 완료·비행 가능 시점은 보장하지 않습니다.
- 원문과 답변이 전부 동일하다는 주장은 하지 않습니다. **31개 진료별 원문/현재 답변 대조 자료**를 관리자에 마련했습니다. 안전 표현 수정과 보완 답변은 병원 감수 대상입니다.

### 탐색·연락
- 콘텐츠·병원안내 드롭다운과 모바일 하위 메뉴.
- 모바일·태블릿에서도 지점 선택과 전화번호 표시. 지점 선택에 따라 전화·네이버 예약·카카오·길찾기가 함께 변경됩니다.
- 모바일 하단 4버튼: 전화 / 카카오 / 네이버 예약 / 오시는 길.
- 관리자에서 지점별 7일 일정과 날짜별 예외를 수정하면 시간표·헤더 상태에 함께 반영됩니다. 등록되지 않은 공휴일은 자동으로 추정하지 않습니다.
- 가나다 색인과 검색을 동시에 적용하는 백과사전 탐색.
- 검색은 공개 진료·의료진·일반 FAQ·영상·건강정보·용어를 포함합니다.
- 공개 진료/의료진 변경은 목록·상세·메인 관련 영역·검색·사이트맵·구조화 데이터에 같은 요청 단위 데이터로 연결됩니다.
- 네이버 지도는 정확한 주소의 **외부 지도 링크**입니다. 실제 지도 임베드는 아직 없습니다.

### 인터랙션 / 영상
기존 7개 스토리와 접근성·정적 fallback을 보존했습니다.
- 대화형 FAQ / 임플란트 구조 / 수면 과정 / 내원 여정.
- 스크롤 조립형 자연치아 보존 / 의료진 드래그·키보드 카드덱 / 전문용어 wipe.
- 글자별 등장, 스크롤 강조, 메뉴·카드·FAQ 전환, 전체 모션 ON/OFF.
- 모션 OFF·reduced-motion·Save-Data는 자동 영상 다운로드를 막지만, **직접 영상 재생은 가능**합니다.
- 자동재생 거절·네트워크 실패·8초 지연 안내, 수동 재생, 새 창 링크, 오래된 play Promise 경쟁 방지.
- 화면 밖·숨겨진 탭·외부 YouTube 모달 재생 중에는 배경 영상 정지.
- `/films/:file`은 허용된 두 MP4만 ASSETS에서 읽어 206/HEAD/suffix/open/416/If-Range 응답 지원. 임의 파일·외부 프록시 접근 불가.
- 데스크톱 1280×720 / 모바일 768×432, H.264, 무음, 4초×4장면. 영상은 생성형 합성이 아닙니다.
- 원본 구간 52.3–55.5, 55.5–58.7, 60.1–63.3, 64.1–67.3초를 0.8배속 편집했습니다. 추가 자막 없는 구간이며 현장 간판·가운 로고는 남아 있습니다.
- 직접 제공 MP4는 1개, 영상 링크 파일은 중복 포함 158개였습니다. 별도 무자막 마스터를 확보하거나 YouTube 영상을 다운로드했다고 주장하지 않습니다.

## 공식 채널 확인 및 연동
출처: **https://thegoodmorningdental.com/** 의 지점별 예약·카카오·블로그 링크와 원장 칼럼 메뉴. 2026-10-06 확인. 해당 사이트의 사진·환자 사례를 가져오지 않았습니다.

| 채널 | 청량리 | 광명 |
|---|---|---|
| 네이버 예약 | https://booking.naver.com/booking/13/bizes/1019716 | https://booking.naver.com/booking/13/bizes/1551337 |
| 카카오 | https://pf.kakao.com/_npxibG | https://pf.kakao.com/_XGQYn |
| 네이버 블로그 | https://blog.naver.com/thegoodmorningdent | https://blog.naver.com/wa517396 |

- YouTube: https://www.youtube.com/channel/UCYLjg7-qpfI4ev-QkfpubFQ
- 원장 인블로그: https://thegoodmorningdental.com/blog/
- `/blog`: 자체 건강정보 게시판과 공식 네이버 블로그 최신 목록을 구분하여 표시.
- `/video`: 관리 영상과 공식 YouTube 최신 목록을 구분하여 표시.
- `/column`: 별도 원장 칼럼 안내 페이지. 기존 자체 `/blog`로 보내던 리다이렉트 제거. 인블로그는 **원문 링크 연결**, 본문 자동 복제/동기화는 아닙니다.
- 네이버 2개와 YouTube 피드에서 각각 12개 항목 실제 수집 확인. 외부 제목·링크만 표시하며 환자 사진·본문은 복제하지 않습니다.
- `channel_cache` D1 캐시. 방문 요청 때 `waitUntil`로 1시간 간격 갱신, 실패 시 5분 backoff와 마지막 성공 목록 유지. 원자적 갱신 잠금, 6초 timeout, 1MB 응답 제한.
- 고정 호스트·ID 기반 URL 생성, 리다이렉트 차단(manual + 응답 상태 확인), XML DOCTYPE/ENTITY 차단. 외부 피드가 없거나 실패하면 공식 원문 링크로 안내합니다.
- cron/KV/프런트 API 토큰 없음. 인스타그램은 공식 계정이 미확정이어서 임의로 추가하지 않았습니다.

## 통합 CMS 사용법
1. `/admin`에서 관리자 로그인.
2. 분류 탭 선택 → 검색 → `편집` 또는 `새 항목 추가`.
3. 일반 입력칸과 목록의 `항목 추가/삭제`로 수정합니다. JSON 작성이 필요하지 않습니다.
4. `초안 저장`은 공개본을 바꾸지 않습니다. `공개 전 미리보기`로 실제 페이지 구성을 확인합니다.
5. 의료정보·자격·일정·금액 검토 후 `검토 완료 · 공개`를 별도로 선택합니다.
6. 기존 원본 항목은 `원본 복원`, 추가 항목은 `삭제`. 연결된 진료·의료진이 있으면 삭제를 막습니다.
7. 변경 이력 최신 20개를 확인하고 과거 버전을 편집기에 불러올 수 있습니다. 불러오기 자체로 저장·공개되지 않습니다.

### 관리 범위
- 진료 설명·증상·세부 섹션·주의사항·과정·진료별 FAQ·담당 의료진·관련 진료.
- 의료진 사진·자격·전체 약력·관련 진료·일정·소개 문구 출처.
- 일반 FAQ, YouTube 영상 목록, 공식 채널.
- 메인 기본 섹션 순서·표시·제목·추가 안내 문구, `custom-` 주소의 새 텍스트 섹션.
- 첫 화면 영상 섹션은 재생·접근성 구성을 보호하기 위해 고정합니다. 수면/자연치아 메인 과정은 4단계를 유지합니다.
- 지점 전화·주소·예약·카카오·주차·이동·주간 일정·날짜별 예외.
- 원장 스토리와 세 가지 약속.
- 비급여·장비·주차·접근성·수면 준비·채용·법률 운영정보.
- 기존 공지·건강정보 게시판과 본문 이미지 기능 유지.

### 확인대기 자료
**44개 비공개 초안**을 초기 마이그레이션으로 마련했습니다.
- 제공 수가표 32항목 대조 초안 1개.
- 재직·지점·주차·접근성·수면·장비·공휴일·사례·채용·법률·해외·도메인·미션 등을 묶은 운영 확인 자료 12개.
- 진료 31개 원문/현재 답변 대조 자료.

수가표는 `더굿모닝치과 비급여수가표_0324.pdf` 이미지에서 추출했습니다. 파일명으로 적용 연도·날짜·지점을 추정하지 않습니다. 금액·보증 조건·산정 단위·적용일·지점 검토 전에는 공개하지 않습니다.

운영정보 공개에는 병원 확인 체크·승인 근거·유효한 적용일이 필요합니다. 사례 동의 및 원문 승인 자료는 비공개 검토 전용으로 공개 API에서 차단됩니다. 실제 환자 사진·건강정보·동의서를 편집기에 업로드하지 마세요.

## 데이터 구조 / 보안
- `src/data.ts`: 제공 원문 기반 기본값. 삭제되지 않는 초기 콘텐츠.
- `src/content.ts`: 요청 단위 스냅샷, 타입별 whitelist 검증, 날짜·URL·참조 검증. imported 전역 배열을 요청마다 변경하지 않습니다.
- `src/ui.ts` / `src/pages.ts`: 해당 요청 스냅샷을 받는 SSR factory.
- `src/studio.ts`: 인증 후에만 접근하는 통합 CMS API.
- `src/channels.ts`: 외부 RSS 파싱·D1 캐시.
- D1 `posts`, `admin_sessions`, `admin_attempts`, `content_entries`, `content_history`, `channel_cache`.
- `content_entries`: `(kind,key)` 기본키, `draft_json`/`live_json` 분리, revision 비교 갱신으로 덮어쓰기 충돌 방지.
- `content_history`: 저장·공개·복원·삭제 이력. 공개 경로 없음.
- R2: JPG/PNG/WebP 5MB 이하, magic bytes 검사. SVG 차단. 공개 게시물 또는 실제 공개 콘텐츠에서 사용되는 이미지만 익명 접근 허용. 초안/삭제된 콘텐츠의 미디어는 비공개.
- SHA256 세션 해시, 8시간, HttpOnly/SameSite=Strict/Secure(HTTPS), 로그인 5회/15분 제한, 변경 API Origin 검사.
- 텍스트 escape, raw HTML 불허, CSP, 요청 body 제한. 미리보기 iframe은 스크립트 실행 없이 렌더링합니다.
- `.dev.vars`, `.sources`, `.wrangler`, `node_modules`, `dist`, QA 산출물은 Git 제외. 원본 환자/수술 사진을 public으로 되돌리지 않습니다.
- 환자 회원가입·온라인 예약 접수·건강정보 수집·AI 진단은 없습니다. 예약은 공식 외부 채널 연결이며 실제 확정은 병원 절차를 따릅니다.

## 주요 경로 / API
| 경로 | 기능 |
|---|---|
| `/` | 영상, 4핵심 진료, 원문 스토리, 의료진, 지점 |
| `/treatments`, `/treatments/:slug` | 진료 목록·상세·진료 FAQ |
| `/doctors`, `/doctors/:slug` | 의료진·전체 약력 |
| `/mission`, `/tour` | 원장 스토리·공간·장비 |
| `/directions?branch=cheongnyangni 또는 gwangmyeong` | 지점·시간·주차·접근 |
| `/reservation`, `/visiting` | 예약 채널·해외/타지역 내원 |
| `/contents`, `/video`, `/blog`, `/column` | 콘텐츠 허브·영상·블로그·인블로그 |
| `/blog/:slug`, `/notice/:slug` | 공개 게시물 |
| `/faq`, `/encyclopedia`, `/symptom-checker` | FAQ·가나다 용어·비진단형 정보 탐색 |
| `/pricing`, `/cases`, `/careers`, `/privacy`, `/terms` | 비용·사례 공개 기준·운영 안내 |
| `/api/search?q=검색어` | 공개 콘텐츠 검색 |
| `/films/clinic-opening.mp4`, `/films/clinic-opening-mobile.mp4` | Range 지원 영상 |
| `/admin` | 관리자 UI |
| `/api/admin/content` GET | 인증된 전체 관리 목록·형식 |
| `/api/admin/content/:kind/:key` POST/DELETE | 초안/공개/복원/삭제, revision 필요 |
| `/api/admin/content-preview/:kind/:key` POST | 비공개 미리보기 |
| `/api/admin/history/:kind/:key` GET | 비공개 변경 이력 |
| `/api/admin/channels` GET, `/channels/refresh` POST | 실제 전체 경로는 `/api/admin/channels/refresh`; 캐시 상태·확인 |
| `/api/admin/posts`, `/upload`, `/preview`, `/login`, `/logout` | 실제 prefix는 모두 `/api/admin`; 기존 게시판 API |
| `/media/:key` | 공개 참조 또는 인증 확인 후 R2 이미지 |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/feed.xml` | SEO / 자체 블로그 RSS |
| `/api/health` | 미리보기 상태 |

## 실행 / 검증
```sh
cd /home/user/webapp
npm run db:migrate:local
npm run typecheck
npm run build
# 처음 시작 또는 재시작할 때 port 3000 정리 후:
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
npm run test:all
```
- `npm test`: 60경로·31진료·285FAQ/schema 일치·320~1440 폭·영상 Range와 디코딩·수동재생·7인터랙션·기존 게시판 보안.
- `npm run test:studio`: 요청 격리·RSS parser/SSRF·전체 약력·44검토 초안·비공개 수가·새 CMS CRUD·초안/공개 분리·revision 충돌·이력·미리보기·연결 삭제 보호·XSS·미디어 권한·새 검색/sitemap·메인 변경·모바일 폼·휴진 예외·실제 공식 RSS.
- 2026-10-06 `npm run test:all` 1회 전체 통과: 60공개 경로·기존 영상/모션·새 CMS·실제 RSS 연속 검증, 당시 브라우저 오류 0개. 이후 개발 도구 sharp를 0.35.5로 보안 패치하고 반복한 검사에서는 smoke 마지막 브라우저 오류 검사에 `Transition was aborted because of invalid state. ViewTransition opt-in disabled` 1건이 수집되어 실패했습니다. 그 반복 실행의 studio 단계는 실행되지 않았습니다. 주요 기능 검사는 통과했지만, 간헐적인 native View Transition 중단의 원인·안정성 확인은 남아 있습니다. 개발 의존성 변경이 원인이라고 확정하지 않습니다. 테스트 임시 공개 데이터는 정리되어, D1에는 44개 비공개 검토 초안만 남아 있습니다.
- 검증은 Playwright Chromium 및 모바일/touch emulation입니다. 실제 iPhone/Safari·인앱 브라우저 검수로 주장하지 않습니다.
- npm audit: 런타임/개발 의존성 취약점 0개 확인. Worker 빌드 약380KB, gzip 약118KB.

## 남은 병원 확인 / 권장 다음 단계
1. 수가표 현행 금액·지점·적용일·산정 단위·임플란트 보증 조건 승인.
2. 의료진 재직·자격 현행 상태·지점별 근무 요일, 청량리 공휴일/대체공휴일 안내.
3. 지점별 주차·휠체어·엘리베이터·진료실 이동 환경, 수면 준비·담당/보호자 정책.
4. TRIOS 모델 표기(제안서 4.5 / 기존 공식 홈페이지 5)와 장비 운영 지점 확인.
5. 원문 조정 답변·미션 문구의 의료진 감수. 체크만 하면 자동 감수가 되는 시스템이 아닙니다.
6. 환자 사례 공개 동의·비식별화·의료광고 승인. 현재 실제 사례 게시·동의문서 보관 기능은 운영하지 않습니다.
7. 채용 조건·공식 이메일, 사업자·개인정보처리방침 등 운영 법률정보 확정.
8. 실제 기기 검수. 지도 임베드가 필요하면 해당 지도 서비스의 승인된 키·도메인 설정을 별도 준비.
9. 정식 전환 승인을 받은 후 배포경로 선택, production D1/R2/ASSETS 확인, 시크릿 설정, 인블로그 `/blog/`와 기존 URL 보존 계획 수립. 현재 `/blog` 자체 게시판을 기존 도메인에 덮어씌우면 안 됩니다.

## 배포 구성
- PM2 `webapp`, Wrangler local Pages, port3000.
- `wrangler.jsonc`의 D1 ID는 로컬용이며 실제 production ID가 아닙니다.
- Hosted 배포를 선택할 경우 D1/R2 사용, KV·cron 없음. 배포경로는 사용자 승인 전 선택하지 않습니다.
- 제공 자료: https://drive.google.com/drive/folders/1nHFzdlo9_6hEZS-GOhcHdhqbtDYiyHZ9?usp=sharing
- 기존 공식 홈페이지 및 인블로그는 변경하지 않았습니다.
