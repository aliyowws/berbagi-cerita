const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/public/styles/style.css',
  '/src/main.js',
];

// Install event - cache resources with safer error handling
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('Opened cache');
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn(`Gagal cache ${url}:`, err);
        }
      }
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// Handle push events
self.addEventListener('push', event => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'Story berhasil dibuat',
    body: 'Anda telah membuat story baru',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    tag: 'story-notification',
    requireInteraction: false
  };

  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data received:', data);
      notificationData = {
        title: data.title || notificationData.title,
        body: data.options?.body || data.body || notificationData.body,
        icon: data.options?.icon || notificationData.icon,
        badge: data.options?.badge || notificationData.badge,
        tag: data.options?.tag || notificationData.tag,
        data: data.options?.data || data.data,
        requireInteraction: data.options?.requireInteraction || false
      };
    } catch (err) {
      console.error('Error parsing push data:', err);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      actions: [
        { action: 'view', title: 'Lihat Story', icon: '/images/view-icon.png' },
        { action: 'close', title: 'Tutup', icon: '/images/close-icon.png' }
      ],
      vibrate: [100, 50, 100],
      timestamp: Date.now()
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  event.notification.close();

  if (event.action === 'close') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle push subscription change WITHOUT localStorage
self.addEventListener('pushsubscriptionchange', event => {
  console.log('Push subscription changed:', event);
  
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
    }).then(subscription => {
      // This should be sent to backend by client page
      console.log('New push subscription:', subscription);
    }).catch(err => {
      console.error('Failed to re-subscribe:', err);
    })
  );
});
