'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Copy, QrCode, Radio, RefreshCw, Sparkles } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { getAll, initialClasses, initialCourses, initialUsers } from '@/lib/data'
import { QUESTION_TYPE_LABELS, type Course, type Question, type SchoolClass } from '@/lib/types'
import { SUBJECT_NAMES } from '@/lib/constants'
import { isLocalShareUrl } from '@/lib/share-links'
import {
  createExam,
  createQuestion,
  enrollStudent,
  fetchAnswersBySession,
  fetchExamSessions,
  fetchQuestionsByExam,
  fetchUsersByRole,
  gradeExamSession,
  isApiConfigured,
  mapTeacherApiQuestionToLocalQuestion,
  updateExamStatus,
  type ExamSession,
  type TeacherExamAnswer,
  type TeacherUser,
} from '@/lib/api/teacher-exams'
import { serializeQuestionForApi } from '@/lib/exam-question-meta'
import { saveExamPayload } from '@/features/teacher/create-exam/createExamUtils'
import {
  buildQuickQuizQrUrl,
  buildQuickQuizShareUrl,
  buildQuickQuizTitle,
  generateAllTaskDemoQuestions,
  generateQuickQuizQuestions,
  normalizeQuickQuizState,
  readStoredQuickQuiz,
  resolveQuickQuizShareOrigin,
  writeStoredQuickQuiz,
  type QuickQuizState,
} from './quickQuizUtils'

function parseStoredAnswer(value: string | null) {
  if (!value) {
    return ''
  }

  try {
    const parsed = JSON.parse(value) as unknown

    if (typeof parsed === 'string') {
      return parsed
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      'value' in parsed &&
      typeof parsed.value === 'string'
    ) {
      return parsed.value
    }
  } catch {
    return value
  }

  return value
}

function parseLiveAnswer(
  question: Question,
  answer: TeacherExamAnswer | undefined,
) {
  if (!answer) {
    return 'Хариулаагүй'
  }

  if (answer.fileUrl) {
    return answer.fileUrl
  }

  if (answer.formulaAnswerJson) {
    return parseStoredAnswer(answer.formulaAnswerJson)
  }

  if (question.type === 'multiple' && answer.textAnswer) {
    try {
      const parsed = JSON.parse(answer.textAnswer) as unknown
      if (Array.isArray(parsed)) {
        return parsed.join(', ')
      }
    } catch {
      return answer.textAnswer
    }
  }

  return answer.textAnswer ? parseStoredAnswer(answer.textAnswer) : 'Хариулаагүй'
}

function isAnswerCorrect(question: Question, answer: TeacherExamAnswer | undefined) {
  if (!answer || !question.correctAnswer || question.isManualGrade) {
    return false
  }

  const value = parseLiveAnswer(question, answer)

  if (question.type === 'multiple') {
    if (typeof value !== 'string' || !Array.isArray(question.correctAnswer)) {
      return false
    }

    const selected = value
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .sort()
    const correct = [...question.correctAnswer]
      .map((item) => item.trim().toLowerCase())
      .sort()

    return (
      selected.length === correct.length &&
      selected.every((item, index) => item === correct[index])
    )
  }

  return (
    typeof value === 'string' &&
    !Array.isArray(question.correctAnswer) &&
    value.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()
  )
}

function formatCourseLabel(course: Course | undefined) {
  if (!course) {
    return ''
  }

  return `${SUBJECT_NAMES[course.subjectId] ?? course.subjectId} • ${course.grade}-р анги`
}

