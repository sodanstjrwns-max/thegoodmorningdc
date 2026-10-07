# 더굿모닝치과 — Good Morning Web

## 프로젝트 / 현재 상태
- 대상: **강도욱 원장님의 더굿모닝치과**. 서울비디치과 홈페이지가 아닙니다.
- 목표: 원장 사전설문·개편 제안서·제공 의료진/공간/영상 자료를 반영한 진료 정보와 직접 운영 가능한 CMS.
- 환경: Hono SSR + TypeScript + Vite + Cloudflare Pages, 바닐라 JS, 차콜·노랑.
- 경로 / 브랜치: `/home/user/webapp` / `main`.
- **제작 미리보기입니다. 정식 배포·기존 홈페이지 교체·도메인/DNS 변경은 하지 않았습니다.**
- 미리보기: https://3000-iea4n2skk8l8g2o6tat4s-dfc00ec5.sandbox.novita.ai/?v=12
- 공개 수가표: 위 주소의 `/pricing`. 원본 PDF: `/static/fees-0324.pdf`.
- 관리자: `/admin`. 비밀번호는 `.dev.vars`의 보안 변수로 관리하며 문서·소스에 공개하지 않습니다.
- 감사 기준일: 2026-10-07. 아래의 완료는 **미리보기 구현 기준**이며 병원 사실 확인·의료 감수·검색 노출 성과를 뜻하지 않습니다.

## 원장 요청·바람 대조표
원본: 사전설문, 개편 제안서, 제공 약력·수가표·사진·영상, 기존 공식 홈페이지. 개인 연락처를 포함한 설문은 `.sources/`에만 보관하며 Git/public에 공개하지 않습니다.

| 원장 요청·바람 | 반영 내용 | 상태 |
|---|---|---|
| 전문적이고 신뢰감 있는 이미지 | 차콜·노랑, 기존 CI, 힘 있는 글꼴, 실제 의료진·원내 사진 | 반영 |
| 수면·재수술·앞니·장애인 환자 중심 | 첫 영상 다음 핵심 4진료, 관련 설명 영상, 수면 전용 섹션·장애인 메시지 우선 배치 | 반영 |
| 교정 축소, 소아·레진 빌드업 중심 유입 지양 | 핵심 유입 영역을 위 4진료로 구성 | 반영 |
| 신뢰와 만족, 불편함을 한 번 더 듣는 병원 | 원장 철학·세 가지 약속·설명 중심 FAQ·진료 과정 | 반영 |
| 1990년 아버지가 시작한 치과의 계승 | 개원 스토리·미션에 반영 | 반영 |
| 공포 때문에 치료를 미룬 환자 돕기 | 수면 과정·불안 안내·준비 및 주의사항 | 반영, 무통·안전 보장 표현 제외 |
| 지역에서 폭넓은 진료 제공 | 외과·재수술·보존 진료 상세와 의료진 연결 | 반영, 모든 치료 가능·대학병원 불필요 단정 제외 |
| 해외·타지역 내원 환자 | `/visiting` 준비 안내와 짧은 영문 안내 | 부분 반영: 실제 통역·다국어 운영·귀국 일정 확약 없음 |
| 실제 영상 중심 무자막 오프닝 | 제공 MP4에서 16초 무음 편집, 모바일/PC 소스, 수동 재생 | 반영 |
| 다채로운 스크롤·타이핑·조립·카드덱 | 7개 스토리 인터랙션, 키보드 조작, 모션 OFF·정적 대체 화면 | 반영 |
| 전체 진료 설명·의료진 약력 | 31진료, 5의료진 전체 제공 약력, 285진료 FAQ·6일반 FAQ | 반영, 원문과 완전히 동일한 답변이라는 주장 아님 |
| 블로그처럼 업로드·항목 추가 | 통합 CMS, 일반 입력·반복 항목 편집, 초안/공개/미리보기/이력 | 반영 |
| 공식 채널 연결 | 네이버 2개·YouTube RSS, 예약·카카오·인블로그 원문 링크 | 반영, 인블로그 자동 동기화·인스타그램 제외 |
| 쉽게 연락·예약·길찾기 | 지점 선택 연동, 모바일 4버튼, PC 전화·카카오·예약 | 반영 |
| 수가표 공개 | 익명 열람 32항목·원본 PDF, 푸터 실제 수가 요약 | 공개 완료 |
| 최신 콘텐츠 노출 | 홈 공식 블로그 최신 6개, 날짜 정렬·URL 중복 제거, 영상 주제 필터 | 보완 완료 |
| 지점별 시간 안내 | 헤더 영업 상태·7일 일정·날짜별 예외, 푸터 펼쳐보기 | 반영, 미확정 공휴일 추정 안 함 |
| 지도 | 공식 주소에 연결되는 네이버 외부 지도 | 부분 반영: 지도 임베드 없음 |
| 환자 전후 사례·후기 | 공개 기준 안내 및 비공개 검토 자료 | 실제 사례 공개 미구현, 동의·검토 확인 필요 |
| 채용 안내 | 안내 페이지·전화 문의 | 부분 반영: 확정 조건·공식 이메일·지원서 없음 |
| 기존 도메인·인블로그 유지/무중단 전환 | 현재 기존 사이트를 변경하지 않음 | 정식 전환 단계 미수행 |

