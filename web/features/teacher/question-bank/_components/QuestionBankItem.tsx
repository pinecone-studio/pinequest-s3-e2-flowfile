import Link from 'next/link'
import { X } from 'lucide-react'
import { ExamShareCard } from '@/components/exam-share-card'
import type { TeacherExamBankRecord } from '@/lib/teacher-exam-bank'
import { QUESTION_TYPE_LABELS } from '@/lib/types'

export function QuestionBankSlideOver({
  selectedExam,
  onClose,
  formatDate,
}: {
  selectedExam: TeacherExamBankRecord
  onClose: () => void
  formatDate: (dateStr: string) => string
}) {
  const questions = selectedExam.questions
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
            <div className="text-[13px]"><span className="text-text-secondary">Хичээл:</span><span className="ml-2 text-foreground">{selectedExam.subjectName}</span></div>
            <div className="text-[13px]"><span className="text-text-secondary">Хугацаа:</span><span className="ml-2 text-foreground">{selectedExam.durationMinutes} мин</span></div>
            <div className="text-[13px]"><span className="text-text-secondary">Асуулт:</span><span className="ml-2 text-foreground">{selectedExam.questions.length}</span></div>
            <div className="text-[13px]"><span className="text-text-secondary">Огноо:</span><span className="ml-2 text-foreground">{formatDate(selectedExam.createdAt)}</span></div>
          </div>
          <div className="mb-6">
            <ExamShareCard
              examId={selectedExam.id}
              title={selectedExam.title}
              subjectName={selectedExam.subjectName}
              questionCount={selectedExam.questions.length}
              durationMinutes={selectedExam.durationMinutes}
            />
          </div>
          <div className="mb-4">
            <Link
              href={`/teacher/bank/${selectedExam.id}`}
              className="inline-flex items-center rounded-lg border px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-[#F5F7FA]"
              style={{ borderColor: '#DDE1E7' }}
            >
              Дэлгэрэнгүй нээх
            </Link>
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
