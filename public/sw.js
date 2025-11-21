const CACHE_NAME = "dopamine-pwa-v1";
const API_VISITS_KEY = "/api/visits";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache
          .addAll([
            "/",
            "/visits",
            "/reps-map",
            "/field-visit",
            "/settings",
            "/manifest.webmanifest",
          ])
          .catch(() => {
            // ignore precache errors
          })
      )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Cache last successful /api/visits response
  if (url.pathname.startsWith(API_VISITS_KEY)) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const clone = networkResponse.clone();

          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(API_VISITS_KEY, clone);
          }

          return networkResponse;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(API_VISITS_KEY);
          if (cached) {
            return cached;
          }
          throw err;
        }
      })()
    );
    return;
  }

  // Navigation requests: network first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (_err) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request);
          if (cached) {
            return cached;
          }
          const fallback = await cache.match("/");
          return fallback || Response.error();
        }
      })()
    );
  }
});

