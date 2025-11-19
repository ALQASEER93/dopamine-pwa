
// firebase-messaging-sw.js
// This will be replaced with your actual Firebase Messaging logic.

self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};
  const title = data.notification?.title || 'Dopamine CRM';
  const options = {
    body: data.notification?.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data.data || {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
