const CACHE_NAME = 'berbagi-cerita-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/src/main.js',
  '/src/scripts/router.js',
  '/src/scripts/views/homeView.js',
  '/src/scripts/views/favoriteView.js',
  '/src/scripts/presenters/homePresenter.js',
  '/src/scripts/presenters/favoritePresenter.js',
  '/src/style.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.url.startsWith('https://story-api.dicoding.dev')) return;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request)
          .then((liveResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, liveResponse.clone());
              return liveResponse;
            });
          })
          .catch(() => {
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          })
      );
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Notifikasi',
    options: {
      body: 'Ada update baru!',
      icon: '/assets/icons/icon-192x192.png',
    },
  };

  if (event.data) {
    try {
      const json = event.data.json();
      notificationData.title = json.title || notificationData.title;
      notificationData.options.body = json.options?.body || notificationData.options.body;
    } catch (e) {
      console.error('❌ Gagal parsing push data JSON:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

self.addEventListener('message', (event) => {
  const { type, title, options } = event.data || {};
  if (type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(title, {
      ...options,
      icon: '/assets/icons/icon-192x192.png',
    });
  }
});
