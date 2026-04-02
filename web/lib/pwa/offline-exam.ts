import { apiFetch, isApiConfigured } from '@/lib/api/client'
import type { StudentExamQuestion } from '@/lib/api/student-exams'

const ATTEMPT_CACHE_KEY = 'seedcone.offline.attempts'
const DRAFT_QUEUE_KEY = 'seedcone.offline.drafts'
const SUBMISSION_QUEUE_KEY = 'seedcone.offline.submissions'

type CachedAttempt = {
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

type DraftQueueItem = {
  draftKey: string
  assignmentId: string
  examId: string
  studentId: string
  answers: Record<string, string>
  markedForReview: string[]
  currentIndex: number
  startedAt: string
  updatedAt: string
}

type SubmissionQueueItem = {
  assignmentId: string
  examId: string
  studentId: string
  attempt: Record<string, unknown>
  result: Record<string, unknown>
  queuedAt: string
}

function readStore<T>(key: string): T[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(key)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeStore<T>(key: string, items: T[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(items))
}

export function cacheExamAttempt(examId: string, studentId: string, attempt: CachedAttempt) {
  const key = `${studentId}:${examId}`
  const items = readStore<Array<{ key: string; value: CachedAttempt }>>(ATTEMPT_CACHE_KEY)
  const next = items.filter((item) => item.key !== key)
  next.push({ key, value: attempt })
  writeStore(ATTEMPT_CACHE_KEY, next)
}

export function readCachedExamAttempt(examId: string, studentId: string) {
  const key = `${studentId}:${examId}`
  const items = readStore<Array<{ key: string; value: CachedAttempt }>>(ATTEMPT_CACHE_KEY)
  return items.find((item) => item.key === key)?.value ?? null
}

export function queueOfflineDraft(item: DraftQueueItem) {
  const items = readStore<DraftQueueItem>(DRAFT_QUEUE_KEY)
  const next = items.filter((draft) => draft.draftKey !== item.draftKey)
  next.push(item)
  writeStore(DRAFT_QUEUE_KEY, next)
}

export function queueOfflineSubmission(item: SubmissionQueueItem) {
  const items = readStore<SubmissionQueueItem>(SUBMISSION_QUEUE_KEY)
  const next = items.filter(
    (submission) =>
      !(submission.assignmentId === item.assignmentId && submission.studentId === item.studentId),
  )
  next.push(item)
  writeStore(SUBMISSION_QUEUE_KEY, next)
}

export async function syncOfflineExamQueue() {
  if (!isApiConfigured() || typeof window === 'undefined' || !navigator.onLine) {
    return
  }

  const drafts = readStore<DraftQueueItem>(DRAFT_QUEUE_KEY)
  const submissions = readStore<SubmissionQueueItem>(SUBMISSION_QUEUE_KEY)

  const remainingDrafts: DraftQueueItem[] = []
  for (const draft of drafts) {
    try {
      await apiFetch('/offline-exam-sync/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(draft),
      })
    } catch {
      remainingDrafts.push(draft)
    }
  }

  writeStore(DRAFT_QUEUE_KEY, remainingDrafts)

  const remainingSubmissions: SubmissionQueueItem[] = []
  for (const submission of submissions) {
    try {
      await apiFetch('/offline-exam-sync/submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      })
    } catch {
      remainingSubmissions.push(submission)
    }
  }

  writeStore(SUBMISSION_QUEUE_KEY, remainingSubmissions)
}

export function getOfflineQueueSnapshot() {
  return {
    drafts: readStore<DraftQueueItem>(DRAFT_QUEUE_KEY),
    submissions: readStore<SubmissionQueueItem>(SUBMISSION_QUEUE_KEY),
  }
}
