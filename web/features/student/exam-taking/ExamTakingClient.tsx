'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { runPreviewCode } from '@/lib/api/student-exams'
import { SUBJECT_COLORS } from '@/lib/constants'
import { ExamTopBar } from './_components/ExamTopBar'
import { QuestionGrid } from './_components/QuestionGrid'
import { QuestionDisplay } from './_components/QuestionDisplay'
import { AnswerMCQ } from './_components/AnswerMCQ'
import { AnswerTrueFalse } from './_components/AnswerTrueFalse'
import { AnswerText } from './_components/AnswerText'
import { AnswerMatching } from './_components/AnswerMatching'
import { AnswerFormula } from './_components/AnswerFormula'
import { AnswerChemistry } from './_components/AnswerChemistry'
import { AnswerCode } from './_components/AnswerCode'
import { AnswerMediaRecorder } from './_components/AnswerMediaRecorder'
import { StudentProctoringPreview } from './_components/StudentProctoringPreview'
import { ExamBottomBar } from './_components/ExamBottomBar'
import { SubmitModal } from './_components/SubmitModal'
import { ExamLoadingState } from './_components/ExamLoadingState'
import { ExamNotFoundState } from './_components/ExamNotFoundState'
import { ExamCompletedState } from './_components/ExamCompletedState'
import { scoreAndSave } from './examScoring'
import { useExamSession } from './useExamSession'
import { cacheExamAttempt, queueOfflineDraft } from '@/lib/pwa/offline-exam'

const globalNavHeightClass = 'top-9'

