// Service worker — estrategia "network-first":
// siempre intenta traer la última versión desde la red (GitHub Pages);
// si no hay internet, usa la última versión guardada en caché.
const CACHE = 'cuotas-cache-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // limpia cachés viejas de otras versiones
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        try {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        } catch (_) {}
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
