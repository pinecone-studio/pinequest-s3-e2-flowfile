import Link from 'next/link'
import { ArrowUpRight, MoreHorizontal, Activity, Calendar, CheckCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Exam, User } from '@/lib/types'

type StatusConfig = { label: string; color: string; icon: React.ElementType }

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case 'active': return { label: 'Идэвхтэй', color: 'bg-green-100 text-green-700', icon: Activity }
    case 'scheduled': return { label: 'Товлогдсон', color: 'bg-blue-100 text-blue-700', icon: Calendar }
    case 'closed': return { label: 'Дууссан', color: 'bg-gray-100 text-gray-600', icon: CheckCircle }
    default: return { label: 'Ноорог', color: 'bg-gray-100 text-gray-500', icon: FileText }
  }
}

export function AdminActivityFeed({
  recentExams,
  teachers,
  activeExams,
  scheduledExams,
  completedExams,
  totalExams,
}: {
  recentExams: Exam[]
  teachers: User[]
  activeExams: number
  scheduledExams: number
  completedExams: number
  totalExams: number
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-card-border">
        <div className="px-5 py-4 border-b border-card-border flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-foreground">Сүүлийн шалгалтууд</h2>
            <p className="text-[12px] text-text-secondary">Системд бүртгэгдсэн сүүлийн шалгалтууд</p>
          </div>
          <Link href="/admin/exams" className="flex items-center gap-1 text-[13px] text-primary hover:underline font-medium">
            Бүгдийг харах<ArrowUpRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="p-4 space-y-2">
          {recentExams.map(exam => {
            const statusConfig = getStatusConfig(exam.status)
            const StatusIcon = statusConfig.icon
            return (
              <div key={exam.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-table-header transition-colors">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', statusConfig.color.split(' ')[0])}>
                  <StatusIcon size={18} className={statusConfig.color.split(' ')[1]} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground truncate">{exam.title}</p>
                  <p className="text-[12px] text-text-secondary">{exam?.duration ?? 0} минут • {(exam?.questionIds ?? []).length} асуулт</p>
                </div>
                <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium', statusConfig.color)}>{statusConfig.label}</span>
                <button className="p-1.5 hover:bg-card-border rounded-md text-text-secondary">
                  <MoreHorizontal size={16} strokeWidth={1.5} />
                </button>
              </div>
            )
          })}
          {recentExams.length === 0 && (
            <div className="text-center py-8 text-text-secondary text-[14px]">Шалгалт байхгүй байна</div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-card-border">
          <div className="px-5 py-4 border-b border-card-border">
            <h2 className="text-[15px] font-semibold text-foreground">Шалгалтын статус</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Идэвхтэй', value: activeExams, color: 'bg-green-500' },
              { label: 'Товлогдсон', value: scheduledExams, color: 'bg-blue-500' },
              { label: 'Дууссан', value: completedExams, color: 'bg-gray-400' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-text-secondary">{label}</span>
                  <span className="text-[13px] font-semibold text-foreground">{value}</span>
                </div>
                <div className="h-2 bg-table-header rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${totalExams > 0 ? (value / totalExams) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-card-border">
          <div className="px-5 py-4 border-b border-card-border">
            <h2 className="text-[15px] font-semibold text-foreground">Дундаж оноо</h2>
          </div>
          <div className="p-5 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#E8EBF0" strokeWidth="10" />
                <circle cx="64" cy="64" r="56" fill="none" stroke="#0066ff" strokeWidth="10" strokeDasharray={`${0.785 * 352} 352`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[28px] font-bold text-foreground">78.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-card-border">
          <div className="px-5 py-4 border-b border-card-border">
            <h2 className="text-[15px] font-semibold text-foreground">Идэвхтэй багш нар</h2>
          </div>
          <div className="p-4 space-y-3">
            {teachers.slice(0, 3).map(teacher => (
              <div key={teacher.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[12px] font-semibold text-primary">
                  {teacher.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">{teacher.name}</p>
                  <p className="text-[11px] text-text-secondary">Багш</p>
                </div>
                <span className="px-2 py-0.5 bg-table-header text-text-secondary text-[11px] rounded font-medium">3 шалгалт</span>
              </div>
            ))}
            {teachers.length === 0 && <div className="text-center py-4 text-text-secondary text-[13px]">Багш байхгүй байна</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
