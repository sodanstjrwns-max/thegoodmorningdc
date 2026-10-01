# 더굿모닝치과 — Good Morning Web

## 프로젝트
강도욱 원장님의 사전설문·개편 제안서·디자인 가이드·실제 사진과 영상을 기반으로 만든 Hono + Cloudflare Pages 홈페이지입니다. 차콜·노랑, 원본 로고 심볼, 원장님 원문을 중심에 둡니다. 서울비디치과 사이트가 아닙니다.

## 실제 영상 오프닝 + 사이트 전반 인터랙션 개편 (2026-10-01)
이전 사진 기반 CSS 히어로를 실제 촬영 영상으로 교체했습니다. AI 생성 영상이 아닙니다.

### 원본과 편집 내역
- 사용자 제공 Drive: https://drive.google.com/drive/folders/1nHFzdlo9_6hEZS-GOhcHdhqbtDYiyHZ9?usp=sharing
- `홈페이지 (사본 2026-09-21) / 4번 요청사항 / 원내 소개 영상 / !최종본_더굿모닝치과의원_고화질.mp4`
- 원본 파일 ID: `1J0RLm3gEanf50FHOWvgpIiGL0o15CW0X`.
- 원본: 1920×1080, 81.125초, 199,697,706 bytes. `.sources/clinic-original.mp4`는 비공개·Git/빌드 제외.
- 원본 의미/장면 분석 및 프레임 검수 후 환자 없는 대기실 60.2–63.5초, 빈 진료실 64.1–67.3초만 사용했습니다.
- 0.7배속·0.6초 교차 페이드·무음 H.264/24fps/faststart, 최종 8.708초 반복 영상. 원본 앞부분의 환자 진료·수술·의료기록 화면 및 보장성 자막은 사용하지 않습니다.
- `/static/video/clinic-opening.mp4`: 1280×720, 약 981KB.
- `/static/video/clinic-opening-mobile.mp4`: 768×432, 약 352KB.
- `/static/images/film-poster.webp`: 실제 오프닝 영상 프레임으로 만든 정적 대체 이미지.
- 초기 뷰포트 760px 이하에서는 모바일 파일 선택. 처음 로드한 파일은 화면 회전 시 다시 다운로드하지 않습니다.
- 영상은 `muted`, `loop`, `playsinline`, `preload=none`; JS에서 사용자/기기 모션 설정 확인 후에만 src를 연결합니다.
- 자동재생 거절·네트워크 실패에는 실제 영상 포스터 유지. reduced-motion·Save-Data·no-JS 초기 환경에서는 영상 다운로드를 시작하지 않습니다.
- 화면 밖/숨긴 탭에서는 영상 정지. 재진입 시 설정에 따라 재생. 타임코드에 맞춰 장면 번호/설명/진행선을 갱신합니다.

### 인터랙션 범위
- 메인: 원문을 세 줄로 재구성하고 “한 번 더”를 대형 타이포로 강조. 글자별 stagger/입체 등장, 스크롤에 따른 제목 이동, 데스크톱 글자 hover 반응.
- 메인·하위 페이지의 H1/H2: 원래 단어 경계와 줄바꿈을 보존한 글자 단위 등장. 원문 accessible name은 heading의 aria-label로 유지합니다. 관리자 편집 UI와 FAQ 질문 자체는 분할하지 않습니다.
- 원장 철학: 큰 sticky 문장, 스크롤에 따른 글자 강조, 실제 강도욱 원장 사진.
- 원문 약속 문구로 구성한 가로 타이포 띠는 스크롤에 반응합니다. 강제 자동 스크롤은 없습니다.
- 9개 차별점: 차콜 섹션, 카드 순차 등장·포인터 조명.
- 진료 카드·의료진·콘텐츠 카드: 순차 등장, hover 반응, 사진 확대.
- 공간 사진: 스크롤 시 이미지 이동/마스크 열림. 원장 얼굴 사진은 크롭 안정성을 위해 이미지 이동 대상에서 제외합니다.
- 수면 섹션: 큰 영문 타이포 이동·아침빛 진행. 장문 진료 설명은 정적으로 읽습니다.
- 메뉴·FAQ·지점 변경: 열림/전환 효과. 상단 읽기 진행선.
- 지원 브라우저에서 cross-document View Transitions로 페이지 전환. 미지원 브라우저는 정상 문서 탐색. 링크 클릭을 가로채거나 SPA로 바꾸지 않습니다.
- 히어로 정지/재생과 별도의 사이트 전체 모션 ON/OFF. 전체 설정은 UI 환경설정으로 sessionStorage에 저장합니다. 기기 reduced-motion과 Save-Data가 우선합니다.
- 모든 핵심 콘텐츠·CTA는 JS 없이도 표시합니다. IntersectionObserver 미지원 시 텍스트를 숨기지 않습니다. 추가 애니메이션 라이브러리·강제 스크롤·커스텀 커서는 없습니다.

