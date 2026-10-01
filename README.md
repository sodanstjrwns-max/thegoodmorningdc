# 더굿모닝치과 — Good Morning Web

## 프로젝트
강도욱 원장님의 사전설문·개편 제안서·디자인 가이드·실제 사진과 영상을 기반으로 만든 Hono + Cloudflare Pages 홈페이지입니다. 차콜·노랑, 원본 로고 심볼, 원장님 원문을 중심에 둡니다. 서울비디치과 사이트가 아닙니다.

## 스토리형 인터랙티브 섹션 (2026-10-01)
참고: 사용자가 제공한 https://pfwebengine.kr 의 질문 타이핑/설명 전환 방식. 참고 사이트의 통계·추천·의료 판단·브랜드 자산은 가져오지 않았습니다. 기존 영상 오프닝을 유지하면서 아래 네 섹션을 추가/개편했습니다.

| 경로 | 연출 | 콘텐츠 |
|---|---|---|
| `/#question-story` | 질문 입력 → 설명 타이핑, 직접 주제 선택 | 수면·앞니·재수술·자연치아 FAQ 4쌍 |
| `/#revision-story` | 보철 분리·주변 조직 강조·씹는 힘 모식도, 3단계 탐색 | 임플란트 재수술 기존 설명/FAQ |
| `/#sedation-sequence` | 원형 진행선·궤도 점·단계 번호/설명 전환 | 기존 수면진료 준비부터 회복까지 4단계 |
| `/#visit-story` | 실제 공간 사진 교차 전환·내원 경로 진행선 | 문의 → 확인 → 설명 → 관리의 일반적인 흐름 |

### 콘텐츠 및 동작 원칙
- 대화와 재수술 답변은 `src/data.ts`의 기존 검토된 FAQ를 그대로 참조합니다. FAQ 페이지/진료 상세와 별도 답변을 생성하지 않습니다.
- 내원 여정은 원장 철학을 바탕으로 구성한 일반 안내이지 원장님 직접 인용이나 개인별 진료 일정이 아닙니다.
- 대화는 실시간 상담/AI 진단이 아님을 표시. 입력창 모양의 표시 영역은 실제 의료정보 입력 폼이 아닙니다. 서버 호출/건강정보 저장 없음.
- 구조 그림은 직접 작성한 SVG 모식도, 실제 CT/진단 이미지 아님. 궤도는 진료 단계 표시, 생체신호나 진정 깊이 표시 아님.
- 각 섹션은 화면 진입 시 한 번 진행합니다. 자동 주제 순환/무한 타이핑은 하지 않습니다. 완료 후 정적 상태로 유지합니다.
- 연출 정지/재생/다시 보기. 화면 밖·숨긴 탭에서는 JS 타임라인 정지. 선택 버튼은 방향키/Home/End로도 사용 가능합니다.
- 사용자가 직접 단계 선택 시 자동 전환을 멈추고 선택한 설명을 유지합니다. 대화 주제 선택은 해당 질문/답변을 다시 연출합니다.
- 링크에 키보드 포커스가 들어오면 읽는 도중 바뀌지 않도록 일시정지합니다.
- 전체 모션 OFF·reduced-motion·Save-Data 환경은 완성된 설명을 즉시 표시하며 수동 탐색은 가능합니다.
- no-JS는 15개 패널의 전체 원고가 SSR로 표시되고 동작하지 않는 버튼은 숨깁니다. 시각적 타이핑과 별도로 스크린리더용 전체 문장을 보존합니다.
- 새 외부 라이브러리/API/이미지 구매/영상 생성 없음. 구현: `src/ui.ts`, `public/static/app.js`, `public/static/style.css`.

## 실제 영상 오프닝 + 사이트 전반 인터랙션
이전 사진 기반 히어로를 실제 촬영 영상으로 교체했습니다. AI 생성 영상이 아닙니다.

### 원본과 편집 내역
- 사용자 제공 Drive: https://drive.google.com/drive/folders/1nHFzdlo9_6hEZS-GOhcHdhqbtDYiyHZ9?usp=sharing
- `홈페이지 (사본 2026-09-21) / 4번 요청사항 / 원내 소개 영상 / !최종본_더굿모닝치과의원_고화질.mp4`
- 원본 파일 ID: `1J0RLm3gEanf50FHOWvgpIiGL0o15CW0X`.
- 원본: 1920×1080, 81.125초, 199,697,706 bytes. `.sources/clinic-original.mp4`는 비공개·Git/빌드 제외.
- 환자 없는 대기실 60.2–63.5초, 빈 진료실 64.1–67.3초만 사용했습니다.
- 0.7배속·0.6초 교차 페이드·무음 H.264/24fps/faststart, 최종 8.708초 반복 영상. 환자 진료·수술·의료기록 화면 및 보장성 자막은 사용하지 않습니다.
- `/static/video/clinic-opening.mp4`: 1280×720, 약 981KB.
- `/static/video/clinic-opening-mobile.mp4`: 768×432, 약 352KB.
- `/static/images/film-poster.webp`: 실제 영상 프레임 대체 이미지.
- 초기 뷰포트 760px 이하에서는 모바일 파일 선택. 화면 회전 시 재다운로드하지 않습니다.
- muted/loop/playsinline/preload=none. 사용자/기기 설정 확인 후에만 src 연결.
- 자동재생 거절·네트워크 실패 시 포스터 유지. reduced-motion·Save-Data·no-JS 초기 환경에서는 영상 미다운로드.
- 화면 밖/숨긴 탭에서 정지. 장면 번호·설명·진행선은 실제 영상 시간과 연동합니다.

