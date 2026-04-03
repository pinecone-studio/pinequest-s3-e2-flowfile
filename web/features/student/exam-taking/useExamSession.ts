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
  type StudentProctoringViolationType,
  type StudentExamQuestion,
} from '@/lib/api/student-exams'
import {
  cacheExamAttempt,
  queueOfflineSubmission,
  readCachedExamAttempt,
} from '@/lib/pwa/offline-exam'
import { createLocalNotification } from '@/lib/notifications'
import { getAll } from '@/lib/data'
import {
  getCurrentStudentId,
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

function createSeededRandom(seed: string) {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  let state = hash >>> 0 || 0x6d2b79f5

  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleQuestionsForStudent(
  questions: StudentExamQuestion[],
  seed: string,
) {
  const shuffled = [...questions]
  const random = createSeededRandom(seed)

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled.map((question, index) => ({
    ...question,
    order: index + 1,
  }))
}

const LOCAL_PROCTORING_MESSAGE: Record<StudentProctoringViolationType, string> = {
  face_not_detected: 'камерын хүрээнээс гарсан',
  multiple_faces_detected: 'олон нүүр илэрсэн',
  tab_switch: 'шалгалтын tab-аа сольсон',
  window_blur: 'шалгалтын цонхоос гарсан',
  audio_detected: 'дуу чимээний дохио үүсгэсэн',
  device_changed: 'төхөөрөмж эсвэл камерын орчныг сольсон',
  looking_left: 'зүүн тийш харсан',
  looking_right: 'баруун тийш харсан',
  looking_up: 'дээш харсан',
  looking_down: 'доош харсан',
}

export function useExamSession(
  id: string,
  options?: {
    enabled?: boolean
    qrClassName?: string | null
  },
) {
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
  const proctoringCooldownRef = useRef<Partial<Record<StudentProctoringViolationType, number>>>({})
  const isEnabled = options?.enabled ?? true

  const currentStudent = getCurrentStudent()
  const currentStudentId = getCurrentStudentId()
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

    setQuestions(
      shuffleQuestionsForStudent(
        mappedQuestions,
        `${loadedExam.id}:${currentStudentId}`,
      ),
    )

    const attemptKey = loadedAssignment?.id ?? loadedExam.id
    assignmentIdRef.current = attemptKey
    const savedAnswers = localStorage.getItem(
      `attempt_${attemptKey}_${currentStudentId}`,
    )
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers) as Record<string, string>)
    }
    setTimeRemaining(loadedExam.duration * 60)
    setCompletionState(null)
    setIsLoaded(true)
  }, [currentStudentId, id])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (!isEnabled) {
        return
      }

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
  }, [id, isEnabled, loadLocalSession])

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

  const reportProctoringViolation = useCallback(
    (
      input:
        | StudentProctoringViolationType
        | {
            type: StudentProctoringViolationType
            details?: string
            metadata?: Record<string, string | number | boolean | null>
          },
    ) => {
      if (!exam) {
        return
      }

      const payload = typeof input === 'string' ? { type: input } : input
      const now = Date.now()
      const lastReportedAt = proctoringCooldownRef.current[payload.type] ?? 0
      const cooldownMs =
        payload.type === 'tab_switch' || payload.type === 'window_blur'
          ? 5_000
          : 20_000

      if (now - lastReportedAt < cooldownMs) {
        return
      }

      proctoringCooldownRef.current[payload.type] = now

      if (!isApiBacked || !sessionId) {
        if (exam.teacherId) {
          createLocalNotification({
            recipientId: exam.teacherId,
            examId: exam.id,
            title: 'Proctoring alert',
            body: `${currentStudentName} "${exam.title}" шалгалтын үеэр ${LOCAL_PROCTORING_MESSAGE[payload.type]}${payload.details ? `. ${payload.details}` : '.'}`,
            type: 'suspicious_event',
          })
        }

        return
      }

      void createProctoringViolation({
        examId: exam.id,
        assignmentId: assignmentIdRef.current ?? exam.id,
        sessionId: sessionId ?? undefined,
        type: payload.type,
        className: options?.qrClassName ?? undefined,
        details: payload.details,
        metadata: payload.metadata,
      }).catch(() => null)
    },
    [currentStudentName, exam, isApiBacked, options?.qrClassName, sessionId],
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
    reportProctoringViolation,
    formatTime,
    startedAt,
  }
}
