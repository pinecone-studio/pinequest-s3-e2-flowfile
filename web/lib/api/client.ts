'use client'

import {
  CURRENT_STUDENT_ID,
  CURRENT_TEACHER_ID,
  getCurrentStudent,
  getCurrentTeacher,
} from '@/lib/data'

type DevRole = 'student' | 'teacher'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || ''
const LOCAL_PROXY_PREFIX = '/api/proxy'

function encodeTokenPayload(payload: Record<string, unknown>) {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

function getStorageKey(role: DevRole) {
  return `seedcone.dev_auth_token.${role}`
}

function getUserIdStorageKey(role: DevRole) {
  return `seedcone.dev_user_id.${role}`
}

export function isApiConfigured() {
  return apiBaseUrl.length > 0
}

function shouldUseLocalApiProxy() {
  if (typeof window === 'undefined' || !isApiConfigured()) {
    return false
  }

  const hostname = window.location.hostname

  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return false
  }

  try {
    const resolvedApiUrl = new URL(apiBaseUrl)
    return resolvedApiUrl.origin !== window.location.origin
  } catch {
    return false
  }
}

export function getApiUrl(path: string) {
  if (!isApiConfigured()) {
    return null
  }

  if (shouldUseLocalApiProxy()) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `${LOCAL_PROXY_PREFIX}${normalizedPath}`
  }

  return new URL(path, apiBaseUrl).toString()
}

function createDevTokenPayload(role: DevRole) {
  const currentUser = role === 'teacher' ? getCurrentTeacher() : getCurrentStudent()
  const fallbackUserId = role === 'teacher' ? CURRENT_TEACHER_ID : CURRENT_STUDENT_ID

  const userId =
    window.localStorage.getItem(getUserIdStorageKey(role)) ??
    window.localStorage.getItem('seedcone.dev_user_id') ??
    process.env.NEXT_PUBLIC_DEV_USER_ID ??
    currentUser?.id ??
    fallbackUserId

  return {
    userId,
    role,
    sub: `dev-${userId}`,
    email:
      process.env.NEXT_PUBLIC_DEV_USER_EMAIL ??
      `${role}.${String(userId).toLowerCase()}@seedcone.local`,
    name: currentUser?.name ?? userId,
  }
}

export function setDevAuthIdentity(
  role: DevRole,
  payload: {
    userId: string
    email: string
    name: string
    imageUrl?: string | null
  },
) {
  if (typeof window === 'undefined') {
    return ''
  }

  const token = encodeTokenPayload({
    userId: payload.userId,
    role,
    sub: `dev-${payload.userId}`,
    email: payload.email,
    name: payload.name,
    imageUrl: payload.imageUrl ?? null,
  })

  window.localStorage.setItem(getUserIdStorageKey(role), payload.userId)
  window.localStorage.setItem(getStorageKey(role), token)

  return token
}

export function getDevAuthToken(role: DevRole = 'student') {
  if (typeof window === 'undefined') {
    return ''
  }

  const storageKey = getStorageKey(role)
  const existing = window.localStorage.getItem(storageKey)
  if (existing) {
    return existing
  }

  const token = encodeTokenPayload(createDevTokenPayload(role))
  window.localStorage.setItem(storageKey, token)
  return token
}

export function getAuthHeaders(role: DevRole = 'student') {
  const token = getDevAuthToken(role)

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  role: DevRole = 'student',
): Promise<T> {
  const url = getApiUrl(path)

  if (!url) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.')
  }

  const headers = new Headers(init?.headers)

  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (!headers.has('Authorization')) {
    const authHeaders = getAuthHeaders(role)
    if (authHeaders.Authorization) {
      headers.set('Authorization', authHeaders.Authorization)
    }
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json() as Promise<T>
}
