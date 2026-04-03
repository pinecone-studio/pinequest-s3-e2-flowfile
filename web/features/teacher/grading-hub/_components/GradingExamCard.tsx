import Link from 'next/link'
import { Users, Clock, FileText } from 'lucide-react'

export function GradingExamCard({
  examId,
  classId,
  title,
  className,
  manualCount,
  stats,
}: {
  examId: string
  classId: string
  title: string
  className: string
  manualCount: number
  stats: { submitted: number; graded: number; total: number }
}) {
  return (
    <div className="bg-white border rounded-[10px] p-4 flex items-center gap-4" style={{ borderColor: '#DDE1E7' }}>
      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
        <FileText size={22} style={{ color: '#B45309' }} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-medium mb-1" style={{ color: '#1A1A2E' }}>{title}</h3>
        <div className="flex items-center gap-3 text-[12px]" style={{ color: '#5A6474' }}>
          <span className="px-2 py-0.5 rounded" style={{ backgroundColor: '#F5F7FA' }}>{className}</span>
          <span className="flex items-center gap-1"><Users size={12} strokeWidth={1.5} />{stats.submitted} гараар шалгах даалгавар</span>
          <span className="flex items-center gap-1"><Clock size={12} strokeWidth={1.5} />{manualCount} асуулт</span>
        </div>
      </div>
      <div className="text-right mr-4">
        <div className="text-[11px]" style={{ color: '#8A94A0' }}>Үнэлэгдсэн</div>
        <div className="text-[15px] font-semibold" style={{ color: '#1A1A2E' }}>{stats.graded}/{stats.total}</div>
      </div>
      <Link
        href={`/teacher/grading/${examId}/${classId}`}
        className="px-4 py-2 rounded-lg text-[13px] font-medium text-white shrink-0"
        style={{ backgroundColor: '#0066FF' }}
      >
        Үнэлэх
      </Link>
    </div>
  )
}
