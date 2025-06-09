const CACHE_NAME = 'berbagi-cerita-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/style.css',
  '/src/main.js',
  '/assets/notif.png',
  './assets/notif.png', 
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll([...new Set(urlsToCache)])) // hindari duplikat
  );
  self.skipWaiting(); 
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('push', function (event) {
  let payload = {
    title: 'Notifikasi Baru',
    options: {
      body: 'Ada cerita baru yang berhasil dibuat!',
      icon: './assets/notif.png',
      badge: './assets/notif.png',
    }
  };

  try {
    const data = event.data.json();
    payload.title = data.title;
    payload.options = data.options;
  } catch (e) {
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, payload.options)
  );
});
