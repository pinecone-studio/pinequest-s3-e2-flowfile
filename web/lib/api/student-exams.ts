import { apiFetch, getApiUrl, getAuthHeaders, isApiConfigured } from '@/lib/api/client'

export interface StudentExamQuestion {
  id: string
  text: string
  type: 'single' | 'multiple' | 'truefalse' | 'matching' | 'short' | 'long' | 'formula' | 'chemistry' | 'code' | 'voice' | 'video' | 'handwritten'
  points: number
  order: number
  options?: string[]
  matchingPairs?: { left: string; right: string }[]
  correctAnswer?: string | string[] | null
}

export interface StudentExamSummary {
  exam: {
    id: string
    title: string
    subjectId: string
    subject: string
    durationMinutes: number
    startsAt: string | null
    endsAt: string | null
  }
  session: {
    id: string
    status: string
    startedAt: string | null
    submittedAt: string | null
  } | null
  enrolledAt: string
  attemptStatus: 'upcoming' | 'ready' | 'in_progress' | 'submitted' | 'force_submitted' | 'closed'
  timing: {
    timeRemainingSeconds: number
  } | null
}

interface ApiAttemptResponse {
  exam: {
    id: string
    title: string
    subject: string
    teacherId: string
    durationMinutes: number
  }
  session: {
    id: string
    status: string
    startedAt: string | null
    submittedAt: string | null
  }
  questions: Array<{
    id: string
    content: string
    inputType: string
    points: number
    orderIndex: number
    optionsJson?: string | null
    correctAnswer?: string | null
  }>
  answers: Array<{
    questionId: string
    textAnswer?: string | null
    formulaAnswerJson?: string | null
    fileUrl?: string | null
  }>
  timing: {
    timeRemainingSeconds: number
  }
}

function mapInputType(inputType: string): StudentExamQuestion['type'] {
  switch (inputType) {
    case 'mcq':
      return 'single'
    case 'short_text':
      return 'short'
    case 'rich_text':
      return 'long'
    case 'math_formula':
      return 'formula'
    case 'chem_formula':
      return 'chemistry'
    case 'voice_record':
      return 'voice'
    case 'handwritten':
      return 'handwritten'
    default:
      return 'short'
  }
}

function parseMaybeJson<T>(value?: string | null, fallback?: T): T | undefined {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function mapAttemptToQuestionList(attempt: ApiAttemptResponse): StudentExamQuestion[] {
  return attempt.questions
    .slice()
    .sort((left, right) => left.orderIndex - right.orderIndex)
    .map((question) => ({
      id: question.id,
      text: question.content,
      type: mapInputType(question.inputType),
      points: question.points,
      order: question.orderIndex,
      options: parseMaybeJson<string[]>(question.optionsJson, []),
      correctAnswer: null,
    }))
}

export function mapAttemptToAnswerMap(attempt: ApiAttemptResponse) {
  return attempt.answers.reduce<Record<string, string>>((result, answer) => {
    result[answer.questionId] =
      answer.textAnswer ??
      answer.formulaAnswerJson ??
      answer.fileUrl ??
      ''
    return result
  }, {})
}

export async function fetchAssignedExams() {
  const data = await apiFetch<StudentExamSummary[]>('/exams/assigned/me')

  return data.map((item) => ({
    ...item,
    exam: {
      ...item.exam,
      subjectId: item.exam.subject,
    },
  }))
}

export async function startExamSession(examId: string) {
  return apiFetch<{ id: string; status: string; startedAt: string | null }>(`/sessions/exam/${examId}/start`, {
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
  const payload: {
    sessionId: string
    questionId: string
    textAnswer?: string
    formulaAnswerJson?: string
    fileUrl?: string
  } = {
    sessionId: params.sessionId,
    questionId: params.question.id,
  }

  if (params.question.type === 'formula' || params.question.type === 'chemistry' || params.question.type === 'matching') {
    payload.formulaAnswerJson = params.value
  } else if (params.question.type === 'voice' || params.question.type === 'video' || params.question.type === 'handwritten') {
    payload.fileUrl = params.value
  } else {
    payload.textAnswer = params.value
  }

  return apiFetch('/answers/autosave', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...getAuthHeaders('student'),
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json() as Promise<{ url: string }>
}

export async function runPreviewCode(code: string) {
  return apiFetch<{ logs: string[]; result: unknown; error: string | null }>('/code/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      mode: 'preview',
    }),
  })
}

export async function createProctoringViolation(params: {
  studentId: string
  examId: string
  sessionId?: string
  type: 'tab_switch' | 'window_blur'
  teacherId?: string
  studentName?: string
  examTitle?: string
  assignmentId?: string
}) {
  if (!isApiConfigured()) {
    return null
  }

  return apiFetch('/monitoring/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: params.sessionId ?? `${params.examId}:${params.studentId}`,
      studentId: params.studentId,
      examId: params.examId,
      eventType: params.type,
    }),
  })
}
