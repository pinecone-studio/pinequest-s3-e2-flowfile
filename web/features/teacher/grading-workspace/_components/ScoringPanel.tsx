import { MessageSquare, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/types'

type FeedbackMap = Record<string, { score: number; comment: string }>

export function ScoringPanel({
  currentQuestion,
  feedback,
  onScoreChange,
  onCommentChange,
}: {
  currentQuestion: Question
  feedback: FeedbackMap
  onScoreChange: (questionId: string, score: number) => void
  onCommentChange: (questionId: string, comment: string) => void
}) {
  return (
    <div className="bg-white rounded-lg border border-card-border p-6">
      <h3 className="text-[14px] font-semibold text-foreground mb-4 flex items-center gap-2">
        <Award size={16} strokeWidth={1.5} />Дүн оруулах
      </h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[13px] text-text-secondary">Оноо:</span>
        <div className="flex gap-1">
          {Array.from({ length: (currentQuestion.points || 0) + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => onScoreChange(currentQuestion.id, i)}
              className={cn(
                'w-8 h-8 rounded-lg text-[13px] font-medium transition-colors',
                feedback[currentQuestion.id]?.score === i
                  ? i === currentQuestion.points
                    ? 'bg-green-500 text-white'
                    : i > 0
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-500 text-white'
                  : 'bg-table-header text-foreground hover:bg-card-border'
              )}
            >
              {i}
            </button>
          ))}
        </div>
        <span className="text-[13px] text-text-secondary ml-2">/ {currentQuestion.points}</span>
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-[13px] font-medium text-foreground mb-1.5">
          <MessageSquare size={14} strokeWidth={1.5} />Тайлбар
        </label>
        <textarea
          value={feedback[currentQuestion.id]?.comment || ''}
          onChange={(e) => onCommentChange(currentQuestion.id, e.target.value)}
          rows={3}
          placeholder="Сурагчид илгээх тайлбар..."
          className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none resize-none transition-colors"
        />
      </div>
    </div>
  )
}
