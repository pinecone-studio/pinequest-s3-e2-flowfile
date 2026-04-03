'use client'

import { apiFetch, isApiConfigured } from '@/lib/api/client'
import type { AppNotification } from '@/lib/types'

type ApiNotificationType =
  | 'exam_started'
  | 'exam_submitted'
  | 'suspicious_event'
  | 'exam_published'

interface ApiNotification {
  id: string
  recipientId: string
  examId: string | null
  sessionId: string | null
  title: string
  body: string
  type: ApiNotificationType
  isRead: boolean
  createdAt: string
}

function mapNotificationType(type: ApiNotificationType): AppNotification['type'] {
  if (type === 'exam_published') {
    return 'exam_assigned'
  }

  return type
}

function mapApiNotification(notification: ApiNotification): AppNotification {
  return {
    id: notification.id,
    recipientId: notification.recipientId,
    title: notification.title,
    body: notification.body,
    type: mapNotificationType(notification.type),
    examId: notification.examId ?? undefined,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  }
}

export async function fetchMyNotifications() {
  const notifications = await apiFetch<ApiNotification[]>(
    '/notifications/me',
    undefined,
    'student',
  )

  return notifications.map(mapApiNotification)
}

export async function markMyNotificationAsRead(notificationId: string) {
  const notification = await apiFetch<ApiNotification>(
    `/notifications/${notificationId}/read`,
    { method: 'PATCH' },
    'student',
  )

  return mapApiNotification(notification)
}

export async function markAllMyNotificationsAsRead() {
  return apiFetch<void>('/notifications/me/read-all', { method: 'PATCH' }, 'student')
}

export { isApiConfigured }
