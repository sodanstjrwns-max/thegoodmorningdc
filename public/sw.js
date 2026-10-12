/* 더굿모닝치과 관리자 — 새 접수 알림 서비스 워커 (캐시·요청 가로채기 없음, 푸시 알림 전용) */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var data = {};
  try { data = e.data ? e.data.json() : {}; } catch (err) { data = { body: e.data ? e.data.text() : '' }; }
  var options = {
    body: data.body || '',
    tag: data.tag || 'gm-request',
    renotify: true,
    icon: '/static/images/admin-icon-192.png',
    badge: '/static/images/admin-icon-192.png',
    data: { url: data.url || '/admin#request-inbox' }
  };
  e.waitUntil(self.registration.showNotification(data.title || '새 예약 신청', options));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/admin#request-inbox';
  var target = new URL(url, self.location.origin);
  if (target.origin !== self.location.origin) target = new URL('/admin', self.location.origin);
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) {
      var client = list[i];
      if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
        return client.focus().then(function (c) { return c && 'navigate' in c ? c.navigate(target.href) : c; });
      }
    }
    return self.clients.openWindow(target.href);
  }));
});
