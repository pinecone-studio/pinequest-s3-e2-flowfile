'use client'

import { useSchedule } from "@/hooks/useSchedule"       
import ScheduleHeader from "./components/ScheduleHeader"
import CalendarControls from "./components/CalendarControls"
import MonthView from "./components/MonthView"
import MonthView from "./components/MonthView"
import WeekView from "./components/WeekView"

export default function TeacherSchedulePage() {
  const data = useSchedule()

  return (
    <div className="p-6">
      <ScheduleHeader />
      <CalendarControls {...data} />

      {data.viewMode === 'month' && <MonthView {...data} />}
      {data.viewMode === 'week' && <WeekView {...data} />}
    </div>
  )
}