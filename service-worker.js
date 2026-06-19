const CACHE_NAME = "shivmarg-v1";
const APP_SHELL = [
  "/",
  "/manifest.json",
  "/images/icon-192.png",
  "/images/icon-512.png",
  "/images/shivmarg_logo.png"
];

importScripts("/firebase-config.js");

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin ||
      url.pathname.startsWith("/admin") || url.pathname.startsWith("/admin-login")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});

const firebaseConfig = self.SHIVMARG_FIREBASE_CONFIG;
if (firebaseConfig && !Object.values(firebaseConfig).some((value) => String(value).startsWith("YOUR_"))) {
  importScripts("https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js");
  importScripts("https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js");
  firebase.initializeApp(firebaseConfig);
  firebase.messaging().onBackgroundMessage((payload) => {
    const data = payload.data || {};
    self.registration.showNotification(data.title || "ShivMarg", {
      body: data.body || "",
      icon: "/images/icon-192.png",
      badge: "/images/icon-192.png",
      data: { url: data.url || "/" }
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(target));
});