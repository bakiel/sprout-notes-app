// Service Worker for Sprout Notes PWA

const CACHE_NAME = 'sprout-notes-static-v1';
// Add URLs of essential assets to cache for the app shell
// Note: JS/CSS bundle names might change based on build process.
// We might need a more dynamic way to get these later (e.g., build tool integration).
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/app.css', // Assuming global styles are here
  '/manifest.json',
  '/favicon.ico',
  // App icons for various sizes 
  '/icons/icon-48x48.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  // Add font files if needed (check network tab after build)
  // e.g., 'https://fonts.googleapis.com/css2?family=Montserrat:wght@600&family=Poppins:wght@400&display=swap'
  // e.g., 'https://fonts.gstatic.com/s/...' (actual font files)
  // TODO: Add main JS bundle path(s) after build
];

// Install event: Cache the app shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell:', APP_SHELL_URLS);
        // Use addAll for atomic caching
        return cache.addAll(APP_SHELL_URLS).catch(error => {
          console.error('[Service Worker] Failed to cache app shell during install:', error);
          // Optional: Throw error to fail installation if core assets fail
          // throw error; 
        });
      })
      .then(() => {
        console.log('[Service Worker] App shell cached successfully');
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting(); 
      })
  );
});

// Activate event: Clean up old caches (optional for now)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');
  // Example: Remove old caches if CACHE_NAME changes
  // event.waitUntil(
  //   caches.keys().then((cacheNames) => {
  //     return Promise.all(
  //       cacheNames.map((cacheName) => {
  //         if (cacheName !== CACHE_NAME) {
  //           console.log('[Service Worker] Deleting old cache:', cacheName);
  //           return caches.delete(cacheName);
  //         }
  //       })
  //     );
  //   }).then(() => self.clients.claim()) // Take control of uncontrolled clients
  // );
   event.waitUntil(self.clients.claim()); // Take control immediately
});

// Fetch event: Serve from cache first, then network (Cache-First Strategy)
self.addEventListener('fetch', (event) => {
  // Let the browser handle requests for scripts from extensions, etc.
  if (!event.request.url.startsWith(self.location.origin)) {
     return;
  }

  // For navigation requests (HTML pages), try network first, then cache (Network-First)
  // This ensures users get the latest HTML if online.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Optional: Cache the successful response for offline fallback
          // Be careful caching HTML frequently if it changes often
          return response; 
        })
        .catch(() => {
          // Network failed, try the cache
          return caches.match(event.request)
            .then(response => {
              return response || caches.match('/'); // Fallback to root cache if specific page not found
            });
        })
    );
    return;
  }

  // For other requests (CSS, JS, images), use Cache-First strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          // console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }

        // Not in cache - fetch from network
        // console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // console.log('[Service Worker] Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
           console.error('[Service Worker] Fetch failed; returning offline fallback if available.', error);
           // Optional: Return a custom offline fallback page or image
           // return caches.match('/offline.html'); 
        });
      })
  );
});
