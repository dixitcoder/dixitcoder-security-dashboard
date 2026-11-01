const CACHE_NAME = 'dixitcoder-shell-v1'
const ASSET_CACHE = 'dixitcoder-assets-v1'
const SHELL_ASSETS = ['/', '/manifest.webmanifest', '/images/pwa-icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) =>
          key.startsWith('dixitcoder-') && ![CACHE_NAME, ASSET_CACHE].includes(key),
        ).map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (
    request.method !== 'GET'
    || url.origin !== self.location.origin
    || url.pathname.startsWith('/api/')
    || url.pathname.startsWith('/scan-history')
    || url.pathname.startsWith('/uploads/')
  ) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/')),
    )
    return
  }

  if (SHELL_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    )
    return
  }

  if (url.pathname.startsWith('/assets/') || /\.(?:js|css|woff2?|png|jpe?g|svg|webp)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        try {
          const response = await fetch(request)
          if (response.ok) await cache.put(request, response.clone())
          return response
        } catch (error) {
          if (cached) return cached
          throw error
        }
      }),
    )
  }
})
