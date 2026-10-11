# 더굿모닝치과 납품 자료 — Payment24

## 결제·지원 조건 반영

- 사용자 요청 ‘결제도 넣어 다른 병원이랑 조건 똑같아’에 따라 공개 금액·입금계좌·예금주·계산서 발급기한·영원한 무상 수정 조건을 안내서에 반영했습니다.
- 금액은 VAT포함1,500만원, 계좌이체만 지원, 입금 확인 후2주 이내 세금계산서 발급입니다. 승인된 입금계좌는 본문11절에서 확인합니다. 실제 입금·발급 사실을 생성하지 않습니다.
- 고수·서울도담·연세온·마곡베스트 공통 조건 기준입니다. 검단퍼스트만의 분할납부 예외는 더굿모닝에 적용하지 않았습니다.
- 결제 안내와 무상 수정 문구를 본문·메시지·체크리스트·V24 선택형 출력에 동기화합니다. 검증·배포 진행 중.

## 바로 열리는 공개 안내서

**https://thegoodmorningdc.kr/handover**

원장님·직원에게 전달할 기본 안내서는 위 주소입니다. 로그인 없이 읽고, 목차로 이동하고, 인쇄/PDF 저장을 할 수 있습니다. 공개 안내서의 단일 본문 원본은 `handoff/DELIVERY.md`이며 `src/handover.ts`가 빌드 시 포함해 제공합니다. 이 README는 기술·검수 담당자 참고용으로 별도 유지합니다.

- 논지: SEO·AEO·환자의 이해/상담 → 더굿모닝의 실제 강점 → 관리자 사용법 → 지속적인 칼럼·사례 운영 → 안정화·인수 체크리스트.
- 사용자 제공 병원 안내서7개의 공개 접근/구성을 참고하되 다른 병원의 기능·성과·인증정보는 복제하지 않았습니다. 결제·지원 조건은 사용자 동일 조건 승인에 따라 Payment24에서 반영했습니다.
- `/handover`는 DB/CMS 조회나 로그인 없이 제공하며 항상 검색 제외합니다. 안내서의 noindex는 접근 제한이 아닙니다. 일반 환자 메뉴·사이트맵에는 추가하지 않았습니다.
- 공개본문에는 비밀번호·토큰·환자·직원 개인정보·내부 백업 경로가 없습니다. 제작자가 공개 승인한 제작비·입금계좌·예금주·계산서 및 무상 수정 조건은 표시합니다.
- 미해결500/검색 비공개/개인정보·실물 기기·병원 검수 보류를 그대로 고지합니다. 안내서 공개가 최종 납품 승인이나 오류 해결을 의미하지 않습니다.
- `MESSAGE.txt`와 `CHECKLIST.csv`를 현재 단일 병원과 안내서 중심으로 수정했습니다. 실제 발송은 하지 않았습니다.
- `node handoff/build.mjs`는 현재 안내서로 V24 PDF/DOCX/HTML을 비공개 출력하는 선택 명령입니다. 기존 R1 파일을 덮어쓰지 않습니다.
- 로컬 타입검사·빌드 및 로컬/실제 도메인 `node tests/handover.mjs` PASS: 공개GET/HEAD200/DB조회0회/항상noindex, Chromium·WebKit10화면폭, WCAG 자동검사, 목차11개, 인쇄/PDF, 복사 및 실패 대안, no-JS. PC/모바일 화면과 인쇄 본문을 확인했습니다. 실물 기기 검수와 구분합니다.
- BYOK 앱 `2e19794` 배포 완료: https://00830e7b.webapp-2-9y5.pages.dev . 공개 안내서 에셋200, 비인증 관리자 API3경로401, 비공개 파일 경로404 확인. 알려진 실제 인증값 공개 포함0 및 비공개 자료 Git추적0 확인. 운영 데이터 쓰기·DNS·검색 공개 변경은 없습니다.

- 배포 후 단일 병원 검사: 한·영120경로·Chromium/WebKit72화면폭, 공개 수가32항목·원본 PDF 바이트 일치 PASS. 안내서 내부 링크11개200 확인. 기존 간헐500의 근본원인 해결 검증을 대신하지 않습니다.

