# 더굿모닝치과 납품 자료 — R1

## 받는 분께
1. `01_Handoff.pdf`: 7쪽 인계서. 구현 범위·관리자 사용법·검수·정식 전환·백업 안내.
2. `02_Handoff_Editable.docx`: 같은 내용의 수정 가능한 Word. 글꼴/Word 환경에 따라 페이지 나눔은 PDF와 다를 수 있습니다. 인쇄 기준은 PDF입니다.
3. `03_Checklist.csv`: 34개 항목. Excel에서 열어 실제 담당자·일자·결과·증빙을 기록하세요. 기술 통과와 병원 미확인/미완료를 구분했습니다.
4. `04_Message.txt`: 문석준 원장 검토 후 강도욱 원장님께 전달할 문안. 실제 발송하지 않았습니다.
5. `05_Web_Manual.html`: 외부 글꼴 요청 없이 열리는 단일 HTML 인계서. 링크 클릭 시에는 해당 사이트에 접속합니다.
6. `evidence/`: 실제 공개 화면2장과 읽기 전용 납품 전 재검사 JSON. 스크린샷은 Chromium이며 실기기 증빙이 아닙니다.
7. `SHA256SUMS.txt`: 파일 무결성 확인용 목록.

홈페이지: https://webapp-2-9y5.pages.dev/
앱 기준 커밋: daaa9be509f7b743154989a4de8f1d66bfa2851b
고정 배포 스냅샷: https://7543d6e6.webapp-2-9y5.pages.dev
문서 ID: GM-HANDOFF-2026-10-08-R1 / 작성일: 2026-10-08

## 별도 전달
- **기술 백업**: 소스·Git 이력·운영 SQL 포함. 비공개 검토 콘텐츠가 있으므로 기술 담당자에게만 전달합니다. 일반 자료 ZIP에는 넣지 않았습니다.
- **관리자 접근정보**: 실제 비밀번호 포함. 수신 담당자를 확인한 안전한 별도 경로로 전달합니다. 일반 자료 ZIP과 기술 백업에 비밀번호를 포함하지 않았습니다.
- 이 일반 자료는 웹 공개 폴더에 배치하지 않았습니다. 검수용 자료이며 수령/오픈 승인란은 미작성입니다.
- 기존 공식 도메인·인블로그·DNS는 변경하지 않았습니다. 일본어·중국어 및 병원/실기기 확인은 인계서의 미완료 목록을 확인하세요.

## 제작 담당자용 재생성
저장소 루트에서 `node handoff/build.mjs`를 실행하면 `.sources/handoff/`에 PDF·DOCX·HTML이 생성됩니다. Node/Playwright, pandoc, python-docx가 필요합니다. 글꼴은 기존 `public/static/fonts/PretendardVariable.woff2`를 HTML/PDF에 사용합니다. 일반 ZIP의 `FONT_LICENSE.txt`는 해당 OFL 라이선스입니다.

원본: `DELIVERY.md`, `print.css`, `pagebreak.lua`, `build.mjs`, `CHECKLIST.csv`, `MESSAGE.txt`, `release-verification.json`. 이 작업은 문서 생성만 수행하며 앱 배포·접수 데이터 변경·도메인 전환은 하지 않습니다.