### 원문과 조정한 내용
- 미션의 지역 내 폭넓은 치료 의도는 유지하되 모든 치료 가능·무통·안전·원데이 완료 등 결과를 보장하지 않습니다.
- 강도욱·이상훈 2인만 제공 자격에 근거한 더블보드 표기. 다른 의료진의 소개 문구를 원장 직접 인용으로 표시하지 않습니다.
- 진료별 원문/현재 답변 대조 자료 31개를 관리자 비공개 검토 자료로 유지합니다. 기존 대조 기록은 전체 문자열 일치 127개, 수정·보완·축약 158개이며 이번 감사에서 이 비율을 다시 계산하지 않았습니다.
- 증상체커는 비진단형 정보 선택 안내입니다. AI 진단, 환자 회원가입, 온라인 예약 접수, 건강정보 수집은 없습니다.
- 전체 요구를 100% 완료로 표현하지 않습니다. 위 부분 반영·미구현 및 아래 병원 확인 항목이 남아 있습니다.

## SEO / AEO 구현
- `src/seo.ts`: 실제 공개 콘텐츠에 따른 페이지별 고유 description, canonical URL·production origin 검증.
- 두 지점 각각의 Dentist, MedicalOrganization, WebSite, WebPage/MedicalWebPage 구조화 데이터.
- 지점별 주소·전화·7일 진료시간·날짜별 예외를 CMS 데이터와 함께 변경. 임의 평점·후기·감수자·감수일을 생성하지 않습니다.
- 화면의 현재 위치 breadcrumb와 BreadcrumbList 데이터를 동일하게 생성.
- 의료진별 실제 프로필 OG 이미지, OG/Twitter 설명·이미지, RSS alternate.
- 진료 상세 31개에 **무엇인지 / 어떤 증상인지 / 주의사항 / 관련 의료진 / 수가표** 핵심답변 요약.
- 실제 FAQ 본문과 FAQ 구조화 데이터 일치. `#faq-sedation-q1` 등의 질문별 직접 링크와 자동 펼치기.
- sitemap URL 중복 제거. 게시물의 실제 `updated_at`만 lastmod로 제공하며 정적 페이지에 임의 날짜를 붙이지 않습니다.
- `/llms.txt`는 공개 진료·의료진·지점·공식 채널의 절대 URL 텍스트 색인. 비공개 승인 자료는 포함하지 않습니다.
- 검색에서 수가표·해외/타지역 내원 안내도 찾을 수 있습니다.
- `PUBLIC_SITE_URL`이 유효한 HTTPS origin이고 요청 host가 정확히 일치할 때만 공개 정상 페이지의 색인을 허용합니다. 미리보기·관리자·API·미디어·오류 응답은 noindex. 미리보기 robots는 전체 Disallow입니다.

