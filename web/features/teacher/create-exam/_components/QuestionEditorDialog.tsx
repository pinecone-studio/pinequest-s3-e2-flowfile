'use client'

import { useEffect, useState } from 'react'
import type { Question, QuestionType } from '@/lib/types'
import { QUESTION_TYPE_LABELS } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QuestionTabNew } from './QuestionTabNew'
import { isManualQuestionType } from '../createExamUtils'

export function QuestionEditorDialog({
  open,
  question,
  questionNumber,
  onOpenChange,
  onSave,
}: {
  open: boolean
  question: Question | null
  questionNumber?: number
  onOpenChange: (open: boolean) => void
  onSave: (question: Question) => void
}) {
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType>('single')
  const [questionOptions, setQuestionOptions] = useState<string[]>(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState<string | string[]>('')
  const [matchingPairs, setMatchingPairs] = useState<{ left: string; right: string }[]>([
    { left: '', right: '' },
    { left: '', right: '' },
  ])
  const [questionPoints, setQuestionPoints] = useState(2)

  useEffect(() => {
    if (!open || !question) {
      return
    }

    setQuestionText(question.text)
    setQuestionType(question.type)
    setQuestionOptions(question.options?.length ? question.options : ['', '', '', ''])
    setCorrectAnswer(question.correctAnswer ?? (question.type === 'multiple' ? [] : ''))
    setMatchingPairs(
      question.matchingPairs?.length
        ? question.matchingPairs
        : [
            { left: '', right: '' },
            { left: '', right: '' },
          ],
    )
    setQuestionPoints(question.points)
  }, [open, question])

  const handleSave = () => {
    if (!question || !questionText.trim()) {
      return
    }

    const updatedQuestion: Question = {
      id: question.id,
      examId: question.examId,
      text: questionText.trim(),
      type: questionType,
      points: questionPoints,
      order: question.order,
      isManualGrade: isManualQuestionType(questionType),
      imageUrl: question.imageUrl,
    }

    if (questionType === 'single') {
      updatedQuestion.options = questionOptions.map((option) => option.trim()).filter(Boolean)
      updatedQuestion.correctAnswer =
        typeof correctAnswer === 'string' ? correctAnswer.trim() : ''
    } else if (questionType === 'multiple') {
      updatedQuestion.options = questionOptions.map((option) => option.trim()).filter(Boolean)
      updatedQuestion.correctAnswer = Array.isArray(correctAnswer)
        ? correctAnswer.map((option) => option.trim()).filter(Boolean)
        : []
    } else if (questionType === 'truefalse') {
      updatedQuestion.correctAnswer = correctAnswer === 'false' ? 'false' : 'true'
    } else if (questionType === 'matching') {
      updatedQuestion.matchingPairs = matchingPairs.filter(
        (pair) => pair.left.trim() && pair.right.trim(),
      )
    } else if (typeof correctAnswer === 'string' && correctAnswer.trim()) {
      updatedQuestion.correctAnswer = correctAnswer.trim()
    }

    onSave(updatedQuestion)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 sm:max-w-5xl">
        {question && (
          <>
            <DialogHeader className="border-b border-card-border px-6 py-5">
              <DialogTitle className="text-[20px] text-foreground">
                Асуулт {questionNumber ? `#${questionNumber}` : ''}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-text-secondary">
                {QUESTION_TYPE_LABELS[questionType]} • Бүх мэдээллийг хараад шаардлагатай бол засварлана уу.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <QuestionTabNew
                questionText={questionText}
                questionType={questionType}
                questionOptions={questionOptions}
                correctAnswer={correctAnswer}
                questionPoints={questionPoints}
                matchingPairs={matchingPairs}
                onQuestionText={setQuestionText}
                onQuestionType={setQuestionType}
                onQuestionOptions={setQuestionOptions}
                onCorrectAnswer={setCorrectAnswer}
                onQuestionPoints={setQuestionPoints}
                onMatchingPairs={setMatchingPairs}
                onAddQuestion={handleSave}
                onCancel={() => onOpenChange(false)}
                actionLabel="Өөрчлөх"
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