## 원문 중심 콘텐츠 복원
- 메인: “환자의 불편함을 한 번 더 듣는 치과”, “치료가 막막했던 순간, 다시 가능성을 이야기합니다”, “어려운 치료에는 신중한 해답을, 불안한 마음에는 믿을 수 있는 설명을”.
- 원안의 9개 차별점, 8개 대표 진료 카드, 5개 핵심 태그, 의료진 5인.
- `/mission`: 1990년 아버지에게 이어받은 개원 이야기, 수면진료를 더한 이유, 병원 이름의 유래를 1인칭으로 복원. 장애인 진료에 관한 원장 메시지 별도 섹션.
- 31개 진료별 182개 증상·96개 설명 소섹션·285개 진료 FAQ 및 과정/차별점/관련 진료.
- `/faq`: 일반 내원 6개 + 진료 285개 = 291개. 화면과 FAQ JSON-LD는 같은 데이터를 사용합니다.
- 검색에 진료별 소제목·증상·FAQ 질문 반영. 기존 URL 유지.

### 원문 / 보완 / 보류
- 기준: `9.3_더굿모닝치과_홈페이지_개편제안서.docx`. `src/data.ts`의 sourceLines는 비공개 `.sources/proposal.txt` 대조 구간입니다.
- 285개 진료 질문은 공백 정규화 후 원본에서 확인했습니다. 답변까지 전부 원문 그대로라는 의미는 아닙니다.
- 원문에 질문만 있던 턱관절 FAQ 4개 등은 설명을 보완했습니다. 새 설명을 원장 직접 발언처럼 인용하지 않습니다.
- 무해·무통·기억 소실·식립 정확도·당일 완성·장기 수명을 보장하는 표현은 수정했습니다.
- 금식·복용약은 개별 안내, 임의 약 중단 금지, 진정 중 호흡 위험·보호자·운전 금지. 부정확한 재채기 억제/신경치료 설명을 보정했습니다.
- 보험·보증·기간·수가의 미확정 수치는 약속하지 않습니다. 제작 메모·빈칸은 공개하지 않습니다.
- 연차는 “1990년부터, 2대째”로 표기. 일요일 진료는 청량리 본점에 한정하며 광명 일요일·대체공휴일 휴진과 구분합니다.
- 환자 특정 사례/질환/치료 결과/수술 이미지·후기는 비공개. 의료광고 적법성이나 효과를 보증하지 않으며 운영 전 최종 감수가 필요합니다.
- 기존 D1 게시물을 덮어쓰지 않았습니다.

## 타이포와 색
- self-hosted Pretendard Variable + 영문 보조 Manrope. Pretendard SIL OFL: `public/static/fonts/LICENSE.txt`.
- 메인 제목 weight 860. 기본 제목 크기에 줄별 비율을 적용하며 “한 번 더”는 PC 약 190px, 390px 모바일 약 90px로 구성합니다. 하위 페이지 제목도 반응형 글자 모션 적용.
- 차콜 `#242725`, 노랑 `#f2d45e`. 설문 답변은 “차콜 & 노랑”이며 정확한 HEX·보조색은 제작 해석입니다.

## 현재 상태 / URL
- 제작 미리보기. 정식 배포 및 기존 홈페이지·도메인·DNS 변경 없음.
- 미리보기: https://3000-iea4n2skk8l8g2o6tat4s-dfc00ec5.sandbox.novita.ai
- 로컬: http://localhost:3000
- 관리자: `/admin` (비밀번호 보호), 헬스체크: `/api/health`.
- 기본 noindex + robots 차단. 정식 오픈 검수 후 PUBLIC_SITE_URL 설정이 필요합니다.

