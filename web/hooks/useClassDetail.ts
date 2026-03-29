'use client'

import { useState } from "react"
import {
  initialClasses,
  initialCourses,
  initialExamAssignments,
  initialExams,
  initialUsers,
  initialAttempts,
  CURRENT_TEACHER_ID
} from "@/lib/data"

export function useClassDetail(id: string) {
  const [activeTab, setActiveTab] = useState<'exams' | 'students'>('exams')

  const cls = initialClasses.find(c => c.id === id)

  const course = initialCourses.find(c => (c.classIds ?? []).includes(id))

  const classAssignments = initialExamAssignments.filter(ea =>
    ea.classId === id && ea.assignedBy === CURRENT_TEACHER_ID
  )

  const classStudents = initialUsers.filter(
    u => u.role === 'student' && (cls?.studentIds ?? []).includes(u.id)
  )

  const upcomingExams = classAssignments.filter(e => e.status !== 'closed')
  const pastExams = classAssignments.filter(e => e.status === 'closed')

  const getExam = (id: string) => initialExams.find(e => e.id === id)

  const getExamStats = (assignmentId: string) => {
    const results = initialAttempts.filter(a =>
      a.examAssignmentId === assignmentId && a.status === 'graded'
    )

    if (!results.length) return null

    const scores = results.map(a =>
      a.totalPoints && a.earnedPoints
        ? Math.round((a.earnedPoints / a.totalPoints) * 100)
        : 0
    )

    return {
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      completed: results.length,
      total: cls?.studentIds.length ?? 0
    }
  }

  const getStudentStats = (studentId: string) => {
    const results = initialAttempts.filter(a =>
      a.studentId === studentId &&
      a.status === 'graded' &&
      classAssignments.some(e => e.id === a.examAssignmentId)
    )

    if (!results.length) return { avgScore: null, attendance: 0, trend: 'neutral' }

    const avgScore = Math.round(
      results.reduce((sum, a) => {
        if (!a.totalPoints || !a.earnedPoints) return sum
        return sum + (a.earnedPoints / a.totalPoints) * 100
      }, 0) / results.length
    )

    return {
      avgScore,
      attendance: Math.round((results.length / pastExams.length) * 100) || 0,
      trend: 'neutral'
    }
  }

  return {
    cls,
    course,
    activeTab,
    setActiveTab,
    classStudents,
    upcomingExams,
    pastExams,
    getExam,
    getExamStats,
    getStudentStats
  }
}