export function QuickQuizClient() {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses)
  const [courseId, setCourseId] = useState('')
  const [classId, setClassId] = useState('')
  const [topic, setTopic] = useState('')
  const [summary, setSummary] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [durationMinutes, setDurationMinutes] = useState(10)
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([])
  const [quizState, setQuizState] = useState<QuickQuizState | null>(null)
  const [showGeneratedPanels, setShowGeneratedPanels] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [liveSessions, setLiveSessions] = useState<ExamSession[]>([])
  const [liveQuestions, setLiveQuestions] = useState<Question[]>([])
  const [liveUsers, setLiveUsers] = useState<TeacherUser[]>([])
  const [answersBySessionId, setAnswersBySessionId] = useState<
    Record<string, TeacherExamAnswer[]>
  >({})
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const generatedSectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const storedCourses = getAll<Course>('courses')
    const storedClasses = getAll<SchoolClass>('classes')

    if (storedCourses.length > 0) {
      setCourses(storedCourses)
    }

    if (storedClasses.length > 0) {
      setClasses(storedClasses)
    }

    const storedQuiz = readStoredQuickQuiz(resolveQuickQuizShareOrigin())
    if (storedQuiz) {
      setQuizState(storedQuiz)
      setShowGeneratedPanels(true)
    }
  }, [])

  useEffect(() => {
    if (!showGeneratedPanels || !quizState || !generatedSectionRef.current) {
      return
    }

    generatedSectionRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [quizState, showGeneratedPanels])

  const selectedCourse = courses.find((course) => course.id === courseId)
  const selectedClass = classes.find((schoolClass) => schoolClass.id === classId)

  const createQuizFromQuestions = async (params: {
    questionsToCreate: Question[]
    title: string
    description: string
    topicLabel: string
    durationMinutesValue: number
    successTitle: string
    successDescription: string
    fallbackCourse?: Course
  }) => {
    if (isCreating) {
      return
    }

    const activeCourse = selectedCourse ?? params.fallbackCourse
    const activeClass = selectedClass

    setPreviewQuestions(params.questionsToCreate)
    setIsCreating(true)

    try {
      if (isApiConfigured()) {
        const apiStudents = await fetchUsersByRole('student')

        if (apiStudents.length === 0) {
          throw new Error('Бүртгэлтэй сурагч олдсонгүй.')
        }

        const classStudentIds = activeClass
          ? new Set(activeClass.studentIds)
          : null
        const matchedStudents = classStudentIds
          ? apiStudents.filter((student) => classStudentIds.has(student.id))
          : apiStudents
        const enrolledStudents =
          matchedStudents.length > 0 ? matchedStudents : apiStudents
        const now = new Date()
        const endsAt = new Date(now.getTime() + params.durationMinutesValue * 60 * 1000)
        const exam = await createExam({
          title: params.title,
          subject: activeCourse?.subjectId ?? 'QUIZ',
          description: params.description,
          durationMinutes: params.durationMinutesValue,
          shuffleQuestions: true,
          allowCopyPaste: false,
          requireFullscreen: false,
          maxTabSwitches: 5,
          startsAt: now.toISOString(),
          endsAt: endsAt.toISOString(),
        })

        for (const [index, question] of params.questionsToCreate.entries()) {
          const serialized = serializeQuestionForApi(question)

          await createQuestion(exam.id, {
            content: question.text,
            inputType: serialized.inputType,
            points: question.points,
            orderIndex: index + 1,
            isRequired: true,
            subjectHint: serialized.subjectHint,
            optionsJson: serialized.optionsJson,
            correctAnswer: serialized.correctAnswer,
          })
        }

        await Promise.all(
          enrolledStudents.map((student) => enrollStudent(exam.id, student.id)),
        )
        await updateExamStatus(exam.id, 'published')

        const shareUrl = buildQuickQuizShareUrl(
          exam.id,
          resolveQuickQuizShareOrigin(),
        )
        const createdState: QuickQuizState = normalizeQuickQuizState({
          examId: exam.id,
          title: params.title,
          shareUrl,
          qrCodeUrl: buildQuickQuizQrUrl(shareUrl),
          questionCount: params.questionsToCreate.length,
          durationMinutes: params.durationMinutesValue,
          topic: params.topicLabel,
          courseLabel: formatCourseLabel(activeCourse) || undefined,
          classLabel: activeClass?.name,
          createdAt: new Date().toISOString(),
        })

        setQuizState(createdState)
        setShowGeneratedPanels(true)
        writeStoredQuickQuiz(createdState)
        setSelectedSessionId(null)

        toast({
          title: params.successTitle,
          description:
            activeClass && matchedStudents.length === 0
              ? 'Сонгосон ангид таарах сурагч олдсонгүй. Иймээс бүх сурагчид нээлттэй болголоо.'
              : params.successDescription,
        })

        return
      }

      if (!activeCourse) {
        throw new Error('Хичээлээ сонгоно уу.')
      }

      const now = new Date()
      const endsAt = new Date(now.getTime() + params.durationMinutesValue * 60 * 1000)
      const formatPart = (value: Date) => value.toISOString().slice(0, 10)
      const formatTime = (value: Date) => value.toISOString().slice(11, 16)
      const exam = await saveExamPayload({
        questions: params.questionsToCreate,
        title: params.title,
        selectedCourse: activeCourse,
        chapter: 'Шуурхай quiz',
        topic: params.topicLabel,
        description: params.description,
        duration: params.durationMinutesValue,
        totalPoints: params.questionsToCreate.reduce(
          (sum, question) => sum + question.points,
          0,
        ),
        visibility: 'private',
        selectedClasses: activeClass ? [activeClass.id] : [],
        startDate: formatPart(now),
        startTime: formatTime(now),
        endDate: formatPart(endsAt),
        endTime: formatTime(endsAt),
        classes,
      })

      const shareUrl = buildQuickQuizShareUrl(
        exam.id,
        resolveQuickQuizShareOrigin(),
      )
      const createdState: QuickQuizState = normalizeQuickQuizState({
        examId: exam.id,
        title: params.title,
        shareUrl,
        qrCodeUrl: buildQuickQuizQrUrl(shareUrl),
        questionCount: params.questionsToCreate.length,
        durationMinutes: params.durationMinutesValue,
        topic: params.topicLabel,
        courseLabel: formatCourseLabel(activeCourse) || undefined,
        classLabel: activeClass?.name,
        createdAt: new Date().toISOString(),
      })

      setQuizState(createdState)
      setShowGeneratedPanels(true)
      writeStoredQuickQuiz(createdState)
      toast({
        title: params.successTitle,
        description: params.successDescription,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Шуурхай шалгалт үүсгэж чадсангүй',
        description:
          error instanceof Error ? error.message : 'Дахин оролдоно уу.',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const liveStudentMap = useMemo(
    () =>
      new Map(
        [
          ...liveUsers.map((user) => [user.id, user.name] as const),
          ...initialUsers
            .filter((user) => user.role === 'student')
            .map((user) => [user.id, user.name] as const),
        ],
      ),
    [liveUsers],
  )

  useEffect(() => {
    if (!quizState || !isApiConfigured()) {
      return
    }

    let isCancelled = false

    const loadLiveState = async () => {
      try {
        const [sessions, questions, users] = await Promise.all([
          fetchExamSessions(quizState.examId),
          fetchQuestionsByExam(quizState.examId),
          fetchUsersByRole('student'),
        ])

        if (isCancelled) {
          return
        }

        const relevantSessions = sessions.filter(
          (session) =>
            session.status === 'in_progress' ||
            session.status === 'submitted' ||
            session.status === 'force_submitted' ||
            session.status === 'graded',
        )

        setLiveSessions(relevantSessions)
        setLiveQuestions(
          questions
            .map(mapTeacherApiQuestionToLocalQuestion)
            .sort((left, right) => left.order - right.order),
        )
        setLiveUsers(users)

        const answers = await Promise.all(
          relevantSessions.map(async (session) => ({
            sessionId: session.id,
            answers: await fetchAnswersBySession(session.id),
          })),
        )

        if (isCancelled) {
          return
        }

        setAnswersBySessionId(
          answers.reduce<Record<string, TeacherExamAnswer[]>>((result, item) => {
            result[item.sessionId] = item.answers
            return result
          }, {}),
        )

        setSelectedSessionId((previous) => {
          if (previous && relevantSessions.some((session) => session.id === previous)) {
            return previous
          }

          return relevantSessions[0]?.id ?? null
        })
      } catch {
        // Keep the latest successful poll result on screen.
      }
    }

    void loadLiveState()
    const interval = window.setInterval(() => {
      void loadLiveState()
    }, 5000)

    return () => {
      isCancelled = true
      window.clearInterval(interval)
    }
  }, [quizState])

  const handlePreview = () => {
    if (!topic.trim() || !summary.trim()) {
      toast({
        variant: 'destructive',
        title: 'Сэдэв ба товч агуулгаа оруулна уу',
      })
      return
    }

    setPreviewQuestions(
      generateQuickQuizQuestions({
        topic,
        summary,
        count: questionCount,
      }),
    )
  }

  const handleFillDemo = () => {
    const demoCourse = courses[0]
    const demoClass =
      classes.find((schoolClass) =>
        demoCourse ? demoCourse.classIds.includes(schoolClass.id) : false,
      ) ?? classes[0]
    const demoTopic = 'Квадрат тэгшитгэл'
    const demoSummary =
      'ax² + bx + c = 0 хэлбэрийн тэгшитгэлийн язгуур, дискриминант, графиктай холбоотой суурь ойлголтууд.'

    if (demoCourse) {
      setCourseId(demoCourse.id)
    }

    if (demoClass) {
      setClassId(demoClass.id)
    }

    setTopic(demoTopic)
    setSummary(demoSummary)
    setQuestionCount(5)
    setDurationMinutes(10)
    setPreviewQuestions(
      generateQuickQuizQuestions({
        topic: demoTopic,
        summary: demoSummary,
        count: 5,
      }),
    )
  }

  const handleCreateAllTaskDemoQuiz = async () => {
    const fallbackCourse = selectedCourse ?? courses[0]
    const demoTopic = 'Бүх төрлийн demo шалгалт'
    const demoSummary =
      'Нэг сонголт, олон сонголт, үнэн худал, тааруулах, богино ба урт текст, томъёо, химийн бүтэц, код, дуу, видео, гараар бичсэн хариултыг нэг дор турших жишиг шалгалт.'
    const demoQuestions = generateAllTaskDemoQuestions(demoTopic)
    const demoDuration = 25

    if (fallbackCourse) {
      setCourseId(fallbackCourse.id)
    }

    setTopic(demoTopic)
    setSummary(demoSummary)
    setQuestionCount(demoQuestions.length)
    setDurationMinutes(demoDuration)
    setPreviewQuestions(demoQuestions)

    await createQuizFromQuestions({
      questionsToCreate: demoQuestions,
      title: demoTopic,
      description: demoSummary,
      topicLabel: demoTopic,
      durationMinutesValue: demoDuration,
      successTitle: 'Бүх төрлийн demo шалгалт бэлэн боллоо',
      successDescription:
        'QR кодоо нээгээд сурагч талаас бүх төрлийн хариултыг туршаад submit хийж болно.',
      fallbackCourse,
    })
  }

  const handleCreateQuiz = async () => {
    if (!topic.trim() || !summary.trim() || isCreating) {
      return
    }

    const generatedQuestions = generateQuickQuizQuestions({
      topic,
      summary,
      count: questionCount,
    })
    await createQuizFromQuestions({
      questionsToCreate: generatedQuestions,
      title: buildQuickQuizTitle(topic),
      description: summary,
      topicLabel: topic,
      durationMinutesValue: durationMinutes,
      successTitle: 'Шуурхай шалгалт бэлэн боллоо',
      successDescription: 'QR кодоо нээгээд сурагчдадаа тараагаарай.',
    })
  }

  const handleCopyLink = async () => {
    if (!quizState) {
      return
    }

    try {
      await navigator.clipboard.writeText(quizState.shareUrl)
      toast({
        title: 'Холбоос хуулагдлаа',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Холбоос хуулах боломжгүй байна',
      })
    }
  }

  const handleRefreshNow = async () => {
    if (!quizState || !isApiConfigured()) {
      return
    }

    setIsRefreshing(true)

    try {
      const [sessions, questions, users] = await Promise.all([
        fetchExamSessions(quizState.examId),
        fetchQuestionsByExam(quizState.examId),
        fetchUsersByRole('student'),
      ])
      const relevantSessions = sessions.filter(
        (session) =>
          session.status === 'in_progress' ||
          session.status === 'submitted' ||
          session.status === 'force_submitted' ||
          session.status === 'graded',
      )
      const answers = await Promise.all(
        relevantSessions.map(async (session) => ({
          sessionId: session.id,
          answers: await fetchAnswersBySession(session.id),
        })),
      )

      setLiveSessions(relevantSessions)
      setLiveQuestions(
        questions
          .map(mapTeacherApiQuestionToLocalQuestion)
          .sort((left, right) => left.order - right.order),
      )
      setLiveUsers(users)
      setAnswersBySessionId(
        answers.reduce<Record<string, TeacherExamAnswer[]>>((result, item) => {
          result[item.sessionId] = item.answers
          return result
        }, {}),
      )
    } finally {
      setIsRefreshing(false)
    }
  }

  const selectedLiveSession =
    liveSessions.find((session) => session.id === selectedSessionId) ?? null
  const selectedLiveAnswers = selectedLiveSession
    ? answersBySessionId[selectedLiveSession.id] ?? []
    : []
  const activeCount = liveSessions.filter((session) => session.status === 'in_progress').length
  const submittedCount = liveSessions.filter(
    (session) =>
      session.status === 'submitted' ||
      session.status === 'force_submitted' ||
      session.status === 'graded',
  ).length
  const gradedCount = liveSessions.filter((session) => session.status === 'graded').length
  const averageScore = (() => {
    const scoredSessions = liveSessions.filter((session) => session.score !== null)

    if (scoredSessions.length === 0) {
      return null
    }

    return Math.round(
      scoredSessions.reduce((sum, session) => sum + (session.score ?? 0), 0) /
        scoredSessions.length,
    )
  })()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>
            Шуурхай Quiz
          </h1>
          <p className="text-[13px]" style={{ color: '#5A6474' }}>
            Хичээлийн сэдэв, товч агуулга оруулаад шууд QR-тай quiz нээгээрэй.
          </p>
        </div>
        <Link
          href="/teacher/exams/create"
          className="px-4 py-2 rounded-lg text-[13px] font-medium border"
          style={{ borderColor: '#DDE1E7', color: '#5A6474' }}
        >
          Бүрэн шалгалт үүсгэх
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="bg-white border rounded-[14px] p-6" style={{ borderColor: '#DDE1E7' }}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} strokeWidth={1.8} style={{ color: '#0066FF' }} />
              <h2 className="text-[16px] font-semibold" style={{ color: '#1A1A2E' }}>
                Quiz тохируулах
              </h2>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="rounded-lg border px-3 py-2 text-[12px] font-medium"
              style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}
            >
              Demo
            </button>
            <button
              type="button"
              onClick={() => {
                const demoTopic = 'Бүх төрлийн demo шалгалт'
                const demoSummary =
                  'Нэг сонголт, олон сонголт, үнэн худал, тааруулах, богино ба урт текст, томъёо, химийн бүтэц, код, дуу, видео, гараар бичсэн хариултыг нэг дор турших жишиг шалгалт.'
                const demoQuestions = generateAllTaskDemoQuestions(demoTopic)
                const fallbackCourse = selectedCourse ?? courses[0]

                if (fallbackCourse) {
                  setCourseId(fallbackCourse.id)
                }

                setTopic(demoTopic)
                setSummary(demoSummary)
                setQuestionCount(demoQuestions.length)
                setDurationMinutes(25)
                setPreviewQuestions(demoQuestions)
              }}
              className="rounded-lg border px-3 py-2 text-[12px] font-medium"
              style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}
            >
              Бүх төрөл
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A2E' }}>
                Хичээл
              </label>
              <select
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-lg text-[14px] bg-white"
                style={{ borderColor: '#DDE1E7' }}
              >
                <option value="">Сонгоогүй</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {formatCourseLabel(course)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A2E' }}>
                Анги
              </label>
              <select
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-lg text-[14px] bg-white"
                style={{ borderColor: '#DDE1E7' }}
              >
                <option value="">Бүх сурагч</option>
                {classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A2E' }}>
              Хичээлийн сэдэв
            </label>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Жишээ: Квадрат тэгшитгэл"
              className="w-full px-3.5 py-2.5 border rounded-lg text-[14px]"
              style={{ borderColor: '#DDE1E7' }}
            />
          </div>

          <div className="mt-4">
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A2E' }}>
              Товч агуулга
            </label>
            <Textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Өнөөдөр ямар ойлголт, жишээ, томьёо, дүрэм үзсэнээ товч бичээрэй."
              rows={6}
              className="min-h-[144px] resize-none border-[#DDE1E7] bg-white px-3.5 py-2.5 text-[14px]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A2E' }}>
                Асуултын тоо
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={questionCount}
                onChange={(event) =>
                  setQuestionCount(
                    Math.min(10, Math.max(3, Number(event.target.value) || 3)),
                  )
                }
                className="w-full px-3.5 py-2.5 border rounded-lg text-[14px]"
                style={{ borderColor: '#DDE1E7' }}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A2E' }}>
                Хугацаа, мин
              </label>
              <input
                type="number"
                min={5}
                max={45}
                value={durationMinutes}
                onChange={(event) =>
                  setDurationMinutes(
                    Math.min(45, Math.max(5, Number(event.target.value) || 5)),
                  )
                }
                className="w-full px-3.5 py-2.5 border rounded-lg text-[14px]"
                style={{ borderColor: '#DDE1E7' }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handlePreview}
              className="px-4 py-2 rounded-lg text-[13px] font-medium border"
              style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}
            >
              Preview харах
            </button>
            <button
              onClick={handleCreateQuiz}
              disabled={isCreating}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: '#0066FF' }}
            >
              {isCreating ? 'Үүсгэж байна...' : 'QR-тай quiz үүсгэх'}
            </button>
            <button
              onClick={() => void handleCreateAllTaskDemoQuiz()}
              disabled={isCreating}
              className="px-4 py-2 rounded-lg text-[13px] font-medium border disabled:opacity-50"
              style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}
            >
              {isCreating ? 'Үүсгэж байна...' : 'Бүх төрлийн demo шалгалт'}
            </button>
          </div>

          <div className="mt-4 text-[12px]" style={{ color: '#8A94A0' }}>
            Энэ quiz QR-аар шууд нээгдэнэ. Хэрэв сонгосон ангид таарах сурагч олдохгүй бол бүх сурагчид нээлттэй болно.
          </div>
        </div>

        <div className="bg-white border rounded-[14px] p-6" style={{ borderColor: '#DDE1E7' }}>
          <div className="flex items-center gap-2 mb-5">
            <Radio size={18} strokeWidth={1.8} style={{ color: '#1A7A4A' }} />
            <h2 className="text-[16px] font-semibold" style={{ color: '#1A1A2E' }}>
              Асуултын preview
            </h2>
          </div>

          {previewQuestions.length > 0 ? (
            <div className="space-y-3">
              {previewQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-xl border p-4"
                  style={{ borderColor: '#E6EAF0', backgroundColor: '#FAFBFD' }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[12px] font-medium" style={{ color: '#0066FF' }}>
                      Асуулт {index + 1}
                    </span>
                    <span className="text-[11px]" style={{ color: '#8A94A0' }}>
                      {QUESTION_TYPE_LABELS[question.type]}
                    </span>
                  </div>
                  <div className="text-[14px] leading-6" style={{ color: '#1A1A2E' }}>
                    {question.text}
                  </div>
                  {question.options && (
                    <div className="mt-3 grid gap-2">
                      {question.options.map((option) => (
                        <div
                          key={option}
                          className="rounded-lg px-3 py-2 text-[13px]"
                          style={{
                            backgroundColor:
                              option === question.correctAnswer ? '#E8F5EE' : '#F3F5F8',
                            color:
                              option === question.correctAnswer ? '#1A7A4A' : '#5A6474',
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                  {question.matchingPairs && (
                    <div className="mt-3 space-y-2">
                      {question.matchingPairs.map((pair) => (
                        <div
                          key={`${pair.left}-${pair.right}`}
                          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-[13px]"
                          style={{ backgroundColor: '#F3F5F8', color: '#5A6474' }}
                        >
                          <span>{pair.left}</span>
                          <span>↔</span>
                          <span>{pair.right}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!question.options && !question.matchingPairs && (
                    <div
                      className="mt-3 rounded-lg px-3 py-2 text-[13px]"
                      style={{ backgroundColor: '#F3F5F8', color: '#5A6474' }}
                    >
                      Нээлттэй хариулттай даалгавар
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl border border-dashed px-5 py-10 text-center text-[13px]"
              style={{ borderColor: '#DDE1E7', color: '#8A94A0' }}
            >
              Сэдэв, агуулгаа оруулаад preview хараарай.
            </div>
          )}
        </div>
      </div>

      {quizState && showGeneratedPanels && (
        <div
          ref={generatedSectionRef}
          className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]"
        >
          <div className="bg-white border rounded-[14px] p-6" style={{ borderColor: '#DDE1E7' }}>
            <div className="flex items-center gap-2 mb-4">
              <QrCode size={18} strokeWidth={1.8} style={{ color: '#0066FF' }} />
              <h2 className="text-[16px] font-semibold" style={{ color: '#1A1A2E' }}>
                QR код
              </h2>
            </div>
            <div
              className="rounded-[18px] p-4 border mb-4"
              style={{ borderColor: '#E6EAF0', backgroundColor: '#FAFBFD' }}
            >
              <div className="mx-auto w-full max-w-[220px] rounded-[14px] bg-white">
                <Image
                  src={quizState.qrCodeUrl}
                  alt="Шуурхай шалгалтын QR код"
                  width={220}
                  height={220}
                  className="h-auto w-full rounded-[14px] bg-white"
                  unoptimized
                />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="text-[15px] font-semibold" style={{ color: '#1A1A2E' }}>
                {quizState.title}
              </div>
              <div className="text-[12px]" style={{ color: '#5A6474' }}>
                {quizState.courseLabel ? `${quizState.courseLabel} • ` : ''}
                {quizState.classLabel ?? 'Бүх сурагч'}
              </div>
              <div className="text-[12px]" style={{ color: '#5A6474' }}>
                {quizState.questionCount} асуулт • {quizState.durationMinutes} минут
              </div>
            </div>
            <div
              className="rounded-xl border px-3.5 py-3 text-[12px] break-all mb-3"
              style={{ borderColor: '#E6EAF0', backgroundColor: '#FAFBFD', color: '#1A1A2E' }}
            >
              {quizState.shareUrl}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border"
                style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}
              >
                <Copy size={14} strokeWidth={1.8} />
                Холбоос хуулах
              </button>
              <a
                href={quizState.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white"
                style={{ backgroundColor: '#1A7A4A' }}
              >
                Шалгалтыг нээх
              </a>
            </div>
            {isLocalShareUrl(quizState.shareUrl) && (
              <p className="mt-3 text-[12px]" style={{ color: '#B45309' }}>
                Энэ холбоос өөр төхөөрөмж дээр шууд нээгдэхгүй байж магадгүй. Утсаар scan хийх бол нийтэд нээгдэх хаяг ашиглаарай.
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-[14px] p-6" style={{ borderColor: '#DDE1E7' }}>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-[16px] font-semibold" style={{ color: '#1A1A2E' }}>
                    Шууд хяналт
                  </h2>
                  <p className="text-[12px]" style={{ color: '#5A6474' }}>
                    Сурагчдын илгээсэн хариулт, явц, оноо энд шууд шинэчлэгдэнэ.
                  </p>
                </div>
                {isApiConfigured() && (
                  <button
                    onClick={handleRefreshNow}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium border disabled:opacity-50"
                    style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}
                  >
                    <RefreshCw size={14} strokeWidth={1.8} className={isRefreshing ? 'animate-spin' : ''} />
                    Одоо шинэчлэх
                  </button>
                )}
              </div>

              {isApiConfigured() ? (
                <>
                  <div className="grid gap-4 md:grid-cols-4 mb-6">
                    {[
                      { label: 'Идэвхтэй', value: activeCount, color: '#0066FF' },
                      { label: 'Илгээсэн', value: submittedCount, color: '#1A7A4A' },
                      { label: 'Үнэлэгдсэн', value: gradedCount, color: '#7C3AED' },
                      { label: 'Дундаж оноо', value: averageScore ?? '—', color: '#B45309' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border p-4"
                        style={{ borderColor: '#E6EAF0', backgroundColor: '#FAFBFD' }}
                      >
                        <div className="text-[12px] mb-1" style={{ color: '#8A94A0' }}>
                          {item.label}
                        </div>
                        <div className="text-[24px] font-semibold" style={{ color: item.color }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#E6EAF0' }}>
                      <div className="px-4 py-3 border-b" style={{ borderColor: '#E6EAF0', backgroundColor: '#FAFBFD' }}>
                        <div className="text-[13px] font-medium" style={{ color: '#1A1A2E' }}>
                          Сурагчдын явц
                        </div>
                      </div>
                      <div className="max-h-[520px] overflow-y-auto p-2">
                        {liveSessions.length > 0 ? (
                          liveSessions.map((session) => (
                            <button
                              key={session.id}
                              onClick={() => setSelectedSessionId(session.id)}
                              className="w-full text-left rounded-lg p-3 mb-2 transition-colors"
                              style={{
                                backgroundColor:
                                  selectedSessionId === session.id ? '#EEF5FF' : '#FFFFFF',
                                border:
                                  selectedSessionId === session.id
                                    ? '1px solid #0066FF'
                                    : '1px solid #E6EAF0',
                              }}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-[13px] font-medium" style={{ color: '#1A1A2E' }}>
                                    {liveStudentMap.get(session.studentId) ?? session.studentId}
                                  </div>
                                  <div className="text-[11px]" style={{ color: '#8A94A0' }}>
                                    {session.studentId}
                                  </div>
                                </div>
                                <span
                                  className="px-2 py-0.5 rounded-full text-[11px]"
                                  style={{
                                    backgroundColor:
                                      session.status === 'in_progress'
                                        ? '#EBF2FF'
                                        : session.status === 'graded'
                                          ? '#E8F5EE'
                                          : '#FFF4E5',
                                    color:
                                      session.status === 'in_progress'
                                        ? '#0066FF'
                                        : session.status === 'graded'
                                          ? '#1A7A4A'
                                          : '#B45309',
                                  }}
                                >
                                  {session.status === 'in_progress'
                                    ? 'Оруулж байна'
                                    : session.status === 'graded'
                                      ? 'Үнэлэгдсэн'
                                      : 'Илгээсэн'}
                                </span>
                              </div>
                              <div className="mt-2 text-[12px]" style={{ color: '#5A6474' }}>
                                {session.score !== null ? `Оноо: ${session.score}` : 'Одоогоор дүнгүй'}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-5 text-[13px]" style={{ color: '#8A94A0' }}>
                            Одоогоор холбогдсон сурагч алга байна.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#E6EAF0' }}>
                      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#E6EAF0', backgroundColor: '#FAFBFD' }}>
                        <div>
                          <div className="text-[13px] font-medium" style={{ color: '#1A1A2E' }}>
                            {selectedLiveSession
                              ? liveStudentMap.get(selectedLiveSession.studentId) ?? selectedLiveSession.studentId
                              : 'Сурагч сонгоно уу'}
                          </div>
                          <div className="text-[11px]" style={{ color: '#8A94A0' }}>
                            Live answers / results
                          </div>
                        </div>
                        {selectedLiveSession && selectedLiveSession.status !== 'graded' && selectedLiveSession.score !== null && (
                          <button
                            onClick={() => gradeExamSession(selectedLiveSession.id, selectedLiveSession.score ?? 0).then(() => handleRefreshNow()).catch(() => null)}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-white"
                            style={{ backgroundColor: '#1A7A4A' }}
                          >
                            Дүн батлах
                          </button>
                        )}
                      </div>
                      <div className="max-h-[520px] overflow-y-auto p-4 space-y-3">
                        {selectedLiveSession ? (
                          liveQuestions.map((question, index) => {
                            const answer = selectedLiveAnswers.find(
                              (item) => item.questionId === question.id,
                            )
                            const answerText = parseLiveAnswer(question, answer)
                            return (
                              <div
                                key={question.id}
                                className="rounded-xl border p-4"
                                style={{ borderColor: '#E6EAF0', backgroundColor: '#FFFFFF' }}
                              >
                                <div className="flex items-center justify-between gap-3 mb-2">
                                  <span className="text-[12px] font-medium" style={{ color: '#0066FF' }}>
                                    Асуулт {index + 1}
                                  </span>
                                  <span
                                    className="text-[11px]"
                                    style={{
                                      color:
                                        answer && isAnswerCorrect(question, answer)
                                          ? '#1A7A4A'
                                          : '#8A94A0',
                                    }}
                                  >
                                    {answer
                                      ? isAnswerCorrect(question, answer)
                                        ? 'Зөв'
                                        : selectedLiveSession.status === 'graded' || selectedLiveSession.status === 'submitted' || selectedLiveSession.status === 'force_submitted'
                                          ? 'Шалгасан'
                                          : 'Autosave'
                                      : 'Хариултгүй'}
                                  </span>
                                </div>
                                <div className="text-[14px] mb-2 leading-6" style={{ color: '#1A1A2E' }}>
                                  {question.text}
                                </div>
                                <div
                                  className="rounded-lg px-3 py-2 text-[13px] whitespace-pre-wrap break-words"
                                  style={{ backgroundColor: '#F7F9FC', color: '#5A6474' }}
                                >
                                  {answerText}
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <div className="p-5 text-[13px]" style={{ color: '#8A94A0' }}>
                            Зүүн талын жагсаалтаас сурагч сонгоод явц, хариултыг нь харна уу.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed px-5 py-10 text-center text-[13px]" style={{ borderColor: '#DDE1E7', color: '#8A94A0' }}>
                  Сурагчид шалгалтад орж эхэлмэгц энд явц нь харагдана.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