## 기능 / 주요 경로
- 공개 58페이지, 진료 상세 31개, 의료진 상세 5개.
- `/`, `/mission`: 메인 영상/인터랙션과 원장 철학.
- `/treatments`, `/treatments/:slug`: 증상·설명·진료 방식·과정·FAQ. 검색·분류 필터.
- `/doctors`, `/doctors/:slug`: 실제 자격/경력. 5인 모두 전문의로 표시하지 않습니다.
- `/directions?branch=cheongnyangni|gwangmyeong`, `/reservation`, `/tour`.
- 지점별 전화·진료시간·주소 복사·네이버 지도 검색. 정규 일정만 반영하며 임시휴진·공휴일은 전화 확인.
- 예약 페이지에서 지점을 선택해 전화합니다. 온라인 접수·예약 확정 기능은 없습니다.
- `/contents`, `/video`: 제공 YouTube 영상 6개를 클릭 후 재생. 카드 이미지는 병원 공간이며 영상 썸네일이 아닙니다.
- `/faq`, `/encyclopedia` (66개 용어), `/symptom-checker` (규칙 기반 4단계 정보 탐색, AI 진단 아님, 답변 저장 안 함).
- `/blog`, `/blog/:slug`, `/notice`, `/notice/:slug`.
- `/cases`, `/pricing`, `/careers`, `/privacy`, `/terms`.
- `/hours`, `/about` → `/directions`, `/column` → `/blog`.
- `/admin`, `/api/admin/*`, `/media/:key`, `/api/search?q=검색어`, `/api/health`.
- 관리자는 `## 제목`, `### 소제목`, 빈 줄로 문단 작성. JPG/PNG/WebP 최대 5MB 삽입. 초안은 비공개.
- SSR, 고유 title/description, canonical, OG, Dentist/Person/MedicalProcedure/FAQ/Article/Breadcrumb 구조화 데이터.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/feed.xml`.

## 데이터 / 보안
- Hono SSR + TypeScript + Vite, 정적 CSS/vanilla JS. 파일은 public/static에서 제공.
- `src/data.ts`: 진료·의료진·지점·FAQ·영상·미션. 진료 원고는 sourceContent 단일 데이터.
- `src/glossary.ts`: 용어 데이터.
- D1 posts: id, slug, title, body, type, status, created_at, updated_at.
- D1 admin_sessions: 세션 토큰 SHA-256·8시간 만료.
- D1 admin_attempts: 비밀을 섞은 IP 해시·시도 시간. 5회/15분 제한.
- HttpOnly/SameSite 쿠키, HTTPS Secure, 변경 API Origin 검증, 출력 escape, CSP, 이미지 magic bytes 검사, SVG 차단.
- R2 이미지는 공개 글에 참조된 경우에만 비로그인 접근. 초안 미디어는 관리자만 접근.
- `.dev.vars` ADMIN_PASSWORD는 Git 제외. 운영 환경에 별도 비밀 설정 필요.
- `.sources/` 비공개·Git/빌드 제외. 원본 전체 영상은 정적 자산으로 복사하지 않습니다.
- sessionStorage에는 지점과 모션 UI 환경설정만 저장. 환자 회원가입·건강정보 수집 없음.
- Vite emptyOutDir로 삭제 자산이 dist에 남지 않게 합니다.

## 실행 / 검증
```sh
npm run db:migrate:local
npm run typecheck
npm run build
pm2 start ecosystem.config.cjs
npm test
```
- Node.js 22+, Wrangler 로컬 D1/R2, PM2 포트 3000.
- Playwright 설치: `npx playwright install chromium`, 필요 시 `npx playwright install-deps chromium`.
- `tests/smoke.mjs`: 58개 공개 경로 HTTP200·단일 H1·고유 title, 31개 진료·285개 FAQ 및 화면/schema 일치, 메인9/8/5 구성, 320–1440px 넘침 검사.
- 실제 MP4 디코딩/재생시간 증가·장면 탐색·모바일 파일 선택·정지/재생·화면 밖 정지.
- 실제 글자 transform 보간·접근 가능한 heading 이름·전체 모션 끄기·하위 페이지 타이포·문서 탐색.
- reduced-motion·Save-Data 초기 영상 미다운로드, 실시간 설정 변경, no-JS·영상 네트워크 실패 포스터 폴백.
- 검색·필터·지점·FAQ·증상 안내·용어·관리자 CRUD·초안/미디어 보호·XSS·업로드·로그아웃.
- 원본 문서·원본 영상·비밀·삭제한 환자 사진 URL 404 확인.
- PC/모바일 히어로 및 원장 사진 요소 시각 검수. 의료 감수·공식 Rich Results·Lighthouse·실제 iOS/인앱 브라우저·외부 영상/지도는 별도 최종 검증 대상.

## 운영 전 남은 작업 / 권장 순서
1. 의료 문구·진료 범위·의료진 재직/근무 지점·진정 담당 체계·휴일/주차/장애인 접근 최종 검수.
2. 최신 비급여 수가/적용일 확정 후 법정 고지. `/pricing`은 현재 확인 안내.
3. 촬영/음원/인물 사용 범위 최종 승인. 환자 사례는 동의 조건 확인 전 비공개 유지.
4. 공식 네이버예약·카카오·블로그 연결. RSS/YouTube 자동 갱신은 미구현.
5. 회원가입·환자 예약 관리·사례 슬라이더·고급 WYSIWYG·500개 용어·지역 SEO 확장은 미구현.
6. 실제 3D/WebGL/3D 투어는 미구현. 현재는 실제 촬영 영상 + CSS/SVG/vanilla JS 연출.
7. 사업자·개인정보 보호책임자·정식 약관·의료광고 심의 필요 여부 확정.
8. 사용자 배포 경로 선택 후 운영 D1/R2·비밀·마이그레이션·데이터 이관. 현재 DB ID는 로컬용이며 자동 운영 이전되지 않습니다.
9. 최종 승인 후 PUBLIC_SITE_URL·검색엔진 등록·분석 도구·도메인 전환.
