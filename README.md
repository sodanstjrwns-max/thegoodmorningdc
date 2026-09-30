# 더굿모닝치과 — Good Morning Web

## 프로젝트
강도욱 원장님의 사전설문·개편 제안서·디자인 가이드와 제공 사진을 기반으로 만든 Hono + Cloudflare Pages 홈페이지입니다. 차콜·옐로, 실제 공간·의료진 사진, 원본 로고 심볼을 적용했습니다. 원본 로고의 심볼을 추출해 요청 팔레트로 단색화했으며 헤더의 병원명은 실제 텍스트입니다.

## 현재 상태 / URL
- **상태: 제작 미리보기. 정식 운영 배포 및 기존 도메인 변경 없음.**
- 미리보기: https://3000-iea4n2skk8l8g2o6tat4s-dfc00ec5.sandbox.novita.ai
- 로컬: http://localhost:3000
- 관리자: `/admin` (비밀번호 보호)
- 헬스체크: `/api/health`
- 검색엔진: 기본 noindex + robots 차단. 정식 오픈 검수 후 PUBLIC_SITE_URL을 설정해야 인덱싱이 허용됩니다.

## 구현된 기능
- 공개 페이지 58개: 메인, 31개 진료 상세, 의료진 목록 및 5인 상세, 병원 철학, 공간, 내원 안내, 콘텐츠 등.
- 실제 사진, 스크롤 진입 모션, 포인터 반응 조명, 수면센터의 스크롤 연동 원형 빛 연출. 모션 줄이기 지원.
- 4열 진료 메가메뉴, 모바일 메뉴, 전체 검색, 진료별 검색·필터.
- 청량리·광명 지점 선택, 전화 번호 연동, 진료시간, 주소 복사, 네이버 지도 검색 연결.
- 정규 일정 기반 시간 안내. 공휴일/임시휴진은 별도 확인 필요. 실제 영업 상태를 보장하지 않습니다.
- 6개 제공 YouTube 영상의 클릭 후 재생. 현재 카드 사진은 실제 병원 공간이며 영상 썸네일이 아닙니다.
- 66개 용어 백과사전, FAQ, 4단계 규칙 기반 증상별 정보 탐색. AI 진단 아님. 응답은 저장하지 않음.
- 관리자 인증, 글 작성·수정·삭제, 초안·공개, 제목·슬러그 편집, 안전한 텍스트 기반 소제목, 이미지 삽입·드롭, 본문 미리보기.
- D1 기반 게시물·세션·로그인 시도 제한, R2 이미지 업로드. 미공개 이미지 접근은 관리자만 허용.
- 로그인 5회/15분 제한, 8시간 세션, HttpOnly/SameSite 쿠키, 변경 요청 Origin 검증, HTML 이스케이프, 이미지 타입·크기 검사.
- SSR 본문, 고유 title/description, canonical, OG, Dentist/Person/MedicalProcedure/FAQ/Article/Breadcrumb 구조화 데이터, sitemap.xml, robots.txt, llms.txt, feed.xml.

## 주요 경로
- `/`, `/mission`
- `/treatments`, `/treatments/:slug`
- `/doctors`, `/doctors/:slug`
- `/directions?branch=cheongnyangni|gwangmyeong`, `/reservation`, `/tour`
- `/contents`, `/video`, `/faq`, `/encyclopedia`, `/symptom-checker`
- `/blog`, `/blog/:slug`, `/notice`, `/notice/:slug`
- `/cases`, `/pricing`, `/careers`, `/privacy`, `/terms`
- `/admin`, `/api/admin/*`, `/media/:key`
- `/api/search?q=검색어`, `/api/health`
- `/hours`와 `/about`은 `/directions`로, `/column`은 `/blog`로 이동합니다. 독립 원장 컬럼은 미연결 상태입니다.

## 사용법
1. 메인에서 증상 중심 진료 카드를 선택하거나 진료 목록에서 검색합니다.
2. 내원 안내/예약에서 지점을 선택해 전화합니다. **온라인 예약을 접수하거나 확정하는 기능은 없습니다.**
3. 관리자는 `/admin`에서 로그인해 글을 작성합니다. 본문 소제목은 `## 제목`, 하위 소제목은 `### 제목`, 문단은 빈 줄로 구분합니다.
4. JPEG·PNG·WebP(최대 5MB)를 파일 선택 또는 본문에 드롭해 넣습니다. 이미지 설명을 수정하고 저장합니다. 초안은 공개 목록에 나타나지 않습니다.

