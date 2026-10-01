# 더굿모닝치과 — Good Morning Web

## 프로젝트
강도욱 원장님의 사전설문·개편 제안서·디자인 가이드·실제 사진과 영상을 기반으로 만든 Hono + Cloudflare Pages 홈페이지입니다. 차콜·노랑, 원본 로고 심볼, 원장님 원문을 중심에 둡니다. 서울비디치과 사이트가 아닙니다.

## 추가 인터랙티브 스터디 (2026-10-01)
사용자 요청에 따라 PF 웹엔진의 스크롤 조립/카드덱/대비 전환 원리를 참고해 세 가지 다른 인터랙션을 추가했습니다. 참고 사이트의 이미지·브랜드 자산·통계·추천 문구는 복사하지 않았습니다.

| 경로 | 인터랙션 | 내용과 출처 |
|---|---|---|
| `/#preservation-assembly` | 스크롤에 따라 4개 층이 합쳐지는 진료 계획, 단계 슬라이더 | `natural-tooth.steps`를 그대로 사용. 치아 보존 검토·한계·관리 설명 |
| `/#physician-deck` | 겹친 의료진 카드덱, 좌우 드래그/이름 선택/방향키 | 기존 5인 의료진의 실제 사진·자격·첫 약력·상세 페이지 링크 |
| `/#language-reveal` | 경계선을 밀어 전문용어에서 쉬운 말로 전환 | `glossary`의 치은·치조골·교합·지대주 정의. 쉬운 제목만 추가 |

- 기존 의료진 그리드를 카드덱으로 재구성했습니다. 인원/자격/URL과 “진료의 깊이는 다르게. 환자를 향한 마음은 같게.” 문구는 유지합니다. `/#doctors` 앵커도 유지.
- 계획 조립은 데스크톱에서 native sticky/스크롤 위치 연동. 슬라이더 사용 후에는 수동 상태를 유지하며 “스크롤 따라가기”로 복귀. 모바일은 슬라이더 중심이며 강제 스크롤/장시간 pin 없음.
- 조립 층은 설명을 위한 CSS 시각화입니다. 실제 진단·성공률·치아 보존 보장 표현 없음.
- 의료진 덱은 자동 순환하지 않습니다. 이전/다음·이름·방향키/Home/End·드래그 지원. 비활성 카드 링크는 탭 순서에서 제외하고 선택 후에만 상세 진입. 세로 스크롤은 가로 제스처로 가로채지 않습니다.
- 용어 전환은 첫 진입/다시 보기 시 1.8초 연출. range를 조작하면 즉시 중지하고 직접 제어. 숨긴 탭·화면 밖·모션 OFF에서 중지. 원래 용어와 전체 설명은 마스크 아래에도 항상 읽을 수 있습니다.
- 전체 OFF/reduced-motion/Save-Data에서 카드덱은 5인 정적 그리드로 복귀, 조립은 완성 상태, 용어 설명은 즉시 표시. 수동 용어/단계 선택은 가능합니다.
- no-JS에서는 4개 검토 문단·5인 카드·4개 용어 전체 표시. 비활성 조작 버튼은 숨깁니다.
- 새 외부 라이브러리/API/미디어 다운로드 없음. CSS+vanilla JS와 기존 실제 병원 자산 사용.

## 스토리형 인터랙티브 섹션
참고: 사용자가 제공한 https://pfwebengine.kr 의 질문 타이핑/설명 전환 방식. 기존 실제 영상 오프닝을 유지합니다.

| 경로 | 연출 | 콘텐츠 |
|---|---|---|
| `/#question-story` | 질문 입력 → 설명 타이핑, 주제 선택 | 수면·앞니·재수술·자연치아 FAQ 4쌍 |
| `/#revision-story` | 보철 분리·주변 조직·씹는 힘, 3단계 | 임플란트 재수술 기존 설명/FAQ |
| `/#sedation-sequence` | 원형 진행선·궤도 점·단계 전환 | 수면진료 준비부터 회복까지 4단계 |
| `/#visit-story` | 실제 공간 사진·내원 경로 진행 | 문의 → 확인 → 설명 → 관리 |

- 대화/재수술 답변은 `src/data.ts`의 기존 검토된 FAQ 참조. 별도 AI 답변 생성 없음.
- 내원 여정은 일반 안내이며 원장 직접 인용이나 개인별 일정이 아닙니다.
- 대화는 실시간 상담/AI 진단 아님을 표시. 실제 의료정보 입력 폼/서버 호출/건강정보 저장 없음.
- SVG 구조 그림은 모식도이며 실제 CT/진단 이미지가 아닙니다. 궤도는 단계 표시이며 생체신호/진정 깊이가 아닙니다.
- 각 섹션은 진입 시 한 번 진행. 무한 타이핑/자동 주제 순환 없음. 정지/재생/다시 보기 및 방향키/Home/End 지원.
- 화면 밖/숨긴 탭에서 타임라인 정지. 직접 단계 선택은 자동 전환 중단, 대화 주제 선택은 해당 답변 재연출.
- 링크에 키보드 포커스가 들어오면 일시정지. 전체 OFF/reduced-motion/Save-Data에서는 전체 문장 즉시 표시.
- no-JS: 15개 패널 전체 원고 SSR 표시/비활성 버튼 숨김. 타이핑과 별도로 스크린리더용 전체 문장 유지.

