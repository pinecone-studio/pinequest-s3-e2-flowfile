const STATIC_CACHE = 'seedcone-static-v1'
const RUNTIME_CACHE = 'seedcone-runtime-v1'
const APP_SHELL = ['/', '/student', '/student/results', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
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
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined)
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return (
            cached ||
            (await caches.match('/student')) ||
            (await caches.match('/')) ||
            Response.error()
          )
        }),
    )
    return
  }

  const isStaticAsset = ['style', 'script', 'worker', 'font', 'image'].includes(
    request.destination,
  )

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached
      }

      if (!isStaticAsset) {
        return fetch(request)
          .then((response) => {
            const copy = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined)
            return response
          })
          .catch(() => Response.error())
      }

      return fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined)
          return response
        })
        .catch(() => cached || Response.error())
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const examId = event.notification.data?.examId
  const targetPath =
    typeof examId === 'string' && examId.length > 0
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
