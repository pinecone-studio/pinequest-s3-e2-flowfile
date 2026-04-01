import { cn } from '@/lib/utils'
import type { Question } from '@/lib/types'

type FeedbackMap = Record<string, { score: number; comment: string }>

export function GradingNavBar({
  questions,
  feedback,
  currentQuestionIndex,
  onSelect,
}: {
  questions: Question[]
  feedback: FeedbackMap
  currentQuestionIndex: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="px-6 py-3 bg-white border-b border-card-border flex items-center gap-2 overflow-x-auto">
      {questions.map((q, index) => {
        const fb = feedback[q.id]
        const hasScore = fb?.score !== undefined
        return (
          <button
            key={q.id}
            onClick={() => onSelect(index)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors shrink-0',
              currentQuestionIndex === index
                ? 'bg-primary text-white'
                : hasScore
                  ? fb.score === q.points
                    ? 'bg-green-100 text-green-700'
                    : fb.score > 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  : 'bg-table-header text-text-secondary hover:bg-card-border'
            )}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}