## 실제 영상 오프닝
AI 생성 영상이 아니라 원장 제공 촬영 영상을 편집한 오프닝입니다.

- 원본 폴더: https://drive.google.com/drive/folders/1nHFzdlo9_6hEZS-GOhcHdhqbtDYiyHZ9?usp=sharing
- `홈페이지 (사본 2026-09-21) / 4번 요청사항 / 원내 소개 영상 / !최종본_더굿모닝치과의원_고화질.mp4`
- 파일 ID `1J0RLm3gEanf50FHOWvgpIiGL0o15CW0X`, 1920×1080, 81.125초, 199,697,706 bytes.
- `.sources/clinic-original.mp4`는 비공개·Git/빌드 제외.
- 환자 없는 대기실 60.2–63.5초, 빈 진료실 64.1–67.3초 사용. 원본 환자·수술·의료기록·보장성 자막 미사용.
- 0.7배속·0.6초 교차 페이드·무음 H.264/24fps/faststart. 최종 8.708초 반복.
- `/static/video/clinic-opening.mp4`: 1280×720, 약 981KB.
- `/static/video/clinic-opening-mobile.mp4`: 768×432, 약 352KB.
- `/static/images/film-poster.webp`: 실제 영상 프레임.
- 초기 760px 이하 모바일 파일 선택, 회전 시 재다운로드 없음.
- muted/loop/playsinline/preload=none. 사용자/기기 설정 확인 후 src 연결.
- 자동재생 거절/네트워크 실패 시 포스터, reduced-motion/Save-Data/no-JS 초기 미다운로드.
- 화면 밖/숨긴 탭에서 정지. 장면 번호/설명/진행선은 실제 시간 연동.

## 공통 인터랙션 / 타이포
- “한 번 더” 대형 타이포·글자별 등장·스크롤 이동·데스크톱 hover.
- H1/H2 단어 경계·줄바꿈·accessible name 보존. 관리자 UI/FAQ 질문은 분할 제외.
- 원장 철학 sticky 문장·스크롤 강조·실제 원장 사진. 얼굴 사진은 이미지 이동 제외.
- 원문 약속 가로 띠·차별점 카드·포인터 조명·공간 사진/수면 아침빛·메뉴/FAQ/지점 전환·읽기 진행선.
- 지원 브라우저 cross-document View Transitions. 미지원 정상 탐색. 링크 가로채기/SPA 전환 없음.
- 히어로 정지/재생 + 사이트 전체 ON/OFF. sessionStorage UI 환경설정, 기기 설정 우선.
- self-hosted Pretendard Variable + Manrope. OFL: `public/static/fonts/LICENSE.txt`.
- H1 weight860, 강조 구간 PC 약190px/390px 모바일 약90px.
- 차콜 `#242725`, 노랑 `#f2d45e`. 설문은 “차콜 & 노랑”; HEX/보조색은 제작 해석.

## 원문 중심 콘텐츠
- 메인: “환자의 불편함을 한 번 더 듣는 치과”, “치료가 막막했던 순간, 다시 가능성을 이야기합니다”, “어려운 치료에는 신중한 해답을, 불안한 마음에는 믿을 수 있는 설명을”.
- 원안 9개 차별점·8개 대표 진료·5개 태그·의료진5인 유지.
- `/mission`: 개원/수면진료/이름 유래 1인칭 복원, 장애인 진료 메시지.
- 31진료의 182증상·96소섹션·285진료 FAQ 및 과정/차별점/관련 진료.
- `/faq`: 일반6+진료285=291. 화면/JSON-LD 동일 데이터. 검색에 증상/소제목/질문 포함.
- 기준 `9.3_더굿모닝치과_홈페이지_개편제안서.docx`. sourceLines는 비공개 `.sources/proposal.txt` 대조 구간.
- 285질문 원본 확인. 모든 답변이 원문 그대로인 것은 아님. 턱관절 FAQ4개 등 설명 보완. 새 설명을 직접 발언처럼 인용하지 않음.
- 무해/무통/기억소실/정확도/당일완성/수명 보장 수정. 금식·복용약 개별 안내, 임의 중단 금지, 진정 위험/보호자/운전 금지.
- 부정확한 재채기 억제/신경치료 설명 보정. 미확정 보험/보증/기간/수가·제작 메모 비공개.
- “1990년부터, 2대째”. 일요일 청량리만, 광명 일요일/대체공휴일 휴진 구분.
- 환자 특정 사례/수술 사진/후기 비공개. 운영 전 의학/의료광고 최종 감수 필요.
- 기존 D1 게시물 미변경.

