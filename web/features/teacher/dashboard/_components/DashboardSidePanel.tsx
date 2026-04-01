import { COURSE_COLORS } from '@/lib/constants'
import type { Exam, ExamAssignment } from '@/lib/types'

interface StatCard { label: string; val: number; color: string; bg: string }
interface StatusRow { label: string; count: number; dot: string }
interface WeekDay { date: Date; exams: { assignment: ExamAssignment; exam?: Exam }[] }

const DAY_ABBREV = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня']

export function DashboardSidePanel({
  stats, statuses, weekDays, today,
}: {
  stats: StatCard[]
  statuses: StatusRow[]
  weekDays: WeekDay[]
  today: Date
}) {
  return (
    <div className="space-y-5">
      <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
        <h2 className="font-semibold text-[15px] mb-3" style={{ color: '#1A1A2E' }}>Тоон мэдээлэл</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label} className="p-3 rounded-[8px]" style={{ background: s.bg }}>
              <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[11px]" style={{ color: '#5A6474' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
        <h2 className="font-semibold text-[15px] mb-3" style={{ color: '#1A1A2E' }}>Шалгалтуудын төлөв</h2>
        {statuses.map(s => (
          <div key={s.label} className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }} />
            <span className="text-[13px] flex-1" style={{ color: '#1A1A2E' }}>{s.label}</span>
            <span className="text-[13px] font-semibold" style={{ color: s.dot }}>{s.count}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
        <h2 className="font-semibold text-[15px] mb-3" style={{ color: '#1A1A2E' }}>Энэ 7 хоног</h2>
        <div className="flex gap-1">
          {weekDays.map((d, i) => {
            const isToday = d.date.toDateString() === today.toDateString()
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px]" style={{ color: '#5A6474' }}>{DAY_ABBREV[i]}</div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium"
                  style={{ background: isToday ? '#0066FF' : '#F5F7FA', color: isToday ? 'white' : '#1A1A2E' }}>
                  {d.date.getDate()}
                </div>
                {d.exams.map(({ assignment, exam }, j) => (
                  <div key={j} className="w-2 h-2 rounded-full"
                    style={{ background: COURSE_COLORS[exam?.subjectId ?? ''] ?? '#0066FF' }}
                    title={exam?.title ?? ''}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
