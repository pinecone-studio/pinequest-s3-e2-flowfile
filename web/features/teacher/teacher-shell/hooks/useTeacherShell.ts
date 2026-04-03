import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

import {
  CURRENT_TEACHER_ID,
  getAll,
  getCurrentTeacher,
  initialAttempts,
  initialExamAssignments,
  initialExams,
  initialQuestions,
} from '@/lib/data'
import {
  fetchTeacherUnreadNotificationCount,
  isApiConfigured,
} from '@/lib/api/notifications'
import {
  getNotificationEventName,
  getNotifications,
  getTeacherNotificationRefreshEventName,
} from '@/lib/notifications'
import type { Attempt, Exam, ExamAssignment, Question } from '@/lib/types'

import type { TeacherNavItem } from '@/features/teacher/teacher-shell/types/teacher-shell.types'

export function useTeacherShell(): {
  collapsed: boolean
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean | ((prev: boolean) => boolean)) => void
  pendingManualTaskCount: number
  unreadNotificationCount: number
  teacher: ReturnType<typeof getCurrentTeacher>
  isActive: (item: TeacherNavItem) => boolean
} {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [assignments, setAssignments] = useState<ExamAssignment[]>(initialExamAssignments)
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
  const teacher = getCurrentTeacher()

  useEffect(() => {
    const loadedExams = getAll<Exam>('exams')
    const loadedAssignments = getAll<ExamAssignment>('examAssignments')
    const loadedAttempts = getAll<Attempt>('attempts')
    const loadedQuestions = getAll<Question>('questions')

    if (loadedExams.length) setExams(loadedExams)
    if (loadedAssignments.length) setAssignments(loadedAssignments)
    if (loadedAttempts.length) setAttempts(loadedAttempts)
    if (loadedQuestions.length) setQuestions(loadedQuestions)
  }, [])

  useEffect(() => {
    let isMounted = true

    const syncUnreadCount = async () => {
      try {
        if (isApiConfigured()) {
          const response = await fetchTeacherUnreadNotificationCount()

          if (isMounted) {
            setUnreadNotificationCount(response.unreadCount)
          }

          return
        }

        if (isMounted) {
          setUnreadNotificationCount(
            getNotifications(CURRENT_TEACHER_ID).filter((item) => !item.isRead).length,
          )
        }
      } catch {
        if (!isMounted) {
          return
        }

        setUnreadNotificationCount(0)
      }
    }

    void syncUnreadCount()

    const syncEvents = isApiConfigured()
      ? ([getTeacherNotificationRefreshEventName(), 'focus'] as const)
      : ([getNotificationEventName(), 'storage', 'focus'] as const)

    const handleSync = () => {
      void syncUnreadCount()
    }

    syncEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleSync)
    })

    const intervalId = window.setInterval(handleSync, isApiConfigured() ? 15000 : 30000)

    return () => {
      isMounted = false
      syncEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleSync)
      })
      window.clearInterval(intervalId)
    }
  }, [])

  const getExam = (examId: string): Exam | undefined => exams.find(exam => exam.id === examId)

  const hasManualQuestion = (exam: Exam): boolean => {
    return questions.some(question => exam.questionIds.includes(question.id) && question.isManualGrade)
  }

  const pendingManualTaskCount = assignments.reduce((count, assignment) => {
    if (assignment.assignedBy !== CURRENT_TEACHER_ID) return count
    if (assignment.status !== 'closed') return count

    const exam = getExam(assignment.examId)
    if (!exam || !hasManualQuestion(exam)) return count

    return count + attempts.filter(attempt =>
      attempt.examAssignmentId === assignment.id &&
      attempt.status === 'submitted'
    ).length
  }, 0)

  const isActive = (item: TeacherNavItem): boolean => {
    if (pathname === '/teacher/exams/create') {
      return item.href === '/teacher/exams/create'
    }
    if (pathname.startsWith('/teacher/courses') || pathname.startsWith('/teacher/classes')) {
      return item.href === '/teacher'
    }
    if (pathname.match(/^\/teacher\/exams\/[^/]+$/) && !pathname.includes('create')) {
      return item.href === '/teacher/exams'
    }
    if (item.href === '/teacher') {
      return pathname === '/teacher'
    }
    return item.matchPaths.some(path => pathname.startsWith(path))
  }

  return {
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
    pendingManualTaskCount,
    unreadNotificationCount,
    teacher,
    isActive,
  }
}
