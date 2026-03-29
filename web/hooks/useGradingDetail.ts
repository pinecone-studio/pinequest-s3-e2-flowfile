'use client'

import {
  initialExams,
  initialExamAssignments,
  initialAttempts,
  initialClasses,
  initialUsers,
  initialQuestions,
  CURRENT_TEACHER_ID
} from "@/lib/data"

export function useGradingDetail(examId: string, classId: string) {
  const exam = initialExams.find(e => e.id === examId)
  const cls = initialClasses.find(c => c.id === classId)

  const assignment = initialExamAssignments.find(a =>
    a.examId === examId &&
    a.classId === classId &&
    a.assignedBy === CURRENT_TEACHER_ID
  )

  const attempts = initialAttempts.filter(a =>
    a.examAssignmentId === assignment?.id && a.status === 'submitted'
  )

  const questions = initialQuestions.filter(q =>
    exam?.questionIds.includes(q.id)
  )

  return { exam, cls, attempts, questions, users: initialUsers }
}