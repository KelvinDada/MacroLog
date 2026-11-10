const CACHE_NAME = 'macrolog-static-v1'
const APP_SCOPE = new URL('/MacroLog/', self.location.origin).pathname

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll([
      APP_SCOPE,
      `${APP_SCOPE}manifest.webmanifest`,
      `${APP_SCOPE}icons/icon.svg`,
    ])
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter((name) => name.startsWith('macrolog-static-') && name !== CACHE_NAME).map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(APP_SCOPE)) return

  // Never cache API-like paths, IndexedDB data, or non-static document requests.
  if (request.mode === 'navigate') {
    if (url.pathname !== APP_SCOPE && url.pathname !== `${APP_SCOPE}index.html`) return
    event.respondWith((async () => {
      try {
        const response = await fetch(request)
        const cache = await caches.open(CACHE_NAME)
        await cache.put(APP_SCOPE, response.clone())
        return response
      } catch {
        const cache = await caches.open(CACHE_NAME)
        return (await cache.match(APP_SCOPE)) || Response.error()
      }
    })())
    return
  }

  if (url.pathname.includes('/api/') || !/\.(?:js|css|svg|png|ico|webmanifest|woff2?)$/i.test(url.pathname)) return
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    if (cached) return cached
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      await cache.put(request, response.clone())
    }
    return response
  })())
})
