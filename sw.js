/* Service worker — Gideão 300 */
const CACHE = 'gideao300-v223';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './config.js',
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
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

// ativa o SW novo quando a página pedir (botão "Atualizar")
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// App shell (html/js/manifest) = network-first: pega código novo assim que há rede,
// cai para o cache quando offline. Demais recursos (imagens, seed) = cache-first.
function isShell(u) {
  const p = u.pathname;
  return u.origin === self.location.origin && (
    p.endsWith('/') || p.endsWith('/index.html') || p.endsWith('/app.js') ||
    p.endsWith('/sw.js') || p.endsWith('/manifest.json')
  );
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === self.location.origin;

  // version.json: SEMPRE rede, nunca cache (é o gatilho do banner de atualização)
  if (url.pathname.indexOf('version.json') >= 0) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {headers:{'Content-Type':'application/json'}})));
    return;
  }

  // tudo (inclusive app shell) = cache-first: app roda a versão cacheada (estável/offline);
  // a atualização é detectada por version.json e aplicada pelo botão "Atualizar" (limpa cache + reload).
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        const copy = resp.clone();
        if (resp.ok && sameOrigin) caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => cached);
    })
  );
});
