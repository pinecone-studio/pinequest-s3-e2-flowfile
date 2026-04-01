import type { Question } from '@/lib/types'
import { cn } from '@/lib/utils'

interface QuestionGridProps {
  questions: Question[]
  answers: Record<string, string | string[]>
  markedForReview: Set<string>
  currentIndex: number
  onSelect: (index: number) => void
  answeredCount: number
  unansweredCount: number
  markedCount: number
}

export function QuestionGrid({
  questions,
  answers,
  markedForReview,
  currentIndex,
  onSelect,
  answeredCount,
  unansweredCount,
  markedCount,
}: QuestionGridProps) {
  return (
    <div className="w-[220px] border-r border-card-border bg-white overflow-y-auto shrink-0 flex flex-col">
      <div className="p-4 border-b border-card-border">
        <div className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-3">
          Асуултууд
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {questions.map((q, index) => {
            const isAnswered = answers[q.id] && (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : (answers[q.id] as string).trim() !== '')
            const isMarked = markedForReview.has(q.id)
            const isCurrent = index === currentIndex

            return (
              <button
                key={q.id}
                onClick={() => onSelect(index)}
                className={cn(
                  "w-8 h-8 rounded-lg text-[12px] font-semibold transition-all",
                  isMarked
                    ? "bg-amber-500 text-white"
                    : isAnswered
                      ? "bg-green-500 text-white"
                      : "bg-table-header text-text-secondary hover:bg-card-border",
                  isCurrent && "ring-2 ring-primary ring-offset-1"
                )}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-card-border bg-table-header">
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-text-secondary">Хариулсан ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-table-header border border-card-border" />
            <span className="text-text-secondary">Хариулаагүй ({unansweredCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-500" />
            <span className="text-text-secondary">Тэмдэглэсэн ({markedCount})</span>
          </div>
        </div>
      </div>
    </div>
  )
}
