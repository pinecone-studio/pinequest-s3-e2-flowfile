'use client'

import { getApiUrl, getDevAuthToken, isApiConfigured } from '@/lib/api/client'
import type { StudentProctoringViolationType } from '@/lib/api/student-exams'

export interface TeacherLiveProctoringViolation {
  id: string
  teacherId: string
  teacherName: string | null
  studentId: string
  studentName: string
  examId: string
  examTitle: string
  assignmentId: string
  classId: string | null
  className: string | null
  type: StudentProctoringViolationType
  severity: 'low' | 'medium' | 'high'
  details: string | null
  metadataJson: string | null
  createdAt: string
}

type TeacherProctoringStreamEvent =
  | {
      type: 'connected'
      teacherId: string
      connectedAt: string
    }
  | {
      type: 'heartbeat'
      timestamp: string
    }
  | {
      type: 'violation'
      violation: TeacherLiveProctoringViolation
    }

function createTeacherStreamHeaders() {
  const headers = new Headers()
  const token = typeof window === 'undefined' ? '' : getDevAuthToken('teacher')

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

function parseSseChunk(
  chunk: string,
  onEvent: (event: TeacherProctoringStreamEvent) => void,
) {
  const normalized = chunk.replaceAll('\r\n', '\n')
  const eventBlocks = normalized.split('\n\n')
  const remainder = eventBlocks.pop() ?? ''

  for (const block of eventBlocks) {
    const lines = block.split('\n')
    let data = ''

    for (const line of lines) {
      if (line.startsWith('data:')) {
        data += `${line.slice(5).trim()}\n`
      }
    }

    if (!data.trim()) {
      continue
    }

    try {
      onEvent(JSON.parse(data.trim()) as TeacherProctoringStreamEvent)
    } catch {
      continue
    }
  }

  return remainder
}

export function subscribeToTeacherProctoringStream(params: {
  onEvent: (event: TeacherProctoringStreamEvent) => void
  onError?: (error: unknown) => void
}) {
  if (typeof window === 'undefined' || !isApiConfigured()) {
    return () => undefined
  }

  const url = getApiUrl('/proctoring/stream')

  if (!url) {
    return () => undefined
  }

  let disposed = false
  let reconnectTimeout: number | null = null
  let abortController: AbortController | null = null

  const connect = async () => {
    abortController = new AbortController()

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: createTeacherStreamHeaders(),
        cache: 'no-store',
        signal: abortController.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error(`Teacher proctoring stream failed: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!disposed) {
        const { done, value } = await reader.read()

        if (done) {
          throw new Error('Teacher proctoring stream closed')
        }

        buffer += decoder.decode(value, { stream: true })
        buffer = parseSseChunk(buffer, params.onEvent)
      }
    } catch (error) {
      if (disposed || abortController.signal.aborted) {
        return
      }

      params.onError?.(error)
      reconnectTimeout = window.setTimeout(() => {
        void connect()
      }, 3_000)
    }
  }

  void connect()

  return () => {
    disposed = true

    if (reconnectTimeout) {
      window.clearTimeout(reconnectTimeout)
    }

    abortController?.abort()
  }
}
