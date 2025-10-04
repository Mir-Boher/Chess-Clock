const CACHE_VERSION = "v5";
const CACHE_NAME = `chess-clock-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "/", // root
  "/index.html",
  "/index.css",
  "/index.js",
  "/manifest.json",
  // icons
  "/assets/icons/N-One192.png",
  "/assets/icons/N-Two512.png",
  // sounds
  "/assets/sounds/click.wav",
  "/assets/sounds/resume.wav",
  "/assets/sounds/femalelow.wav",
];

// Install: cache core
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((c) => c.addAll(CORE_ASSETS))
      .catch(console.error)
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("chess-clock-") && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// Fetch: offline-first for navigations, cache-first for core, network for others
self.addEventListener("fetch", (e) => {
  const req = e.request;

  // Handle page navigations (SPA / offline)
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("/index.html")));
    return;
  }

  // Try cache, then network
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => resp);
    })
  );
});

// Optional: listen for manual skipWaiting trigger
self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
