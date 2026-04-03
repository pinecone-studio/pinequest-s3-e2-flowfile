'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { CURRENT_TEACHER_ID, getAll, initialExamAssignments, initialExams } from '@/lib/data'
import type { Exam, ExamAssignment, SchoolClass } from '@/lib/types'
import {
  fetchEnrollmentsByExam,
  fetchMyExams,
  isApiConfigured,
} from '@/lib/api/teacher-exams'
import { cn } from '@/lib/utils'
import {
  buildSyntheticAssignment,
  buildSyntheticExam,
  inferClassIdsFromEnrollments,
  loadTeacherCatalog,
} from '@/lib/teacher-course-data'
import { CalendarGrid } from './_components/CalendarGrid'
import { WeekView } from './_components/WeekView'
import { EventPopup } from './_components/EventPopup'

type ViewMode = 'month' | 'week'

const INITIAL_TIMESTAMP = Date.UTC(2026, 2, 1, 0, 0, 0)
const monthNames = [
  '1-р сар',
  '2-р сар',
  '3-р сар',
  '4-р сар',
  '5-р сар',
  '6-р сар',
  '7-р сар',
  '8-р сар',
  '9-р сар',
  '10-р сар',
  '11-р сар',
  '12-р сар',
]

function ScheduleSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-[10px] border bg-white"
      style={{ borderColor: '#DDE1E7' }}
    >
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: '#DDE1E7' }}>
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    </div>
  )
}

export function ExamScheduleClient() {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [assignments, setAssignments] = useState<ExamAssignment[]>(initialExamAssignments)
  const [classes, setClasses] = useState<SchoolClass[]>(loadTeacherCatalog().classes)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(() => new Date(INITIAL_TIMESTAMP))
  const [selectedEvent, setSelectedEvent] = useState<{
    assignment: ExamAssignment
    exam: Exam
    position: { x: number; y: number }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(isApiConfigured())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const { classes: availableClasses } = loadTeacherCatalog()
    setClasses(availableClasses)

    if (!isApiConfigured()) {
      const loadedExams = getAll<Exam>('exams')
      const loadedAssignments = getAll<ExamAssignment>('examAssignments')
      if (loadedExams.length) setExams(loadedExams)
      if (loadedAssignments.length) setAssignments(loadedAssignments)
      setIsLoading(false)
      return
    }

    let isCancelled = false

    const loadApiState = async () => {
      setIsRefreshing(true)

      try {
        const apiExams = await fetchMyExams()
        const enrollments = await Promise.all(
          apiExams.map(async (exam) => ({
            exam,
            enrollments: await fetchEnrollmentsByExam(exam.id),
          })),
        )

        if (isCancelled) {
          return
        }

        setExams(
          apiExams.map((exam) => buildSyntheticExam(exam)),
        )
        setAssignments(
          enrollments.flatMap((item) =>
            inferClassIdsFromEnrollments(item.enrollments, availableClasses).map((classId) =>
              buildSyntheticAssignment(item.exam, classId),
            ),
          ),
        )
      } catch {
        if (isCancelled) {
          return
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    void loadApiState()

    return () => {
      isCancelled = true
    }
  }, [])

  const teacherAssignments = assignments.filter(
    (assignment) => assignment.assignedBy === CURRENT_TEACHER_ID,
  )
  const getExam = (examId: string) => exams.find((exam) => exam.id === examId)
  const getClass = (classId: string) => classes.find((schoolClass) => schoolClass.id === classId)
  const getEventsForDate = (date: Date) =>
    teacherAssignments.filter(
      (assignment) =>
        new Date(assignment.scheduledStart).toDateString() === date.toDateString(),
    )
  const formatTime = (dateStr: string) => {
    const value = new Date(dateStr)
    return `${value.getHours().toString().padStart(2, '0')}:${value
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  }
  const getMonthName = () =>
    `${currentDate.getFullYear()} оны ${monthNames[currentDate.getMonth()]}`
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    const days: { date: Date; isCurrentMonth: boolean }[] = []

    for (let index = startPadding - 1; index >= 0; index -= 1) {
      days.push({ date: new Date(year, month, -index), isCurrentMonth: false })
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    const remaining = 42 - days.length
    for (let day = 1; day <= remaining; day += 1) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    }

    return days
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)

    return Array.from({ length: 7 }, (_, index) => {
      const nextDate = new Date(startOfWeek)
      nextDate.setDate(startOfWeek.getDate() + index)
      return nextDate
    })
  }

  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
      return
    }

    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 7,
      ),
    )
  }

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
      return
    }

    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() + 7,
      ),
    )
  }

  const handleEventClick = (event: React.MouseEvent, assignment: ExamAssignment) => {
    event.stopPropagation()
    const exam = getExam(assignment.examId)

    if (!exam) {
      return
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setSelectedEvent({
      assignment,
      exam,
      position: {
        x: Math.min(rect.left, window.innerWidth - 220),
        y: rect.bottom + 4,
      },
    })
  }

  return (
    <div className="p-6" onClick={() => setSelectedEvent(null)}>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>
            Хуваарь
          </h1>
          <p className="text-[13px]" style={{ color: '#5A6474' }}>
            Товлогдсон шалгалтуудын календарь
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded border" style={{ borderColor: '#DDE1E7' }}>
            {(['month', 'week'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-3 py-1.5 text-[14px] transition-colors',
                  viewMode === mode ? 'text-white' : 'bg-white hover:bg-[#F5F7FA]',
                )}
                style={
                  viewMode === mode
                    ? { backgroundColor: '#1A1A2E', color: 'white' }
                    : { color: '#1A1A2E' }
                }
              >
                {mode === 'month' ? 'Сарын харагдац' : '7 хоногийн харагдац'}
              </button>
            ))}
          </div>

          {isRefreshing && <Spinner className="size-4 text-[#0066FF]" />}
        </div>
      </div>

      {isLoading ? (
        <ScheduleSkeleton />
      ) : (
        <div
          className="overflow-hidden rounded-[10px] border bg-white"
          style={{ borderColor: '#DDE1E7' }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: '#DDE1E7' }}
          >
            <button
              onClick={goToPrevious}
              className="rounded p-1 transition-colors hover:bg-[#F5F7FA]"
              style={{ color: '#5A6474' }}
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <h2 className="text-[15px] font-medium" style={{ color: '#1A1A2E' }}>
              {getMonthName()}
            </h2>
            <button
              onClick={goToNext}
              className="rounded p-1 transition-colors hover:bg-[#F5F7FA]"
              style={{ color: '#5A6474' }}
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>

          {viewMode === 'month' && (
            <CalendarGrid
              days={getMonthDays()}
              getExam={getExam}
              getEventsForDate={getEventsForDate}
              isToday={isToday}
              onEventClick={handleEventClick}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              weekDays={getWeekDays()}
              getEventsForDate={getEventsForDate}
              getExam={getExam}
              isToday={isToday}
              handleEventClick={handleEventClick}
              formatTime={formatTime}
            />
          )}
        </div>
      )}

      {selectedEvent && <EventPopup event={selectedEvent} getClass={getClass} />}
    </div>
  )
}
