'use client'

import { apiFetch, isApiConfigured } from '@/lib/api/client'
import type { AppNotification } from '@/lib/types'

type NotificationApiRole = 'student' | 'teacher'

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

async function fetchNotificationsForRole(role: NotificationApiRole) {
  const notifications = await apiFetch<ApiNotification[]>(
    '/notifications/me',
    undefined,
    role,
  )

  return notifications.map(mapApiNotification)
}

async function markNotificationAsReadForRole(
  notificationId: string,
  role: NotificationApiRole,
) {
  const notification = await apiFetch<ApiNotification>(
    `/notifications/${notificationId}/read`,
    { method: 'PATCH' },
    role,
  )

  return mapApiNotification(notification)
}

async function markAllNotificationsAsReadForRole(role: NotificationApiRole) {
  return apiFetch<void>('/notifications/me/read-all', { method: 'PATCH' }, role)
}

async function fetchUnreadNotificationCountForRole(role: NotificationApiRole) {
  return apiFetch<{ userId: string; unreadCount: number }>(
    '/notifications/me/unread-count',
    undefined,
    role,
  )
}

export async function fetchMyNotifications() {
  return fetchNotificationsForRole('student')
}

export async function fetchTeacherNotifications() {
  return fetchNotificationsForRole('teacher')
}

export async function markMyNotificationAsRead(notificationId: string) {
  return markNotificationAsReadForRole(notificationId, 'student')
}

export async function markTeacherNotificationAsRead(notificationId: string) {
  return markNotificationAsReadForRole(notificationId, 'teacher')
}

export async function markAllMyNotificationsAsRead() {
  return markAllNotificationsAsReadForRole('student')
}

export async function markAllTeacherNotificationsAsRead() {
  return markAllNotificationsAsReadForRole('teacher')
}

export async function fetchMyUnreadNotificationCount() {
  return fetchUnreadNotificationCountForRole('student')
}

export async function fetchTeacherUnreadNotificationCount() {
  return fetchUnreadNotificationCountForRole('teacher')
}

export { isApiConfigured }
