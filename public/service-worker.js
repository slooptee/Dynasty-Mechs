// Simple service worker for offline support

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('dynasty-mechs-v1').then(async cache => {
      // Cache static files
      const files = [
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
        '/splash-512x1024.png',
      ];
      // Dynamically cache all assets/* files
      try {
        const assetFiles = [
          ...self.__WB_MANIFEST?.map(e => e.url) || [],
          '/assets/index-0N8X_cIM.css',
          '/assets/index-D-e-hxuQ.js'
        ];
        await cache.addAll([...files, ...assetFiles]);
      } catch (e) {
        await cache.addAll(files);
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      if (resp) return resp;
      return fetch(event.request).catch(() => caches.match('/index.html'));
    })
  );
});
