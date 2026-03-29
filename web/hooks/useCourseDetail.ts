'use client'

import {
  initialCourses,
  initialClasses,
  initialExamAssignments,
  CURRENT_TEACHER_ID
} from "@/lib/data"
import { COURSE_COLORS, PATTERNS, SUBJECT_NAMES } from "@/lib/constants"

export function useCourseDetail(id: string) {
  const course = initialCourses.find(c => c.id === id)

  const courseClasses = initialClasses.filter(c =>
    (course?.classIds ?? []).includes(c.id)
  )

  const subjectColor = COURSE_COLORS[course?.subjectId || ''] || COURSE_COLORS.default
  const subjectPattern = PATTERNS[course?.subjectId || ''] || PATTERNS.default
  const subjectName = SUBJECT_NAMES[course?.subjectId || ''] || course?.subjectId

  const getUpcomingExamCount = (classId: string) => {
    return initialExamAssignments.filter(ea =>
      ea.classId === classId &&
      ea.assignedBy === CURRENT_TEACHER_ID &&
      (ea.status === 'scheduled' || ea.status === 'active')
    ).length
  }

  return {
    course,
    courseClasses,
    subjectColor,
    subjectPattern,
    subjectName,
    getUpcomingExamCount
  }
}