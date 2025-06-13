// sw.js - Service Worker

const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/scripts/index.js',
  // Add other static assets you want to cache
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
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
      
      // Format sesuai dengan dokumentasi API
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
      // Fallback to text data
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const showNotification = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      actions: [
        {
          action: 'view',
          title: 'Lihat Story',
          icon: '/images/view-icon.png'
        },
        {
          action: 'close',
          title: 'Tutup',
          icon: '/images/close-icon.png'
        }
      ],
      vibrate: [100, 50, 100],
      timestamp: Date.now()
    }
  );

  event.waitUntil(showNotification);
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    // User clicked close, do nothing
    return;
  }

  // Default action or 'view' action
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then(clientList => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If app is not open, open it
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event);
  // You can track notification close events here if needed
});

// Handle background sync (optional - for offline functionality)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle background sync logic here
  }
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', event => {
  console.log('Push subscription changed:', event);
  
  event.waitUntil(
    // Re-subscribe to push notifications
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
    }).then(subscription => {
      // Send new subscription to server
      return fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth
          }
        })
      });
    }).catch(err => {
      console.error('Failed to re-subscribe:', err);
    })
  );
});