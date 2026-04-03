'use client'

import {
  apiFetch,
  getApiUrl,
  getAuthHeaders,
  isApiConfigured,
} from '@/lib/api/client'
import {
  getQuestionTypeFromApi,
  parseMatchingPairs,
  parseQuestionOptions,
} from '@/lib/exam-question-meta'

export type StudentExamStatus =
  | 'upcoming'
  | 'ready'
  | 'in_progress'
  | 'submitted'
  | 'force_submitted'
  | 'closed'

export type StudentExamQuestionType =
  | 'single'
  | 'multiple'
  | 'truefalse'
  | 'matching'
  | 'short'
  | 'long'
  | 'formula'
  | 'chemistry'
  | 'code'
  | 'voice'
  | 'video'
  | 'handwritten'

type StudentSessionStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'force_submitted'

export interface StudentExamQuestion {
  id: string
  text: string
  type: StudentExamQuestionType
  points: number
  order: number
  options?: string[]
  matchingPairs?: Array<{ left: string; right: string }>
  correctAnswer?: string | string[] | null
  subjectHint?: string | null
  isRequired?: boolean
}

export interface StudentExamSummary {
  exam: {
    id: string
    title: string
    subjectId: string
    subject: string
    description?: string | null
    teacherId: string
    durationMinutes: number
    startsAt: string | null
    endsAt: string | null
    status: string
  }
  session: {
    id: string
    status: StudentSessionStatus
    startedAt: string | null
    submittedAt: string | null
  } | null
  enrolledAt: string
  attemptStatus: StudentExamStatus
  timing: {
    serverTime: string
    startedAt: string | null
    expiresAt: string | null
    timeLimitMinutes: number
    timeRemainingSeconds: number
    isExpired: boolean
  } | null
}

interface RawStudentExamSummary {
  exam: {
    id: string
    title: string
    subject: string
    description?: string | null
    teacherId: string
    durationMinutes: number
    startsAt: string | null
    endsAt: string | null
    status: string
  }
  session: {
    id: string
    status: StudentSessionStatus
    startedAt: string | null
    submittedAt: string | null
  } | null
  enrolledAt: string
  attemptStatus: StudentExamStatus
  timing: {
    serverTime: string
    startedAt: string | null
    expiresAt: string | null
    timeLimitMinutes: number
    timeRemainingSeconds: number
    isExpired: boolean
  } | null
}

interface ApiAttemptResponse {
  exam: {
    id: string
    title: string
    subject: string
    description: string | null
    teacherId: string
    durationMinutes: number
    startsAt: string | null
    endsAt: string | null
    status: string
  }
  session: {
    id: string
    status: StudentSessionStatus
    startedAt: string | null
    submittedAt: string | null
  }
  questions: Array<{
    id: string
    orderIndex: number
    content: string
    inputType:
      | 'mcq'
      | 'short_text'
      | 'rich_text'
      | 'math_formula'
      | 'chem_formula'
      | 'handwritten'
      | 'voice_record'
    subjectHint: string | null
    points: number
    isRequired: boolean
    optionsJson: string | null
    correctAnswer?: string | null
  }>
  answers: Array<{
    id: string
    questionId: string
    textAnswer: string | null
    formulaAnswerJson: string | null
    fileUrl: string | null
    lastSavedAt: string
    isFinal: boolean
  }>
  timing: {
    serverTime: string
    startedAt: string | null
    expiresAt: string | null
    timeLimitMinutes: number
    timeRemainingSeconds: number
    isExpired: boolean
  }
}

function parseStructuredAnswer(value: string | null) {
  if (!value) {
    return ''
  }

  try {
    const parsed = JSON.parse(value) as unknown
    if (typeof parsed === 'string') {
      return parsed
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      'value' in parsed &&
      typeof parsed.value === 'string'
    ) {
      return parsed.value
    }
  } catch {
    return value
  }

  return value
}

export function mapAttemptToQuestionList(
  attempt: ApiAttemptResponse,
): StudentExamQuestion[] {
  return attempt.questions
    .slice()
    .sort((left, right) => left.orderIndex - right.orderIndex)
    .map((question) => {
      const type = getQuestionTypeFromApi(
        question.inputType,
        question.subjectHint,
      ) as StudentExamQuestionType

      return {
        id: question.id,
        text: question.content,
        type,
        points: question.points,
        order: question.orderIndex,
        options:
          type === 'matching' ? undefined : parseQuestionOptions(question.optionsJson),
        matchingPairs:
          type === 'matching'
            ? parseMatchingPairs(question.optionsJson)
            : undefined,
        correctAnswer: null,
        subjectHint: question.subjectHint,
        isRequired: question.isRequired,
      }
    })
}

