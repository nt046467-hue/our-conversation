self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'New message', body: 'New chat message received' };
  const title = data.title || 'New message from Karu';
  const options = {
    body: data.body || 'Karu sent a message',
    icon: '/icon.png',
    badge: '/icon.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then((clientList) => {
    for (const client of clientList) {
      if ('focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow('/');
  }));
});