### 공통 인터랙션
- “한 번 더” 대형 타이포, 글자별 순차 등장, 스크롤 이동, 데스크톱 글자 hover.
- 메인/하위 페이지 H1/H2는 단어 경계·줄바꿈과 accessible name 보존. 관리자 UI와 FAQ 질문은 분할하지 않습니다.
- 원장 철학 sticky 문장·스크롤 강조·실제 원장 사진. 얼굴 사진은 이미지 이동에서 제외.
- 원문 약속 문구 가로 띠·차콜 차별점 카드·포인터 조명·카드/사진 등장·확대.
- 공간 사진 이동/마스크, 수면 섹션 아침빛, 메뉴/FAQ/지점 전환, 읽기 진행선.
- 지원 브라우저에서 cross-document View Transitions. 미지원 브라우저는 정상 문서 탐색. 링크를 가로채지 않습니다.
- 히어로 정지/재생과 사이트 전체 ON/OFF. 전체 설정은 sessionStorage의 UI 환경설정이며 기기 설정이 우선합니다.
- 강제 스크롤·커스텀 커서 없음. JS/IntersectionObserver 미지원 시에도 핵심 콘텐츠 표시.

## 원문 중심 콘텐츠 복원
- 메인: “환자의 불편함을 한 번 더 듣는 치과”, “치료가 막막했던 순간, 다시 가능성을 이야기합니다”, “어려운 치료에는 신중한 해답을, 불안한 마음에는 믿을 수 있는 설명을”.
- 원안의 9개 차별점·8개 대표 진료·5개 핵심 태그·의료진 5인.
- `/mission`: 개원 이야기·수면진료를 더한 이유·이름 유래를 1인칭으로 복원. 장애인 진료 메시지 별도 섹션.
- 31개 진료의 182개 증상·96개 설명 소섹션·285개 진료 FAQ 및 과정/차별점/관련 진료.
- `/faq`: 일반 내원 6개 + 진료 285개 = 291개. 화면/JSON-LD 동일 데이터. 검색에도 증상/설명/질문 반영.
- 기준 자료: `9.3_더굿모닝치과_홈페이지_개편제안서.docx`. sourceLines는 비공개 `.sources/proposal.txt` 대조 구간.
- 285개 질문은 공백 정규화 후 원본 확인. 답변까지 전부 원문 그대로인 것은 아닙니다. 턱관절 FAQ 4개 등은 설명 보완. 새 설명을 원장 직접 발언처럼 인용하지 않습니다.
- 무해·무통·기억 소실·정확도·당일 완성·수명 보장 표현 수정. 금식/복용약 개별 안내·임의 약 중단 금지·호흡 위험/보호자/운전 금지. 부정확한 재채기 억제/신경치료 설명 보정.
- 미확정 보험/보증/기간/수가·제작 메모 비공개. “1990년부터, 2대째”로 표기.
- 일요일 진료는 청량리 본점 한정. 광명 일요일·대체공휴일 휴진과 구분.
- 환자 특정 사례/질환/수술 사진/후기는 비공개. 운영 전 의학/의료광고 최종 감수 필요.
- 기존 D1 게시물은 덮어쓰지 않았습니다.

## 타이포와 색
- self-hosted Pretendard Variable + Manrope. Pretendard SIL OFL: `public/static/fonts/LICENSE.txt`.
- 메인 제목 weight 860. “한 번 더” PC 약 190px, 390px 모바일 약 90px. 하위 제목도 반응형.
- 차콜 `#242725`, 노랑 `#f2d45e`. 설문 원문은 “차콜 & 노랑”. HEX·보조색은 제작 해석.

## 현재 상태 / URL
- 제작 미리보기. 정식 배포 및 기존 홈페이지·도메인·DNS 변경 없음.
- 미리보기: https://3000-iea4n2skk8l8g2o6tat4s-dfc00ec5.sandbox.novita.ai
- 로컬: http://localhost:3000
- 관리자 `/admin`, 헬스체크 `/api/health`.
- 기본 noindex + robots 차단. 오픈 검수 후 PUBLIC_SITE_URL 필요.

