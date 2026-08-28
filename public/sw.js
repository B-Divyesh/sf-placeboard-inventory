const VERSION = 'placeboard-v1';
const SHELL = ['/', '/inventory', '/demo', '/privacy', '/terms', '/offline.html', '/manifest.webmanifest', '/favicon.svg', '/assets/placeboard-market.webp'];
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(VERSION);
  await cache.addAll(SHELL);
  const html = await (await fetch('/')).text();
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
  if (assets.length) await cache.addAll(assets);
  await self.skipWaiting();
})()));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(VERSION).then(cache => cache.put(event.request, copy)); return response; }).catch(async () => (await caches.match(event.request)) || (await caches.match('/')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(async response => { if (response.ok) await (await caches.open(VERSION)).put(event.request, response.clone()); return response; })));
});
