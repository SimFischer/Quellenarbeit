const CACHE_NAME = 'clara-neumann-v7';
const CORE_FILES = [
  './',
  './index.html',
  './lehrer.html',
  './config.js',
  './teacher.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-180.png',
  './icon-512.png'
];

// Diese Dateien werden immer zuerst aus dem Netz geladen, damit Änderungen
// sofort ankommen. Ohne Verbindung wird die zuletzt gespeicherte Fassung genutzt.
const ALWAYS_FRESH = /\.(html|js|webmanifest)$|\/$/;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  const store = response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  };

  if (event.request.mode === 'navigate' || ALWAYS_FRESH.test(requestUrl.pathname)) {
    event.respondWith(
      fetch(event.request).then(store).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(store).catch(() => caches.match('./index.html')))
  );
});
