-- User-requested single-clinic scope. Preserve publication status and original date.
-- Only the initial clinic-hours notice is changed; fees and all other content remain intact.
UPDATE posts
SET title = '내원 전 진료시간을 확인해 주세요',
    body = '## 더굿모닝치과 진료시간

평일 09:30–18:30, 토요일 09:30–14:00, 일요일 10:00–14:00입니다. 평일 점심시간은 13:00–14:30이며 수요일은 13:00–15:30입니다. 문의: 02-969-3776.

## 위치

서울특별시 동대문구 왕산로 123, 2층입니다. 제기동역 2번 출구에서 85m 거리에 있습니다.

## 일정 확인

토요일과 일요일은 점심시간 없이 진료합니다. 위 시간은 제공받은 정규 일정이며 공휴일·임시휴진은 다를 수 있습니다. 원장별 진료 일정은 내원 전 전화로 확인해 주세요.',
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE id = 'initial-hours' AND slug = 'check-clinic-hours' AND type = 'notice'
  AND title = '내원 전 지점별 진료시간을 확인해 주세요';
