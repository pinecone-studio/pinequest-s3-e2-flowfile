'use client'

import {
  initialExams,
  initialExamAssignments,
  initialAttempts,
  initialClasses,
  initialQuestions,
  CURRENT_TEACHER_ID
} from "@/lib/data"

export function useGradingHub() {
  const getExam = (id: string) => initialExams.find(e => e.id === id)
  const getClass = (id: string) => initialClasses.find(c => c.id === id)

  const assignments = initialExamAssignments.filter(a =>
    a.assignedBy === CURRENT_TEACHER_ID && a.status === 'closed'
  )

  const getManualCount = (exam: any) => {
    return initialQuestions.filter(q =>
      exam.questionIds.includes(q.id) && q.isManualGrade
    ).length
  }

  const list = assignments.filter(a => {
    const exam = getExam(a.examId)
    if (!exam) return false
    if (getManualCount(exam) === 0) return false

    return initialAttempts.some(at =>
      at.examAssignmentId === a.id && at.status === 'submitted'
    )
  })

  return { list, getExam, getClass }
}