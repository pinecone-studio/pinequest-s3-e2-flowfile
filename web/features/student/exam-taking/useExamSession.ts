'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  autosaveExamAnswer,
  createProctoringViolation,
  fetchAssignedExams,
  fetchExamAttempt,
  mapAttemptToAnswerMap,
  mapAttemptToQuestionList,
  startExamSession,
  submitExamSession,
  type StudentExamQuestion,
} from '@/lib/api/student-exams'
import {
  cacheExamAttempt,
  queueOfflineSubmission,
  readCachedExamAttempt,
} from '@/lib/pwa/offline-exam'
import { getAll } from '@/lib/data'
import {
  CURRENT_STUDENT_ID,
  getCurrentStudent,
  initialCourses,
  initialExamAssignments,
  initialExams,
  initialQuestions,
  initialSubjects,
} from '@/lib/data'
import { isApiConfigured } from '@/lib/api/client'
import type { Course, Exam, ExamAssignment, Question, Subject } from '@/lib/types'

type LegacyExam = Exam & { courseId?: string }

interface NormalizedExam {
  id: string
  title: string
  subjectId: string
  duration: number
  teacherId?: string
}

interface CompletionState {
  title: string
  description: string
}

function mapLocalQuestion(question: Question): StudentExamQuestion {
  return {
    id: question.id,
    text: question.text,
    type: question.type,
    points: question.points,
    order: question.order,
    options: question.options,
    matchingPairs: question.matchingPairs,
    correctAnswer: question.correctAnswer ?? null,
  }
}

function isAnswerFilled(value?: string) {
  return Boolean(value && value.trim().length > 0)
}

