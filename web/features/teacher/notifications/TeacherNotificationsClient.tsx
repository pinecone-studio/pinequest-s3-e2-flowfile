'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, CheckCheck, Clock3, Eye, ShieldAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  fetchTeacherNotifications,
  isApiConfigured,
  markAllTeacherNotificationsAsRead,
  markTeacherNotificationAsRead,
} from '@/lib/api/notifications'
import { fetchUsersByRole, type TeacherUser } from '@/lib/api/teacher-exams'
import { CURRENT_TEACHER_ID, getAll, initialUsers } from '@/lib/data'
import {
  getNotificationEventName,
  getNotifications,
  getTeacherNotificationRefreshEventName,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/notifications'
import type { AppNotification, User } from '@/lib/types'
import { cn } from '@/lib/utils'

type NotificationFilter = 'all' | 'suspicious_event' | 'exam_submitted' | 'exam_started'

function TeacherNotificationsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function replaceStudentIds(text: string, studentMap: Map<string, string>) {
  let nextText = text

  studentMap.forEach((studentName, studentId) => {
    nextText = nextText.replaceAll(studentId, studentName)
  })

  return nextText
}

function translateSuspiciousEvent(body: string) {
  return body
    .replace('switched away from the exam tab', 'tab-аа сольсон')
    .replace('left the exam window', 'шалгалтын цонхоос гарсан')
    .replace('left the camera frame', 'камераас гарсан')
    .replace('triggered a multiple-face alert', 'олон нүүрний дохио өгсөн')
    .replace('triggered an audio alert', 'дууны дохио өгсөн')
    .replace('changed device or camera context', 'төхөөрөмж эсвэл камерын орчноо сольсон')
    .replace('looked away to the left', 'зүүн тийш харсан')
    .replace('looked away to the right', 'баруун тийш харсан')
    .replace('looked upward', 'дээш харсан')
    .replace('looked downward', 'доош харсан')
    .replace('A face_not_detected event was reported during an active exam session.', 'Камераас гарсан дохио шалгалтын үеэр ирлээ.')
    .replace('A multiple_faces_detected event was reported during an active exam session.', 'Олон нүүр илэрсэн дохио шалгалтын үеэр ирлээ.')
    .replace('A tab_switch event was reported during an active exam session.', 'Tab сольсон дохио шалгалтын үеэр ирлээ.')
    .replace('A window_blur event was reported during an active exam session.', 'Шалгалтын цонхоос гарсан дохио шалгалтын үеэр ирлээ.')
    .replace('A audio_detected event was reported during an active exam session.', 'Дуу чимээний дохио шалгалтын үеэр ирлээ.')
    .replace('A device_changed event was reported during an active exam session.', 'Төхөөрөмжийн өөрчлөлтийн дохио шалгалтын үеэр ирлээ.')
    .replace('A looking_left event was reported during an active exam session.', 'Зүүн тийш харсан дохио шалгалтын үеэр ирлээ.')
    .replace('A looking_right event was reported during an active exam session.', 'Баруун тийш харсан дохио шалгалтын үеэр ирлээ.')
    .replace('A looking_up event was reported during an active exam session.', 'Дээш харсан дохио шалгалтын үеэр ирлээ.')
    .replace('A looking_down event was reported during an active exam session.', 'Доош харсан дохио шалгалтын үеэр ирлээ.')
    .replace('during', 'үед')
    .replace('Details:', 'Тайлбар:')
}

function formatTeacherNotificationBody(
  notification: AppNotification,
  studentMap: Map<string, string>,
) {
  const body = replaceStudentIds(notification.body, studentMap)

  if (notification.type === 'suspicious_event') {
    return translateSuspiciousEvent(body)
  }

  return body
}

function getNotificationMeta(notification: AppNotification) {
  switch (notification.type) {
    case 'suspicious_event':
      return {
        label: 'Хяналтын дохио',
        icon: ShieldAlert,
        tone: 'text-[#B45309] bg-[#FFF7E8] border-[#F5D7A1]',
      }
    case 'exam_submitted':
      return {
        label: 'Дуусгасан',
        icon: Eye,
        tone: 'text-[#1A7A4A] bg-[#EAF7EF] border-[#B7E2C5]',
      }
    case 'exam_started':
      return {
        label: 'Эхэлсэн',
        icon: Clock3,
        tone: 'text-[#0066FF] bg-[#EEF5FF] border-[#C9DCFF]',
      }
    default:
      return {
        label: 'Мэдэгдэл',
        icon: Bell,
        tone: 'text-[#5A6474] bg-[#F5F7FA] border-[#DDE1E7]',
      }
  }
}

async function loadTeacherNotificationFeed() {
  if (isApiConfigured()) {
    const [notifications, students] = await Promise.all([
      fetchTeacherNotifications(),
      fetchUsersByRole('student').catch(() => [] as TeacherUser[]),
    ])

    return {
      notifications,
      students,
    }
  }

  const storedUsers = getAll<User>('users')
  const users = storedUsers.length > 0 ? storedUsers : initialUsers

  return {
    notifications: getNotifications(CURRENT_TEACHER_ID),
    students: users
      .filter((user) => user.role === 'student')
      .map<TeacherUser>((user) => ({
        id: user.id,
        name: user.name,
        email: `${user.id.toLowerCase()}@seedcone.local`,
        role: 'student',
      })),
  }
}

export function TeacherNotificationsClient() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [students, setStudents] = useState<TeacherUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all')

  useEffect(() => {
    let isMounted = true

    const load = async (refresh = false) => {
      if (refresh) {
        setIsRefreshing(true)
      }

      try {
        const payload = await loadTeacherNotificationFeed()

        if (!isMounted) {
          return
        }

        setNotifications(payload.notifications)
        setStudents(payload.students)
      } catch {
        if (!isMounted) {
          return
        }
      } finally {
        if (!isMounted) {
          return
        }

        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    void load()

    const syncEvents = isApiConfigured()
      ? ([getTeacherNotificationRefreshEventName(), 'focus'] as const)
      : ([getNotificationEventName(), 'storage', 'focus'] as const)

    const handleSync = () => {
      void load(true)
    }

    syncEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleSync)
    })

    const intervalId = window.setInterval(handleSync, isApiConfigured() ? 15000 : 30000)

    return () => {
      isMounted = false
      syncEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleSync)
      })
      window.clearInterval(intervalId)
    }
  }, [])

  const studentMap = useMemo(
    () => new Map(students.map((student) => [student.id, student.name] as const)),
    [students],
  )
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  )
  const filteredNotifications = useMemo(
    () =>
      activeFilter === 'all'
        ? notifications
        : notifications.filter((notification) => notification.type === activeFilter),
    [activeFilter, notifications],
  )
  const stats = useMemo(
    () => ({
      total: notifications.length,
      suspicious: notifications.filter((item) => item.type === 'suspicious_event').length,
      submitted: notifications.filter((item) => item.type === 'exam_submitted').length,
      started: notifications.filter((item) => item.type === 'exam_started').length,
    }),
    [notifications],
  )

  const handleMarkAllRead = async () => {
    try {
      if (isApiConfigured()) {
        await markAllTeacherNotificationsAsRead()
      } else {
        markAllNotificationsRead(CURRENT_TEACHER_ID)
      }

      setNotifications((current) =>
        current.map((item) => (item.isRead ? item : { ...item, isRead: true })),
      )
    } catch {
      return
    }
  }

  const handleMarkRead = async (notificationId: string) => {
    try {
      if (isApiConfigured()) {
        const updated = await markTeacherNotificationAsRead(notificationId)
        setNotifications((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        )
        return
      }

      markNotificationRead(notificationId)
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId && !item.isRead ? { ...item, isRead: true } : item,
        ),
      )
    } catch {
      return
    }
  }

  if (isLoading) {
    return <TeacherNotificationsSkeleton />
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1A1A2E]">Мэдэгдэл</h1>
          <p className="text-[13px] text-[#5A6474]">
            Tab сольсон, өөр тийш харсан, шалгалтаа дуусгасан сурагчдын feed.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isRefreshing && <Spinner className="size-4 text-[#0066FF]" />}
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={notifications.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-[#DDE1E7] bg-white px-4 py-2 text-[13px] font-medium text-[#1A1A2E] disabled:opacity-50"
          >
            <CheckCheck size={14} strokeWidth={1.8} />
            Бүгдийг уншсан болгох
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Нийт', value: stats.total, color: '#1A1A2E' },
          { label: 'Уншаагүй', value: unreadCount, color: '#0066FF' },
          { label: 'Сэжигтэй', value: stats.suspicious, color: '#B45309' },
          { label: 'Дуусгасан', value: stats.submitted, color: '#1A7A4A' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border bg-white p-4"
            style={{ borderColor: '#DDE1E7' }}
          >
            <div className="text-[12px] text-[#8A94A0]">{item.label}</div>
            <div className="mt-2 text-[28px] font-semibold" style={{ color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ['all', 'Бүгд'],
          ['suspicious_event', 'Сэжигтэй'],
          ['exam_submitted', 'Дуусгасан'],
          ['exam_started', 'Эхэлсэн'],
        ] as Array<[NotificationFilter, string]>).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActiveFilter(value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors',
              activeFilter === value
                ? 'border-[#0066FF] bg-[#EEF5FF] text-[#0066FF]'
                : 'border-[#DDE1E7] bg-white text-[#5A6474]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DDE1E7] bg-white px-5 py-14 text-center">
            <Bell size={28} strokeWidth={1.6} className="mx-auto mb-3 text-[#8A94A0]" />
            <div className="text-[14px] font-medium text-[#1A1A2E]">Одоогоор мэдэгдэл алга</div>
            <div className="mt-1 text-[12px] text-[#8A94A0]">
              Сурагч шалгалт эхлүүлэх, дуусгах эсвэл proctoring alert үүсэхэд энд харагдана.
            </div>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const meta = getNotificationMeta(notification)
            const Icon = meta.icon

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => void handleMarkRead(notification.id)}
                className={cn(
                  'w-full rounded-2xl border bg-white p-4 text-left transition-colors',
                  notification.isRead ? 'border-[#DDE1E7]' : 'border-[#BFD4FF] bg-[#F8FBFF]',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={cn('rounded-xl border p-2', meta.tone)}>
                      <Icon size={18} strokeWidth={1.7} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#1A1A2E]">
                          {meta.label}
                        </span>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-[#0066FF]" />
                        )}
                      </div>
                      <p className="mt-1 text-[14px] leading-6 text-[#1A1A2E]">
                        {formatTeacherNotificationBody(notification, studentMap)}
                      </p>
                      <div className="mt-2 text-[12px] text-[#8A94A0]">
                        {formatNotificationTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-[11px] text-[#8A94A0]">
                    {notification.isRead ? 'Уншсан' : 'Шинэ'}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
