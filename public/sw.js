const CACHE_NAME = 'gamblehub-v1';
const STATIC_ASSETS = [
  '/',
  '/GAMBLE-HUB/',
  '/GAMBLE-HUB/index.html',
  '/GAMBLE-HUB/manifest.json',
  '/GAMBLE-HUB/icon.svg',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Failed to cache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
      self.clients.claim(),
    ])
  );
});

// Fetch - stale-while-revalidate for better UX
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests to same origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const clone = response.clone();
            cache.put(request, clone);
          }
          return response;
        }).catch(() => {
          // Return cached version if network fails
          return cached;
        });

        return cached || fetchPromise;
      });
    })
  );
});

// Listen for skipWaiting message from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
