self.addEventListener("install", (event) => {
  event.waitUntil(caches.open("zuknow-v1").then((cache) => cache.addAll(["/", "/logo.png", "/manifest.json"])));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))),
  );
});
