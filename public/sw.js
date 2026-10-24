// Comiks X Studio — Service Worker
// Production-grade PWA Service Worker
// Security Guardrail: Never caches Supabase, Auth, API, or private user data.

const CACHE_VERSION = "comiks-x-v2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const APP_SHELL_ASSETS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-512x512.png",
  "/icons/apple-touch-icon.png",
  "/icons/shortcut-96x96.png",
  "/screenshots/screenshot-narrow.png",
  "/screenshots/screenshot-wide.png",
];

// 1. Install Event: Precache app shell and offline document
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .then(() => {
        // Do not force skipWaiting immediately; allow graceful user-prompted updates
      })
      .catch((err) => {
        console.warn("[PWA SW] Precache failed:", err);
      })
  );
});

// 2. Activate Event: Clean up stale caches and claim clients
self.addEventListener("activate", (event) => {
  const expectedCaches = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !expectedCaches.includes(key))
            .map((key) => {
              console.log("[PWA SW] Deleting obsolete cache:", key);
              return caches.delete(key);
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Message Event: Support skipWaiting on user prompt
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[PWA SW] Received SKIP_WAITING signal from client");
    self.skipWaiting();
  }
});

// Helper: Check if request is strictly Network-Only (Supabase / Auth / API / Private Data)
function isNetworkOnlyRequest(url, request) {
  // Non-GET requests are always network-only
  if (request.method !== "GET") return true;

  // Supabase endpoints (auth, rest, storage, realtime)
  if (url.hostname.includes("supabase.co") || url.hostname.includes("supabase.in")) {
    return true;
  }

  // Next.js API route handlers
  if (url.pathname.startsWith("/api/")) {
    return true;
  }

  // Authentication callbacks & OAuth tokens
  if (
    url.pathname.startsWith("/auth/") ||
    url.searchParams.has("code") ||
    url.searchParams.has("token") ||
    url.searchParams.has("access_token") ||
    url.searchParams.has("refresh_token")
  ) {
    return true;
  }

  // Authorization header present
  if (request.headers && request.headers.has("authorization")) {
    return true;
  }

  // WebSocket or SSE
  if (url.protocol === "ws:" || url.protocol === "wss:") {
    return true;
  }

  return false;
}

// 4. Fetch Event: Multi-tiered caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // SECURITY GUARD: Strictly bypass all private & dynamic endpoints
  if (isNetworkOnlyRequest(url, request)) {
    return; // Pass through straight to network
  }

  // Strategy A: HTML Page Navigations -> Network-first with 2500ms timeout, falling back to cached page or /offline
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Attempt network fetch with timeout
          const networkPromise = fetch(request);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Network timeout")), 2500)
          );

          const response = await Promise.race([networkPromise, timeoutPromise]);
          if (response && response.status === 200) {
            return response;
          }
          throw new Error("Invalid network response");
        } catch {
          // Offline fallback
          const staticCache = await caches.open(STATIC_CACHE);
          // Try matching exact URL first
          const cachedMatch = await staticCache.match(request);
          if (cachedMatch) return cachedMatch;

          // Try matching home root shell
          const rootMatch = await staticCache.match("/");
          if (rootMatch) return rootMatch;

          // Fallback to dedicated offline page
          const offlinePage = await staticCache.match("/offline");
          if (offlinePage) return offlinePage;

          return new Response("Offline. Please check your network connection.", {
            headers: { "Content-Type": "text/plain" },
          });
        }
      })()
    );
    return;
  }

  // Strategy B: Next.js Static Build Chunks & Icons -> Cache-First with Network Fallback
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/screenshots/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // Strategy C: Same-Origin Static Media (images, fonts, stylesheets) -> Stale-While-Revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".jpeg") ||
      url.pathname.endsWith(".webp") ||
      url.pathname.endsWith(".svg") ||
      url.pathname.endsWith(".woff2") ||
      url.pathname.endsWith(".woff") ||
      url.pathname.endsWith(".css"))
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
    );
  }
});
