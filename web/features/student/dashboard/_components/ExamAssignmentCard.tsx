import Link from 'next/link'
import { Clock, FileText, Calendar, Timer, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUBJECT_COLORS, SUBJECT_NAMES } from '@/lib/constants'
import type { Exam, ExamAssignment } from '@/lib/types'
import type { Subject } from '@/lib/types'

type StatusConfig = { label: string; color: string; icon: React.ElementType }

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'active': return { label: 'Идэвхтэй', color: 'bg-green-100 text-green-700', icon: Timer }
    case 'scheduled': return { label: 'Товлогдсон', color: 'bg-amber-100 text-amber-700', icon: Calendar }
    case 'completed': return { label: 'Дууссан', color: 'bg-blue-100 text-blue-700', icon: CheckCircle }
    case 'closed': return { label: 'Хаагдсан', color: 'bg-gray-100 text-gray-600', icon: AlertCircle }
    default: return { label: status, color: 'bg-gray-100 text-gray-600', icon: FileText }
  }
}

export function ExamAssignmentCard({
  assignment,
  exam,
  subject,
  assignmentStatus,
  getTeacherName,
  formatDateTime,
}: {
  assignment: ExamAssignment
  exam: Exam
  subject: Subject | undefined
  assignmentStatus: string
  getTeacherName: (id: string) => string
  formatDateTime: (dateStr: string) => string
}) {
  const statusConfig = getStatusConfig(assignmentStatus)
  const StatusIcon = statusConfig.icon
  const subjectColor = SUBJECT_COLORS[exam.subjectId] || SUBJECT_COLORS.default

  return (
    <Link
      href={`/student/exams/${assignment.id}`}
      className="group bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md"
      style={{ borderColor: '#DDE1E7' }}
    >
      <div className="h-24 relative p-4 flex flex-col justify-end" style={{ backgroundColor: subjectColor.bg }}>
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M30 30h30v30H30zM0 0h30v30H0z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '30px 30px' }}
        />
        <div className="relative z-10">
          <span className={cn('px-2 py-1 rounded text-[11px] font-medium', statusConfig.color)}>
            <StatusIcon size={12} className="inline mr-1" strokeWidth={1.5} />
            {statusConfig.label}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: '#5A6474' }}>
          {subject?.name || SUBJECT_NAMES[exam.subjectId] || 'Хичээл'}
        </div>
        <h3 className="text-[16px] font-semibold mb-3 transition-colors group-hover:text-[#0066FF]" style={{ color: '#1A1A2E' }}>
          {exam.title}
        </h3>
        <div className="flex items-center gap-4 text-[12px] mb-4" style={{ color: '#5A6474' }}>
          <div className="flex items-center gap-1.5"><Clock size={14} strokeWidth={1.5} />{exam.duration} мин</div>
          <div className="flex items-center gap-1.5"><FileText size={14} strokeWidth={1.5} />{(exam?.questionIds ?? []).length} асуулт</div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: '#DDE1E7' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium" style={{ backgroundColor: '#F5F7FA', color: '#5A6474' }}>
              {getTeacherName(exam.ownerId).charAt(0)}
            </div>
            <span className="text-[12px]" style={{ color: '#5A6474' }}>{getTeacherName(exam.ownerId)}</span>
          </div>
          <div className="text-[12px] flex items-center gap-1" style={{ color: '#5A6474' }}>
            <Calendar size={12} strokeWidth={1.5} />
            {formatDateTime(assignment.scheduledStart)}
          </div>
        </div>
      </div>
    </Link>
  )
}
