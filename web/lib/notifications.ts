import { getAll } from '@/lib/data/local-storage'
import type { AppNotification, Exam, SchoolClass } from '@/lib/types'

const NOTIFICATIONS_KEY = 'notifications'
const NOTIFICATION_EVENT = 'seedcone:notifications-changed'

function emitNotificationsChanged() {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT))
}

export function getNotificationEventName() {
  return NOTIFICATION_EVENT
}

export function getNotifications(recipientId?: string): AppNotification[] {
  const notifications = getAll<AppNotification>(NOTIFICATIONS_KEY)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (!recipientId) {
    return notifications
  }

  return notifications.filter((item) => item.recipientId === recipientId)
}

export function saveNotifications(items: AppNotification[]) {
  if (typeof window === 'undefined' || items.length === 0) {
    return
  }

  const existing = getNotifications()
  const existingIds = new Set(existing.map((item) => item.id))
  const merged = [...existing]

  for (const item of items) {
    if (!existingIds.has(item.id)) {
      merged.push(item)
    }
  }

  if (merged.length === existing.length) {
    return
  }

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(merged))
  emitNotificationsChanged()
}

export function markNotificationRead(notificationId: string) {
  if (typeof window === 'undefined') {
    return
  }

  let hasChanged = false
  const updated = getNotifications().map((item) =>
    item.id === notificationId && !item.isRead
      ? (hasChanged = true, { ...item, isRead: true })
      : item,
  )

  if (!hasChanged) {
    return
  }

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
  emitNotificationsChanged()
}

export function markAllNotificationsRead(recipientId: string) {
  if (typeof window === 'undefined') {
    return
  }

  let hasChanged = false
  const updated = getNotifications().map((item) =>
    item.recipientId === recipientId && !item.isRead
      ? (hasChanged = true, { ...item, isRead: true })
      : item,
  )

  if (!hasChanged) {
    return
  }

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated))
  emitNotificationsChanged()
}

export function buildExamAssignmentNotifications(params: {
  exam: Exam
  selectedClasses: SchoolClass[]
}) {
  const { exam, selectedClasses } = params
  const createdAt = new Date().toISOString()

  return selectedClasses.flatMap((schoolClass) =>
    schoolClass.studentIds.map<AppNotification>((studentId) => ({
      id: `notif-${exam.id}-${schoolClass.id}-${studentId}`,
      recipientId: studentId,
      title: 'Шинэ шалгалт оноогдлоо',
      body: `"${exam.title}" шалгалт ${schoolClass.name} дээр нэмэгдлээ.`,
      type: 'exam_assigned',
      examId: exam.id,
      classId: schoolClass.id,
      isRead: false,
      createdAt,
    })),
  )
}
