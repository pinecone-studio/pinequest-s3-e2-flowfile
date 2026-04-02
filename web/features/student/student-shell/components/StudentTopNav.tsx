'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck, User } from 'lucide-react'

import { CURRENT_STUDENT_ID } from '@/lib/data'
import { getNotificationEventName, getNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import { StudentPwaControls } from '@/features/student/student-shell/components/StudentPwaControls'

import type { AppNotification } from '@/lib/types'
import type { StudentNavLink } from '@/features/student/student-shell/utils/student-shell.constants'

type StudentTopNavProps = {
  pathname: string
  navLinks: StudentNavLink[]
  studentDisplayName: string
}

function formatNotificationTime(value: string) {
  const date = new Date(value)
  return new Intl.DateTimeFormat('mn-MN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

async function showBrowserNotification(notification: AppNotification) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready.catch(() => null)
    if (registration) {
      await registration.showNotification(notification.title, {
        body: notification.body,
        data: {
          examId: notification.examId,
        },
        tag: notification.id,
      })
      return
    }
  }

  new Notification(notification.title, { body: notification.body })
}

export function StudentTopNav({ pathname, navLinks, studentDisplayName }: StudentTopNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const hasHydrated = useRef(false)
  const shownNotificationIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    const loadNotifications = () => {
      const nextNotifications = getNotifications(CURRENT_STUDENT_ID)
      setNotifications((current) => {
        if (
          current.length === nextNotifications.length &&
          current.every((item, index) =>
            item.id === nextNotifications[index]?.id &&
            item.isRead === nextNotifications[index]?.isRead &&
            item.createdAt === nextNotifications[index]?.createdAt,
          )
        ) {
          return current
        }

        return nextNotifications
      })
    }

    loadNotifications()

    const syncEvents = [getNotificationEventName(), 'focus', 'storage'] as const

    syncEvents.forEach((eventName) => {
      window.addEventListener(eventName, loadNotifications)
    })

    return () => {
      syncEvents.forEach((eventName) => {
        window.removeEventListener(eventName, loadNotifications)
      })
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated.current) {
      notifications.forEach((item) => {
        shownNotificationIds.current.add(item.id)
      })
      hasHydrated.current = true
      return
    }

    const nextUnread = notifications.filter((item) => !item.isRead && !shownNotificationIds.current.has(item.id))

    nextUnread.forEach((item) => {
      shownNotificationIds.current.add(item.id)
      void showBrowserNotification(item)
    })
  }, [notifications])

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  )

  return (
    <nav className="fixed inset-x-0 top-9 z-30 flex flex-col gap-3 border-b border-card-border bg-white px-4 py-3 md:h-14 md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
        <Link href="/student" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-primary text-[14px] font-bold">e</span>
          </div>
          <span className="text-[15px] font-semibold" style={{ color: '#216ad7' }}>е-shalgalt</span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:overflow-visible md:pb-0">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] transition-colors',
                  isActive
                    ? 'bg-active-nav text-primary font-medium'
                    : 'text-text-secondary hover:text-foreground hover:bg-table-header'
                )}
              >
                <Icon size={16} strokeWidth={1.5} />
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StudentPwaControls />

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative w-9 h-9 rounded-lg hover:bg-table-header flex items-center justify-center text-text-secondary hover:text-foreground transition-colors"
            aria-label="Мэдэгдэл"
          >
            <Bell size={18} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-[#D64545] text-white text-[11px] font-semibold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-[320px] rounded-2xl border border-card-border bg-white shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
                <div>
                  <div className="text-[14px] font-semibold text-foreground">Мэдэгдэл</div>
                  <div className="text-[12px] text-text-secondary">{unreadCount} уншаагүй</div>
                </div>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsRead(CURRENT_STUDENT_ID)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-primary"
                  >
                    <CheckCheck size={14} strokeWidth={1.5} />
                    Бүгдийг уншсан
                  </button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[13px] text-text-secondary">
                    Одоогоор мэдэгдэл алга байна.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => markNotificationRead(notification.id)}
                      className={cn(
                        'w-full text-left px-4 py-3 border-b border-card-border/70 transition-colors',
                        notification.isRead ? 'bg-white' : 'bg-[#EEF5FF] hover:bg-[#E7F0FF]'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-foreground">{notification.title}</div>
                          <div className="mt-1 text-[12px] leading-5 text-text-secondary">{notification.body}</div>
                        </div>
                        {!notification.isRead && (
                          <span className="mt-1 w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <div className="mt-2 text-[11px] text-text-secondary">
                        {formatNotificationTime(notification.createdAt)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-table-header cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-[13px]">
            <div className="font-medium text-foreground">{studentDisplayName}</div>
          </div>
        </div>
      </div>
    </nav>
  )
}
