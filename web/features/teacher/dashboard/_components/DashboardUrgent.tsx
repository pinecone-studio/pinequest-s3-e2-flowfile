import ExamPipeline from '@/components/exam-pipeline'
import type { Exam, ExamAssignment, Attempt, Result, Question } from '@/lib/types'

interface UrgentItem {
  exam: Exam
  assignment: ExamAssignment
  attempts: Attempt[]
  results: Result[]
  questions: Question[]
}

export function DashboardUrgent({ items }: { items: UrgentItem[] }) {
  return (
    <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-semibold text-[15px]" style={{ color: '#1A1A2E' }}>Яаралтай анхаарах зүйлс</h2>
        {items.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[11px] text-white font-bold" style={{ background: '#E8112D' }}>{items.length}</span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="rounded-[8px] p-3 text-[13px] font-medium" style={{ background: '#DCFCE7', color: '#1A7A4A' }}>
          ✓ Одоогоор хийх зүйл байхгүй байна
        </div>
      ) : items.map(({ exam, assignment, attempts, results, questions }) => (
        <div key={assignment.id} className="mb-2">
          <ExamPipeline variant="compact" exam={exam} assignment={assignment} attempts={attempts} results={results} questions={questions} />
        </div>
      ))}
    </div>
  )
}
