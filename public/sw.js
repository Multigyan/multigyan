// Service worker to force cache updates
self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Delete all caches on activation
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName)
        })
      )
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim()
    })
  )
})

// Intercept fetch requests and always fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store'
    }).catch(() => {
      // If network fails, try cache as fallback
      return caches.match(event.request)
    })
  )
})
