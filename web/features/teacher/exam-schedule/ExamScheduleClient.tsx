'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getAll, CURRENT_TEACHER_ID } from '@/lib/data'
import type { Exam, ExamAssignment } from '@/lib/types'
import { initialExams, initialExamAssignments, initialClasses } from '@/lib/data'
import { cn } from '@/lib/utils'
import { CalendarGrid } from './_components/CalendarGrid'
import { WeekView } from './_components/WeekView'
import { EventPopup } from './_components/EventPopup'

type ViewMode = 'month' | 'week'
const INITIAL_TIMESTAMP = Date.UTC(2026, 2, 1, 0, 0, 0)
const monthNames = ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар']

export function ExamScheduleClient() {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [assignments, setAssignments] = useState<ExamAssignment[]>(initialExamAssignments)
  const [classes, setClasses] = useState(initialClasses)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(() => new Date(INITIAL_TIMESTAMP))
  const [selectedEvent, setSelectedEvent] = useState<{ assignment: ExamAssignment; exam: Exam; position: { x: number; y: number } } | null>(null)

  useEffect(() => {
    const loadedExams = getAll<Exam>('exams'); const loadedAssignments = getAll<ExamAssignment>('examAssignments')
    if (loadedExams.length) setExams(loadedExams)
    if (loadedAssignments.length) setAssignments(loadedAssignments)
  }, [])

  const teacherAssignments = assignments.filter(a => a.assignedBy === CURRENT_TEACHER_ID)
  const getExam = (examId: string) => exams.find(e => e.id === examId)
  const getClass = (classId: string) => classes.find(c => c.id === classId)
  const getEventsForDate = (date: Date) => teacherAssignments.filter(a => new Date(a.scheduledStart).toDateString() === date.toDateString())
  const formatTime = (dateStr: string) => { const d = new Date(dateStr); return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` }
  const getMonthName = () => `${currentDate.getFullYear()} оны ${monthNames[currentDate.getMonth()]}`
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

  const getMonthDays = () => {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay(); const days: { date: Date; isCurrentMonth: boolean }[] = []
    for (let i = startPadding - 1; i >= 0; i--) { days.push({ date: new Date(year, month, -i), isCurrentMonth: false }) }
    for (let i = 1; i <= lastDay.getDate(); i++) { days.push({ date: new Date(year, month, i), isCurrentMonth: true }) }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) { days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false }) }
    return days
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate); const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)
    const days: Date[] = []
    for (let i = 0; i < 7; i++) { days.push(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i)) }
    return days
  }

  const goToPrevious = () => {
    if (viewMode === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))
  }
  const goToNext = () => {
    if (viewMode === 'month') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    else setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))
  }

  const handleEventClick = (e: React.MouseEvent, assignment: ExamAssignment) => {
    e.stopPropagation(); const exam = getExam(assignment.examId)
    if (exam) { const rect = (e.target as HTMLElement).getBoundingClientRect(); setSelectedEvent({ assignment, exam, position: { x: Math.min(rect.left, window.innerWidth - 220), y: rect.bottom + 4 } }) }
  }

  return (
    <div className="p-6" onClick={() => setSelectedEvent(null)}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>Хуваарь</h1>
        <div className="flex border rounded overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
          {(['month', 'week'] as ViewMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={cn('px-3 py-1.5 text-[14px] transition-colors', viewMode === mode ? 'text-white' : 'bg-white hover:bg-[#F5F7FA]')}
              style={viewMode === mode ? { backgroundColor: '#1A1A2E', color: 'white' } : { color: '#1A1A2E' }}
            >
              {mode === 'month' ? 'Сарын харагдац' : '7 хоногийн харагдац'}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#DDE1E7' }}>
          <button onClick={goToPrevious} className="p-1 rounded transition-colors hover:bg-[#F5F7FA]" style={{ color: '#5A6474' }}><ChevronLeft size={20} strokeWidth={1.5} /></button>
          <h2 className="text-[15px] font-medium" style={{ color: '#1A1A2E' }}>{getMonthName()}</h2>
          <button onClick={goToNext} className="p-1 rounded transition-colors hover:bg-[#F5F7FA]" style={{ color: '#5A6474' }}><ChevronRight size={20} strokeWidth={1.5} /></button>
        </div>
        {viewMode === 'month' && <CalendarGrid days={getMonthDays()} getExam={getExam} getEventsForDate={getEventsForDate} isToday={isToday} onEventClick={handleEventClick} />}
        {viewMode === 'week' && <WeekView weekDays={getWeekDays()} getEventsForDate={getEventsForDate} getExam={getExam} isToday={isToday} handleEventClick={handleEventClick} formatTime={formatTime} />}
      </div>
      {selectedEvent && <EventPopup event={selectedEvent} getClass={getClass} onClose={() => setSelectedEvent(null)} />}
    </div>
  )
}