## 현재 상태 / URL
- 제작 미리보기. 정식 배포 및 기존 홈페이지/도메인/DNS 변경 없음.
- 미리보기: https://3000-iea4n2skk8l8g2o6tat4s-dfc00ec5.sandbox.novita.ai
- 로컬 http://localhost:3000, 관리자 `/admin`, 헬스체크 `/api/health`.
- 기본 noindex/robots 차단. 오픈 검수 후 PUBLIC_SITE_URL 설정.

## 기능 / 주요 경로
- 공개58페이지, 진료31개, 의료진 상세5개.
- `/`, `/mission`, `/treatments`, `/treatments/:slug`, `/doctors`, `/doctors/:slug`.
- `/directions?branch=cheongnyangni|gwangmyeong`, `/reservation`, `/tour`.
- 지점 전화/정규시간/주소복사/네이버지도. 임시휴진/공휴일은 전화 확인. 예약은 전화이며 온라인 접수/확정 없음.
- `/contents`, `/video`: 제공 YouTube6개 클릭 후 재생. 카드 사진은 병원 공간.
- `/faq`, `/encyclopedia` (66개), `/symptom-checker` (규칙기반4단계, AI 진단/저장 아님).
- `/blog`, `/blog/:slug`, `/notice`, `/notice/:slug`, `/cases`, `/pricing`, `/careers`, `/privacy`, `/terms`.
- `/hours`, `/about` → `/directions`, `/column` → `/blog`.
- `/admin`, `/api/admin/*`, `/media/:key`, `/api/search?q=검색어`, `/api/health`.
- 관리자 `## 제목`, `### 소제목`, 빈 줄 문단, JPG/PNG/WebP 5MB 이하, 초안 비공개.
- SSR·고유title/description·canonical·OG·Dentist/Person/MedicalProcedure/FAQ/Article/Breadcrumb.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/feed.xml`.

## 데이터 / 보안
- Hono SSR+TypeScript+Vite, public/static CSS/vanilla JS/자산.
- `src/data.ts`: sourceContent·의료진·지점·FAQ·영상·미션. `src/glossary.ts`: 용어.
- D1 posts: id, slug, title, body, type, status, created_at, updated_at.
- D1 admin_sessions: SHA-256/8시간. admin_attempts: 비밀 섞은 IP해시,5회/15분.
- HttpOnly/SameSite·HTTPS Secure·Origin 검증·escape·CSP·magic bytes·SVG 차단.
- R2 공개 글 참조 이미지만 비로그인 접근, 초안은 관리자 전용.
- `.dev.vars` 및 `.sources/` Git/빌드 제외. sessionStorage는 지점/모션 UI만.
- 회원가입/건강정보 수집 없음. Vite emptyOutDir로 삭제 자산 잔재 방지.

## 실행 / 검증
```sh
npm run db:migrate:local
npm run typecheck
npm run build
pm2 start ecosystem.config.cjs
npm test
```
- Node22+, Wrangler 로컬 D1/R2, PM2 포트3000. Playwright Chromium 필요.
- `tests/smoke.mjs`: 58경로·단일H1/고유title·31진료·285FAQ 화면/schema·메인9/8/5·320–1440px.
- MP4 재생/탐색/모바일 소스/정지, 글자 transform/하위 페이지 탐색.
- 4개 스토리 타이핑/원문/정지/화면 밖/자동단계/키보드/수동선택/전체OFF.
- 추가 검증: 실제 스크롤 층 조립, range Home/End, 의료진 실제 마우스 드래그/방향키/상세 링크, 비활성 카드 탭 제외, 용어 wipe 보간/슬라이더/사전 정의 일치.
- OFF/no-JS 정적 폴백: 기존15패널+검토4문단+의료진5카드+용어4패널, 비활성 버튼 숨김.
- reduced-motion/Save-Data/영상실패 폴백, 검색/필터/지점/FAQ/증상/용어/관리자 CRUD/초안/미디어/XSS/업로드/로그아웃.
- 원본 문서/영상/비밀/삭제 환자 사진404. PC/모바일 스크린샷 검수.
- 의료 감수·Lighthouse·Rich Results·실제 iOS/인앱 브라우저·외부 영상/지도는 최종 검증 대상.

## 운영 전 남은 작업
1. 의료 문구/범위/의료진 재직·지점/진정담당/휴일·주차·장애인 접근 최종 확인.
2. 최신 비급여 수가/적용일 확정. 현재 `/pricing` 확인 안내.
3. 촬영/음원/인물 사용범위 승인. 환자 사례 동의 전 비공개.
4. 네이버예약·카카오·블로그 연결. RSS/YouTube 자동갱신 미구현.
5. 회원가입·예약관리·사례슬라이더·고급 WYSIWYG·500용어·지역SEO 확장 미구현.
6. 실시간 AI 상담/진단·실제 3D/WebGL/실내투어 미구현. 현재 CSS/SVG/영상 안내 연출.
7. 사업자/개인정보책임자/약관/의료광고심의 필요 여부 확정.
8. 사용자 배포 경로 선택 후 운영 D1/R2·비밀·마이그레이션·데이터 이관. 현재 DB ID 로컬용.
9. 승인 후 PUBLIC_SITE_URL·검색엔진·분석도구·도메인 전환.
