import Link from 'next/link'
import { ArrowLeft, GripVertical, Trash2, Clock, FileText, Check, Eye, Save } from 'lucide-react'
import type { Question } from '@/lib/types'

type SubjectColor = { bg: string; text?: string }

export function ExamPreviewPanel({
  title,
  selectedCourseLabel,
  subjectColor,
  duration,
  questions,
  totalPoints,
  onRemoveQuestion,
  onSave,
}: {
  title: string
  selectedCourseLabel: string
  subjectColor: SubjectColor
  duration: number
  questions: Question[]
  totalPoints: number
  onRemoveQuestion: (index: number) => void
  onSave: () => void
}) {
  return (
    <div className="w-[400px] border-r border-card-border bg-white flex flex-col">
      <div className="p-4 border-b border-card-border">
        <Link href="/teacher/exams" className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground text-[13px] mb-3">
          <ArrowLeft size={14} strokeWidth={1.5} />Буцах
        </Link>
        <h1 className="text-[18px] font-semibold text-foreground">Шинэ шалгалт</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Урьдчилан харах</div>
        <div className="border border-card-border rounded-lg overflow-hidden shadow-sm">
          <div className="h-20 relative" style={{ backgroundColor: subjectColor.bg }}>
            <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.4'%3E%3Cpath d='M20 20h20v20H20zM0 0h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '20px 20px' }} />
            <div className="absolute bottom-3 left-4 right-4">
              <div className="text-white/80 text-[11px] font-medium">{selectedCourseLabel || 'Хичээл сонгогдоогүй'}</div>
            </div>
          </div>
          <div className="p-4 bg-white">
            <h2 className="text-[16px] font-semibold text-foreground mb-2">{title || 'Шалгалтын гарчиг'}</h2>
            <div className="flex items-center gap-3 text-[12px] text-text-secondary mb-4">
              <div className="flex items-center gap-1"><Clock size={12} strokeWidth={1.5} />{duration} мин</div>
              <div className="flex items-center gap-1"><FileText size={12} strokeWidth={1.5} />{questions.length} асуулт</div>
              <div className="flex items-center gap-1"><Check size={12} strokeWidth={1.5} />{totalPoints} оноо</div>
            </div>
            <div className="border-t border-divider pt-3">
              <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Асуултууд</div>
              {questions.length > 0 ? (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                  {questions.map((q, index) => (
                    <div key={q.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-table-header group cursor-pointer">
                      <span className="w-5 h-5 rounded-full text-white text-[10px] font-medium flex items-center justify-center shrink-0" style={{ backgroundColor: subjectColor.bg }}>{index + 1}</span>
                      <span className="text-[12px] text-foreground truncate flex-1">{q.text}</span>
                      <span className="px-1.5 py-0.5 bg-table-header text-text-secondary text-[10px] rounded shrink-0">{q.points} оноо</span>
                      <GripVertical size={12} className="text-input-border shrink-0 opacity-0 group-hover:opacity-100" strokeWidth={1.5} />
                      <button onClick={() => onRemoveQuestion(index)} className="p-0.5 text-text-secondary hover:text-red-accent opacity-0 group-hover:opacity-100"><Trash2 size={12} strokeWidth={1.5} /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-text-secondary text-[13px]">Асуулт нэмэгдээгүй байна</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-card-border bg-table-header">
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 border border-card-border rounded-md text-[13px] font-medium text-foreground hover:bg-white transition-colors flex items-center justify-center gap-1.5"><Eye size={14} strokeWidth={1.5} />Урьдчилан харах</button>
          <button onClick={onSave} disabled={!title || questions.length === 0} className="flex-1 px-4 py-2 rounded-md text-[13px] font-medium text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50" style={{ backgroundColor: subjectColor.bg }}><Save size={14} strokeWidth={1.5} />Хадгалах</button>
        </div>
      </div>
    </div>
  )
}
