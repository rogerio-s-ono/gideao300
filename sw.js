/* Service worker — cache offline do app Gideão 300 */
const CACHE = 'gideao300-v18';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './seed.json',
  './icon-192.png',
  './icon-512.png',
  './logo-cf.png',
  './logo-cf-light.png',
  './logo-gideao.png',
  './logo-helmet.png',
  './logo-300.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // cache same-origin GETs opportunistically
        const copy = resp.clone();
        if (resp.ok && new URL(e.request.url).origin === self.location.origin) {
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
