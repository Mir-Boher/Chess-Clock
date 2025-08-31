const CACHE_NAME = "chess-clock-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/index.css",
  "/index.js",
  "/manifest.json",
  "/assets/sounds/click.wav",
  "/assets/sounds/resume.wav",
  "/assets/sounds/femalelow.wav",
  // Add your icons here
  "/assets/sounds/icons/N.png",
  "/assets/sounds/icons/N.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
