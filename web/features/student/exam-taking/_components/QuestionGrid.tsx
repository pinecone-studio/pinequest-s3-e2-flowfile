import type { StudentExamQuestion } from '@/lib/api/student-exams'
import { cn } from '@/lib/utils'

interface QuestionGridProps {
  questions: StudentExamQuestion[]
  answers: Record<string, string>
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
    <div className="w-full border-b border-card-border bg-white md:w-[220px] md:shrink-0 md:border-b-0 md:border-r md:overflow-y-auto md:flex md:flex-col">
      <div className="p-4 border-b border-card-border">
        <div className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-3">
          Асуултууд
        </div>
        <div className="grid grid-flow-col auto-cols-[2rem] gap-1.5 overflow-x-auto pb-1 md:grid-flow-row md:auto-cols-auto md:grid-cols-5 md:overflow-visible">
          {questions.map((q, index) => {
            const isAnswered = Boolean(answers[q.id] && answers[q.id].trim() !== '')
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

      <div className="grid grid-cols-1 gap-2 border-t border-card-border bg-table-header p-4 text-[11px] sm:grid-cols-3 md:mt-auto md:grid-cols-1">
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
  )
}
