import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Question } from '@/lib/types'
import { QUESTION_TYPE_LABELS } from '@/lib/types'

export function QuestionTabBank({ bankSearchQuery, selectedBankQuestions, filteredBankQuestions, onBankSearchQuery, onSelectedBankQuestions, onAddFromBank }: {
  bankSearchQuery: string; selectedBankQuestions: string[]; filteredBankQuestions: Question[]
  onBankSearchQuery: (v: string) => void; onSelectedBankQuestions: (ids: string[]) => void; onAddFromBank: () => void
}) {
  return (
    <div className="bg-white rounded-lg border border-card-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" strokeWidth={1.5} />
          <input type="text" value={bankSearchQuery} onChange={(e) => onBankSearchQuery(e.target.value)} placeholder="Асуулт хайх..." className="w-full pl-9 pr-3 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
        </div>
        <button onClick={onAddFromBank} disabled={selectedBankQuestions.length === 0} className="px-4 py-2.5 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">Нэмэх ({selectedBankQuestions.length})</button>
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredBankQuestions.length > 0 ? filteredBankQuestions.map(q => (
          <label key={q.id} className={cn('flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors', selectedBankQuestions.includes(q.id) ? 'bg-active-nav border-primary' : 'bg-white border-card-border hover:border-input-border')}>
            <input type="checkbox" checked={selectedBankQuestions.includes(q.id)} onChange={(e) => { if (e.target.checked) { onSelectedBankQuestions([...selectedBankQuestions, q.id]) } else { onSelectedBankQuestions(selectedBankQuestions.filter(id => id !== q.id)) } }} className="mt-0.5" />
            <div className="flex-1">
              <div className="text-[14px] text-foreground">{q.text}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-table-header text-text-secondary text-[11px] rounded">{QUESTION_TYPE_LABELS[q.type]}</span>
                <span className="text-[11px] text-text-secondary">{q.points} оноо</span>
              </div>
            </div>
          </label>
        )) : (<div className="text-center py-8 text-text-secondary text-[14px]">Асуулт олдсонгүй</div>)}
      </div>
    </div>
  )
}