## FinalAudit22 기록과 미해결 사항

## 최종 점검 범위 (2026-10-11)
- 대상은 강도욱 원장님의 더굿모닝치과 한 병원입니다. 서울비디치과·광명 지점은 공개 범위가 아닙니다.
- 홈페이지: https://thegoodmorningdc.kr/ . www도 HTTPS200을 확인했습니다.
- 관리자: https://thegoodmorningdc.kr/admin . 소유자는 직원 아이디를 비우고 별도 전달된 비밀번호를 사용합니다. 비밀번호는 이 문서에 포함하지 않습니다.
- 검증용 주소: https://webapp-2-9y5.pages.dev/ . 수정 앱 `95f7676`, 스냅샷 https://b9b8b778.webapp-2-9y5.pages.dev . 최신 검사 결과와 남은 안정성 이슈는 프로젝트 루트 README의 FinalAudit22 기록을 기준으로 합니다.
- GitHub: https://github.com/sodanstjrwns-max/thegoodmorningdc (`main`). 코드 위치 `/home/user/webapp`.
- 사용자 소유 Cloudflare Pages `webapp-2`, D1 `webapp-2-goodmorning-production`, R2 `webapp-2-goodmorning-media` 유지.

## 현재 제공 기능
- 의료진5명, 진료31페이지, FAQ285개, 상담 준비카드32개와 인쇄/PDF 저장.
- 한·영 안내, 검색·분류·페이지네이션, 진료별 FAQ/관련 의료진·칼럼 연결.
- 메인 영상과 장면 제어, reduced-motion/Save-Data/no-JS 대안, 반응형 병원 사진.
- 비급여32항목과 원본 `/static/fees-0324.pdf` 공개 유지.
- 전화02-969-3776, 네이버 예약1019716, 카카오_npxibG, Place19524548, 공식 SNS/인블로그.
- `/video#broadcast-appearances` 및 강도욱 프로필에 공식 방송2개 링크. 방송 썸네일·환자사진은 복제하지 않습니다.
- 네이버 톡톡 `w4s3ry`: 예약·오시는 길·홈·빠른 상담·모바일 메뉴·푸터에서 외부 연결. 채팅 내용을 사이트가 수집하지 않습니다.
- CMS 초안/발행/철회/이력/CAS, Tiptap/Markdown, 직원 역할/검토 workflow, 미디어 사용처, 접수함, 알림·집계 기능.
- 승인되지 않은 사례는 공개하지 않으며 기존 로그인 제한 사례를 가져오지 않았습니다.

## 실제 운영 전 필수 확인 — 최종 납품 승인 보류
0. **간헐500 원인 미확정:** 운영 `/en/blog`에서 첫 수정 배포 후 HTTP500을 확인했습니다. 이후 직접 요청·35회 낮은 동시성 검사·순차 회귀는 정상이나 오류 당시 서버 원인은 확보하지 못했습니다. 후속 정상 응답만으로 해결 처리하지 않으며 안정화 후 최종 인수가 필요합니다. 근거는 루트 README와 `test-results/final-incidents.json`입니다.
1. **검색 공개 설정:** DNS/TLS는 active지만 `PUBLIC_SITE_URL`은 아직 미설정이고 apex/www/Pages 모두 noindex입니다. 병원 승인 후 대표 URL을 확정하고 www 정규화·canonical·robots·sitemap·검색도구 등록을 확인해야 합니다. 현재 noindex는 비밀번호 보호가 아닙니다.
2. **개인정보·운영 주체:** `/privacy`·`/terms`에는 제작 미리보기/정식 운영 전 확인 문안이 남아 있습니다. 운영 주체·보호책임자·연락창구·수집/보유/위탁 내역을 병원 기준으로 확정해야 합니다. 기존 공식사이트의 사업자 대표자와 임상 대표원장을 임의로 동일시하지 않습니다.
3. **의료·운영 정보:** 의료진 자격·일정, 현행 장비 모델/운영 여부, 주차·접근성, 정규시간·공휴일을 병원 담당자가 확인해야 합니다. 자동검사가 실제 의료 감수를 대신하지 않습니다. 공개 승인 수가는 재승인 대기로 되돌리지 않습니다.
4. **접수 담당 체계:** 운영 직원 계정은 아직 없고 이메일 알림/상담 집계/성능 집계는 OFF입니다. 소유자 관리자에서 접수함을 정기 확인할 담당자·응답 기준을 정하거나 필요한 알림을 별도 설정해야 합니다. 신규 자동 통역 계약이나 채용 조건은 생성하지 않았습니다.
5. **실물 기기:** Chromium/WebKit 검사는 실물 iPhone/Android·VoiceOver/TalkBack 검수가 아닙니다. 전화/네이버/카카오/톡톡 실제 연결·송수신과 직원 CMS 실사용 인수를 별도로 진행하세요.

