'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trophy, CheckCircle, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getAll } from '@/lib/data'
import { formatMongolianShortDate } from '@/lib/date-time'
import type { Exam, Result, Question, Attempt } from '@/lib/types'
import {
  fetchAssignedExams,
  fetchExamAttempt,
  mapAttemptToAnswerMap,
  mapAttemptToQuestionList,
  type StudentExamQuestion,
} from '@/lib/api/student-exams'
import { isApiConfigured } from '@/lib/api/client'
import {
  getCurrentStudentId,
  initialAttempts,
  initialExams,
  initialQuestions,
  initialResults,
} from '@/lib/data'
import { ResultExamList } from './_components/ResultExamList'
import { ResultDetail } from './_components/ResultDetail'

const MANUAL_RESULT_TYPES = new Set<Question['type']>([
  'short',
  'long',
  'formula',
  'chemistry',
  'code',
  'voice',
  'video',
  'handwritten',
])

function StudentResultsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: '#DDE1E7' }}
          >
            <Skeleton className="mb-3 h-10 w-10" />
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[300px]">
          <div
            className="rounded-xl border bg-white p-4"
            style={{ borderColor: '#DDE1E7' }}
          >
            <Skeleton className="mb-4 h-5 w-24" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div
            className="rounded-xl border bg-white p-6"
            style={{ borderColor: '#DDE1E7' }}
          >
            <Skeleton className="mb-4 h-6 w-48" />
            <Skeleton className="mb-3 h-4 w-32" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

function mapApiQuestionToLocalQuestion(
  question: StudentExamQuestion,
  examId: string,
): Question {
  return {
    id: question.id,
    examId,
    text: question.text,
    type: question.type,
    options: question.options,
    matchingPairs: question.matchingPairs,
    correctAnswer: undefined,
    points: question.points,
    order: question.order,
    isManualGrade: MANUAL_RESULT_TYPES.has(question.type),
  }
}

