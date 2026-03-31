import { cn } from '@/lib/utils'
import type { ExamAssignment, Exam } from '@/lib/types'
import { EventPill } from './EventPill'

export function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  events,
  getExam,
  onEventClick,
}: {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: ExamAssignment[]
  getExam: (examId: string) => Exam | undefined
  onEventClick: (e: React.MouseEvent, assignment: ExamAssignment) => void
}) {
  return (
    <div
      className={cn('min-h-[80px] p-1 border-b border-r', !isCurrentMonth && 'bg-[#F5F7FA]/50')}
      style={{ borderColor: '#DDE1E7' }}
    >
      <div
        className={cn('w-6 h-6 flex items-center justify-center text-[13px] mb-1', isToday && 'rounded-full text-white', !isCurrentMonth && 'text-[#8A94A0]')}
        style={isToday ? { backgroundColor: '#1A1A2E' } : { color: isCurrentMonth ? '#1A1A2E' : '#8A94A0' }}
      >
        {date.getDate()}
      </div>
      <div className="space-y-0.5">
        {events.slice(0, 2).map(assignment => (
          <EventPill key={assignment.id} assignment={assignment} exam={getExam(assignment.examId)} onClick={onEventClick} />
        ))}
        {events.length > 2 && (
          <div className="text-[10px] px-1" style={{ color: '#8A94A0' }}>+{events.length - 2} дахин</div>
        )}
      </div>
    </div>
  )
}
