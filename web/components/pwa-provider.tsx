'use client'

import { useEffect } from 'react'
import { syncOfflineExamQueue } from '@/lib/pwa/offline-exam'

export function PwaProvider() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    void navigator.serviceWorker.register('/sw.js').catch(() => null)
  }, [])

  useEffect(() => {
    const sync = () => {
      void syncOfflineExamQueue().catch(() => null)
    }

    sync()
    window.addEventListener('online', sync)
    window.addEventListener('focus', sync)

    return () => {
      window.removeEventListener('online', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  return null
}