export function StudentResultsClient() {
  const searchParams = useSearchParams()
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [results, setResults] = useState<Result[]>(initialResults)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts)
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(isApiConfigured())

  const currentStudentId = getCurrentStudentId()

  useEffect(() => {
    let isMounted = true

    const loadLocalResults = () => {
      const loadedExams = getAll<Exam>('exams')
      const loadedResults = getAll<Result>('results')
      const loadedQuestions = getAll<Question>('questions')
      const loadedAttempts = getAll<Attempt>('attempts')

      if (!isMounted) {
        return
      }

      if (loadedExams.length) setExams(loadedExams)
      if (loadedResults.length) setResults(loadedResults)
      if (loadedQuestions.length) setQuestions(loadedQuestions)
      if (loadedAttempts.length) setAttempts(loadedAttempts)

      const studentResults = (loadedResults.length ? loadedResults : initialResults).filter(
        (result) => result.studentId === currentStudentId,
      )

      if (studentResults.length > 0 && !selectedResultId) {
        setSelectedResultId(studentResults[0].id)
      }

      setIsLoading(false)
    }

    if (!isApiConfigured()) {
      loadLocalResults()
      return () => {
        isMounted = false
      }
    }

    const loadApiResults = async () => {
      try {
        const assignedExams = await fetchAssignedExams()
        const completed = assignedExams.filter(
          (item) =>
            item.session?.id &&
            (item.session.status === 'submitted' ||
              item.session.status === 'force_submitted' ||
              item.session.status === 'graded'),
        )

        const attemptBundles = await Promise.all(
          completed.map(async (item) => ({
            summary: item,
            attempt: await fetchExamAttempt(item.session!.id),
          })),
        )

        if (!isMounted) {
          return
        }

        const nextExams: Exam[] = []
        const nextResults: Result[] = []
        const nextQuestions: Question[] = []
        const nextAttempts: Attempt[] = []

        for (const bundle of attemptBundles) {
          const localQuestions = mapAttemptToQuestionList(bundle.attempt).map((question) =>
            mapApiQuestionToLocalQuestion(question, bundle.summary.exam.id),
          )
          const answers = mapAttemptToAnswerMap(bundle.attempt)
          const maxScore = localQuestions.reduce((sum, question) => sum + question.points, 0)
          const hasManualQuestions = localQuestions.some((question) => question.isManualGrade)
          const totalScore = bundle.summary.session?.score ?? 0
          const isPublished =
            bundle.summary.session?.status === 'graded' ||
            (!hasManualQuestions && bundle.summary.session?.score !== null)

          nextExams.push({
            id: bundle.summary.exam.id,
            title: bundle.summary.exam.title,
            subjectId: bundle.summary.exam.subjectId,
            description: bundle.summary.exam.description ?? undefined,
            duration: bundle.summary.exam.durationMinutes,
            totalPoints: maxScore,
            ownerType: 'teacher',
            ownerId: bundle.summary.exam.teacherId,
            collaboratorIds: [],
            status:
              bundle.summary.exam.status === 'draft'
                ? 'draft'
                : bundle.summary.exam.status === 'published'
                  ? 'published'
                  : 'private',
            visibility: 'private',
            questionIds: localQuestions.map((question) => question.id),
            isTemplate: false,
            createdAt: bundle.summary.enrolledAt,
            updatedAt: bundle.summary.session?.submittedAt ?? bundle.summary.enrolledAt,
            tags: [bundle.summary.exam.subjectId],
          })

          nextResults.push({
            id: bundle.summary.session?.id ?? bundle.summary.exam.id,
            attemptId: bundle.summary.session?.id ?? bundle.summary.exam.id,
            studentId: currentStudentId,
            examId: bundle.summary.exam.id,
            scorePerQuestion: {},
            totalScore,
            maxScore,
            percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
            isPublished,
            submittedAt: bundle.summary.session?.submittedAt ?? undefined,
          })

          nextAttempts.push({
            id: bundle.summary.session?.id ?? bundle.summary.exam.id,
            examId: bundle.summary.exam.id,
            assignmentId: bundle.summary.exam.id,
            studentId: currentStudentId,
            answers,
            startedAt: bundle.summary.session?.startedAt ?? bundle.summary.enrolledAt,
            submittedAt: bundle.summary.session?.submittedAt ?? undefined,
            endedAt: bundle.summary.session?.submittedAt ?? undefined,
            isComplete:
              bundle.summary.session?.status === 'submitted' ||
              bundle.summary.session?.status === 'force_submitted' ||
              bundle.summary.session?.status === 'graded',
            timeSpentSeconds: 0,
            status:
              bundle.summary.session?.status === 'graded'
                ? 'graded'
                : 'submitted',
            totalPoints: maxScore,
            earnedPoints: totalScore,
          })

          nextQuestions.push(...localQuestions)
        }

        setExams(nextExams)
        setResults(nextResults)
        setQuestions(nextQuestions)
        setAttempts(nextAttempts)

        if (nextResults.length > 0) {
          const requestedExamId = searchParams.get('examId')
          const preferredResult =
            (requestedExamId
              ? nextResults.find((result) => result.examId === requestedExamId)
              : null) ?? nextResults[0]

          setSelectedResultId(preferredResult?.id ?? null)
        }
      } catch {
        if (!isMounted) {
          return
        }

        loadLocalResults()
        return
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadApiResults()

    return () => {
      isMounted = false
    }
  }, [currentStudentId, searchParams, selectedResultId])

  if (isLoading) {
    return <StudentResultsSkeleton />
  }

  const studentResults = results.filter((result) => result.studentId === currentStudentId)
  const requestedExamId = searchParams.get('examId')
  const selectedResult =
    results.find((result) => result.id === selectedResultId) ||
    (requestedExamId
      ? studentResults.find((result) => result.examId === requestedExamId) || null
      : null)
  const selectedExam = selectedResult
    ? exams.find((exam) => exam.id === selectedResult.examId) || null
    : requestedExamId
      ? exams.find((exam) => exam.id === requestedExamId) || null
      : null
  const selectedAttempt = selectedResult
    ? attempts.find((attempt) => attempt.id === selectedResult.attemptId) || null
    : requestedExamId
      ? attempts
          .filter(
            (attempt) =>
              attempt.examId === requestedExamId && attempt.studentId === currentStudentId,
          )
          .sort((left, right) => {
            const leftDate = left.submittedAt || left.endedAt || left.startedAt
            const rightDate = right.submittedAt || right.endedAt || right.startedAt
            return new Date(rightDate).getTime() - new Date(leftDate).getTime()
          })[0] || null
      : null
  const getExam = (examId: string) => exams.find((exam) => exam.id === examId)
  const getExamQuestions = (exam: Exam) => questions.filter((question) => exam.questionIds.includes(question.id))
  const formatDate = (dateStr: string) => formatMongolianShortDate(dateStr)
  const publishedResults = studentResults.filter((result) => result.isPublished)
  const avgScore =
    publishedResults.length > 0
      ? Math.round(
          publishedResults.reduce(
            (sum, result) => sum + (result.totalScore / Math.max(result.maxScore, 1)) * 100,
            0,
          ) / publishedResults.length,
        )
      : 0

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="mb-1 text-[24px] font-bold text-foreground">Үр дүн</h1>
        <p className="text-[14px] text-text-secondary">Таны шалгалтын үр дүнгүүд</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: <Trophy size={20} className="text-blue-600" strokeWidth={1.5} />,
            iconBg: 'bg-blue-100',
            label: 'Дундаж оноо',
            value: `${avgScore}%`,
          },
          {
            icon: <CheckCircle size={20} className="text-green-600" strokeWidth={1.5} />,
            iconBg: 'bg-green-100',
            label: 'Нийтлэгдсэн',
            value: publishedResults.length,
          },
          {
            icon: <Clock size={20} className="text-amber-600" strokeWidth={1.5} />,
            iconBg: 'bg-amber-100',
            label: 'Хүлээгдэж буй',
            value: studentResults.length - publishedResults.length,
          },
        ].map(({ icon, iconBg, label, value }) => (
          <div key={label} className="rounded-xl border border-card-border bg-white p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
                {icon}
              </div>
              <div className="text-[13px] text-text-secondary">{label}</div>
            </div>
            <div className="text-[28px] font-bold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[300px]">
          <ResultExamList
            studentResults={studentResults}
            selectedResultId={selectedResultId}
            getExam={getExam}
            attempts={attempts}
            formatDate={formatDate}
            onSelect={setSelectedResultId}
          />
        </div>
        <div className="flex-1">
          <ResultDetail
            selectedResult={selectedResult}
            selectedExam={selectedExam}
            selectedAttempt={selectedAttempt}
            examQuestions={selectedExam ? getExamQuestions(selectedExam) : []}
          />
        </div>
      </div>
    </div>
  )
}
