import { X } from 'lucide-react'
import { QUESTION_TYPE_LABELS } from '@/lib/types'
import type { Exam, Question } from '@/lib/types'

type LegacyExam = Exam & { courseId?: string }

export function QuestionBankSlideOver({
  selectedExam,
  onClose,
  getExamSubjectName,
  getExamQuestions,
  formatDate,
}: {
  selectedExam: LegacyExam
  onClose: () => void
  getExamSubjectName: (exam: LegacyExam) => string
  getExamQuestions: (exam: Exam) => Question[]
  formatDate: (dateStr: string) => string
}) {
  const questions = getExamQuestions(selectedExam)
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white border-l border-card-border z-50 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-divider sticky top-0 bg-white">
          <h2 className="text-[15px] font-medium">{selectedExam.title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-foreground">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="text-[13px]"><span className="text-text-secondary">Хичээл:</span><span className="ml-2 text-foreground">{getExamSubjectName(selectedExam)}</span></div>
            <div className="text-[13px]"><span className="text-text-secondary">Хугацаа:</span><span className="ml-2 text-foreground">{selectedExam.duration} мин</span></div>
            <div className="text-[13px]"><span className="text-text-secondary">Асуулт:</span><span className="ml-2 text-foreground">{selectedExam.questionIds.length}</span></div>
            <div className="text-[13px]"><span className="text-text-secondary">Огноо:</span><span className="ml-2 text-foreground">{formatDate(selectedExam.createdAt)}</span></div>
          </div>
          <h3 className="text-[14px] font-medium mb-3">Асуултууд</h3>
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div key={q.id} className="border border-card-border rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-navy text-white text-[11px] flex items-center justify-center">{index + 1}</span>
                  <span className="px-2 py-0.5 bg-table-header text-text-secondary text-[11px] rounded">{QUESTION_TYPE_LABELS[q.type]}</span>
                  <span className="text-[11px] text-text-secondary ml-auto">{q.points} оноо</span>
                </div>
                <p className="text-[13px] text-foreground">{q.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
