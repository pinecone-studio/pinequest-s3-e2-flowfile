'use client'

import {
  fetchExamById,
  fetchMyExams,
  fetchQuestionsByExam,
  mapTeacherApiQuestionToLocalQuestion,
} from '@/lib/api/teacher-exams'
import { SUBJECT_NAMES } from '@/lib/constants'
import { getCurrentTeacher } from '@/lib/data'
import type { Exam, Question, Subject, User } from '@/lib/types'

type LegacyExam = Exam & { courseId?: string }

export interface TeacherExamBankRecord {
  id: string
  title: string
  subjectId: string
  subjectName: string
  ownerId: string
  ownerName: string
  status: string
  visibility: 'private' | 'school'
  durationMinutes: number
  createdAt: string
  updatedAt: string
  description?: string | null
  grade?: number | null
  chapter?: string
  topic?: string
  questions: Question[]
}

function resolveSubjectName(subjectId: string, subjects: Subject[]) {
  return (
    subjects.find((subject) => subject.id === subjectId)?.name ||
    SUBJECT_NAMES[subjectId] ||
    subjectId
  )
}

function normalizeVisibility(
  visibility?: Exam['visibility'],
): TeacherExamBankRecord['visibility'] {
  return visibility === 'private' ? 'private' : 'school'
}

export function getTeacherExamMaxScore(exam: Pick<TeacherExamBankRecord, 'questions'>) {
  return exam.questions.reduce((sum, question) => sum + (question.points || 0), 0)
}

export function getTeacherExamStatusLabel(status: string) {
  switch (status) {
    case 'draft':
      return 'Ноорог'
    case 'private':
      return 'Хувийн'
    case 'scheduled':
      return 'Товлогдсон'
    case 'published':
      return 'Нийтлэгдсэн'
    case 'closed':
      return 'Хаагдсан'
    default:
      return status
  }
}

export function mapLocalExamToTeacherExamBankRecord(
  exam: LegacyExam,
  questions: Question[],
  users: User[],
  subjects: Subject[],
): TeacherExamBankRecord {
  const questionList = questions
    .filter((question) => exam.questionIds.includes(question.id))
    .sort((left, right) => left.order - right.order)

  return {
    id: exam.id,
    title: exam.title,
    subjectId: exam.subjectId,
    subjectName: resolveSubjectName(exam.subjectId, subjects),
    ownerId: exam.ownerId,
    ownerName:
      users.find((user) => user.id === exam.ownerId)?.name ||
      getCurrentTeacher()?.name ||
      exam.ownerId,
    status: exam.status,
    visibility: normalizeVisibility(exam.visibility),
    durationMinutes: exam.duration,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
    description: exam.description,
    grade: exam.grade ?? null,
    chapter: exam.chapter,
    topic: exam.topic,
    questions: questionList,
  }
}

export async function fetchTeacherExamBankRecords(): Promise<TeacherExamBankRecord[]> {
  const teacherName = getCurrentTeacher()?.name
  const exams = await fetchMyExams()

  return Promise.all(
    exams.map(async (exam) => {
      const questionRows = await fetchQuestionsByExam(exam.id)
      const questions = questionRows
        .map(mapTeacherApiQuestionToLocalQuestion)
        .sort((left, right) => left.order - right.order)

      return {
        id: exam.id,
        title: exam.title,
        subjectId: exam.subject,
        subjectName: SUBJECT_NAMES[exam.subject] || exam.subject,
        ownerId: exam.teacherId,
        ownerName: teacherName || exam.teacherId,
        status: exam.status,
        visibility: exam.status === 'published' ? 'school' : 'private',
        durationMinutes: exam.durationMinutes,
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt,
        description: null,
        grade: null,
        chapter: undefined,
        topic: undefined,
        questions,
      } satisfies TeacherExamBankRecord
    }),
  )
}

export async function fetchTeacherExamBankRecordById(
  examId: string,
): Promise<TeacherExamBankRecord | null> {
  const teacherName = getCurrentTeacher()?.name
  const [exam, questionRows] = await Promise.all([
    fetchExamById(examId),
    fetchQuestionsByExam(examId),
  ])

  if (!exam) {
    return null
  }

  return {
    id: exam.id,
    title: exam.title,
    subjectId: exam.subject,
    subjectName: SUBJECT_NAMES[exam.subject] || exam.subject,
    ownerId: exam.teacherId,
    ownerName: teacherName || exam.teacherId,
    status: exam.status,
    visibility: exam.status === 'published' ? 'school' : 'private',
    durationMinutes: exam.durationMinutes,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
    description: exam.description,
    grade: null,
    chapter: undefined,
    topic: undefined,
    questions: questionRows
      .map(mapTeacherApiQuestionToLocalQuestion)
      .sort((left, right) => left.order - right.order),
  }
}
