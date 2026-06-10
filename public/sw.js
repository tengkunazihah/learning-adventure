// Learning Adventure - Service Worker
// Implements offline caching for PWA support

const CACHE_NAME = 'learning-adventure-v1';

// Core shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Asset file extensions that should use cache-first strategy
const CACHE_FIRST_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.mp3',
  '.wav',
  '.ogg',
  '.woff',
  '.woff2',
];

// Static asset extensions (JS, CSS) - also cache-first
const STATIC_ASSET_EXTENSIONS = ['.js', '.css'];

/**
 * Install event: pre-cache core shell assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately without waiting for existing clients to close
  self.skipWaiting();
});

/**
 * Activate event: clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

/**
 * Determine the caching strategy based on the request URL
 */
function getStrategy(url) {
  const pathname = new URL(url).pathname;

  // Cache-first for images and audio files
  if (CACHE_FIRST_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return 'cache-first';
  }

  // Cache-first for static assets (JS, CSS) - these are hashed by Next.js
  if (STATIC_ASSET_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return 'cache-first';
  }

  // Network-first for HTML pages (navigation requests)
  return 'network-first';
}

/**
 * Cache-first strategy: try cache, fall back to network, cache the response
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return a fallback for images/audio if offline and not cached
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Network-first strategy: try network, fall back to cache, show offline message
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return an offline fallback page for navigation requests
    if (request.mode === 'navigate') {
      return new Response(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Learning Adventure</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #FFF8E1;
      color: #333;
      text-align: center;
      padding: 2rem;
    }
    .container {
      max-width: 480px;
    }
    h1 {
      font-size: 2rem;
      color: #FF6B35;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.25rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    a {
      display: inline-block;
      background: #FF6B35;
      color: white;
      padding: 1rem 2rem;
      border-radius: 1rem;
      text-decoration: none;
      font-size: 1.25rem;
      font-weight: bold;
      min-width: 80px;
      min-height: 80px;
      line-height: 80px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Oops! You're Offline</h1>
    <p>This activity hasn't been saved for offline use yet. Connect to the internet and try again, or go back to an activity you've already visited!</p>
    <a href="/">Go Home</a>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Fetch event: route requests to appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  const strategy = getStrategy(request.url);

  if (strategy === 'cache-first') {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});
