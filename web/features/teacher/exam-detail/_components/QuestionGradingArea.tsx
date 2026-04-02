import { Check, X, MessageSquare, User, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/types'
import { QUESTION_TYPE_LABELS } from '@/lib/types'

type AnswerItem = { questionId: string; answer: string | string[] }

export function QuestionGradingArea({ currentQuestion, currentQuestionIndex, currentAnswer, feedback, onScoreChange, onCommentChange }: {
  currentQuestion: Question | undefined; currentQuestionIndex: number
  currentAnswer: AnswerItem | null; feedback: Record<string, { score: number; comment: string }>
  onScoreChange: (questionId: string, score: number) => void; onCommentChange: (questionId: string, comment: string) => void
}) {
  if (!currentQuestion) return null
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg border border-card-border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-primary/10 text-primary text-[11px] font-semibold rounded">Асуулт {currentQuestionIndex + 1}</span>
            <span className="px-2 py-1 bg-table-header text-text-secondary text-[11px] rounded">{QUESTION_TYPE_LABELS[currentQuestion.type]}</span>
          </div>
          <span className="text-[13px] font-medium text-foreground">{currentQuestion.points} оноо</span>
        </div>
        <p className="text-[15px] text-foreground leading-relaxed">{currentQuestion.text}</p>
        {currentQuestion.options && (
          <div className="mt-4 space-y-2">
            {currentQuestion.options.map((opt, index) => {
              const isCorrect = currentQuestion.type === 'single' ? currentQuestion.correctAnswer === opt : Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer.includes(opt)
              const isSelected = currentAnswer?.answer === opt || (Array.isArray(currentAnswer?.answer) && currentAnswer.answer.includes(opt))
              return (
                <div key={index} className={cn('p-3 rounded-lg border text-[14px]', isCorrect && isSelected ? 'bg-green-50 border-green-300 text-green-800' : isCorrect ? 'bg-green-50 border-green-200 text-green-700' : isSelected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-table-header border-card-border text-foreground')}>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white border border-card-border flex items-center justify-center text-[12px] font-medium">{String.fromCharCode(65 + index)}</span>
                    {opt}
                    {isCorrect && <Check size={14} className="ml-auto text-green-600" strokeWidth={2} />}
                    {isSelected && !isCorrect && <X size={14} className="ml-auto text-red-500" strokeWidth={2} />}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg border border-card-border p-6 mb-6">
        <h3 className="text-[14px] font-semibold text-foreground mb-3 flex items-center gap-2"><User size={16} strokeWidth={1.5} />Сурагчийн хариулт</h3>
        {currentAnswer ? (
          <div className="p-4 bg-table-header rounded-lg">
            {currentQuestion.type === 'long' || currentQuestion.type === 'short' ? (
              <p className="text-[14px] text-foreground whitespace-pre-wrap">{currentAnswer.answer as string}</p>
            ) : currentQuestion.type === 'truefalse' ? (
              <p className="text-[14px] text-foreground">{currentAnswer.answer === 'true' ? 'Үнэн' : 'Худал'}</p>
            ) : (
              <p className="text-[14px] text-foreground">{Array.isArray(currentAnswer.answer) ? currentAnswer.answer.join(', ') : currentAnswer.answer}</p>
            )}
          </div>
        ) : <p className="text-[14px] text-text-secondary italic">Хариулаагүй</p>}
      </div>
      <div className="bg-white rounded-lg border border-card-border p-6">
        <h3 className="text-[14px] font-semibold text-foreground mb-4 flex items-center gap-2"><Award size={16} strokeWidth={1.5} />Дүн оруулах</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[13px] text-text-secondary">Оноо:</span>
          <div className="flex gap-1">
            {Array.from({ length: (currentQuestion.points || 0) + 1 }, (_, i) => (
              <button key={i} onClick={() => onScoreChange(currentQuestion.id, i)}
                className={cn('w-8 h-8 rounded-lg text-[13px] font-medium transition-colors', feedback[currentQuestion.id]?.score === i ? i === currentQuestion.points ? 'bg-green-500 text-white' : i > 0 ? 'bg-amber-500 text-white' : 'bg-red-500 text-white' : 'bg-table-header text-foreground hover:bg-card-border')}
              >{i}</button>
            ))}
          </div>
          <span className="text-[13px] text-text-secondary ml-2">/ {currentQuestion.points}</span>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-[13px] font-medium text-foreground mb-1.5"><MessageSquare size={14} strokeWidth={1.5} />Тайлбар</label>
          <textarea value={feedback[currentQuestion.id]?.comment || ''} onChange={(e) => onCommentChange(currentQuestion.id, e.target.value)} rows={3} placeholder="Сурагчид илгээх тайлбар..." className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none resize-none transition-colors" />
        </div>
      </div>
    </div>
  )
}
