// Import-free constants and [ko,en] copy for the reservation form (kept separate to avoid an
// import cycle: locales → reservations → ui → locales).
export const RESERVATION_RETENTION_DAYS=90
export const RESERVATION_WINDOW_DAYS=60
export const timeSlots:[string,string,string][]=[['morning','오전 (09:30–13:00)','Morning (09:30–13:00)'],['afternoon','오후 (14:30–18:30 · 평일)','Afternoon (14:30–18:30 · weekdays)'],['any','시간 무관 · 연락 시 조율','Any time · arrange by phone']]
// [ko,en] pairs for the server-rendered form on /en/reservation (extends the generated dictionary).
export const reservationPairs:[string,string][]=[
 ['홈페이지 예약 상담 신청','Online reservation request'],
 ['희망하시는 진료와 날짜·시간대를 남겨 주시면 병원에서 확인 후 전화로 연락드려 예약을 확정합니다. 신청만으로 예약이 확정되지는 않습니다.','Tell us the treatment, date and time you prefer. The clinic will check availability and call you to confirm. Submitting this form does not confirm an appointment.'],
 ['급한 통증·부기·출혈은 신청서 대신','For urgent pain, swelling or bleeding, please call '],
 ['로 바로 전화해 주세요.',' directly instead of using this form.'],
 ['접수는 Cloudflare의 국외 인프라에서 처리·보관될 수 있습니다. 동의를 거부할 수 있으나 온라인 신청은 제한되며, 전화(02-969-3776)·네이버 예약·카카오 상담은 그대로 이용할 수 있습니다. 만 14세 미만은 보호자와 함께 전화로 문의해 주세요.','Requests may be processed and stored on Cloudflare infrastructure outside Korea. You may refuse consent; online requests will then be unavailable, but telephone (02-969-3776), Naver booking and Kakao remain available. Children under 14 should call the clinic with a guardian.'],
 ['이름','Name'],['연락처 (휴대전화)','Telephone (mobile)'],['희망 진료','Treatment of interest'],['상담 후 결정 · 잘 모르겠어요','Not sure · decide at consultation'],
 ['희망 날짜','Preferred date'],['희망 시간대','Preferred time'],...timeSlots.map(([,ko,en])=>[ko,en] as [string,string]),
 ['토·일요일은 오후 진료가 없습니다(토 09:30–14:00, 일 10:00–14:00). 휴진일·원장별 일정은 연락 시 조율합니다.','There are no afternoon hours on weekends (Sat 09:30–14:00, Sun 10:00–14:00). Closures and individual dentists’ schedules are arranged when we call.'],
 ['문의 내용·연락 가능 시간 (선택)','Questions and best time to call (optional)'],['예: 평일 오후 6시 이후 통화 가능합니다.','e.g. I can take calls after 6 pm on weekdays.'],
 ['진단명·복용 약·주민등록번호 등 민감한 정보는 적지 마시고 내원 상담에서 말씀해 주세요.','Please do not enter diagnoses, medicines, ID numbers or other sensitive details; share them at your consultation instead.'],
 ['수집 항목·목적·보유기간 확인','Information collected, purposes and retention'],
 ['처리 주체: 더굿모닝치과의원. 목적: 예약 상담 연락과 진료 일정 조율. 필수: 이름·연락처·희망 진료·희망 날짜·희망 시간대. 선택: 문의 내용. 접수 언어·동의 문안 버전·접수일시를 함께 저장합니다.','Controller: The Good Morning Dental Clinic. Purpose: contacting you about your reservation and arranging an appointment. Required: name, telephone number, treatment of interest, preferred date and time. Optional: message. Submission language, consent version and time are also recorded.'],
 [`보유기간: 접수일로부터 ${RESERVATION_RETENTION_DAYS}일. 기간 경과 후 열람을 차단하고 이후 접수 또는 관리자 요청 시 삭제합니다. 권한 있는 관리자·접수 담당자만 열람하며 광고에 이용하지 않습니다. 새 신청 알림(병원 관리자 기기)에는 이름과 희망 진료·날짜만 표시하고 연락처는 넣지 않습니다.`,`Retention: ${RESERVATION_RETENTION_DAYS} days from submission. Access is blocked after expiry and the record is deleted on a later submission or administrator request. Only authorised administrators and reception staff can view it, and it is never used for advertising. New-request alerts on clinic staff devices show only your name, treatment of interest and date, never your telephone number.`],
 ['위 수집·이용 안내를 확인하고 동의합니다. (필수)','I have read the above and consent to the collection and use of my information. (Required)'],
 ['예약 상담 신청하기','Send reservation request'],
 ['온라인 신청에는 JavaScript가 필요합니다. 전화·네이버 예약·카카오 상담을 이용해 주세요.','Online requests require JavaScript. Please use telephone, Naver booking or Kakao instead.'],
 ['예약 상담 신청','Reservation request'],['온라인 예약 상담 신청','Request a reservation online'],
 ['비급여 진료비는 진단 후 치료 항목을 확인하고 개별 안내드립니다.','Non-covered fees are explained individually after diagnosis, once the treatment items are confirmed.'],
 ['현재 홈페이지에는 항목별 금액을 게시하지 않고 있습니다. 원내에 게시된 비급여 진료비용 안내를 확인하시거나','Itemised fees are not currently listed on this website. Please check the non-covered fee notice displayed at the clinic or call '],['으로 문의해 주세요.','.'],['상담·예약 안내','Consultation and booking'],['온라인 상담 신청','Request a consultation online'],['예약 신청','Book online'],
 ['온라인 예약 상담 신청 또는 전화·네이버 예약·카카오·네이버 톡톡으로 상담해 주세요.','Send an online reservation request, or contact us by telephone, Naver booking, Kakao or Naver Talk.']
]
