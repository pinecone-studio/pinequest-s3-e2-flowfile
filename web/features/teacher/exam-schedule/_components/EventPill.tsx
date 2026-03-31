import type { ExamAssignment, Exam } from '@/lib/types'

export function EventPill({
  assignment,
  exam,
  onClick,
}: {
  assignment: ExamAssignment
  exam: Exam | undefined
  onClick: (e: React.MouseEvent, assignment: ExamAssignment) => void
}) {
  return (
    <button
      onClick={(e) => onClick(e, assignment)}
      className="w-full px-1.5 py-0.5 text-[11px] rounded truncate text-left transition-opacity hover:opacity-80"
      style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}
    >
      {exam?.title}
    </button>
  )
}
