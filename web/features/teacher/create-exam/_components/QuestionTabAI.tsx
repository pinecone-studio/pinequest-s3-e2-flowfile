import { Plus, Sparkles, Wand2 } from 'lucide-react'
import type { Question } from '@/lib/types'
import { QUESTION_TYPE_LABELS } from '@/lib/types'

export function QuestionTabAI({ aiTopic, aiDifficulty, aiCount, aiGenerating, aiGeneratedQuestions, onAiTopic, onAiDifficulty, onAiCount, onAiGenerate, onAddAiQuestions }: {
  aiTopic: string; aiDifficulty: 'easy' | 'medium' | 'hard'; aiCount: number; aiGenerating: boolean; aiGeneratedQuestions: Question[]
  onAiTopic: (v: string) => void; onAiDifficulty: (v: 'easy' | 'medium' | 'hard') => void; onAiCount: (v: number) => void
  onAiGenerate: () => void; onAddAiQuestions: (ids: string[]) => void
}) {
  return (
    <div className="bg-white rounded-lg border border-card-border p-6">
      <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center"><Sparkles size={20} className="text-white" strokeWidth={1.5} /></div>
        <div><h3 className="text-[15px] font-semibold text-foreground">AI Auto-fill</h3><p className="text-[13px] text-text-secondary">Хиймэл оюун ухаанаар асуулт автоматаар үүсгэнэ</p></div>
      </div>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">Сэдэв / Түлхүүр үг</label>
          <input type="text" value={aiTopic} onChange={(e) => onAiTopic(e.target.value)} placeholder="Жишээ: Пифагорын теорем" className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Хүндрэлийн түвшин</label>
            <select value={aiDifficulty} onChange={(e) => onAiDifficulty(e.target.value as 'easy' | 'medium' | 'hard')} className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none bg-white transition-colors">
              <option value="easy">Хөнгөн</option><option value="medium">Дунд</option><option value="hard">Хүнд</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-foreground mb-1.5">Асуултын тоо</label>
            <input type="number" value={aiCount} onChange={(e) => onAiCount(Number(e.target.value))} min={1} max={20} className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
          </div>
        </div>
        <button onClick={onAiGenerate} disabled={!aiTopic.trim() || aiGenerating} className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-[14px] font-medium hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {aiGenerating ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Үүсгэж байна...</>) : (<><Wand2 size={16} strokeWidth={1.5} />Асуулт үүсгэх</>)}
        </button>
      </div>
      {aiGeneratedQuestions.length > 0 && (
        <div className="border-t border-divider pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[14px] font-medium text-foreground">Үүсгэсэн асуултууд</h4>
            <button onClick={() => onAddAiQuestions(aiGeneratedQuestions.map(q => q.id))} className="text-[13px] text-primary hover:underline flex items-center gap-1"><Plus size={14} strokeWidth={1.5} />Бүгдийг нэмэх</button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {aiGeneratedQuestions.map(q => (
              <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg border border-card-border bg-white hover:border-input-border transition-colors">
                <div className="flex-1">
                  <div className="text-[14px] text-foreground">{q.text}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[11px] rounded font-medium">AI</span>
                    <span className="px-2 py-0.5 bg-table-header text-text-secondary text-[11px] rounded">{QUESTION_TYPE_LABELS[q.type]}</span>
                    <span className="text-[11px] text-text-secondary">{q.points} оноо</span>
                  </div>
                </div>
                <button onClick={() => onAddAiQuestions([q.id])} className="px-3 py-1.5 bg-primary text-white rounded text-[12px] font-medium hover:bg-primary/90 transition-colors">Нэмэх</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