## 데이터와 보안
- 최종 점검은 운영 게시물·접수·계정을 생성하지 않습니다. 관리자/역할/CRUD/파일 업로드의 쓰기 검사는 로컬 DB/R2에서 수행합니다.
- 운영 SQL 백업은 `.sources/final-audit/`에 비공개 보관하며 Git·일반 납품 파일에 포함하지 않습니다. 최종 전후 비교 결과는 루트 README에 기록합니다.
- 내부 `cheongnyangni` ID는 데이터 호환용이며 공개 선택 UI는 없습니다. 과거 branch 쿼리는 해당 매개변수만 제거해301 이동합니다.
- `.dev.vars`, `.sources/`와 인증 토큰은 Git 제외. 비밀번호/토큰을 문서·로그·브라우저 코드에 출력하지 않습니다.
- 게시물/수가/이력/접수 데이터와 기존 공식 홈페이지·인블로그·기존 도메인/DNS는 보존합니다.

## 재검사 안내
- `npm run typecheck && npm run build`
- 로컬 쓰기 검사: `npm test`, `npm run test:studio`, `npm run test:services`, `npm run test:editorial`, `npm run test:operations`.
- 영문 UI: `npm run test:locales`. 오래된 다지점 원자료가 아닌 실제 렌더된 고정 UI와 동적 숫자 문구를 검사합니다. 공식 RSS/신규 게시물 원문 제목은 번역 보장 대상이 아닙니다.
- 운영 읽기 전용: `TEST_URL=https://thegoodmorningdc.kr node tests/foundations.mjs`, `tests/single-clinic.mjs`, `tests/broadcast-talk.mjs`, `tests/hero-layout.mjs`, `tests/care.mjs`.
- `tests/operations-production.mjs`는 운영 임시 계정을 생성하는 별도 QA 도구입니다. 이번 최종 점검에서는 실행하지 않았으며 읽기 전용 검사로 오인하지 마세요.
- 성능: `tests/care-performance.mjs`는 모의 모바일 환경의 실험실 표본입니다. 실사용자 p75·Core Web Vitals 합격 인증이 아닙니다.
- 백업 복원/배포는 기존 BYOK 설정과 main 브랜치를 사용하며 원본 DB를 초기화하거나 `.sources/restore_content.py`를 재실행하지 않습니다.

## 이전 자료는 역사 기록입니다
- R1의 `01_Handoff.pdf`, `02_Handoff_Editable.docx`, `03_Checklist.csv`, `04_Message.txt`, `05_Web_Manual.html`, `evidence/`, `SHA256SUMS.txt`는 최신 기능을 자동 반영하지 않습니다.
- 기존 R1 출력 파일은 역사 기록입니다. 현재 `handoff/build.mjs`는 Handover23 본문을 별도 이름으로 출력하도록 변경했습니다.
- Hero20은 메인 하단 밀집을 해소했고 Broadcast21은 방송2개·톡톡을 추가했습니다. 이번 FinalAudit22는 오타·영문 UI 누락을 보완하고 도메인 활성화 및 납품 준비도를 재검증합니다.
