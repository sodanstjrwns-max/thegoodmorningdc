# 더굿모닝치과 납품 자료 — SingleClinic19

## 현재 배포 (2026-10-11)
- 홈페이지: https://webapp-2-9y5.pages.dev/
- 관리자: https://webapp-2-9y5.pages.dev/admin
- 배포 스냅샷: https://78bf57b4.webapp-2-9y5.pages.dev
- 앱 커밋: `9f9f4fb`.
- GitHub: https://github.com/sodanstjrwns-max/thegoodmorningdc (`main`).
- 사용자 소유 Cloudflare Pages `webapp-2`와 기존 D1/R2를 사용합니다.

## 이번 변경 — 강도욱 원장님의 병원만 안내
- 더굿모닝치과 / 서울특별시 동대문구 왕산로 123, 2층 / 제기동역 2번 출구 / 02-969-3776.
- 광명 위치·연락처·시간·예약·카카오·블로그·플레이스와 공개 지점 선택 기능을 제거했습니다. Instagram에 붙였던 지점명도 제거했습니다.
- 네이버 예약 `1019716`, 플레이스 `19524548`, 카카오 `_npxibG`, 네이버 블로그 `thegoodmorningdent`, Instagram `_thegoodmorning`, YouTube와 기존 인블로그를 유지합니다.
- 한·영 헤더·푸터·지도·상담 양식·공지·메타·구조화 데이터·llms 안내를 통일했습니다.
- 과거 공개 URL의 `branch` 매개변수만 제거해301 이동하며 다른 검색 조건은 보존합니다. 과거 브라우저 지점 저장값은 사용하지 않습니다.
- 내부 `cheongnyangni` ID는 기존 데이터 호환용입니다. 공개 선택 UI는 없으며 문의는 한 병원으로만 접수합니다. 과거 CMS 행·이력은 삭제하지 않고 공개 합성 모델에서 타 지점 정보를 제외합니다.
- 제공 의료진5명·진료31페이지·준비카드32개·기존 CMS 기능은 유지합니다. 임의의 의료진 배정·환자 사례·의료 감수·통역 계약·채용 조건을 생성하지 않았습니다.

## 데이터 변경과 보존
- `0007_single_clinic.sql`을 로컬/운영에 적용했습니다.
- 변경한 운영 게시물은 `/notice/check-clinic-hours` 한 건입니다. 제목·본문·수정일만 변경했으며 공개 상태·최초 게시일을 보존했습니다.
- 운영 전후 SQL 독립 복원 대조: CMS44건·콘텐츠이력1건 동일, 다른 게시물2건 동일, 접수·직원·설정·집계·알림큐 동일.
- 공개 승인된 비급여 수가32항목과 원본 `/static/fees-0324.pdf`를 유지합니다. 비공개·승인 대기로 되돌리지 않았습니다.
- 비공개 백업/보존 증빙: `.sources/single-clinic-release/`. Git과 일반 인계자료에 비밀번호·토큰·SQL을 포함하지 않습니다.

## 검사와 사용 안내
- `/directions`에서 위치·진료시간을 확인하고 `/reservation` 또는 고정 상담 버튼으로 병원에 연결합니다.
- `/admin`에서 기존 CMS를 사용합니다. 소유자 로그인은 직원 아이디를 비우고 기존 비밀번호를 사용합니다. 비밀번호를 변경하지 않았습니다.
- 로컬: 단일 병원120한·영 경로, Chromium/WebKit72화면폭, 이전 URL/저장값, 수가/PDF 보존 검사 통과. SEO360화면폭·CMS·접수·탐색·Foundations120경로480화면폭·Care 접근성/인쇄/폼 검사 통과.
- 운영: 읽기 전용 단일 병원120경로·Chromium/WebKit72화면폭 및 Foundations120경로480화면폭 검사 통과. 공개 수가32항목·원본PDF 동일, 메타·캐노니컬·FAQ·noindex 확인. 로컬 smoke/operations/editorial 추가 회귀도 통과.
- 재검사: `node tests/single-clinic.mjs`, `npm run test:foundations`. 운영 주소를 `TEST_URL`로 지정하면 읽기 전용 공개 검사를 수행합니다.
- 실제 운영에 시험용 환자 자료·예약·문의·채용 지원·메시지를 생성하지 않습니다.
- 실물 iPhone/Android·VoiceOver/TalkBack 검사는 하지 않았습니다. 자동 브라우저 검사를 실제 기기 검수로 표시하지 않습니다.

## 변경하지 않은 사항 / 후속 확인
- 기존 공식 홈페이지·인블로그·도메인·DNS 변경 없음. 정식 도메인 전환 없음.
- `PUBLIC_SITE_URL` 미설정으로 검증 주소 noindex 유지. noindex는 접근 암호가 아닙니다.
- 알림 미연결, 상담 집계·성능 집계 OFF 유지. 실사용자 p75나 Core Web Vitals 합격을 주장하지 않습니다.
- 병원 담당자의 의료·개인정보 문안 확인, 실제 기기 검수와 별도 도메인 전환 승인이 남아 있습니다.
- WhatsApp·네이버 톡톡 추가 등 다른 기능은 이번 범위가 아닙니다.

## 이전 자료는 역사 기록입니다
기존 R1 PDF/Word/ZIP은 후속 Operations16·Care17·Foundations18·SingleClinic19를 포함하지 않습니다. 당시 자료를 덮어쓰지 않았습니다.
- `01_Handoff.pdf`, `02_Handoff_Editable.docx`, `03_Checklist.csv`, `04_Message.txt`, `05_Web_Manual.html`, `evidence/`, `SHA256SUMS.txt`: R1 기준.
- R1 앱: `daaa9be509f7b743154989a4de8f1d66bfa2851b`.
- R1 스냅샷: https://7543d6e6.webapp-2-9y5.pages.dev
- Operations16 스냅샷: https://d8ca0fac.webapp-2-9y5.pages.dev
- Foundations18/Care17 스냅샷: https://12de070f.webapp-2-9y5.pages.dev
- `node handoff/build.mjs`는 R1 자료 재생성용이며 최신 변경을 자동 반영하지 않습니다.
