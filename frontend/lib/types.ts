// lib/types.ts

export interface User {
  id: string
  name: string
  role: 'teacher' | 'student' | 'admin'
  avatarInitials: string
}

export interface Course {
  id: string
  name: string
  grade: string
  year: string
  termBadge?: string
  colorAccent: 'slate' | 'teal' | 'amber'
}

export interface Class {
  id: string
  courseId: string
  name: string
  schedule: string
  studentIds: string[]
  teacherId: string
}

export interface Exam {
  id: string
  title: string
  courseId: string
  chapter?: string
  topic?: string
  description?: string
  duration: number
  visibility: 'private' | 'school'
  ownerId: string
  createdAt: string
  questionIds: string[]
  status: 'draft' | 'scheduled' | 'active' | 'closed'
}

export interface Question {
  id: string
  text: string
  imageUrl?: string
  type: 'single' | 'multiple' | 'truefalse' | 'matching' | 'short' | 'long' | 'formula' | 'code'
  options?: string[]
  matchingPairs?: { left: string; right: string }[]
  correctAnswer?: string | string[]
  points: number
}

export interface Schedule {
  id: string
  examId: string
  classId: string
  startTime: string
  endTime: string
  isPaused: boolean
  extendedMinutes: number
}

export interface Attempt {
  id: string
  examId: string
  studentId: string
  answers: Record<string, string | string[]>
  startedAt: string
  submittedAt?: string
  isComplete: boolean
}

export interface Result {
  id: string
  attemptId: string
  studentId: string
  examId: string
  scorePerQuestion: Record<string, number>
  totalScore: number
  maxScore: number
  isPublished: boolean
}

export type QuestionType = Question['type']

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single: 'Нэг сонголт',
  multiple: 'Олон сонголт',
  truefalse: 'Үнэн/Худал',
  matching: 'Тааруулах',
  short: 'Богино текст',
  long: 'Урт текст',
  formula: 'Томъёо',
  code: 'Код'
}
