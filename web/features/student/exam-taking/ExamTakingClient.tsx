'use client'

import { use, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { joinQrExam, runPreviewCode } from '@/lib/api/student-exams'
import { isApiConfigured } from '@/lib/api/client'
import { SUBJECT_COLORS } from '@/lib/constants'
import { registerQrStudentProfile, readQrStudentProfile, type QrStudentProfile } from '@/lib/student-identity'
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
import { StudentQrEntryGate } from './_components/StudentQrEntryGate'
import { createLocalNotification } from '@/lib/notifications'
import { scoreAndSave } from './examScoring'
import { useExamSession } from './useExamSession'
import { cacheExamAttempt, queueOfflineDraft } from '@/lib/pwa/offline-exam'

export function ExamTakingClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isQrEntry = searchParams.get('entry') === 'qr'
  const [qrProfile, setQrProfile] = useState<QrStudentProfile | null>(() =>
    isQrEntry ? readQrStudentProfile(id) : null,
  )
  const [isQrReady, setIsQrReady] = useState(!isQrEntry)
  const [isPreparingQrEntry, setIsPreparingQrEntry] = useState(false)
  const session = useExamSession(id, {
    enabled: isQrReady,
    qrClassName: qrProfile?.className ?? null,
  })
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
    if (!isQrEntry) {
      setQrProfile(null)
      setIsQrReady(true)
      return
    }

    setQrProfile(readQrStudentProfile(id))
    setIsQrReady(false)
  }, [id, isQrEntry])

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
    const hasMeaningfulChanges = lastPersist?.signature !== signature
    const shouldRefreshTimerSnapshot =
      !lastPersist || now - lastPersist.at >= 15000 || session.timeRemaining <= 0

    if (!hasMeaningfulChanges && !shouldRefreshTimerSnapshot) {
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

      if (session.exam.teacherId) {
        createLocalNotification({
          recipientId: session.exam.teacherId,
          examId: session.exam.id,
          title: 'Exam submitted',
          body: `${session.currentStudentName} "${session.exam.title}" шалгалтыг дуусгаад илгээлээ.`,
          type: 'exam_submitted',
        })
      }

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
    if (!session.isLoaded || !session.exam) {
      return
    }

    const timer = window.setInterval(() => {
      session.setTimeRemaining((prev) => {
        if (prev <= 0) {
          window.clearInterval(timer)
          return 0
        }

        if (prev === 1) {
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
  }, [handleSubmit, session.exam, session.isLoaded, session.setTimeRemaining])

  const handleQrEntrySubmit = useCallback(
    async (payload: { name: string; className: string }) => {
      if (isPreparingQrEntry) {
        return
      }

      setIsPreparingQrEntry(true)

      try {
        const profile = registerQrStudentProfile({
          examId: id,
          name: payload.name,
          className: payload.className,
        })

        if (isApiConfigured()) {
          await joinQrExam(id, profile.studentId, {
            studentName: profile.name,
          })
        }

        setQrProfile(profile)
        setIsQrReady(true)
      } finally {
        setIsPreparingQrEntry(false)
      }
    },
    [id, isPreparingQrEntry],
  )

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

  if (isQrEntry && !isQrReady) {
    return (
      <StudentQrEntryGate
        defaultName={qrProfile?.name ?? ''}
        defaultClassName={qrProfile?.className ?? ''}
        isSubmitting={isPreparingQrEntry}
        onSubmit={handleQrEntrySubmit}
      />
    )
  }

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
    <div className="min-h-screen bg-page-bg">
      <div className="flex min-h-dvh flex-col">
        <div
          className="sticky z-30 bg-page-bg/95 backdrop-blur-sm"
          style={{ top: 'var(--platform-switcher-height)' }}
        >
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
        </div>

        <div className="flex flex-1 flex-col md:flex-row">
          <div className="hidden md:block">
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
          </div>

          <div className="min-h-0 flex-1">
            <div className="mx-auto max-w-3xl px-4 py-5 pb-28 md:px-6 md:py-8 md:pb-10">
              <div className="mb-4 flex flex-wrap items-center gap-2 md:hidden">
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-text-secondary shadow-sm">
                  Хариулсан {answeredCount}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-text-secondary shadow-sm">
                  Үлдсэн {unansweredCount}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-text-secondary shadow-sm">
                  Тэмдэглэсэн {markedCount}
                </span>
              </div>

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
              onProctoringViolation={session.reportProctoringViolation}
            />
          }
        />
      </div>

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
