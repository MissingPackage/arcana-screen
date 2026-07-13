const CACHE_NAME = 'arcana-screen-shell-v1';
const SHELL = ['./', './manifest.webmanifest', './ArcanaScreen-icon.svg', './privacy.html'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL);
    const shellResponse = await fetch('./');
    const html = await shellResponse.text();
    const assetUrls = Array.from(html.matchAll(/(?:src|href)="([^"]+)"/g), (match) => new URL(match[1], self.registration.scope))
      .filter((url) => url.origin === self.location.origin)
      .map((url) => url.href);
    await cache.addAll([...new Set(assetUrls)]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./')));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    })),
  );
});
