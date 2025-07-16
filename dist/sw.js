// NUCLEAR OPTION SERVICE WORKER - INTERCEPTS ALL REQUESTS
const CACHE_NAME = 'vleeb-news-nuclear-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clear all old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - NUCLEAR OPTION: Handle ALL requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Handle navigation requests - ALWAYS return index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch('/index.html');
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }
  
  // Handle API requests - pass through
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Handle static assets - cache first
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }
  
  // NUCLEAR OPTION: For ANY other request, return index.html
  event.respondWith(
    caches.match('/index.html')
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch('/index.html');
      })
      .catch(() => {
        return caches.match('/index.html');
      })
  );
});

// Message event - handle communication from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 