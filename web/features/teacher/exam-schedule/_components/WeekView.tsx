import { cn } from '@/lib/utils'
import type { Exam, ExamAssignment } from '@/lib/types'

const dayNames = ['Ням', 'Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям']

export function WeekView({ weekDays, getEventsForDate, getExam, isToday, handleEventClick, formatTime }: {
  weekDays: Date[]
  getEventsForDate: (date: Date) => ExamAssignment[]
  getExam: (examId: string) => Exam | undefined
  isToday: (date: Date) => boolean
  handleEventClick: (e: React.MouseEvent, assignment: ExamAssignment) => void
  formatTime: (dateStr: string) => string
}) {
  return (
    <div>
      <div className="grid grid-cols-7 border-b" style={{ borderColor: '#DDE1E7' }}>
        {weekDays.map((day, index) => (
          <div key={index} className={cn('px-2 py-2 text-center border-r last:border-r-0', isToday(day) && 'bg-[#EBF2FF]')} style={{ borderColor: '#DDE1E7' }}>
            <div className="text-[11px]" style={{ color: '#8A94A0' }}>{dayNames[day.getDay()]}</div>
            <div className="text-[14px] font-medium" style={{ color: isToday(day) ? '#0066FF' : '#1A1A2E' }}>{day.getDate()}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekDays.map((day, dayIndex) => {
          const events = getEventsForDate(day)
          return (
            <div key={dayIndex} className="border-r last:border-r-0 p-1 relative" style={{ borderColor: '#DDE1E7' }}>
              {events.map(assignment => {
                const exam = getExam(assignment.examId)
                const startTime = new Date(assignment.scheduledStart); const endTime = new Date(assignment.scheduledEnd)
                const startHour = startTime.getHours() + startTime.getMinutes() / 60; const endHour = endTime.getHours() + endTime.getMinutes() / 60
                const top = ((startHour - 7) / 12) * 100; const height = ((endHour - startHour) / 12) * 100
                return (
                  <button key={assignment.id} onClick={(e) => handleEventClick(e, assignment)}
                    className="absolute left-1 right-1 text-white text-[11px] p-1.5 rounded overflow-hidden transition-opacity hover:opacity-90"
                    style={{ top: `${Math.max(0, top)}%`, height: `${Math.max(10, height)}%`, backgroundColor: '#0066FF' }}
                  >
                    <div className="font-medium truncate">{exam?.title}</div>
                    <div className="opacity-80">{formatTime(assignment.scheduledStart)}</div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
