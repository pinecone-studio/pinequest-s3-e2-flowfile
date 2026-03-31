'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useExamSession } from './useExamSession'
import { SUBJECT_COLORS } from '@/lib/constants'
import { ExamTopBar } from './_components/ExamTopBar'
import { QuestionGrid } from './_components/QuestionGrid'
import { QuestionDisplay } from './_components/QuestionDisplay'
import { AnswerMCQ } from './_components/AnswerMCQ'
import { AnswerTrueFalse } from './_components/AnswerTrueFalse'
import { AnswerText } from './_components/AnswerText'
import { AnswerMatching } from './_components/AnswerMatching'
import { ExamBottomBar } from './_components/ExamBottomBar'
import { SubmitModal } from './_components/SubmitModal'
import { ExamLoadingState } from './_components/ExamLoadingState'
import { ExamNotFoundState } from './_components/ExamNotFoundState'
import { scoreAndSave } from './examScoring'

const GLOBAL_NAV_HEIGHT_CLASS = 'top-9'

export function ExamTakingClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const session = useExamSession(id)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  useEffect(() => { if (session.exam) setTimeRemaining(session.exam.duration * 60) }, [session.exam?.id])

  const handleSubmit = () => {
    if (!session.exam) return
    scoreAndSave({ exam: session.exam, assignment: session.assignment, questions: session.questions, answers: session.answers, timeRemaining, currentStudentId: session.currentStudentId })
    router.push('/student/results')
  }

  useEffect(() => {
    if (timeRemaining <= 0) return
    const timer = setInterval(() => {
      setTimeRemaining(prev => { if (prev <= 1) { handleSubmit(); return 0 } return prev - 1 })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeRemaining])

  const handleAnswerChange = (value: string | string[]) => {
    const currentQuestion = session.questions[currentIndex]
    if (!currentQuestion) return
    session.setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
  }

  const toggleMarkForReview = () => {
    const currentQuestion = session.questions[currentIndex]
    if (!currentQuestion) return
    session.setMarkedForReview(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion.id)) newSet.delete(currentQuestion.id)
      else newSet.add(currentQuestion.id)
      return newSet
    })
  }

  const answeredCount = Object.keys(session.answers).filter(k => {
    const a = session.answers[k]
    return a && (Array.isArray(a) ? a.length > 0 : a.trim() !== '')
  }).length
  const unansweredCount = session.questions.length - answeredCount
  const markedCount = session.markedForReview.size
  const subjectKey = session.subject?.id || session.exam?.subjectId || 'math'
  const subjectColor = SUBJECT_COLORS[subjectKey as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.math

  if (!session.isLoaded) return <ExamLoadingState />
  if (!session.exam || session.questions.length === 0) return <ExamNotFoundState onBack={() => router.push('/student')} />

  const currentQuestion = session.questions[currentIndex]

  return (
    <div className={`fixed inset-x-0 bottom-0 ${GLOBAL_NAV_HEIGHT_CLASS} bg-page-bg flex flex-col`}>
      <ExamTopBar examTitle={session.exam.title} subjectColor={subjectColor} subjectName={session.subject?.name || 'Шалгалт'} subjectInitial={session.subject?.name.charAt(0) || 'Ш'} timeRemaining={timeRemaining} formattedTime={session.formatTime(timeRemaining)} currentIndex={currentIndex} totalQuestions={session.questions.length} onSubmitClick={() => setShowSubmitModal(true)} />
      <div className="flex-1 flex overflow-hidden">
        <QuestionGrid questions={session.questions} answers={session.answers} markedForReview={session.markedForReview} currentIndex={currentIndex} onSelect={setCurrentIndex} answeredCount={answeredCount} unansweredCount={unansweredCount} markedCount={markedCount} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto py-8 px-6">
            {currentQuestion && (
              <>
                <QuestionDisplay question={currentQuestion} currentIndex={currentIndex} subjectColor={subjectColor} />
                <div className="space-y-3">
                  {(currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && currentQuestion.options && (
                    <AnswerMCQ options={currentQuestion.options} selected={session.answers[currentQuestion.id] as string | string[] || (currentQuestion.type === 'multiple' ? [] : '')} isMultiple={currentQuestion.type === 'multiple'} onChange={handleAnswerChange} />
                  )}
                  {currentQuestion.type === 'truefalse' && (
                    <AnswerTrueFalse selected={session.answers[currentQuestion.id] as string || ''} onChange={handleAnswerChange} />
                  )}
                  {(['short', 'long', 'formula', 'code'] as Array<typeof currentQuestion.type>).includes(currentQuestion.type) && (
                    <AnswerText value={(session.answers[currentQuestion.id] as string) || ''} onChange={handleAnswerChange} rows={currentQuestion.type === 'short' || currentQuestion.type === 'formula' ? 3 : 8} />
                  )}
                  {currentQuestion.type === 'matching' && currentQuestion.matchingPairs && (
                    <AnswerMatching pairs={currentQuestion.matchingPairs} selected={(session.answers[currentQuestion.id] as string[]) || new Array(currentQuestion.matchingPairs.length).fill('')} onChange={handleAnswerChange} />
                  )}
                </div>
                {session.lastSaved && (
                  <div className="text-[12px] text-text-secondary mt-4 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Автоматаар хадгалагдсан {session.lastSaved.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ExamBottomBar currentIndex={currentIndex} total={session.questions.length} isMarked={session.markedForReview.has(currentQuestion?.id || '')} lastSaved={session.lastSaved} onPrev={() => setCurrentIndex(prev => Math.max(0, prev - 1))} onNext={() => setCurrentIndex(prev => Math.min(session.questions.length - 1, prev + 1))} onToggleMark={toggleMarkForReview} />
      {showSubmitModal && (
        <SubmitModal isOpen={showSubmitModal} answeredCount={answeredCount} unansweredCount={unansweredCount} markedCount={markedCount} onCancel={() => setShowSubmitModal(false)} onConfirm={handleSubmit} />
      )}
    </div>
  )
}
