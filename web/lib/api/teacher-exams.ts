'use client'
import { apiFetch, isApiConfigured } from './client'
import type { Question, QuestionType } from '@/lib/types'
import {
  getQuestionTypeFromApi,
  parseMatchingPairs,
  parseQuestionCorrectAnswer,
  parseQuestionOptions,
} from '@/lib/exam-question-meta'

export interface TeacherExam {
  id: string
  teacherId: string
  title: string
  subject: string
  status: string
  durationMinutes: number
  startsAt: string | null
  endsAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ExamSession {
  id: string
  examId: string
  studentId: string
  status: 'not_started' | 'in_progress' | 'submitted' | 'force_submitted' | 'graded'
  startedAt: string | null
  submittedAt: string | null
  score: number | null
  isFlagged: boolean
  createdAt: string
  updatedAt: string
}

export interface TeacherExamQuestion {
  id: string
  examId: string
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
  correctAnswer: string | null
  createdAt: string
  updatedAt: string
}

export interface TeacherExamAnswer {
  id: string
  sessionId: string
  questionId: string
  textAnswer: string | null
  formulaAnswerJson: string | null
  fileUrl: string | null
  lastSavedAt: string
  isFinal: boolean
  createdAt: string
}

export interface TeacherUser {
  id: string
  name: string
  email: string
  role: 'teacher' | 'student'
  imageUrl?: string | null
  isActive?: boolean
}

export interface TeacherEnrollment {
  id: string
  examId: string
  studentId: string
  assignedAt: string
}

export interface QuestionAnalytics {
  questionId: string
  content: string
  inputType: string
  points: number
  totalAnswers: number
  correctCount: number
  incorrectCount: number
  errorRate: number
}

const MANUAL_QUESTION_TYPES = new Set<QuestionType>([
  'short',
  'long',
  'formula',
  'chemistry',
  'code',
  'voice',
  'video',
  'handwritten',
  'matching',
])

export function isManualTeacherQuestionType(type: QuestionType) {
  return MANUAL_QUESTION_TYPES.has(type)
}

export function mapTeacherApiQuestionToLocalQuestion(
  question: TeacherExamQuestion,
): Question {
  const type = getQuestionTypeFromApi(question.inputType, question.subjectHint)

  return {
    id: question.id,
    examId: question.examId,
    text: question.content,
    type,
    points: question.points,
    order: question.orderIndex,
    options: type === 'matching' ? undefined : parseQuestionOptions(question.optionsJson),
    matchingPairs:
      type === 'matching' ? parseMatchingPairs(question.optionsJson) : undefined,
    correctAnswer: parseQuestionCorrectAnswer(question.correctAnswer, type),
    isManualGrade: isManualTeacherQuestionType(type),
  }
}

export interface ExamDetailResponse {
  exam: TeacherExam
  questions: Array<{ id: string; content: string; inputType: string; points: number; orderIndex: number; isRequired: boolean; optionsJson: string|null; correctAnswer: string|null }>
  sessions: ExamSession[]
  enrollments: Array<{ id: string; examId: string; studentId: string; assignedAt: string }>
  submitted: ExamSession[]
  visualStage: string
  totalEnrolled: number
  totalSubmitted: number
  allSubmitted: boolean
  needsGrading: boolean
}

export async function fetchMyExams(): Promise<TeacherExam[]> {
  return apiFetch<TeacherExam[]>('/exams', undefined, 'teacher')
}

export async function fetchExamById(examId: string): Promise<TeacherExam> {
  return apiFetch<TeacherExam>(`/exams/${examId}`, undefined, 'teacher')
}

export async function fetchExamSessions(examId: string): Promise<ExamSession[]> {
  return apiFetch<ExamSession[]>(`/sessions/exam/${examId}`, undefined, 'teacher')
}

export async function fetchLiveSessions(examId: string): Promise<ExamSession[]> {
  return apiFetch<ExamSession[]>(`/sessions/exam/${examId}/live`, undefined, 'teacher')
}

export async function fetchExamAnalytics(examId: string): Promise<QuestionAnalytics[]> {
  return apiFetch<QuestionAnalytics[]>(`/sessions/exam/${examId}/analytics`, undefined, 'teacher')
}

export async function fetchQuestionsByExam(
  examId: string,
): Promise<TeacherExamQuestion[]> {
  return apiFetch<TeacherExamQuestion[]>(
    `/questions/exam/${examId}`,
    undefined,
    'teacher',
  )
}

export async function fetchAnswersBySession(
  sessionId: string,
): Promise<TeacherExamAnswer[]> {
  return apiFetch<TeacherExamAnswer[]>(
    `/answers/session/${sessionId}`,
    undefined,
    'teacher',
  )
}

export async function fetchUsersByRole(
  role: 'teacher' | 'student',
): Promise<TeacherUser[]> {
  return apiFetch<TeacherUser[]>(`/users?role=${role}`, undefined, 'teacher')
}

export async function fetchEnrollmentsByExam(
  examId: string,
): Promise<TeacherEnrollment[]> {
  return apiFetch<TeacherEnrollment[]>(
    `/enrollments/exam/${examId}`,
    undefined,
    'teacher',
  )
}

export async function fetchExamDetail(examId: string): Promise<ExamDetailResponse> {
  return apiFetch<ExamDetailResponse>(`/exams/${examId}/detail`, undefined, 'teacher')
}

export async function enrollStudents(examId: string, studentIds: string[]): Promise<void> {
  await apiFetch(`/enrollments/bulk`, { method: 'POST', body: JSON.stringify({ examId, studentIds }) }, 'teacher')
}

export async function createExam(payload: {
  title: string
  subject: string
  description?: string
  durationMinutes: number
  shuffleQuestions: boolean
  allowCopyPaste: boolean
  requireFullscreen: boolean
  maxTabSwitches: number
  startsAt?: string
  endsAt?: string
}): Promise<TeacherExam> {
  return apiFetch<TeacherExam>('/exams', { method: 'POST', body: JSON.stringify(payload) }, 'teacher')
}

export async function createQuestion(
  examId: string,
  q: {
    content: string
    inputType: string
    points: number
    orderIndex: number
    isRequired: boolean
    subjectHint?: string
    optionsJson?: string
    correctAnswer?: string
  },
) {
  return apiFetch(`/questions`, { method: 'POST', body: JSON.stringify({ examId, ...q }) }, 'teacher')
}

export async function enrollStudent(examId: string, studentId: string) {
  return apiFetch<TeacherEnrollment>(
    '/enrollments',
    {
      method: 'POST',
      body: JSON.stringify({ examId, studentId }),
    },
    'teacher',
  )
}

export async function updateExamStatus(
  examId: string,
  status: 'draft' | 'scheduled' | 'published' | 'closed',
) {
  return apiFetch<TeacherExam>(
    `/exams/${examId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    'teacher',
  )
}

export async function gradeExamSession(
  sessionId: string,
  score: number,
) {
  return apiFetch<ExamSession>(
    `/sessions/${sessionId}/grade`,
    {
      method: 'PATCH',
      body: JSON.stringify({ score }),
    },
    'teacher',
  )
}

export async function fetchMonitoringEvents(examId: string) {
  return apiFetch<
    Array<{ id: string; sessionId: string; studentId: string; eventType: string; occurredAt: string }>
  >(`/monitoring/events/exam/${examId}`, undefined, 'teacher')
}

export { isApiConfigured }
