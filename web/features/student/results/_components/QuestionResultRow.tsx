import { CheckCircle, XCircle, MinusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/types'
import { QUESTION_TYPE_CONFIG } from '@/lib/constants'

function formatAnswer(answer: string | string[] | undefined): string {
  if (!answer || (Array.isArray(answer) && answer.length === 0)) return 'Хариулаагүй'
  if (Array.isArray(answer)) return answer.join(', ')
  if (answer === 'true') return 'Үнэн'
  if (answer === 'false') return 'Худал'
  return answer
}

export function QuestionResultRow({
  question,
  index,
  score,
  userAnswer,
}: {
  question: Question
  index: number
  score: number
  userAnswer: string | string[] | undefined
}) {
  const isCorrect = score === question.points
  const hasAnswer = userAnswer !== undefined && userAnswer !== ''

  return (
    <div className="px-5 py-4 hover:bg-table-header transition-colors">
      <div className="flex items-start gap-4">
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', isCorrect ? 'bg-green-100' : hasAnswer ? 'bg-red-100' : 'bg-gray-100')}>
          {isCorrect ? <CheckCircle size={16} className="text-green-600" strokeWidth={2} /> : hasAnswer ? <XCircle size={16} className="text-red-500" strokeWidth={2} /> : <MinusCircle size={16} className="text-gray-400" strokeWidth={2} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold text-text-secondary">#{index + 1}</span>
            <span className="px-2 py-0.5 bg-table-header text-text-secondary text-[10px] rounded font-medium">
              {QUESTION_TYPE_CONFIG[question.type]?.label || question.type}
            </span>
          </div>
          <p className="text-[14px] text-foreground mb-2 line-clamp-2">{question.text}</p>
          <div className="flex items-center gap-6 text-[12px]">
            <div>
              <span className="text-text-secondary">Таны хариу: </span>
              <span className={cn('font-medium', isCorrect ? 'text-green-600' : hasAnswer ? 'text-red-500' : 'text-gray-400')}>
                {formatAnswer(userAnswer)}
              </span>
            </div>
            {!isCorrect && question.correctAnswer && (
              <div>
                <span className="text-text-secondary">Зөв хариу: </span>
                <span className="font-medium text-green-600">{formatAnswer(question.correctAnswer as string | string[])}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={cn('text-[16px] font-bold', isCorrect ? 'text-green-600' : hasAnswer ? 'text-red-500' : 'text-gray-400')}>{score}</div>
          <div className="text-[11px] text-text-secondary">/ {question.points}</div>
        </div>
      </div>
    </div>
  )
}
