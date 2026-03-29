export default function MonthView({ currentDate, getEventsForDate, getExam }: any) {
  const days = Array.from({ length: 30 }, (_, i) => new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1))

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, i) => {
        const events = getEventsForDate(day)

        return (
          <div key={i} className="border p-2 min-h-[80px]">
            <div>{day.getDate()}</div>

            {events.map((e: any) => (
              <div key={e.id} className="text-xs bg-blue-100">
                {getExam(e.examId)?.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}