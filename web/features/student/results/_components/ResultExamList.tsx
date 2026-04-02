import { LockKeyhole } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Result, Exam, Attempt } from '@/lib/types'
import { SUBJECT_COLORS } from '@/lib/constants'

export function ResultExamList({
  studentResults,
  selectedResultId,
  getExam,
  attempts,
  formatDate,
  onSelect,
}: {
  studentResults: Result[]
  selectedResultId: string | null
  getExam: (id: string) => Exam | undefined
  attempts: Attempt[]
  formatDate: (d: string) => string
  onSelect: (id: string) => void
}) {
  return (
    <div className="bg-white border border-card-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-card-border">
        <h2 className="text-[14px] font-semibold text-foreground">Шалгалтууд</h2>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {studentResults.map(result => {
          const exam = getExam(result.examId)
          const percentage = result.maxScore > 0 ? Math.round((result.totalScore / result.maxScore) * 100) : 0
          const isSelected = selectedResultId === result.id
          const subjectColor = SUBJECT_COLORS['math']
          const attempt = attempts.find(a => a.id === result.attemptId)
          return (
            <button key={result.id} onClick={() => onSelect(result.id)}
              className={cn('w-full p-4 text-left border-b border-divider last:border-b-0 transition-colors', isSelected ? 'bg-active-nav' : 'hover:bg-table-header')}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ backgroundColor: subjectColor.bg }}>
                  {exam?.title.charAt(0) || 'Х'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-foreground mb-0.5 truncate">{exam?.title}</div>
                  <div className="text-[11px] text-text-secondary mb-2">{exam?.subjectId}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-secondary">{attempt?.submittedAt ? formatDate(attempt.submittedAt) : '-'}</span>
                    {result.isPublished ? (
                      <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold', percentage >= 60 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{percentage}%</span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] rounded-full font-medium">
                        <LockKeyhole size={10} strokeWidth={1.5} />Хүлээгдэж буй
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
        {studentResults.length === 0 && <div className="text-center py-12 text-text-secondary text-[14px]">Ил гарсан үр дүн хараахан алга байна.</div>}
      </div>
    </div>
  )
}
