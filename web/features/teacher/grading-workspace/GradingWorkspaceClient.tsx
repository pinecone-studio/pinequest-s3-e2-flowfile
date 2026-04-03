'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, FileText, Send } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { getAll, initialClasses, initialExams, initialQuestions, initialSubmissions, initialUsers } from '@/lib/data'
import { readManualGrading, writeManualGrading, type ManualGradingFeedback } from '@/lib/manual-grading'
import {
  fetchAnswersBySession,
  fetchExamById,
  fetchExamSessions,
  fetchQuestionsByExam,
  fetchUsersByRole,
  gradeExamSession,
  isApiConfigured,
  mapTeacherApiQuestionToLocalQuestion,
  type TeacherExamAnswer,
} from '@/lib/api/teacher-exams'
import type { Question, Submission, User as UserType } from '@/lib/types'
import { GradingNavBar } from './_components/GradingNavBar'
import { AnswerPanel } from './_components/AnswerPanel'
import { ScoringPanel } from './_components/ScoringPanel'
import { GradingStudentSidebar } from './_components/GradingStudentSidebar'

type LegacySubmission = Submission & {
  status?: string
  submittedAt?: string
  studentId: string
  answers?: Array<{ questionId: string; answer: string | string[] }>
}

type WorkspaceStudent = {
  id: string
  name: string
  studentCode?: string
}

type WorkspaceSession = {
  id: string
  studentId: string
  status: 'submitted' | 'force_submitted' | 'graded'
  submittedAt: string | null
  score: number | null
  startedAt: string | null
}

const ALL_PARTICIPANTS_LABEL = 'Бүх оролцогч'

