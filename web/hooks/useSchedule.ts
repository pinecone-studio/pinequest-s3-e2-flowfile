'use client'

import { useState } from "react"
import {
  initialExams,
  initialExamAssignments,
  initialClasses,
  CURRENT_TEACHER_ID
} from "@/lib/data"

export function useSchedule() {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  const assignments = initialExamAssignments.filter(
    a => a.assignedBy === CURRENT_TEACHER_ID
  )

  const getExam = (id: string) => initialExams.find(e => e.id === id)
  const getClass = (id: string) => initialClasses.find(c => c.id === id)

  const getEventsForDate = (date: Date) => {
    return assignments.filter(a =>
      new Date(a.scheduledStart).toDateString() === date.toDateString()
    )
  }

  return {
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    assignments,
    getExam,
    getClass,
    getEventsForDate
  }
}