import { Plus, Check, Trash2, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestionType } from '@/lib/types'
import { QUESTION_TYPE_LABELS } from '@/lib/types'

export function QuestionTabNew({ questionText, questionType, questionOptions, correctAnswer, questionPoints, onQuestionText, onQuestionType, onQuestionOptions, onCorrectAnswer, onQuestionPoints, onAddQuestion }: {
  questionText: string; questionType: QuestionType; questionOptions: string[]; correctAnswer: string | string[]; questionPoints: number
  onQuestionText: (v: string) => void; onQuestionType: (v: QuestionType) => void; onQuestionOptions: (v: string[]) => void
  onCorrectAnswer: (v: string | string[]) => void; onQuestionPoints: (v: number) => void; onAddQuestion: () => void
}) {
  return (
    <div className="bg-white rounded-lg border border-card-border p-6 space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">Асуултын текст *</label>
        <textarea value={questionText} onChange={(e) => onQuestionText(e.target.value)} rows={3} placeholder="Асуултаа бичнэ үү..." className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none resize-none transition-colors" />
      </div>
      <button className="flex items-center gap-1.5 text-primary text-[13px] hover:underline"><ImagePlus size={14} strokeWidth={1.5} />Зураг нэмэх</button>
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-2">Хариултын төрөл</label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(type => (
            <button key={type} onClick={() => { onQuestionType(type); onCorrectAnswer(type === 'multiple' ? [] : '') }} className={cn('px-3 py-1.5 rounded-full border text-[12px] font-medium transition-colors', questionType === type ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-card-border hover:border-input-border')}>{QUESTION_TYPE_LABELS[type]}</button>
          ))}
        </div>
      </div>
      {(questionType === 'single' || questionType === 'multiple') && (
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-2">Хариултууд</label>
          <div className="space-y-2">
            {questionOptions.map((opt, index) => (
              <div key={index} className="flex items-center gap-2">
                <button type="button" onClick={() => {
                  if (questionType === 'single') { onCorrectAnswer(opt) }
                  else { const current = Array.isArray(correctAnswer) ? correctAnswer : []; if (current.includes(opt)) { onCorrectAnswer(current.filter(a => a !== opt)) } else { onCorrectAnswer([...current, opt]) } }
                }} className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors', (questionType === 'single' && correctAnswer === opt) || (questionType === 'multiple' && Array.isArray(correctAnswer) && correctAnswer.includes(opt)) ? 'border-green-500 bg-green-500' : 'border-input-border hover:border-primary')}>
                  {((questionType === 'single' && correctAnswer === opt) || (questionType === 'multiple' && Array.isArray(correctAnswer) && correctAnswer.includes(opt))) && (<Check size={12} className="text-white" strokeWidth={2} />)}
                </button>
                <input type="text" value={opt} onChange={(e) => { const newOpts = [...questionOptions]; newOpts[index] = e.target.value; onQuestionOptions(newOpts) }} placeholder={`Хариулт ${String.fromCharCode(65 + index)}`} className="flex-1 px-3 py-2 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
                {questionOptions.length > 2 && (<button onClick={() => onQuestionOptions(questionOptions.filter((_, i) => i !== index))} className="p-1.5 text-text-secondary hover:text-red-accent"><Trash2 size={14} strokeWidth={1.5} /></button>)}
              </div>
            ))}
            {questionOptions.length < 6 && (<button onClick={() => onQuestionOptions([...questionOptions, ''])} className="flex items-center gap-1.5 text-primary text-[13px] hover:underline mt-2"><Plus size={14} strokeWidth={1.5} />Хариулт нэмэх</button>)}
          </div>
        </div>
      )}
      {questionType === 'truefalse' && (
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-2">Зөв хариулт</label>
          <div className="flex gap-3">
            <button onClick={() => onCorrectAnswer('true')} className={cn('px-6 py-2.5 rounded-lg border-2 text-[14px] font-medium transition-colors', correctAnswer === 'true' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-card-border text-foreground hover:border-input-border')}>Үнэн</button>
            <button onClick={() => onCorrectAnswer('false')} className={cn('px-6 py-2.5 rounded-lg border-2 text-[14px] font-medium transition-colors', correctAnswer === 'false' ? 'bg-red-50 border-red-400 text-red-700' : 'bg-white border-card-border text-foreground hover:border-input-border')}>Худал</button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-divider">
        <div className="flex items-center gap-3">
          <label className="text-[13px] font-medium text-foreground">Оноо:</label>
          <input type="number" value={questionPoints} onChange={(e) => onQuestionPoints(Number(e.target.value))} min={1} max={10} className="w-16 px-3 py-1.5 border border-input-border rounded-lg text-[14px] text-center focus:border-primary focus:outline-none" />
        </div>
        <button onClick={onAddQuestion} disabled={!questionText.trim()} className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"><Plus size={14} strokeWidth={1.5} />Нэмэх</button>
      </div>
    </div>
  )
}
