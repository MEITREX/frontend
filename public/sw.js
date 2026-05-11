// Service Worker for HyLimo Asset Caching
// Runs in a separate thread to intercept and cache network requests
const CACHE_NAME = "hylimo-cache-v1";

// Install event: Register the service worker
self.addEventListener("install", () => {
  console.log("[SW] Installed");
  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  console.log("[SW] Activated");
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only cache asset requests
  const isAsset =
    url.pathname.includes("@hylimo") ||
    url.pathname.includes("monaco-editor") ||
    url.pathname.includes("codingame") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".wasm") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2");

  if (event.request.method !== "GET" || !isAsset) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        // Return from cache if available
        if (response) {
          console.log("[SW] Cache hit:", url.pathname);
          return response;
        }

        // Not in cache: fetch from server
        return fetch(event.request)
          .then((response) => {
            // Only cache successful (200) responses
            if (!response || response.status !== 200) {
              return response;
            }

            // Clone response and store in cache
            const responseToCache = response.clone();
            cache.put(event.request, responseToCache);
            console.log("[SW] Cached:", url.pathname);
            return response;
          })
          .catch(() => {
            // Offline or network error: return cached version if available
            console.log("[SW] Fetch failed, checking cache:", url.pathname);
            return cache.match(event.request);
          });
      });
    })
  );
});