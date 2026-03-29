export default function CalendarControls({
  viewMode,
  setViewMode,
  currentDate,
  setCurrentDate
}: any) {
  return (
    <div className="flex justify-between mb-4">
      <div className="flex gap-2">
        <button onClick={() => setViewMode('month')}>Month</button>
        <button onClick={() => setViewMode('week')}>Week</button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() =>
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
          }
        >
          Prev
        </button>

        <button
          onClick={() =>
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
          }
        >
          Next
        </button>
      </div>
    </div>
  )
}