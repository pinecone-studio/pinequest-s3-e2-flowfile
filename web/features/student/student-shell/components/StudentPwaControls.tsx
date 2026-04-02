'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, RefreshCw, Wifi, WifiOff } from 'lucide-react'

import { getOfflineQueueSnapshot, syncOfflineExamQueue } from '@/lib/pwa/offline-exam'

type BeforeInstallPromptEventLike = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function StudentPwaControls() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEventLike | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const updateState = () => {
      setIsOnline(navigator.onLine)
      const snapshot = getOfflineQueueSnapshot()
      setPendingCount(snapshot.drafts.length + snapshot.submissions.length)
    }

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPromptEvent(event as BeforeInstallPromptEventLike)
    }

    updateState()
    window.addEventListener('online', updateState)
    window.addEventListener('offline', updateState)
    window.addEventListener('focus', updateState)
    window.addEventListener('storage', updateState)
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)

    return () => {
      window.removeEventListener('online', updateState)
      window.removeEventListener('offline', updateState)
      window.removeEventListener('focus', updateState)
      window.removeEventListener('storage', updateState)
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
    }
  }, [])

  const statusLabel = useMemo(() => {
    if (!isOnline) return 'Offline'
    if (pendingCount > 0) return `${pendingCount} sync хүлээж байна`
    return 'Online'
  }, [isOnline, pendingCount])

  const handleInstall = async () => {
    if (!installPromptEvent) return
    await installPromptEvent.prompt()
    await installPromptEvent.userChoice.catch(() => null)
    setInstallPromptEvent(null)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncOfflineExamQueue()
      const snapshot = getOfflineQueueSnapshot()
      setPendingCount(snapshot.drafts.length + snapshot.submissions.length)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-2 rounded-xl bg-table-header px-3 py-2 text-[12px] text-text-secondary">
        {isOnline ? <Wifi size={14} strokeWidth={1.7} className="text-emerald-600" /> : <WifiOff size={14} strokeWidth={1.7} className="text-amber-600" />}
        <span>{statusLabel}</span>
      </div>
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={() => void handleSync()}
          disabled={!isOnline || isSyncing}
          className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-white px-3 py-2 text-[12px] font-medium text-primary disabled:opacity-50"
        >
          <RefreshCw size={14} strokeWidth={1.7} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Sync хийж байна' : 'Sync'}
        </button>
      )}
      {installPromptEvent && (
        <button
          type="button"
          onClick={() => void handleInstall()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-[12px] font-medium text-white"
        >
          <Download size={14} strokeWidth={1.7} />
          App суулгах
        </button>
      )}
    </div>
  )
}
