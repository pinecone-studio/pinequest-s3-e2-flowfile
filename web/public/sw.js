const STATIC_CACHE = 'seedcone-static-v1'
const RUNTIME_CACHE = 'seedcone-runtime-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([
        '/',
        '/student',
        '/manifest.webmanifest',
        '/icon.svg',
      ]).catch(() => undefined),
    ),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/student')),
      ),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          const cloned = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned)).catch(() => undefined)
          return response
        })
        .catch(() => cached)

      return cached || networkFetch
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const examId = event.notification.data?.examId
  const targetPath = typeof examId === 'string' && examId.length > 0
    ? `/student/exams/${examId}`
    : '/student'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.postMessage({ type: 'seedcone:notification-click', examId })
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetPath)
      }

      return undefined
    }),
  )
})