### SEO/AEO 범위와 한계
- **지금의 noindex는 미리보기 노출 방지를 위한 의도적인 설정입니다.** SEO 요청을 정식 배포 승인으로 해석하지 않았습니다.
- 실제 색인·검색 순위·AI 답변 인용은 정식 배포와 검색엔진 수집 후 측정해야 합니다. Search Console·네이버 Search Advisor 등록과 운영 성과 검증은 하지 않았습니다.
- Google 공식 문서 확인: [AI features](https://developers.google.com/search/docs/appearance/ai-features), [2026 문서 변경](https://developers.google.com/search/updates).
- Google은 AI 검색에도 기본 SEO, 실제 텍스트, 내부 링크, 페이지 경험, 화면과 일치하는 구조화 데이터를 권고합니다. 별도 AI 전용 기술 요건은 없습니다.
- Google의 FAQ 리치결과는 2026-05-07부터 표시 종료, 2026-06-15 관련 문서 제거 안내가 있습니다. FAQ schema를 넣었다고 리치결과를 보장하지 않습니다.
- 같은 6월 안내에 따르면 `llms.txt`는 Google Search 필수 요건이나 가시성·순위 가산점이 아닙니다. 다른 시스템이 참고할 수 있는 보조 색인으로 유지합니다.

## 모바일 / 접근성 / 성능
- 320·390·600·768·1024·1440px에서 60공개 경로, 총 360개 경로/폭 조합의 가로 넘침 검사.
- 영상 카드 추가 검사: 320/360/390/430/600/601/760/768/844/1024/1440px 11개 폭.
- 600px 이하는 큰 16:9 표지 아래 제목·링크, 601~1100px 2열, 큰 화면 메인 4열.
- 메뉴·영상 제목/링크 44px 터치 영역, 검색/관리자 입력 16px, safe-area, 가로모드 영상 모달.
- 모바일 메뉴 검색과 지점 선택 연동. 600px 헤더 줄 넘침과 페이지 상단 메뉴 검색을 헤더가 가리던 문제 수정.
- 모바일 헤더는 fixed top:0으로 배치. body 여백·메뉴 시작점과 맞춰 가림을 해결하며 전체 overflow:hidden으로 문제를 감추지 않습니다.
- 글꼴: 원본 Pretendard Variable **2,057,688bytes → Good Morning Sans 경량본 452,316bytes**, 파일 기준 약 78% 감소.
- 사이트 글자와 공통 한글 2,350자를 포함하고, 드문 신규 CMS 글자에만 원본을 사용하도록 unicode-range를 생성합니다. 모든 페이지의 다운로드가 항상 동일하다는 보장은 아닙니다.
- OFL Reserved Font Name 조건을 고려해 파생 이름을 Good Morning Sans로 변경하고 원본 LICENSE를 보존했습니다.
- 재생성: `python -m pip install fonttools brotli` 후 `python build-font-subset.py`, 이어 `npm run build`. Python은 선택적 개발 도구일 뿐 런타임·배포 필수 의존성이 아닙니다. 스크립트는 글꼴과 CSS fallback 범위를 함께 갱신합니다.
- 실제 iPhone/Safari·인앱 브라우저 검수나 실사용자 Core Web Vitals 측정은 아직 아닙니다. 검증은 Playwright Chromium 및 모바일/touch 에뮬레이션입니다.

## 영상·인터랙션
- 첫 화면: 원본 구간 52.3–55.5, 55.5–58.7, 60.1–63.3, 64.1–67.3초를 0.8배속으로 편집한 16초 무음 영상. 추가 자막은 없고 현장 간판·가운 로고는 남습니다.
- PC 1280×720 / 모바일 768×432, H.264. 생성형 영상이나 별도 무자막 마스터를 확보했다고 주장하지 않습니다.
- 6개 영상은 배열 순서가 아니라 실제 재생 ID로 표지 연결:
  - `f3C458akJog`, `Q3w-rsppT_g`: 해당 YouTube 영상 실제 썸네일 960/480px WebP, srcset·lazy loading·contain.
  - `Ljh4gLCFs6Y`, `xW7k824_a_o`, `DQdEDnEaN4c`, `59WYhK9pWe0`: 원본에 환자 전후·임상·수술 장면이 있어 내용별 HTML/CSS 표지 사용. 해당 환자사진 파일은 public/dist에서 제거.
- 직접 업로드한 확인된 영상 이미지는 우선 적용. 빈칸은 기본 표지, 미등록 ID는 제목 표지입니다. **6편 모두 실제 원본 썸네일로 바꾼 것은 아닙니다.**
- 대화형 FAQ·임플란트 구조·수면 과정·내원 여정·자연치아 조립·의료진 드래그/키보드 카드덱·용어 wipe.
- native cross-document View Transition은 제거. 링크 이동을 가로채지 않는 로컬 제목 등장 효과만 사용합니다.
- 모션 OFF·reduced-motion·Save-Data는 자동재생을 막지만 직접 재생은 허용. offscreen·숨김 탭·YouTube 모달 재생 중 배경 영상 정지.
- autoplay 거절·네트워크 실패·지연 안내, 수동 재생·새 창 링크·오래된 play Promise 보호.
- `/films/:file`: 허용된 두 MP4만 ASSETS에서 반환. byte-exact 206, HEAD, suffix/open, 416, If-Range 지원.

## 공개 수가 / CMS 사용법
1. `/admin` 로그인 → 분류 선택 → 편집 또는 새 항목 추가.
2. 일반 입력칸과 반복 항목 추가/삭제로 수정. JSON 직접 작성 불필요.
3. 초안 저장은 공개본을 바꾸지 않습니다. 공개 전 미리보기로 확인합니다.
4. 검토 후 공개. 변경 이력 최신 20개, 과거 버전 불러오기, 원본 복원, 연결된 항목 삭제 보호.
5. 저장 중 입력/항목 전환 잠금, 편집기 복구 후 완료 표시. 늦은 이미지·미리보기 응답이 다른 항목을 덮지 않도록 보호.

관리 범위: 진료 설명·증상·과정·주의사항·FAQ·관련 진료, 의료진 사진·자격·전체 약력, 일반 FAQ·영상·채널, 메인 섹션 순서/표시/문구·새 텍스트 섹션, 지점·일정·날짜 예외, 원장 스토리, 수가·장비·주차·접근성·수면·채용·법률 안내, 공지·건강정보와 이미지.

- 공개 기본 60경로, 31진료, 5의료진, 진료 FAQ285·일반 FAQ6, 증상182, 설명96, 용어66.
- 첫 영상 섹션은 고정. 수면·자연치아 메인 과정은 4단계 유지. 완전한 자유형 페이지 빌더는 아닙니다.
- 초기 44운영 검토 자료 중 **수가표1개 공개·기타43개 비공개**.
- 수가표32항목은 2026-10-07 사용자 명시 지시에 따라 `0004_publish_fees.sql`로 공개·이력 기록. 원본 이미지/PDF와 항목·금액을 대조했습니다.
- `/pricing` 익명 열람, 접근 가능한 표 caption·scope, 빈 단위/비고 열 숨김. 푸터 요약은 실제 공개 수가에서 가져옵니다.
- 파일명으로 적용 연도·날짜·지점을 추정하지 않습니다. 원본에 없는 수가 적용일은 빈칸 허용, 입력한 날짜는 검증. 다른 운영정보는 적용일·확인 체크·승인 근거 필요.
- 사례 동의와 원문 승인 자료는 비공개 검토용입니다. 실제 환자 사진·건강정보·동의서를 편집기에 올리지 마세요.

## 공식 채널
기존 공식 홈페이지 https://thegoodmorningdental.com/ 의 링크를 근거로 연결했습니다. 사이트의 환자 사례·사진은 가져오지 않았습니다.

| 채널 | 청량리 | 광명 |
|---|---|---|
| 네이버 예약 | https://booking.naver.com/booking/13/bizes/1019716 | https://booking.naver.com/booking/13/bizes/1551337 |
| 카카오 | https://pf.kakao.com/_npxibG | https://pf.kakao.com/_XGQYn |
| 네이버 블로그 | https://blog.naver.com/thegoodmorningdent | https://blog.naver.com/wa517396 |

- YouTube: https://www.youtube.com/channel/UCYLjg7-qpfI4ev-QkfpubFQ
- 원장 인블로그: https://thegoodmorningdental.com/blog/
- 네이버2개·YouTube 각각12항목 RSS, 제목/링크만 표시. 외부 환자사진·본문 복제 안 함.
- D1 `channel_cache`, 방문 시 waitUntil로 1시간 간격 갱신, 실패 시 마지막 성공 목록·5분 backoff, 원자적 잠금·6초 timeout·1MB 제한.
- 고정 호스트/ID, 리다이렉트 차단, XML DOCTYPE/ENTITY 차단. 인블로그는 원문 링크이며 자동 동기화가 아닙니다. 공식 인스타그램 계정은 미확정.

## 데이터 / 보안
- `src/data.ts` 기본값 + D1 live_json → `src/content.ts` 요청 단위 Content → SSR factory. 전역 배열을 요청별로 mutate하지 않습니다.
- D1: posts, admin_sessions, admin_attempts, content_entries, content_history, channel_cache.
- content_entries: kind/key, draft_json/live_json, revision compare-and-swap. content_history: 저장/공개/복원/삭제 기록.
- R2: JPG/PNG/WebP 5MB 이하, magic bytes 검사·SVG 차단. 실제 공개 필드에서 참조한 이미지만 익명 접근 허용, 초안/삭제 미디어 비공개.
- 해시 세션, 8시간, HttpOnly/SameSite=Strict/Secure(HTTPS), 로그인 5회/15분 제한, 변경 API Origin 검사.
- HTML escape·raw HTML 불허·CSP·body 제한·스크립트 없는 관리자 미리보기.
- `.sources`, `.dev.vars`, `.wrangler`, `dist`, `node_modules`, QA 산출물은 Git 제외. 원본 환자/수술 사진을 복구하지 않습니다.
- Cloudflare D1/R2 사용, KV·cron·프런트 API 토큰 없음.

## 주요 URI
| 경로 | 기능 |
|---|---|
| `/` | 영상·4핵심진료·스토리·의료진·최신글·지점 |
| `/treatments`, `/treatments/:slug` | 진료 목록/상세·핵심답변·FAQ |
| `/doctors`, `/doctors/:slug` | 의료진 전체 약력 |
| `/mission`, `/tour` | 원장 철학·공간/장비 |
| `/directions?branch=cheongnyangni` 또는 `gwangmyeong` | 지점·시간·길찾기 |
| `/reservation`, `/visiting` | 예약·해외/타지역 준비 |
| `/contents`, `/video`, `/blog`, `/column` | 콘텐츠·영상 필터·건강정보·인블로그 원문 |
| `/blog/:slug`, `/notice/:slug` | 공개 게시물 |
| `/faq`, `/encyclopedia`, `/symptom-checker` | FAQ·용어·비진단 안내 |
| `/pricing`, `/static/fees-0324.pdf` | 공개 수가32항목·원본 |
| `/cases`, `/careers`, `/privacy`, `/terms` | 사례 기준·채용·운영 안내 |
| `/api/search?q=검색어` | 공개 콘텐츠 검색 |
| `/films/clinic-opening.mp4`, `/films/clinic-opening-mobile.mp4` | Range 영상 |
| `/admin` | CMS |
| `/api/admin/content`, `/api/admin/content/:kind/:key` | 인증된 조회·초안/공개/복원/삭제 |
| `/api/admin/content-preview/:kind/:key`, `/api/admin/history/:kind/:key` | 인증된 미리보기·이력 |
| `/api/admin/channels`, `/api/admin/channels/refresh` | 피드 상태·갱신 |
| `/api/admin/posts`, `/api/admin/upload`, `/api/admin/preview`, `/api/admin/login`, `/api/admin/logout` | 게시판·미디어·인증 |
| `/media/:key` | 권한 확인된 R2 이미지 |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/feed.xml` | 검색/텍스트 색인·RSS |
| `/api/health` | 상태 |

## 실행 / 회귀 검사
```sh
cd /home/user/webapp
npm run db:migrate:local
npm run typecheck
npm run build
# 최초 시작 또는 재시작은 port 3000 정리 후 PM2 사용
pm2 start ecosystem.config.cjs
curl http://localhost:3000/api/health
npm run test:all
```
- `test:navigation`: 92회 탐색, 실제 링크·history·앵커·4모션 정책·no-JS·resize·BFCache 상태 복구.
- `npm test`: 60경로·31진료·285FAQ/schema 일치, 영상 표지6개/11폭, Range·재생 실패 복구·7인터랙션·검색·지점·기존 게시판 보안.
- `test:studio`: 요청 격리·CMS CRUD·초안/공개·CAS·이력·미리보기·연결 삭제 보호·XSS·R2 권한·모바일 폼·지점 예외·RSS/SSRF. 수가32항목 원본대조/PDF 바이트 동일·43비공개 자료 유지.
- `test:seo`: 60URL 고유 설명/canonical/OG·두 지점·breadcrumb 일치·31핵심답변·indexing 분리·절대 llms, 360폭 조합, 터치 메뉴/검색/지점, 경량폰트/희귀글자 fallback.
- `test:all`은 navigation → smoke → studio → seo 순서로 실행합니다. 테스트용 공개 데이터는 정리하고 이력은 보존합니다.
- v12 첫 전체 회귀 통과 후 원본 폰트의 불필요한 다운로드를 unicode-range로 수정했습니다. 최신 빌드에서도 navigation → smoke → studio → seo 전체를 다시 통과했습니다.

## 최종 검증 기록
- 2026-10-07 최신 폰트/CSS·의료진 설명 동기화 반영 후 TypeScript·빌드·전체 회귀 통과(exit 0). 두 프런트 JS와 SEO 테스트 문법 검사 및 git diff --check 통과.
- 92회 탐색, 60공개 경로·31진료·285FAQ/schema 일치, 360개 경로/폭 조합·11개 영상카드 폭·터치 메뉴/검색/지점·CMS 보안·수가32항목/PDF·43비공개 자료 검증. 브라우저 오류 0건.
- 네이버2개·YouTube 각12항목 최신 RSS 정상. 인블로그는 원문 링크이며 수집 항목0개가 정상입니다.
- 모바일 홈 실제 네트워크에서 GoodMorningSans 452,316bytes만 다운로드하고 2MB 원본은 요청하지 않음을 확인. 정적 진료 페이지 경량폰트 및 드문 한글의 원본 fallback 테스트도 통과.
- 외부 HTTPS `/?v=12`와 `/pricing?v=12`에서 최신글·수가32번째 행 로드, 콘솔 메시지 각각0건. 외부 응답 noindex 유지.
- Worker 빌드393.89KB, gzip122.66KB. Lighthouse 점수·실사용자 CWV·실제 Safari 검수를 수행했다는 주장은 하지 않습니다.

## 남은 확인·미구현·전환 작업
1. 의료진 현행 자격·재직·근무지점/요일, 미확정 공휴일 일정.
2. 지점별 주차·휠체어·엘리베이터·이동환경, 수면 준비·보호자 정책, 장비 모델/지점. TRIOS 표기는 제안서4.5/기존 사이트5 간 차이 확인 필요.
3. 조정한 미션·진료 답변의 의료진 감수. 관리자의 검토 체크 자체를 의료 감수로 간주하지 않습니다.
4. 실제 사례 공개 기능·동의/비식별화/광고 검토, 채용 조건·공식 이메일·지원서, 개인정보·사업자 등 법률 운영정보.
5. 지도 임베드, 인블로그 칼럼 자동 동기화, 공식 인스타그램 연결은 미구현/계정 미확정. 사용자 요청 자체가 없어진 것은 아닙니다.
6. 실제 iPhone/Safari·인앱 검수, 실사용자 성능 측정, Search Console·네이버 Search Advisor 및 색인/AI인용 성과 확인.
7. 정식 전환 승인 후 배포경로·production D1/R2·시크릿·도메인 설정, 기존 URL/인블로그 보존 계획. **현재 자체 `/blog`를 기존 인블로그 `/blog/` 위에 그대로 덮어씌우면 안 됩니다.**
8. 수가표는 재승인 대기가 아니라 공개 완료입니다. 향후 금액·지점·시행일·보증조건이 바뀔 때 공개본과 PDF를 함께 갱신합니다.

## 배포 구성 / 자료 출처
- PM2 `webapp`, Wrangler local Pages, port3000. `wrangler.jsonc` D1 ID는 로컬용이지 production ID가 아닙니다.
- 정식 배포경로는 아직 선택하지 않았습니다. Hosted 사용 시 D1/R2, KV/cron 없음.
- 제공 자료: https://drive.google.com/drive/folders/1nHFzdlo9_6hEZS-GOhcHdhqbtDYiyHZ9?usp=sharing
- 기존 공식 사이트: https://thegoodmorningdental.com/
- 위 두 주소는 사용자 제공 원본·조사 출처이며 생성 산출물이 아닙니다.