export function mapAttemptToAnswerMap(attempt: ApiAttemptResponse) {
  return attempt.answers.reduce<Record<string, string>>((result, answer) => {
    if (answer.fileUrl) {
      result[answer.questionId] = answer.fileUrl
      return result
    }

    if (answer.formulaAnswerJson) {
      result[answer.questionId] = parseStructuredAnswer(answer.formulaAnswerJson)
      return result
    }

    if (answer.textAnswer) {
      result[answer.questionId] = parseStructuredAnswer(answer.textAnswer)
    }

    return result
  }, {})
}

export async function fetchAssignedExams() {
  const data = await apiFetch<RawStudentExamSummary[]>('/exams/assigned/me')

  return data.map(
    (item): StudentExamSummary => ({
      ...item,
      exam: {
        ...item.exam,
        subjectId: item.exam.subject,
      },
    }),
  )
}

export async function startExamSession(examId: string) {
  return apiFetch<{
    id: string
    examId: string
    studentId: string
    status: StudentSessionStatus
    startedAt: string | null
    submittedAt: string | null
  }>(`/sessions/exam/${examId}/start`, {
    method: 'POST',
  })
}

export async function fetchExamAttempt(sessionId: string) {
  return apiFetch<ApiAttemptResponse>(`/sessions/${sessionId}/attempt`)
}

export async function submitExamSession(sessionId: string) {
  return apiFetch(`/sessions/${sessionId}/submit`, {
    method: 'PATCH',
  })
}

export async function autosaveExamAnswer(params: {
  sessionId: string
  question: StudentExamQuestion
  value: string
}) {
  const body: {
    sessionId: string
    questionId: string
    textAnswer?: string
    formulaAnswerJson?: string
    fileUrl?: string
  } = {
    sessionId: params.sessionId,
    questionId: params.question.id,
  }

  if (
    params.question.type === 'formula' ||
    params.question.type === 'chemistry' ||
    params.question.type === 'matching'
  ) {
    body.formulaAnswerJson = JSON.stringify({
      type: params.question.type,
      value: params.value,
    })
  } else if (
    params.question.type === 'voice' ||
    params.question.type === 'video' ||
    params.question.type === 'handwritten'
  ) {
    body.fileUrl = params.value
  } else {
    body.textAnswer = params.value
  }

  return apiFetch('/answers/autosave', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function runPreviewCode(code: string) {
  return apiFetch<{
    ok?: boolean
    logs: string[]
    result: unknown
    error: string | null
  }>('/code/run', {
    method: 'POST',
    body: JSON.stringify({
      code,
      mode: 'preview',
    }),
  })
}

export type StudentProctoringViolationType =
  | 'face_not_detected'
  | 'multiple_faces_detected'
  | 'tab_switch'
  | 'window_blur'
  | 'audio_detected'
  | 'device_changed'
  | 'looking_left'
  | 'looking_right'
  | 'looking_up'
  | 'looking_down'

export async function createProctoringViolation(payload: {
  teacherId?: string
  studentId?: string
  studentName?: string
  examId: string
  examTitle?: string
  assignmentId?: string
  sessionId?: string
  teacherName?: string
  classId?: string
  className?: string
  type: StudentProctoringViolationType
  details?: string
  metadata?: Record<string, string | number | boolean | null>
}) {
  if (!isApiConfigured()) {
    return null
  }

  return apiFetch('/proctoring/violations', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      metadata: {
        ...(payload.metadata ?? {}),
      },
    }),
  })
}

export async function saveOfflineDraft(payload: {
  draftKey: string
  assignmentId: string
  examId: string
  studentId: string
  answers: Record<string, string | string[]>
  markedForReview: string[]
  currentIndex: number
  startedAt: string
  updatedAt: string
}) {
  return apiFetch('/offline-exam-sync/draft', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function saveOfflineSubmission(payload: {
  assignmentId: string
  examId: string
  studentId: string
  attempt: Record<string, unknown>
  result: Record<string, unknown>
  queuedAt: string
}) {
  return apiFetch('/offline-exam-sync/submission', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function uploadAnswerAsset(file: File, kind?: string) {
  const url = getApiUrl('/answers/upload')

  if (!url) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.')
  }

  const formData = new FormData()
  formData.append('file', file)
  if (kind) {
    formData.append('kind', kind)
  }

  const headers = new Headers()
  const authHeaders = getAuthHeaders('student')
  if (authHeaders.Authorization) {
    headers.set('Authorization', authHeaders.Authorization)
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
    cache: 'no-store',
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Upload failed with status ${response.status}`)
  }

  return response.json() as Promise<{
    url: string
    fileName: string
    mimeType: string
    size: number
    kind?: string | null
  }>
}
