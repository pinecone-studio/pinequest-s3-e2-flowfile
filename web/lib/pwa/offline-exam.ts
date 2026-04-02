'use client'

import {
  saveOfflineDraft,
  saveOfflineSubmission,
  type StudentExamQuestion,
} from '@/lib/api/student-exams'
import { isApiConfigured } from '@/lib/api/client'

type CachedAttemptPayload = {
  exam: {
    id: string
    title: string
    subjectId: string
    duration: number
    teacherId?: string
  }
  sessionId: string | null
  assignmentId: string
  questions: StudentExamQuestion[]
  answers: Record<string, string>
  timeRemaining: number
  startedAt: string
}

type OfflineDraftPayload = {
  draftKey: string
  assignmentId: string
  examId: string
  studentId: string
  answers: Record<string, string | string[]>
  markedForReview: string[]
  currentIndex: number
  startedAt: string
  updatedAt: string
}

type OfflineSubmissionPayload = {
  assignmentId: string
  examId: string
  studentId: string
  attempt: Record<string, unknown>
  result: Record<string, unknown>
  queuedAt: string
}

const ATTEMPT_PREFIX = 'seedcone.offline_attempt'
const DRAFT_QUEUE_KEY = 'seedcone.offline_draft_queue'
const SUBMISSION_QUEUE_KEY = 'seedcone.offline_submission_queue'

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getAttemptCacheKey(examId: string, studentId: string) {
  return `${ATTEMPT_PREFIX}:${studentId}:${examId}`
}

export function cacheExamAttempt(
  examId: string,
  studentId: string,
  payload: CachedAttemptPayload,
) {
  writeJson(getAttemptCacheKey(examId, studentId), payload)
}

export function readCachedExamAttempt(examId: string, studentId: string) {
  return readJson<CachedAttemptPayload | null>(
    getAttemptCacheKey(examId, studentId),
    null,
  )
}

export function queueOfflineDraft(payload: OfflineDraftPayload) {
  const queue = readJson<OfflineDraftPayload[]>(DRAFT_QUEUE_KEY, [])
  const next = [
    ...queue.filter((item) => item.draftKey !== payload.draftKey),
    payload,
  ]
  writeJson(DRAFT_QUEUE_KEY, next)
}

export function queueOfflineSubmission(payload: OfflineSubmissionPayload) {
  const submissionQueue = readJson<OfflineSubmissionPayload[]>(
    SUBMISSION_QUEUE_KEY,
    [],
  )
  const nextSubmissions = [
    ...submissionQueue.filter(
      (item) =>
        !(
          item.assignmentId === payload.assignmentId &&
          item.studentId === payload.studentId
        ),
    ),
    payload,
  ]
  writeJson(SUBMISSION_QUEUE_KEY, nextSubmissions)

  const draftQueue = readJson<OfflineDraftPayload[]>(DRAFT_QUEUE_KEY, [])
  writeJson(
    DRAFT_QUEUE_KEY,
    draftQueue.filter(
      (item) =>
        !(
          item.assignmentId === payload.assignmentId &&
          item.studentId === payload.studentId
        ),
    ),
  )
}

export async function syncOfflineExamQueue() {
  if (typeof window === 'undefined' || !navigator.onLine || !isApiConfigured()) {
    return
  }

  const draftQueue = readJson<OfflineDraftPayload[]>(DRAFT_QUEUE_KEY, [])
  const remainingDrafts: OfflineDraftPayload[] = []

  for (const draft of draftQueue) {
    try {
      await saveOfflineDraft(draft)
    } catch {
      remainingDrafts.push(draft)
    }
  }

  writeJson(DRAFT_QUEUE_KEY, remainingDrafts)

  const submissionQueue = readJson<OfflineSubmissionPayload[]>(
    SUBMISSION_QUEUE_KEY,
    [],
  )
  const remainingSubmissions: OfflineSubmissionPayload[] = []

  for (const submission of submissionQueue) {
    try {
      await saveOfflineSubmission(submission)
    } catch {
      remainingSubmissions.push(submission)
    }
  }

  writeJson(SUBMISSION_QUEUE_KEY, remainingSubmissions)
}

export function getOfflineQueueSnapshot() {
  return {
    drafts: readJson<OfflineDraftPayload[]>(DRAFT_QUEUE_KEY, []),
    submissions: readJson<OfflineSubmissionPayload[]>(SUBMISSION_QUEUE_KEY, []),
  }
}
