# 더굿모닝치과 — Good Morning Web

## 현재 상태 (2026-10-08)
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
