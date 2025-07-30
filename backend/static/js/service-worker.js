// service-worker.js

const CACHE_NAME = 'focusverse-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/style.css',
  '/static/js/script.js',
  '/static/media/alarm.mp3',  // Add any music/sounds if used
  '/favicon.ico'
];

// Install service worker and cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch assets from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
}); 