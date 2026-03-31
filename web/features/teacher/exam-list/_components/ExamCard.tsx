import Link from 'next/link'
import { Calendar, Clock, FileText } from 'lucide-react'
import { STATUS_CONFIG } from '@/lib/constants'
import type { Exam, ExamAssignment, Course } from '@/lib/types'
import { SUBJECT_NAMES } from '@/lib/constants'

type Stats = { avg: number; completed: number; total: number } | null

export function ExamCard({
  assignment,
  exam,
  cls,
  course,
  stats,
  formatDate,
}: {
  assignment: ExamAssignment
  exam: Exam
  cls: { id: string; name: string }
  course: Course | null
  stats: Stats
  formatDate: (dateStr: string) => string
}) {
  const subjectName = course ? (SUBJECT_NAMES[course.subjectId] || course.subjectId) : ''
  const statusConfig = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.scheduled

  return (
    <Link
      href={`/teacher/exams/${assignment.id}`}
      className="block bg-white rounded-[10px] border p-4 transition-all duration-150 hover:-translate-y-0.5"
      style={{ borderColor: '#DDE1E7', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-medium mb-1 truncate" style={{ color: '#1A1A2E' }}>{exam.title}</div>
          <div className="text-[12px]" style={{ color: '#5A6474' }}>{subjectName} • {cls.name}</div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[11px] shrink-0 ml-2" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
          {statusConfig.label}
        </span>
      </div>

      {stats && (
        <div className="flex items-center gap-6 mb-3 py-2 border-y" style={{ borderColor: '#F0F2F5' }}>
          <div>
            <div className="text-[11px]" style={{ color: '#8A94A0' }}>Дундаж</div>
            <div className="text-[16px] font-semibold" style={{ color: stats.avg >= 80 ? '#1A7A4A' : stats.avg >= 60 ? '#B45309' : '#C4272F' }}>
              {stats.avg}%
            </div>
          </div>
          <div>
            <div className="text-[11px]" style={{ color: '#8A94A0' }}>Оролцоо</div>
            <div className="text-[16px] font-semibold" style={{ color: '#1A1A2E' }}>{stats.completed}/{stats.total}</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-[12px]" style={{ color: '#5A6474' }}>
        <div className="flex items-center gap-1.5"><Calendar size={14} strokeWidth={1.5} /><span>{formatDate(assignment.scheduledStart)}</span></div>
        <div className="flex items-center gap-1.5"><Clock size={14} strokeWidth={1.5} /><span>{exam?.duration ?? 0} мин</span></div>
        <div className="flex items-center gap-1.5"><FileText size={14} strokeWidth={1.5} /><span>{(exam?.questionIds ?? []).length} асуулт</span></div>
      </div>
    </Link>
  )
}
