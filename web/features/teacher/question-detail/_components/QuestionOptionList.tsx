import { cn } from '@/lib/utils'
import type { Question } from '@/lib/types'

export function QuestionOptionList({ question }: { question: Question }) {
  if (!question.options || (question.type !== 'single' && question.type !== 'multiple')) return null

  return (
    <div className="space-y-2 pl-4">
      {question.options.map((option, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex)
        const isCorrect = Array.isArray(question.correctAnswer)
          ? question.correctAnswer.includes(option)
          : question.correctAnswer === option
        return (
          <div
            key={optIndex}
            className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-[13px]', isCorrect ? 'bg-[#E8F5E9]' : 'bg-[#F5F7FA]')}
            style={{ color: isCorrect ? '#1A7A4A' : '#1A1A2E' }}
          >
            <span className="font-medium">{letter})</span>
            <span>{option}</span>
          </div>
        )
      })}
    </div>
  )
}
