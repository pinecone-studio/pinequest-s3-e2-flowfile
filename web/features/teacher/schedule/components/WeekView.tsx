export default function WeekView({ currentDate, getEventsForDate, getExam }: any) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + i)
    return d
  })

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, i) => {
        const events = getEventsForDate(day)

        return (
          <div key={i} className="border p-2 min-h-[100px]">
            <div>{day.getDate()}</div>

            {events.map((e: any) => (
              <div key={e.id} className="text-xs bg-green-100">
                {getExam(e.examId)?.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}