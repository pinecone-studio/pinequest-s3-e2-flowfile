import type React from 'react'
import Link from 'next/link'
import { Clock, FileText, Calendar, Timer, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUBJECT_COLORS, SUBJECT_NAMES } from '@/lib/constants'

type StatusConfig = { label: string; color: string; icon: React.ElementType }

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'active':
    case 'in_progress':
      return { label: 'Идэвхтэй', color: 'bg-green-100 text-green-700', icon: Timer }
    case 'scheduled':
    case 'ready':
    case 'upcoming':
      return { label: 'Товлогдсон', color: 'bg-amber-100 text-amber-700', icon: Calendar }
    case 'completed':
    case 'submitted':
    case 'force_submitted':
      return { label: 'Дууссан', color: 'bg-blue-100 text-blue-700', icon: CheckCircle }
    case 'closed':
      return { label: 'Хаагдсан', color: 'bg-gray-100 text-gray-600', icon: AlertCircle }
    default:
      return { label: status, color: 'bg-gray-100 text-gray-600', icon: FileText }
  }
}

export function ExamAssignmentCard({
  href,
  isDisabled,
  title,
  subjectId,
  status,
  durationMinutes,
  questionCount,
  teacherName,
  scheduledStart,
}: {
  href: string
  isDisabled?: boolean
  title: string
  subjectId: string
  status: string
  durationMinutes: number
  questionCount: number
  teacherName: string
  scheduledStart: string
}) {
  const statusConfig = getStatusConfig(status)
  const StatusIcon = statusConfig.icon
  const subjectColor = SUBJECT_COLORS[subjectId] || SUBJECT_COLORS.default
  const content = (
    <>
      <div className="relative flex h-24 flex-col justify-end p-4" style={{ backgroundColor: subjectColor.bg }}>
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M30 30h30v30H30zM0 0h30v30H0z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '30px 30px' }}
        />
        <div className="relative z-10">
          <span className={cn('rounded px-2 py-1 text-[11px] font-medium', statusConfig.color)}>
            <StatusIcon size={12} className="mr-1 inline" strokeWidth={1.5} />
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wider" style={{ color: '#5A6474' }}>
          {SUBJECT_NAMES[subjectId] || subjectId || 'Хичээл'}
        </div>
        <h3 className="mb-3 text-[16px] font-semibold transition-colors group-hover:text-[#0066FF]" style={{ color: '#1A1A2E' }}>
          {title}
        </h3>
        <div className="mb-4 flex items-center gap-4 text-[12px]" style={{ color: '#5A6474' }}>
          <div className="flex items-center gap-1.5">
            <Clock size={14} strokeWidth={1.5} />
            {durationMinutes} мин
          </div>
          <div className="flex items-center gap-1.5">
            <FileText size={14} strokeWidth={1.5} />
            {questionCount} асуулт
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: '#DDE1E7' }}>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium" style={{ backgroundColor: '#F5F7FA', color: '#5A6474' }}>
              {teacherName.charAt(0)}
            </div>
            <span className="text-[12px]" style={{ color: '#5A6474' }}>{teacherName}</span>
          </div>
          <div className="flex items-center gap-1 text-[12px]" style={{ color: '#5A6474' }}>
            <Calendar size={12} strokeWidth={1.5} />
            {scheduledStart}
          </div>
        </div>
      </div>
    </>
  )

  if (isDisabled) {
    return (
      <div className="group overflow-hidden rounded-xl border bg-white opacity-80" style={{ borderColor: '#DDE1E7' }}>
        {content}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-xl border bg-white transition-all hover:shadow-md"
      style={{ borderColor: '#DDE1E7' }}
    >
      {content}
    </Link>
  )
}
