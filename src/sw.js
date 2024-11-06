const CACHE_NAME = "restaurant-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/favorites.html",
  "/restaurant-details.html",
  "/styles/main.css",
  "/scripts/main.bundle.js",
  // Add any other essential files here
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("restaurant-cache-v1").then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Failed to cache resources:", error);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("restaurant-api.dicoding.dev")) {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          return (
            response ||
            fetch(event.request).then((networkResponse) => {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            })
          );
        })
        .catch(
          () => new Response("Data not available offline.", { status: 500 })
        )
    );
  } else {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
});
