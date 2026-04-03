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
  score?: number
  userAnswer: string | string[] | undefined
}) {
  const hasDetailedScore = typeof score === 'number'
  const hasAnswer =
    userAnswer !== undefined &&
    userAnswer !== '' &&
    (!Array.isArray(userAnswer) || userAnswer.length > 0)
  const isCorrect = hasDetailedScore && score === question.points
  const isIncorrect = hasDetailedScore && !isCorrect && hasAnswer
  const statusBg = isCorrect
    ? 'bg-green-100'
    : isIncorrect
      ? 'bg-red-100'
      : hasAnswer
        ? 'bg-blue-100'
        : 'bg-gray-100'
  const statusColor = isCorrect
    ? 'text-green-600'
    : isIncorrect
      ? 'text-red-500'
      : hasAnswer
        ? 'text-blue-600'
        : 'text-gray-400'

  return (
    <div className="px-5 py-4 hover:bg-table-header transition-colors">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            statusBg,
          )}
        >
          {isCorrect ? (
            <CheckCircle size={16} className="text-green-600" strokeWidth={2} />
          ) : isIncorrect ? (
            <XCircle size={16} className="text-red-500" strokeWidth={2} />
          ) : (
            <MinusCircle size={16} className={statusColor} strokeWidth={2} />
          )}
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
              <span
                className={cn(
                  'font-medium',
                  isCorrect
                    ? 'text-green-600'
                    : isIncorrect
                      ? 'text-red-500'
                      : hasAnswer
                        ? 'text-blue-600'
                        : 'text-gray-400',
                )}
              >
                {formatAnswer(userAnswer)}
              </span>
            </div>
            {hasDetailedScore && !isCorrect && question.correctAnswer && (
              <div>
                <span className="text-text-secondary">Зөв хариу: </span>
                <span className="font-medium text-green-600">
                  {formatAnswer(question.correctAnswer as string | string[])}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          {hasDetailedScore ? (
            <>
              <div
                className={cn(
                  'text-[16px] font-bold',
                  isCorrect ? 'text-green-600' : isIncorrect ? 'text-red-500' : 'text-gray-400',
                )}
              >
                {score}
              </div>
              <div className="text-[11px] text-text-secondary">/ {question.points}</div>
            </>
          ) : (
            <>
              <div className={cn('text-[13px] font-semibold', hasAnswer ? 'text-blue-600' : 'text-gray-400')}>
                {hasAnswer ? 'Илгээгдсэн' : 'Хоосон'}
              </div>
              <div className="text-[11px] text-text-secondary">дэлгэрэнгүйгүй</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
