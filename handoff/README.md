# 더굿모닝치과 납품 자료 — Foundations18 / Care17

## 현재 배포 (2026-10-11)
- 홈페이지: https://webapp-2-9y5.pages.dev/
- 관리자: https://webapp-2-9y5.pages.dev/admin
- 배포 스냅샷: https://12de070f.webapp-2-9y5.pages.dev
- 앱 커밋: `ae3c03d`.
- GitHub: https://github.com/sodanstjrwns-max/thegoodmorningdc (`main`).
- 최신 기능·API·검증·미완료 설정은 루트 `README.md`의 Foundations18 + Care17 절을 확인하세요.

## 이번 반영 내용
- 진료31페이지 및 해외·타지역 내원 페이지에 준비 카드32개와 인쇄/PDF 저장.
- 의료진5명 소개에 제공 자료와 기존 진료 설명을 연결. 확인되지 않은 개별 의료진 방침·인터뷰·환자 사례는 생성하지 않음.
- 모바일 이미지 크기별 제공, 느린 연결 영상 로딩 제한, 입력 오류/키보드 포커스/색 대비 개선.
- 본문 제목 단계, 페이지별 메타 요약, OG/Twitter, 캐노니컬 및 실제 FAQ와 구조화 데이터 일치 검사.
- 공지·건강정보 게시판 검색과9개 단위 페이지 나누기. 영문 검색 및 내부 앵커 경로 유지.
- 성능 구간 집계는 선택형이며 운영 OFF. 실제 기기 검사·실사용자 p75·Core Web Vitals 합격을 주장하지 않음.

## 확인 결과와 보존 사항
- 실제 배포 한·영120경로·480화면폭 검사 통과. 공개 수가32항목 및 원본 PDF 유지.
- 로컬 작성/저장/발행/검색/수정/철회, 권한·승인·오류복구 회귀 통과. 실제 운영에는 시험용 환자자료나 게시물을 생성하지 않음.
- Chromium·WebKit 주요 화면 자동 검사 완료. 실물 iPhone/Android 및 VoiceOver/TalkBack 검사는 별도 필요.
- 운영 전후 CMS44건·게시물3건 및 접수·직원·설정·집계 값 동일 확인.
- 기존 공식 홈페이지·인블로그·도메인/DNS 변경 없음. 검증 주소는 noindex 유지.
- 메일 서비스 미연결, 상담 집계·성능 집계 비활성 유지.
- 소유자는 직원 아이디를 비우고 기존 비밀번호로 로그인. 비밀번호는 변경하지 않았으며 문서나 Git에 포함하지 않음.

## R1 자료는 이전 납품 기준 기록입니다
기존 PDF/Word/ZIP은 후속 Operations16·Care17·Foundations18 기능을 포함하지 않습니다. 원래 납품 기준을 보존하기 위해 덮어쓰지 않았습니다.
1. `01_Handoff.pdf`: 7쪽 R1 인계서.
2. `02_Handoff_Editable.docx`: 수정 가능한 Word.
3. `03_Checklist.csv`: 담당자·실기기·승인란을 실제 확인 후 작성.
4. `04_Message.txt`: 검토 후 전달할 문안. 실제 발송하지 않음.
5. `05_Web_Manual.html`: R1 HTML 인계서.
6. `evidence/`, `SHA256SUMS.txt`: 당시 검사와 파일 무결성 기록.

R1 앱: `daaa9be509f7b743154989a4de8f1d66bfa2851b`.
R1 스냅샷: https://7543d6e6.webapp-2-9y5.pages.dev
Operations16 스냅샷: https://d8ca0fac.webapp-2-9y5.pages.dev

## 별도 전달 및 후속 확인
- 비공개 운영 SQL은 `.sources/foundations-release/`에 보관하며 Git/일반 자료에 포함하지 않습니다. R2 전체 객체 백업과는 다릅니다.
- 관리자 접근정보는 별도 보안 경로로 전달합니다.
- 의료 감수·환자 동의·채용조건·통역 계약·실기기 결과를 임의로 확인 완료 처리하지 않습니다.
- 병원 담당자의 문안·개인정보 처리방침 확인, 실제 기기 검수 및 별도 도메인 전환 승인이 남아 있습니다.
- `node handoff/build.mjs`는 R1 자료를 재생성할 뿐 최신 변경을 자동 반영하지 않습니다.