## 데이터 / 저장소
- `src/data.ts`: 공개용으로 정리한 진료·의료진·지점·FAQ·영상 데이터.
- `src/glossary.ts`: 용어 데이터.
- D1 `posts`: id, slug, title, body, type(blog/notice), status(draft/published), 생성·수정 시각.
- D1 `admin_sessions`: 세션 토큰 SHA-256 해시, 만료 시각.
- D1 `admin_attempts`: 보안 비밀을 섞은 IP 해시, 로그인 시도 시각. 다음 로그인 요청에서 만료 데이터 정리.
- R2: 관리자 업로드 이미지. 공개 글에서 참조된 이미지만 비로그인 접근 가능.
- 지점 UI 선택만 브라우저 sessionStorage에 저장. 환자정보는 수집하지 않습니다.
- `.sources/`는 비공개 원본 작업 자료로 Git/빌드에 포함하지 않습니다. 환자 관련 이미지·설문 원본은 공개 정적 자산에 포함하지 않았습니다.

## 실행 / 테스트
```sh
npm run db:migrate:local
npm run build
pm2 start ecosystem.config.cjs
npm test
```
- Node.js 22+, Wrangler 로컬 D1/R2를 사용합니다.
- `.dev.vars`의 `ADMIN_PASSWORD`는 샌드박스에서 무작위 생성된 관리자 비밀번호입니다. Git에서 제외되어 있으며 공용 기본 비밀번호는 없습니다. 운영에서는 보안 변수로 새 비밀번호를 설정해야 합니다.
- 브라우저 테스트가 처음이면 `npx playwright install chromium`과 `npx playwright install-deps chromium`을 실행합니다.
- `tests/smoke.mjs`: 검색·필터·FAQ·증상 플로우·지점 전환·관리자 CRUD·초안 보호·XSS·R2·로그아웃 및 390/768/1024/1440px 화면 검사.
- 검사 결과: 58개 페이지 HTTP 200 / 페이지당 H1 1개 / 고유 title, 브라우저 런타임 에러 없음, 테스트 통과. npm audit 취약점 0 (검사 시점).
- 외부 서비스 내 실제 영상 재생·지도 결과·카카오/네이버 인앱 브라우저, 공식 검색엔진 Rich Results 및 Lighthouse 성능 점수는 미검증입니다.

## 정식 오픈 전 남은 작업
1. 병원 최종 검수: 현재 의료진 재직·근무 지점, 휴일 시간, 주차·장애인 접근, 진정 담당 체계, 의료 문구 감수.
2. 비급여 수가표를 자료의 최신 금액·적용일과 대조해 법정 고지 형식으로 게시. 현재는 확인 안내 화면입니다.
3. 환자 사진 동의·촬영 조건·기간 확인 후 사례 시스템과 회원 인증 도입. 현재 `/cases`는 안내 화면이고 사진·후기는 미공개입니다.
4. 네이버예약·카카오톡·블로그·인블로그의 공식 주소 및 계정 연결. 현재 외부 예약 접수, 자동 RSS/YouTube 최신 영상 갱신은 미구현입니다.
5. 회원가입, 환자 예약 데이터 관리, 사례 전후 슬라이더, 원장별 글 작성자 관리, 고급 WYSIWYG, 500개 용어, 지역 SEO 확장은 미구현입니다. 현재 관리자는 일반 글/공지 편집기입니다.
6. 실시간 3D, WebGL, 실내 3D 투어는 미구현입니다. 현 버전은 경량 CSS/SVG 및 스크롤 연동 연출입니다.
7. 사업자·개인정보 보호책임자·약관·의료광고 사전심의 필요 여부 확정. 현재 개인정보/이용 안내는 제작 미리보기 고지입니다.
8. 배포 경로 선택 후 운영 D1/R2 생성 또는 바인딩. wrangler의 database_id는 **로컬 미리보기용 식별자**이며 실제 운영 ID가 아닙니다.
9. 운영 관리자 비밀번호 설정, DB 마이그레이션, 필요 데이터 이관. 배포 빌드만으로 로컬 D1/R2 데이터가 자동 이전되지 않습니다.
10. 최종 검수 후 PUBLIC_SITE_URL 설정, 검색엔진 등록, 분석 도구 연결, 기존 도메인/DNS 전환. 현재 기존 홈페이지에 영향을 주지 않았습니다.
