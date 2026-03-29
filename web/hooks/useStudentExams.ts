'use client'

import { initialExamAssignments, CURRENT_STUDENT_ID, initialClasses } from "@/lib/data"

export function useStudentExams() {
  const studentClass = initialClasses.find(c =>
    c.studentIds.includes(CURRENT_STUDENT_ID)
  )

  const assignments = initialExamAssignments.filter(a =>
    a.classId === studentClass?.id
  )

  return { assignments, studentClass }
}