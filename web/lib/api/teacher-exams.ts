'use client'
import { apiFetch, isApiConfigured } from './client'

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
  status: 'not_started' | 'in_progress' | 'submitted' | 'force_submitted'
  startedAt: string | null
  submittedAt: string | null
  score: number | null
  isFlagged: boolean
  createdAt: string
  updatedAt: string
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

export async function fetchMyExams(): Promise<TeacherExam[]> {
  return apiFetch<TeacherExam[]>('/exams', undefined, 'teacher')
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

export async function createExam(payload: {
  title: string
  subject: string
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
    optionsJson?: string
    correctAnswer?: string
  },
) {
  return apiFetch(`/questions`, { method: 'POST', body: JSON.stringify({ examId, ...q }) }, 'teacher')
}

export async function fetchMonitoringEvents(examId: string) {
  return apiFetch<
    Array<{ id: string; sessionId: string; studentId: string; eventType: string; occurredAt: string }>
  >(`/monitoring/events/exam/${examId}`, undefined, 'teacher')
}

export { isApiConfigured }