function parseStoredAnswer(
  value: string | null,
  fallback = '',
) {
  if (!value) {
    return fallback
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

function parseAnswerForQuestion(
  question: Question | undefined,
  answer: TeacherExamAnswer | undefined,
) {
  if (!question || !answer) {
    return null
  }

  if (answer.fileUrl) {
    return { answer: answer.fileUrl as string | string[] }
  }

  if (answer.formulaAnswerJson) {
    return { answer: parseStoredAnswer(answer.formulaAnswerJson) as string | string[] }
  }

  if (!answer.textAnswer) {
    return null
  }

  if (question.type === 'multiple') {
    try {
      const parsed = JSON.parse(answer.textAnswer) as unknown
      if (Array.isArray(parsed)) {
        return {
          answer: parsed.filter((item): item is string => typeof item === 'string'),
        }
      }
    } catch {
      return { answer: answer.textAnswer as string | string[] }
    }
  }

  return { answer: parseStoredAnswer(answer.textAnswer) as string | string[] }
}

function normalizeText(value: string) {
  return value.trim().toLowerCase()
}

function compareStringArrays(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false
  }

  const normalizedLeft = [...left].map(normalizeText).sort()
  const normalizedRight = [...right].map(normalizeText).sort()

  return normalizedLeft.every((item, index) => item === normalizedRight[index])
}

function isAutoCorrect(
  question: Question,
  answer: TeacherExamAnswer | undefined,
) {
  if (!answer || question.isManualGrade || !question.correctAnswer) {
    return false
  }

  const parsed = parseAnswerForQuestion(question, answer)?.answer

  if (question.type === 'multiple') {
    return (
      Array.isArray(parsed) &&
      Array.isArray(question.correctAnswer) &&
      compareStringArrays(parsed, question.correctAnswer)
    )
  }

  if (typeof parsed !== 'string' || Array.isArray(question.correctAnswer)) {
    return false
  }

  return normalizeText(parsed) === normalizeText(question.correctAnswer)
}

export function GradingWorkspaceClient({
  params,
}: {
  params: Promise<{ examId: string; classId: string }>
}) {
  const { examId, classId } = use(params)
  const [examTitle, setExamTitle] = useState('')
  const [classLabel, setClassLabel] = useState<string | undefined>(undefined)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [students, setStudents] = useState<WorkspaceStudent[]>([])
  const [sessions, setSessions] = useState<WorkspaceSession[]>([])
  const [answersBySessionId, setAnswersBySessionId] = useState<
    Record<string, TeacherExamAnswer[]>
  >({})
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [feedback, setFeedback] = useState<ManualGradingFeedback>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadLocalWorkspace = () => {
      const loadedExams = getAll<typeof initialExams[number]>('exams')
      const loadedQuestions = getAll<Question>('questions')
      const loadedSubmissions = getAll<LegacySubmission>('submissions')
      const loadedStudents = getAll<UserType>('students')
      const loadedClasses = getAll<typeof initialClasses[number]>('classes')

      const allExams = loadedExams.length ? loadedExams : initialExams
      const storedQuestions = loadedQuestions.length ? loadedQuestions : initialQuestions
      const storedSubmissions = (loadedSubmissions.length
        ? loadedSubmissions
        : initialSubmissions) as LegacySubmission[]
      const storedStudents = loadedStudents.length
        ? loadedStudents
        : initialUsers.filter((user) => user.role === 'student')
      const storedClasses = loadedClasses.length ? loadedClasses : initialClasses

      const exam = allExams.find((item) => item.id === examId)

      if (!exam) {
        if (!isCancelled) {
          setIsLoaded(true)
        }
        return
      }

      const questionList = storedQuestions
        .filter((question) => exam.questionIds.includes(question.id))
        .sort((left, right) => left.order - right.order)
      const manualQuestions = questionList.filter((question) => question.isManualGrade)
      const submissionList = storedSubmissions
        .filter((submission) => submission.examId === examId)
        .map<WorkspaceSession>((submission) => ({
          id: submission.id,
          studentId: submission.studentId,
          status:
            submission.status === 'graded'
              ? 'graded'
              : submission.status === 'force_submitted'
                ? 'force_submitted'
                : 'submitted',
          submittedAt: submission.submittedAt ?? null,
          score: submission.finalScore ?? null,
          startedAt: null,
        }))
      const workspaceStudents = storedStudents
        .filter((student) =>
          submissionList.some((submission) => submission.studentId === student.id),
        )
        .map((student) => ({
          id: student.id,
          name: student.name,
          studentCode: student.id,
        }))
      const answerMap = submissionList.reduce<Record<string, TeacherExamAnswer[]>>(
        (result, submission) => {
          const originalSubmission = storedSubmissions.find(
            (item) => item.id === submission.id,
          )
          result[submission.id] = (originalSubmission?.answers ?? []).map((answer) => ({
            id: `${submission.id}:${answer.questionId}`,
            sessionId: submission.id,
            questionId: answer.questionId,
            textAnswer:
              typeof answer.answer === 'string'
                ? answer.answer
                : JSON.stringify(answer.answer),
            formulaAnswerJson: null,
            fileUrl: null,
            lastSavedAt: originalSubmission?.submittedAt ?? new Date().toISOString(),
            isFinal: true,
            createdAt: originalSubmission?.submittedAt ?? new Date().toISOString(),
          }))
          return result
        },
        {},
      )
      const resolvedClass = storedClasses.find((schoolClass) => schoolClass.id === classId)
      const defaultStudentId =
        submissionList.find((submission) => submission.status !== 'graded')?.studentId ??
        submissionList[0]?.studentId ??
        null

      if (!isCancelled) {
        setExamTitle(exam.title)
        setClassLabel(resolvedClass?.name)
        setAllQuestions(questionList)
        setQuestions(manualQuestions)
        setStudents(workspaceStudents)
        setSessions(submissionList)
        setAnswersBySessionId(answerMap)
        setSelectedStudentId(defaultStudentId)
        setIsLoaded(true)
      }
    }

    const loadApiWorkspace = async () => {
      try {
        const [exam, apiQuestions, apiSessions, apiStudents] = await Promise.all([
          fetchExamById(examId),
          fetchQuestionsByExam(examId),
          fetchExamSessions(examId),
          fetchUsersByRole('student'),
        ])

        if (isCancelled) {
          return
        }

        const storedClasses = getAll<typeof initialClasses[number]>('classes')
        const availableClasses = storedClasses.length ? storedClasses : initialClasses
        const resolvedClass = availableClasses.find(
          (schoolClass) => schoolClass.id === classId,
        )
        const allowedStudentIds = resolvedClass?.studentIds
          ? new Set(resolvedClass.studentIds)
          : null
        const normalizedQuestions = apiQuestions
          .map(mapTeacherApiQuestionToLocalQuestion)
          .sort((left, right) => left.order - right.order)
        const manualQuestions = normalizedQuestions.filter(
          (question) => question.isManualGrade,
        )
        const relevantSessions = apiSessions
          .filter((session) =>
            session.status === 'submitted' ||
            session.status === 'force_submitted' ||
            session.status === 'graded',
          )
          .filter((session) =>
            allowedStudentIds ? allowedStudentIds.has(session.studentId) : true,
          )
          .map<WorkspaceSession>((session) => ({
            id: session.id,
            studentId: session.studentId,
            status:
              session.status === 'graded'
                ? 'graded'
                : session.status === 'force_submitted'
                  ? 'force_submitted'
                  : 'submitted',
            submittedAt: session.submittedAt,
            score: session.score,
            startedAt: session.startedAt,
          }))

        const apiStudentMap = new Map(apiStudents.map((student) => [student.id, student]))
        const localStudentMap = new Map(
          initialUsers
            .filter((user) => user.role === 'student')
            .map((student) => [student.id, student]),
        )

        const workspaceStudents = relevantSessions.map<WorkspaceStudent>((session) => {
          const apiStudent = apiStudentMap.get(session.studentId)
          const localStudent = localStudentMap.get(session.studentId)

          return {
            id: session.studentId,
            name: apiStudent?.name ?? localStudent?.name ?? session.studentId,
            studentCode: session.studentId,
          }
        })

        const defaultStudentId =
          relevantSessions.find((session) => session.status !== 'graded')?.studentId ??
          relevantSessions[0]?.studentId ??
          null

        setExamTitle(exam.title)
        setClassLabel(
          resolvedClass?.name ?? (classId === 'api' ? ALL_PARTICIPANTS_LABEL : undefined),
        )
        setAllQuestions(normalizedQuestions)
        setQuestions(manualQuestions)
        setStudents(workspaceStudents)
        setSessions(relevantSessions)
        setSelectedStudentId(defaultStudentId)
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Үнэлгээний мэдээлэл ачаалж чадсангүй',
          description:
            error instanceof Error ? error.message : 'Дахин оролдоно уу.',
        })
      } finally {
        if (!isCancelled) {
          setIsLoaded(true)
        }
      }
    }

    setIsLoaded(false)

    if (isApiConfigured()) {
      void loadApiWorkspace()
      return () => {
        isCancelled = true
      }
    }

    loadLocalWorkspace()

    return () => {
      isCancelled = true
    }
  }, [classId, examId])

  const selectedSession = useMemo(
    () => sessions.find((session) => session.studentId === selectedStudentId) ?? null,
    [selectedStudentId, sessions],
  )
  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId, students],
  )

  useEffect(() => {
    if (!selectedSession?.id || !isApiConfigured()) {
      return
    }

    if (answersBySessionId[selectedSession.id]) {
      return
    }

    let isCancelled = false

    fetchAnswersBySession(selectedSession.id)
      .then((answers) => {
        if (isCancelled) {
          return
        }

        setAnswersBySessionId((previous) => ({
          ...previous,
          [selectedSession.id]: answers,
        }))
      })
      .catch(() => null)

    return () => {
      isCancelled = true
    }
  }, [answersBySessionId, selectedSession?.id])

  useEffect(() => {
    if (!selectedSession?.id) {
      setFeedback({})
      return
    }

    setFeedback(readManualGrading(selectedSession.id))
  }, [selectedSession?.id])

  useEffect(() => {
    if (!selectedSession?.id) {
      return
    }

    writeManualGrading(selectedSession.id, feedback)
  }, [feedback, selectedSession?.id])

  useEffect(() => {
    if (currentQuestionIndex >= questions.length) {
      setCurrentQuestionIndex(0)
    }
  }, [currentQuestionIndex, questions.length])

  useEffect(() => {
    setCurrentQuestionIndex(0)
  }, [selectedSession?.id])

  const selectedAnswers = selectedSession
    ? answersBySessionId[selectedSession.id] ?? []
    : []
  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = currentQuestion
    ? parseAnswerForQuestion(
        currentQuestion,
        selectedAnswers.find((answer) => answer.questionId === currentQuestion.id),
      )
    : null
  const handleScoreChange = (questionId: string, score: number) =>
    setFeedback((previous) => ({
      ...previous,
      [questionId]: {
        ...previous[questionId],
        score,
        comment: previous[questionId]?.comment || '',
      },
    }))
  const handleCommentChange = (questionId: string, comment: string) =>
    setFeedback((previous) => ({
      ...previous,
      [questionId]: {
        score: previous[questionId]?.score || 0,
        comment,
      },
    }))
  const autoScore = allQuestions.reduce((sum, question) => {
    const answer = selectedAnswers.find((item) => item.questionId === question.id)
    return isAutoCorrect(question, answer) ? sum + (question.points || 0) : sum
  }, 0)
  const manualScore = questions.reduce(
    (sum, question) => sum + (feedback[question.id]?.score ?? 0),
    0,
  )
  const hasScoresForAllManualQuestions =
    questions.length === 0 ||
    questions.every((question) => feedback[question.id]?.score !== undefined)
  const totalScore = autoScore + manualScore
  const displayScore =
    hasScoresForAllManualQuestions && questions.length > 0
      ? totalScore
      : selectedSession?.status === 'graded' && selectedSession.score !== null
        ? selectedSession.score
        : totalScore
  const maxScore = allQuestions.reduce((sum, question) => sum + (question.points || 0), 0)
  const gradedCount = sessions.filter((session) => session.status === 'graded').length
  const needsGradingCount = sessions.filter((session) => session.status !== 'graded').length

  const handleSubmitGrades = async () => {
    if (!selectedSession || isSubmitting) {
      return
    }

    if (!hasScoresForAllManualQuestions) {
      toast({
        variant: 'destructive',
        title: 'Бүх задгай асуултыг үнэлнэ үү',
        description: 'Асуулт бүрт 0-ээс дээд оноо хүртэл сонгож байж дүн илгээнэ.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isApiConfigured()) {
        await gradeExamSession(selectedSession.id, totalScore)
      }

      setSessions((previous) =>
        previous.map((session) =>
          session.id === selectedSession.id
            ? {
                ...session,
                status: 'graded',
                score: totalScore,
              }
            : session,
        ),
      )

      toast({
        title: 'Дүн хадгалагдлаа',
        description: `${selectedStudent?.name ?? 'Сурагч'}-ийн үнэлгээ шинэчлэгдлээ.`,
      })

      const nextPendingStudentId =
        sessions.find(
          (session) =>
            session.studentId !== selectedSession.studentId &&
            session.status !== 'graded',
        )?.studentId ?? selectedStudentId

      setSelectedStudentId(nextPendingStudentId)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Дүн илгээж чадсангүй',
        description:
          error instanceof Error ? error.message : 'Дахин оролдоно уу.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-5.25rem)] md:h-[calc(100vh-var(--platform-switcher-height))]">
        <div className="text-text-secondary">Ачааллаж байна...</div>
      </div>
    )
  }

  if (!examTitle) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-5.25rem)] md:h-[calc(100vh-var(--platform-switcher-height))]">
        <div className="text-text-secondary">Шалгалт олдсонгүй...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-5.25rem)] md:h-[calc(100vh-var(--platform-switcher-height))]">
        <GradingStudentSidebar
          examTitle={examTitle}
          subtitle={classLabel}
          students={students}
          sessions={sessions}
          selectedStudentId={selectedStudentId}
          gradedCount={gradedCount}
          needsGradingCount={needsGradingCount}
          onSelect={setSelectedStudentId}
        />
        <div className="flex-1 flex items-center justify-center bg-page-bg">
          <div className="text-center">
            <FileText
              size={48}
              className="mx-auto text-card-border mb-3"
              strokeWidth={1}
            />
            <p className="text-text-secondary">
              Энэ шалгалтад гараар үнэлэх асуулт алга байна.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-5.25rem)] md:h-[calc(100vh-var(--platform-switcher-height))]">
      <GradingStudentSidebar
        examTitle={examTitle}
        subtitle={classLabel}
        students={students}
        sessions={sessions}
        selectedStudentId={selectedStudentId}
        gradedCount={gradedCount}
        needsGradingCount={needsGradingCount}
        onSelect={setSelectedStudentId}
      />
      <div className="flex-1 flex flex-col bg-page-bg">
        {selectedStudent && selectedSession ? (
          <>
            <div className="px-6 py-4 bg-white border-b border-card-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-[14px] font-semibold text-primary">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">
                    {selectedStudent.name}
                  </h2>
                  <div className="flex items-center gap-3 text-[12px] text-text-secondary">
                    <span>{selectedStudent.studentCode ?? selectedStudent.id}</span>
                    <span>•</span>
                    <span>
                      Өгсөн:{' '}
                      {selectedSession.submittedAt
                        ? new Date(selectedSession.submittedAt).toLocaleString('mn-MN')
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-text-secondary">Автомат / Гараар</div>
                  <div className="text-[13px] text-text-secondary">
                    {autoScore} / {manualScore}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-text-secondary">Нийт оноо</div>
                  <div className="text-[18px] font-bold text-foreground">
                    {displayScore}{' '}
                    <span className="text-[14px] font-normal text-text-secondary">
                      / {maxScore}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleSubmitGrades}
                  disabled={isSubmitting || !hasScoresForAllManualQuestions}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-[13px] font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send size={14} strokeWidth={1.5} />
                  {isSubmitting ? 'Илгээж байна...' : 'Дүн илгээх'}
                </button>
              </div>
            </div>
            <GradingNavBar
              questions={questions}
              feedback={feedback}
              currentQuestionIndex={currentQuestionIndex}
              onSelect={setCurrentQuestionIndex}
            />
            <div className="flex-1 overflow-y-auto p-6">
              {currentQuestion && (
                <div className="max-w-3xl mx-auto">
                  <AnswerPanel
                    currentQuestion={currentQuestion}
                    currentQuestionIndex={currentQuestionIndex}
                    currentAnswer={currentAnswer}
                  />
                  <ScoringPanel
                    currentQuestion={currentQuestion}
                    feedback={feedback}
                    onScoreChange={handleScoreChange}
                    onCommentChange={handleCommentChange}
                  />
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-white border-t border-card-border flex items-center justify-between">
              <button
                onClick={() =>
                  setCurrentQuestionIndex((previous) => Math.max(0, previous - 1))
                }
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-card-border rounded-lg text-[13px] font-medium text-foreground hover:bg-table-header transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <ChevronLeft size={14} strokeWidth={1.5} />
                Өмнөх
              </button>
              <span className="text-[13px] text-text-secondary">
                {currentQuestionIndex + 1} / {questions.length}
              </span>
              <button
                onClick={() =>
                  setCurrentQuestionIndex((previous) =>
                    Math.min(questions.length - 1, previous + 1),
                  )
                }
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                Дараах
                <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText
                size={48}
                className="mx-auto text-card-border mb-3"
                strokeWidth={1}
              />
              <p className="text-text-secondary">Сурагч сонгоно уу</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