export function ExamTakingClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const session = useExamSession(id)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRunningCode, setIsRunningCode] = useState(false)
  const [codeLogs, setCodeLogs] = useState<Record<string, string[]>>({})
  const [codeResults, setCodeResults] = useState<Record<string, string | null>>({})
  const [codeErrors, setCodeErrors] = useState<Record<string, string | null>>({})
  const hasAutoSubmittedRef = useRef(false)
  const lastOfflinePersistRef = useRef<{ signature: string; at: number } | null>(null)

  useEffect(() => {
    if (currentIndex >= session.questions.length) {
      setCurrentIndex(0)
    }
  }, [currentIndex, session.questions.length])

  useEffect(() => {
    if (!session.exam) {
      return
    }

    const signature = JSON.stringify({
      examId: session.exam.id,
      sessionId: session.sessionId,
      currentIndex,
      answers: session.answers,
      markedForReview: Array.from(session.markedForReview),
      questionCount: session.questions.length,
      isApiBacked: session.isApiBacked,
      startedAt: session.startedAt,
    })

    const now = Date.now()
    const lastPersist = lastOfflinePersistRef.current
    const shouldRefreshTimerSnapshot =
      !lastPersist || now - lastPersist.at >= 15000 || session.timeRemaining <= 0

    if (lastPersist?.signature === signature && !shouldRefreshTimerSnapshot) {
      return
    }

    cacheExamAttempt(session.exam.id, session.currentStudentId, {
      exam: session.exam,
      sessionId: session.sessionId,
      assignmentId: session.exam.id,
      questions: session.questions,
      answers: session.answers,
      timeRemaining: session.timeRemaining,
      startedAt: session.startedAt ?? new Date().toISOString(),
    })

    if (session.isApiBacked) {
      queueOfflineDraft({
        draftKey: `${session.currentStudentId}:${session.exam.id}`,
        assignmentId: session.exam.id,
        examId: session.exam.id,
        studentId: session.currentStudentId,
        answers: session.answers,
        markedForReview: Array.from(session.markedForReview),
        currentIndex,
        startedAt: session.startedAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    lastOfflinePersistRef.current = {
      signature,
      at: now,
    }
  }, [
    currentIndex,
    session.answers,
    session.currentStudentId,
    session.exam,
    session.isApiBacked,
    session.markedForReview,
    session.questions,
    session.sessionId,
    session.startedAt,
    session.timeRemaining,
  ])

  const handleSubmit = useCallback(async () => {
    if (!session.exam) {
      return
    }

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      if (session.isApiBacked) {
        await session.submitCurrentSession()
        router.push(`/student/results?examId=${session.exam.id}&view=latest`)
        return
      }

      scoreAndSave({
        exam: session.exam,
        assignment: session.assignment,
        questions: session.questions,
        answers: session.answers,
        timeRemaining: session.timeRemaining,
        currentStudentId: session.currentStudentId,
      })
      router.push(`/student/results?examId=${session.exam.id}&view=latest`)
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isSubmitting,
    router,
    session.answers,
    session.assignment,
    session.currentStudentId,
    session.exam,
    session.isApiBacked,
    session.questions,
    session.submitCurrentSession,
    session.timeRemaining,
  ])

  useEffect(() => {
    if (!session.isLoaded || !session.exam || session.timeRemaining <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      session.setTimeRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          if (!hasAutoSubmittedRef.current) {
            hasAutoSubmittedRef.current = true
            void handleSubmit()
          }
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [handleSubmit, session.exam, session.isLoaded, session.timeRemaining])

  const toggleMarkForReview = () => {
    const currentQuestion = session.questions[currentIndex]
    if (!currentQuestion) {
      return
    }

    session.setMarkedForReview((prev) => {
      const next = new Set(prev)
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id)
      } else {
        next.add(currentQuestion.id)
      }
      return next
    })
  }

  const answeredCount = Object.values(session.answers).filter((value) =>
    Boolean(typeof value === 'string' && value.trim().length > 0),
  ).length
  const unansweredCount = session.questions.length - answeredCount
  const markedCount = session.markedForReview.size
  const subjectKey = session.subject?.id || session.exam?.subjectId || 'math'
  const subjectColor =
    SUBJECT_COLORS[subjectKey as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.math

  if (!session.isLoaded) {
    return <ExamLoadingState />
  }

  if (session.completionState) {
    return (
      <ExamCompletedState
        title={session.completionState.title}
        description={session.completionState.description}
        onBack={() => router.push('/student')}
      />
    )
  }

  if (!session.exam || session.questions.length === 0) {
    return <ExamNotFoundState onBack={() => router.push('/student')} />
  }

  const currentQuestion = session.questions[currentIndex]
  const currentAnswer = session.answers[currentQuestion?.id ?? ''] ?? ''

  const handleRunCode = async () => {
    if (!currentQuestion || currentQuestion.type !== 'code') {
      return
    }

    setIsRunningCode(true)

    try {
      const response = await runPreviewCode(currentAnswer)
      setCodeLogs((prev) => ({ ...prev, [currentQuestion.id]: response.logs }))
      setCodeResults((prev) => ({
        ...prev,
        [currentQuestion.id]:
          response.result === null ? null : JSON.stringify(response.result),
      }))
      setCodeErrors((prev) => ({ ...prev, [currentQuestion.id]: response.error }))
    } catch (error) {
      setCodeErrors((prev) => ({
        ...prev,
        [currentQuestion.id]:
          error instanceof Error ? error.message : 'Code ажиллуулж чадсангүй.',
      }))
    } finally {
      setIsRunningCode(false)
    }
  }

  return (
    <div className={`fixed inset-x-0 bottom-0 ${globalNavHeightClass} flex flex-col bg-page-bg`}>
      <ExamTopBar
        examTitle={session.exam.title}
        subjectColor={subjectColor}
        subjectName={session.subject?.name || 'Шалгалт'}
        subjectInitial={session.subject?.name.charAt(0) || 'Ш'}
        timeRemaining={session.timeRemaining}
        formattedTime={session.formatTime(session.timeRemaining)}
        currentIndex={currentIndex}
        totalQuestions={session.questions.length}
        onSubmitClick={() => setShowSubmitModal(true)}
      />

      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <QuestionGrid
          questions={session.questions}
          answers={session.answers}
          markedForReview={session.markedForReview}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
          answeredCount={answeredCount}
          unansweredCount={unansweredCount}
          markedCount={markedCount}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
            <QuestionDisplay
              question={currentQuestion}
              currentIndex={currentIndex}
              subjectColor={subjectColor}
            />

            <div className="space-y-3">
              {currentQuestion.type === 'single' && currentQuestion.options && (
                <AnswerMCQ
                  options={currentQuestion.options}
                  selected={currentAnswer}
                  isMultiple={false}
                  onChange={(value) =>
                    session.setAnswerValue(currentQuestion, String(value))
                  }
                />
              )}

              {currentQuestion.type === 'multiple' && currentQuestion.options && (
                <AnswerMCQ
                  options={currentQuestion.options}
                  selected={currentAnswer ? JSON.parse(currentAnswer) : []}
                  isMultiple
                  onChange={(value) =>
                    session.setAnswerValue(
                      currentQuestion,
                      JSON.stringify(Array.isArray(value) ? value : [value]),
                    )
                  }
                />
              )}

              {currentQuestion.type === 'truefalse' && (
                <AnswerTrueFalse
                  selected={currentAnswer}
                  onChange={(value) => session.setAnswerValue(currentQuestion, value)}
                />
              )}

              {(currentQuestion.type === 'short' || currentQuestion.type === 'long') && (
                <AnswerText
                  value={currentAnswer}
                  onChange={(value) => session.setAnswerValue(currentQuestion, value)}
                  rows={currentQuestion.type === 'short' ? 3 : 8}
                />
              )}

              {currentQuestion.type === 'formula' && (
                <AnswerFormula
                  value={currentAnswer}
                  onChange={(value) => session.setAnswerValue(currentQuestion, value)}
                />
              )}

              {currentQuestion.type === 'chemistry' && (
                <AnswerChemistry
                  value={currentAnswer}
                  onChange={(value) => session.setAnswerValue(currentQuestion, value)}
                />
              )}

              {currentQuestion.type === 'code' && (
                <AnswerCode
                  value={currentAnswer}
                  onChange={(value) => session.setAnswerValue(currentQuestion, value)}
                  onRun={handleRunCode}
                  isRunning={isRunningCode}
                  logs={codeLogs[currentQuestion.id] ?? []}
                  result={codeResults[currentQuestion.id] ?? null}
                  error={codeErrors[currentQuestion.id] ?? null}
                />
              )}

              {currentQuestion.type === 'voice' && (
                <AnswerMediaRecorder
                  mode="audio"
                  value={currentAnswer}
                  onChange={(value) => session.setAnswerValue(currentQuestion, value)}
                />
              )}

              {(currentQuestion.type === 'video' ||
                currentQuestion.type === 'handwritten') && (
                <AnswerMediaRecorder
                  mode="video"
                  value={currentAnswer}
                  onChange={(value) => session.setAnswerValue(currentQuestion, value)}
                />
              )}

              {currentQuestion.type === 'matching' && (
                <AnswerMatching
                  pairs={currentQuestion.matchingPairs ?? []}
                  selected={currentAnswer ? JSON.parse(currentAnswer) : []}
                  onChange={(value) =>
                    session.setAnswerValue(currentQuestion, JSON.stringify(value))
                  }
                />
              )}
            </div>

            {session.lastSaved && (
              <div className="mt-4 flex items-center gap-1.5 text-[12px] text-text-secondary">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Автоматаар хадгалагдсан{' '}
                {session.lastSaved.toLocaleTimeString('mn-MN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ExamBottomBar
        currentIndex={currentIndex}
        total={session.questions.length}
        isMarked={session.markedForReview.has(currentQuestion?.id || '')}
        lastSaved={session.lastSaved}
        onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
        onNext={() =>
          setCurrentIndex((prev) =>
            Math.min(session.questions.length - 1, prev + 1),
          )
        }
        onToggleMark={toggleMarkForReview}
        proctoringPreview={
          <StudentProctoringPreview
            onVisibilityViolation={session.reportVisibilityViolation}
          />
        }
      />

      {showSubmitModal && (
        <SubmitModal
          isOpen={showSubmitModal}
          answeredCount={answeredCount}
          unansweredCount={unansweredCount}
          markedCount={markedCount}
          onCancel={() => setShowSubmitModal(false)}
          onConfirm={() => void handleSubmit()}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}
