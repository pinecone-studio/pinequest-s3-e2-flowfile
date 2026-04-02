import { Check, FlaskConical, ImagePlus, Keyboard, Mic, Plus, SquareTerminal, Trash2, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuestionType } from '@/lib/types'
import { QUESTION_TYPE_LABELS } from '@/lib/types'

const questionTypeMeta: Record<QuestionType, { icon: typeof Keyboard; description: string }> = {
  single: { icon: Keyboard, description: 'Нэг зөв хариулттай тест асуулт.' },
  multiple: { icon: Keyboard, description: 'Олон зөв хариулт сонгох тест.' },
  truefalse: { icon: Keyboard, description: 'Үнэн эсвэл худал хэлбэрийн асуулт.' },
  matching: { icon: Keyboard, description: 'Хоёр баганыг тааруулах асуулт.' },
  short: { icon: Keyboard, description: 'Богино текстэн хариулт.' },
  long: { icon: Keyboard, description: 'Дэлгэрэнгүй тайлбар, эссэ хэлбэрийн хариулт.' },
  formula: { icon: Keyboard, description: 'MathLive virtual keyboard-тай математик томъёо.' },
  chemistry: { icon: FlaskConical, description: 'Ketcher editor-оор молекул эсвэл химийн бүтэц зуруулна.' },
  code: { icon: SquareTerminal, description: 'CodeMirror editor дээр код бичүүлнэ.' },
  voice: { icon: Mic, description: 'Сурагч дуу бичлэг эсвэл аудио файл оруулна.' },
  video: { icon: Video, description: 'Видео, зураг эсвэл файл хавсаргаж хариулна.' },
  handwritten: { icon: ImagePlus, description: 'Гараар зурсан зураг, скан эсвэл media upload.' },
}

export function QuestionTabNew({ questionText, questionType, questionOptions, correctAnswer, questionPoints, matchingPairs, onQuestionText, onQuestionType, onQuestionOptions, onCorrectAnswer, onQuestionPoints, onMatchingPairs, onAddQuestion }: {
  questionText: string; questionType: QuestionType; questionOptions: string[]; correctAnswer: string | string[]; questionPoints: number
  matchingPairs: { left: string; right: string }[]
  onQuestionText: (v: string) => void; onQuestionType: (v: QuestionType) => void; onQuestionOptions: (v: string[]) => void
  onCorrectAnswer: (v: string | string[]) => void; onQuestionPoints: (v: number) => void; onMatchingPairs: (pairs: { left: string; right: string }[]) => void; onAddQuestion: () => void
}) {
  const selectedTypeMeta = questionTypeMeta[questionType]
  const SelectedTypeIcon = selectedTypeMeta.icon

  return (
    <div className="bg-white rounded-lg border border-card-border p-6 space-y-4">
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">Асуултын текст *</label>
        <textarea value={questionText} onChange={(e) => onQuestionText(e.target.value)} rows={3} placeholder="Асуултаа бичнэ үү..." className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none resize-none transition-colors" />
      </div>

      <button className="flex items-center gap-1.5 text-primary text-[13px] hover:underline"><ImagePlus size={14} strokeWidth={1.5} />Зураг нэмэх</button>

      <div>
        <label className="block text-[13px] font-medium text-foreground mb-2">Хариултын төрөл</label>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map(type => {
            const meta = questionTypeMeta[type]
            const Icon = meta.icon
            const isActive = questionType === type

            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onQuestionType(type)
                  onCorrectAnswer(type === 'multiple' ? [] : '')
                }}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-left transition-all',
                  isActive
                    ? 'border-primary bg-[#EEF5FF] shadow-sm'
                    : 'border-card-border bg-white hover:border-input-border hover:bg-table-header/70',
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', isActive ? 'bg-primary text-white' : 'bg-table-header text-text-secondary')}>
                    <Icon size={16} strokeWidth={1.7} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-foreground">{QUESTION_TYPE_LABELS[type]}</div>
                    <div className="mt-0.5 text-[11px] leading-4 text-text-secondary">{meta.description}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-card-border bg-table-header/70 p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-white p-2 text-primary shadow-sm">
            <SelectedTypeIcon size={16} strokeWidth={1.7} />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-foreground">{QUESTION_TYPE_LABELS[questionType]}</div>
            <div className="text-[12px] text-text-secondary">{selectedTypeMeta.description}</div>
          </div>
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
                {questionOptions.length > 2 && (<button type="button" onClick={() => onQuestionOptions(questionOptions.filter((_, i) => i !== index))} className="p-1.5 text-text-secondary hover:text-red-accent"><Trash2 size={14} strokeWidth={1.5} /></button>)}
              </div>
            ))}
            {questionOptions.length < 6 && (<button type="button" onClick={() => onQuestionOptions([...questionOptions, ''])} className="flex items-center gap-1.5 text-primary text-[13px] hover:underline mt-2"><Plus size={14} strokeWidth={1.5} />Хариулт нэмэх</button>)}
          </div>
        </div>
      )}

      {questionType === 'truefalse' && (
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-2">Зөв хариулт</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => onCorrectAnswer('true')} className={cn('px-6 py-2.5 rounded-lg border-2 text-[14px] font-medium transition-colors', correctAnswer === 'true' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-card-border text-foreground hover:border-input-border')}>Үнэн</button>
            <button type="button" onClick={() => onCorrectAnswer('false')} className={cn('px-6 py-2.5 rounded-lg border-2 text-[14px] font-medium transition-colors', correctAnswer === 'false' ? 'bg-red-50 border-red-400 text-red-700' : 'bg-white border-card-border text-foreground hover:border-input-border')}>Худал</button>
          </div>
        </div>
      )}

      {questionType === 'matching' && (
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-2">Тааруулах хосууд</label>
          <div className="space-y-2">
            {matchingPairs.map((pair, index) => (
              <div key={index} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
                <input
                  type="text"
                  value={pair.left}
                  onChange={(e) => {
                    const next = [...matchingPairs]
                    next[index] = { ...pair, left: e.target.value }
                    onMatchingPairs(next)
                  }}
                  placeholder={`Зүүн тал ${index + 1}`}
                  className="px-3 py-2 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                />
                <span className="text-[12px] text-text-secondary text-center">↔</span>
                <input
                  type="text"
                  value={pair.right}
                  onChange={(e) => {
                    const next = [...matchingPairs]
                    next[index] = { ...pair, right: e.target.value }
                    onMatchingPairs(next)
                  }}
                  placeholder={`Баруун тал ${index + 1}`}
                  className="px-3 py-2 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors"
                />
                {matchingPairs.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => onMatchingPairs(matchingPairs.filter((_, pairIndex) => pairIndex !== index))}
                    className="p-1.5 text-text-secondary hover:text-red-accent justify-self-end"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onMatchingPairs([...matchingPairs, { left: '', right: '' }])} className="flex items-center gap-1.5 text-primary text-[13px] hover:underline mt-3"><Plus size={14} strokeWidth={1.5} />Хос нэмэх</button>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-divider">
        <div className="flex items-center gap-3">
          <label className="text-[13px] font-medium text-foreground">Оноо:</label>
          <input type="number" value={questionPoints} onChange={(e) => onQuestionPoints(Number(e.target.value))} min={1} max={20} className="w-16 px-3 py-1.5 border border-input-border rounded-lg text-[14px] text-center focus:border-primary focus:outline-none" />
        </div>
        <button type="button" onClick={onAddQuestion} disabled={!questionText.trim()} className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"><Plus size={14} strokeWidth={1.5} />Нэмэх</button>
      </div>
    </div>
  )
}
