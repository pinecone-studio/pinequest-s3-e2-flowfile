import Link from 'next/link'
import { Calendar, Clock, FileText, ChevronRight, CheckCircle2 } from 'lucide-react'
import type { ExamAssignment, Exam } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/constants'

type ExamStats = { avg: number; completed: number; total: number } | null

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
}

export function ClassExamRow({
  assignment,
  exam,
  stats,
  subjectName,
  href,
}: {
  assignment: ExamAssignment
  exam: Exam
  stats: ExamStats
  subjectName: string
  href?: string
}) {
  const isPast = assignment.status === 'closed'
  const statusConfig = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.scheduled

  return (
    <Link
      href={href ?? `/teacher/exams/${assignment.id}`}
      className="block bg-white rounded-[10px] border p-4 transition-all duration-150 hover:-translate-y-0.5"
      style={{ borderColor: '#DDE1E7', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[15px] font-medium mb-1" style={{ color: '#1A1A2E' }}>{exam.title}</div>
          <div className="text-[12px]" style={{ color: '#5A6474' }}>{subjectName}</div>
        </div>
        {isPast ? (
          <span className="px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1" style={{ backgroundColor: '#E8F5E9', color: '#1A7A4A' }}>
            <CheckCircle2 size={12} />дууссан
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
            {statusConfig.label}
          </span>
        )}
      </div>
      {stats && isPast && (
        <div className="flex items-center gap-6 mb-3">
          <div>
            <div className="text-[11px] mb-1" style={{ color: '#8A94A0' }}>Дундаж</div>
            <div className="text-[18px] font-semibold" style={{ color: stats.avg >= 80 ? '#1A7A4A' : stats.avg >= 60 ? '#B45309' : '#C4272F' }}>{stats.avg}%</div>
          </div>
          <div>
            <div className="text-[11px] mb-1" style={{ color: '#8A94A0' }}>Оролцоо</div>
            <div className="text-[18px] font-semibold" style={{ color: '#1A1A2E' }}>{stats.completed}/{stats.total}</div>
          </div>
        </div>
      )}
      {!isPast && (
        <div className="flex items-center gap-4 text-[12px]" style={{ color: '#5A6474' }}>
          <div className="flex items-center gap-1.5"><Calendar size={14} strokeWidth={1.5} /><span>{formatDate(assignment.scheduledStart)}</span></div>
          <div className="flex items-center gap-1.5"><Clock size={14} strokeWidth={1.5} /><span>{formatTime(assignment.scheduledStart)}</span></div>
          <div className="flex items-center gap-1.5"><FileText size={14} strokeWidth={1.5} /><span>{(exam?.questionIds ?? []).length} асуулт</span></div>
        </div>
      )}
      <div className="flex items-center justify-end mt-3 text-[12px]" style={{ color: '#0066FF' }}>
        <span>{isPast ? 'Дүн харах' : 'Дэлгэрэнгүй'}</span>
        <ChevronRight size={14} />
      </div>
    </Link>
  )
}
