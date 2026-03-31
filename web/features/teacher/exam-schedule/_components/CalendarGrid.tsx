import type { ExamAssignment, Exam } from '@/lib/types'
import { CalendarDay } from './CalendarDay'

const dayNames = ['Ням', 'Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям']

export function CalendarGrid({
  days,
  getExam,
  getEventsForDate,
  isToday,
  onEventClick,
}: {
  days: { date: Date; isCurrentMonth: boolean }[]
  getExam: (examId: string) => Exam | undefined
  getEventsForDate: (date: Date) => ExamAssignment[]
  isToday: (date: Date) => boolean
  onEventClick: (e: React.MouseEvent, assignment: ExamAssignment) => void
}) {
  return (
    <div>
      <div className="grid grid-cols-7 border-b" style={{ borderColor: '#DDE1E7' }}>
        {dayNames.map(day => (
          <div key={day} className="px-2 py-2 text-[13px] text-center font-medium" style={{ color: '#5A6474' }}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => (
          <CalendarDay
            key={index}
            date={day.date}
            isCurrentMonth={day.isCurrentMonth}
            isToday={isToday(day.date)}
            events={getEventsForDate(day.date)}
            getExam={getExam}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
}