## 기능 / 주요 경로
- 공개 58페이지, 진료 상세 31개, 의료진 상세 5개.
- `/`, `/mission`: 메인/영상/인터랙션/원장 철학.
- `/treatments`, `/treatments/:slug`: 증상·설명·진료 방식·과정·FAQ·분류/검색.
- `/doctors`, `/doctors/:slug`: 실제 자격/경력. 5인 모두 전문의로 표시하지 않습니다.
- `/directions?branch=cheongnyangni|gwangmyeong`, `/reservation`, `/tour`.
- 지점 전화·정규 진료시간·주소 복사·네이버 지도 검색. 임시휴진/공휴일은 전화 확인.
- 예약은 지점 선택 후 전화. 온라인 접수/확정 기능 없음.
- `/contents`, `/video`: 제공 YouTube 6개 클릭 후 재생. 카드 이미지는 병원 공간.
- `/faq`, `/encyclopedia` (66개), `/symptom-checker` (규칙 기반 4단계, AI 진단 아님/답변 저장 없음).
- `/blog`, `/blog/:slug`, `/notice`, `/notice/:slug`, `/cases`, `/pricing`, `/careers`, `/privacy`, `/terms`.
- `/hours`, `/about` → `/directions`, `/column` → `/blog`.
- `/admin`, `/api/admin/*`, `/media/:key`, `/api/search?q=검색어`, `/api/health`.
- 관리자: `## 제목`, `### 소제목`, 빈 줄로 문단. JPG/PNG/WebP 5MB 이하. 초안 비공개.
- SSR·고유 title/description·canonical·OG·Dentist/Person/MedicalProcedure/FAQ/Article/Breadcrumb.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/feed.xml`.

## 데이터 / 보안
- Hono SSR + TypeScript + Vite, CSS/vanilla JS, public/static 자산.
- `src/data.ts`: sourceContent 및 의료진/지점/FAQ/영상/미션. `src/glossary.ts`: 용어.
- D1 posts: id, slug, title, body, type, status, created_at, updated_at.
- D1 admin_sessions: SHA-256 세션·8시간. admin_attempts: 비밀을 섞은 IP 해시·5회/15분.
- HttpOnly/SameSite·HTTPS Secure·Origin 검증·출력 escape·CSP·이미지 magic bytes·SVG 차단.
- R2 미디어: 공개 글에서 참조한 경우만 비로그인 접근. 초안은 관리자만 접근.
- `.dev.vars` ADMIN_PASSWORD와 `.sources/`는 Git/빌드 제외. 원본 전체 영상 비공개.
- sessionStorage는 지점/모션 UI 설정만. 회원가입·건강정보 수집 없음.
- Vite emptyOutDir로 삭제 자산 잔재 방지.

## 실행 / 검증
```sh
npm run db:migrate:local
npm run typecheck
npm run build
pm2 start ecosystem.config.cjs
npm test
```
- Node22+, Wrangler 로컬 D1/R2, PM2 포트3000. Playwright Chromium 및 필요 시 install-deps.
- `tests/smoke.mjs`: 58경로 HTTP200/단일H1/고유title, 31진료/285FAQ 화면-schema 일치, 메인9/8/5, 320–1440px.
- 실제 MP4 재생/탐색/모바일 소스/정지/화면 밖 정지, 글자 transform 보간, 하위 타이포/탐색.
- 새 섹션: 실제 타이핑 변화·원문/접근성 텍스트 일치·로컬 정지/재개·화면 밖 시계 정지·자동 단계·방향키/End·수동 선택 유지·전체 모션 OFF·반응형 선택 상태.
- no-JS 15개 패널 전체 표시/버튼 숨김, reduced-motion·Save-Data·영상 실패 폴백.
- 검색/필터/지점/FAQ/증상/용어/관리자 CRUD/초안/미디어/XSS/업로드/로그아웃.
- 원본 문서/영상/비밀/삭제 환자 사진404. PC/모바일 새 섹션 시각 검수.
- 의료 감수·Rich Results·Lighthouse·실제 iOS/인앱 브라우저·외부 영상/지도 최종 검증은 별도.

## 운영 전 남은 작업 / 권장 순서
1. 의료 문구·범위·의료진 재직/지점·진정 담당·휴일/주차/장애인 접근 최종 검수.
2. 비급여 수가/적용일 확정. `/pricing`은 확인 안내 상태.
3. 촬영/음원/인물 사용 범위 승인. 환자 사례 동의 확인 전 비공개.
4. 네이버예약·카카오·블로그 연결. RSS/YouTube 자동갱신 미구현.
5. 회원가입·환자 예약 관리·사례 슬라이더·고급 WYSIWYG·500개 용어·지역 SEO 확장 미구현.
6. 실시간 AI 상담/진단·3D/WebGL/실내3D 투어 미구현. 현재 영상/CSS/SVG 안내 연출.
7. 사업자·개인정보 책임자·약관·의료광고 심의 필요 여부 확정.
8. 사용자 배포 경로 선택 후 운영 D1/R2·비밀·마이그레이션·데이터 이관. 현재 DB ID는 로컬용.
9. 최종 승인 후 PUBLIC_SITE_URL·검색엔진·분석 도구·도메인 전환.