export function useExamSession(id: string) {
  const [exam, setExam] = useState<NormalizedExam | null>(null)
  const [assignment, setAssignment] = useState<ExamAssignment | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [questions, setQuestions] = useState<StudentExamQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [completionState, setCompletionState] = useState<CompletionState | null>(
    null,
  )
  const [isApiBacked, setIsApiBacked] = useState(false)
  const [startedAt, setStartedAt] = useState<string | null>(null)

  const saveTimeoutsRef = useRef<Record<string, number>>({})
  const latestAnswersRef = useRef<Record<string, string>>({})
  const latestQuestionsRef = useRef<StudentExamQuestion[]>([])
  const assignmentIdRef = useRef<string | null>(null)

  const currentStudent = getCurrentStudent()
  const currentStudentId = CURRENT_STUDENT_ID
  const currentStudentName = currentStudent?.name ?? 'Сурагч'

  useEffect(() => {
    latestAnswersRef.current = answers
  }, [answers])

  useEffect(() => {
    latestQuestionsRef.current = questions
  }, [questions])

  const loadLocalSession = useCallback(() => {
    const allExams = getAll<LegacyExam>('exams')
    const allAssignments = getAll<ExamAssignment>('examAssignments')
    const allCourses = getAll<Course>('courses')
    const examList = allExams.length ? allExams : (initialExams as LegacyExam[])
    const assignmentList = allAssignments.length ? allAssignments : initialExamAssignments
    const courseList = allCourses.length ? allCourses : initialCourses

    const loadedAssignment = assignmentList.find((item) => item.id === id) || null
    const loadedExam =
      (loadedAssignment
        ? examList.find((item) => item.id === loadedAssignment.examId)
        : null) ||
      examList.find((item) => item.id === id) ||
      null

    setAssignment(loadedAssignment)

    if (!loadedExam) {
      setIsLoaded(true)
      return
    }

    const resolvedSubjectId =
      loadedExam.subjectId ||
      courseList.find((course) => course.id === loadedExam.courseId)?.subjectId ||
      null

    setExam({
      id: loadedExam.id,
      title: loadedExam.title,
      subjectId: resolvedSubjectId ?? loadedExam.subjectId,
      duration: loadedExam.duration,
      teacherId: loadedExam.ownerId,
    })
    setSubject(
      resolvedSubjectId
        ? initialSubjects.find((item) => item.id === resolvedSubjectId) || null
        : null,
    )

    const storedQuestions = getAll<Question>('questions')
    const questionPool = storedQuestions.length ? storedQuestions : initialQuestions
    const mappedQuestions = questionPool
      .filter((question) => loadedExam.questionIds.includes(question.id))
      .sort((left, right) => left.order - right.order)
      .map(mapLocalQuestion)

    setQuestions(mappedQuestions)

    const attemptKey = loadedAssignment?.id ?? loadedExam.id
    assignmentIdRef.current = attemptKey
    const savedAnswers = localStorage.getItem(
      `attempt_${attemptKey}_${CURRENT_STUDENT_ID}`,
    )
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers) as Record<string, string>)
    }
    setTimeRemaining(loadedExam.duration * 60)
    setCompletionState(null)
    setIsLoaded(true)
  }, [id])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoaded(false)
      setCompletionState(null)

      if (!isApiConfigured()) {
        loadLocalSession()
        return
      }

      try {
        const assignedExams = await fetchAssignedExams()
        const summary = assignedExams.find((item) => item.exam.id === id)

        if (!summary) {
          if (isMounted) {
            loadLocalSession()
          }
          return
        }

        if (
          summary.attemptStatus === 'submitted' ||
          summary.attemptStatus === 'force_submitted'
        ) {
          if (!isMounted) {
            return
          }

          setCompletionState({
            title: 'Шалгалт дууссан',
            description:
              'Энэ шалгалтыг аль хэдийн дуусгасан тул дахин нээх боломжгүй.',
          })
          setIsApiBacked(true)
          setIsLoaded(true)
          return
        }

        if (summary.attemptStatus === 'closed') {
          if (!isMounted) {
            return
          }

          setCompletionState({
            title: 'Шалгалт хаагдсан',
            description:
              'Шалгалтын хугацаа дууссан тул дахин орох боломжгүй байна.',
          })
          setIsApiBacked(true)
          setIsLoaded(true)
          return
        }

        if (summary.attemptStatus === 'upcoming') {
          if (!isMounted) {
            return
          }

          setCompletionState({
            title: 'Шалгалт эхлээгүй байна',
            description: 'Товлосон хугацаа эхлэх үед энэ шалгалт руу орно.',
          })
          setIsApiBacked(true)
          setIsLoaded(true)
          return
        }

        const activeSession =
          summary.session?.status === 'in_progress'
            ? summary.session
            : await startExamSession(summary.exam.id)

        const attempt = await fetchExamAttempt(activeSession.id)

        if (!isMounted) {
          return
        }

        const mappedSubject =
          initialSubjects.find((item) => item.id === attempt.exam.subject) || null

        setIsApiBacked(true)
        setSessionId(attempt.session.id)
        assignmentIdRef.current = attempt.exam.id
        setAssignment(null)
        setExam({
          id: attempt.exam.id,
          title: attempt.exam.title,
          subjectId: attempt.exam.subject,
          duration: attempt.exam.durationMinutes,
          teacherId: attempt.exam.teacherId,
        })
        setSubject(mappedSubject)
        setQuestions(mapAttemptToQuestionList(attempt))
        setAnswers(mapAttemptToAnswerMap(attempt))
        setTimeRemaining(attempt.timing.timeRemainingSeconds)
        setStartedAt(attempt.session.startedAt)
        setLastSaved(null)
        cacheExamAttempt(attempt.exam.id, currentStudentId, {
          exam: {
            id: attempt.exam.id,
            title: attempt.exam.title,
            subjectId: attempt.exam.subject,
            duration: attempt.exam.durationMinutes,
            teacherId: attempt.exam.teacherId,
          },
          sessionId: attempt.session.id,
          assignmentId: attempt.exam.id,
          questions: mapAttemptToQuestionList(attempt),
          answers: mapAttemptToAnswerMap(attempt),
          timeRemaining: attempt.timing.timeRemainingSeconds,
          startedAt: attempt.session.startedAt ?? new Date().toISOString(),
        })
        setIsLoaded(true)
      } catch {
        if (isMounted) {
          const cachedAttempt = readCachedExamAttempt(id, currentStudentId)

          if (cachedAttempt) {
            setIsApiBacked(true)
            setSessionId(cachedAttempt.sessionId)
            assignmentIdRef.current = cachedAttempt.assignmentId
            setAssignment(null)
            setExam(cachedAttempt.exam)
            setSubject(
              initialSubjects.find(
                (item) => item.id === cachedAttempt.exam.subjectId,
              ) || null,
            )
            setQuestions(cachedAttempt.questions)
            setAnswers(cachedAttempt.answers)
            setTimeRemaining(cachedAttempt.timeRemaining)
            setStartedAt(cachedAttempt.startedAt)
            setLastSaved(new Date())
            setIsLoaded(true)
            return
          }

          loadLocalSession()
        }
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [id, loadLocalSession])

  useEffect(() => {
    if (isApiBacked || !exam) {
      return
    }

    const attemptKey = assignmentIdRef.current ?? assignment?.id ?? exam.id
    localStorage.setItem(
      `attempt_${attemptKey}_${currentStudentId}`,
      JSON.stringify(answers),
    )
    setLastSaved(new Date())
  }, [answers, assignment?.id, currentStudentId, exam, isApiBacked])

  const setAnswerValue = useCallback(
    (question: StudentExamQuestion, value: string) => {
      setAnswers((prev) => {
        const next = { ...prev, [question.id]: value }
        latestAnswersRef.current = next
        return next
      })

      if (!isApiBacked || !sessionId) {
        return
      }

      if (saveTimeoutsRef.current[question.id]) {
        window.clearTimeout(saveTimeoutsRef.current[question.id])
      }

      saveTimeoutsRef.current[question.id] = window.setTimeout(() => {
        void autosaveExamAnswer({
          sessionId,
          question,
          value,
        })
          .then(() => setLastSaved(new Date()))
          .catch(() => null)
      }, 500)
    },
    [isApiBacked, sessionId],
  )

  const flushPendingSaves = useCallback(async () => {
    if (!isApiBacked || !sessionId) {
      return
    }

    const pendingQuestions = latestQuestionsRef.current.filter((question) =>
      isAnswerFilled(latestAnswersRef.current[question.id]),
    )

    await Promise.all(
      pendingQuestions.map((question) =>
        autosaveExamAnswer({
          sessionId,
          question,
          value: latestAnswersRef.current[question.id] ?? '',
        }).catch(() => null),
      ),
    )
  }, [isApiBacked, sessionId])

  const submitCurrentSession = useCallback(async () => {
    if (!exam) {
      return false
    }

    if (!isApiBacked || !sessionId) {
      return true
    }

    await flushPendingSaves()
    try {
      await submitExamSession(sessionId)
    } catch {
      const now = new Date().toISOString()
      queueOfflineSubmission({
        assignmentId: assignmentIdRef.current ?? exam.id,
        examId: exam.id,
        studentId: currentStudentId,
        attempt: {
          id: sessionId,
          examId: exam.id,
          assignmentId: assignmentIdRef.current ?? exam.id,
          studentId: currentStudentId,
          startedAt: startedAt ?? now,
          submittedAt: now,
          answers: latestAnswersRef.current,
        },
        result: {
          id: `offline-result-${sessionId}`,
          attemptId: sessionId,
          studentId: currentStudentId,
          examId: exam.id,
          submittedAt: now,
        },
        queuedAt: now,
      })
      setCompletionState({
        title: 'Шалгалт хадгалагдлаа',
        description:
          'Интернэт сэргээх үед шалгалтын өгөгдөл автоматаар сервертэй sync хийгдэнэ.',
      })
      return true
    }

    setCompletionState({
      title: 'Шалгалт дууссан',
      description:
        'Шалгалтыг амжилттай илгээлээ. Энэ оролдлогыг дахин нээх боломжгүй.',
    })
    return true
  }, [currentStudentId, exam, flushPendingSaves, isApiBacked, sessionId, startedAt])

  const reportVisibilityViolation = useCallback(
    (type: 'tab_switch' | 'window_blur') => {
      if (!isApiBacked || !exam) {
        return
      }

      void createProctoringViolation({
        teacherId: exam.teacherId ?? '',
        studentId: currentStudentId,
        studentName: currentStudentName,
        examId: exam.id,
        examTitle: exam.title,
        assignmentId: assignmentIdRef.current ?? exam.id,
        type,
      }).catch(() => null)
    },
    [currentStudentId, currentStudentName, exam, isApiBacked],
  )

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  return {
    exam,
    assignment,
    subject,
    questions,
    answers,
    markedForReview,
    lastSaved,
    isLoaded,
    sessionId,
    timeRemaining,
    setTimeRemaining,
    completionState,
    isApiBacked,
    currentStudentId,
    currentStudentName,
    setMarkedForReview,
    setAnswerValue,
    submitCurrentSession,
    reportVisibilityViolation,
    formatTime,
    startedAt,
  }
}
