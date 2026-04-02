import type { Schedule, User } from '@/lib/types'

import { getAll } from './local-storage'
import {
  seedClasses,
  seedCourses,
  seedSchedules,
  seedSubjects,
  seedUsers,
} from './seed-core'
import { allSeedExams, allSeedQuestions } from './seed-mock'
import {
  seedAttempts,
  seedExamAssignments,
  seedSubmissions,
} from './seed-assignments'
import { seedResults } from './seed-results'

export function initializeData(): void {
  if (typeof window === 'undefined') return

  const mergeSeedItems = <T extends { id: string }>(key: string, items: T[]): void => {
    const existing = getAll<T>(key)
    if (existing.length === 0) {
      localStorage.setItem(key, JSON.stringify(items))
      return
    }

    const existingIds = new Set(existing.map(item => item.id))
    const merged = [...existing, ...items.filter(item => !existingIds.has(item.id))]
    localStorage.setItem(key, JSON.stringify(merged))
  }

  mergeSeedItems('subjects', seedSubjects)
  mergeSeedItems('users', seedUsers)
  mergeSeedItems('classes', seedClasses)
  mergeSeedItems('courses', seedCourses)
  mergeSeedItems('questions', allSeedQuestions)
  mergeSeedItems('exams', allSeedExams)
  mergeSeedItems('examAssignments', seedExamAssignments)
  mergeSeedItems('attempts', seedAttempts)
  mergeSeedItems('submissions', seedSubmissions)
  mergeSeedItems('results', seedResults)

  if (getAll('notifications').length === 0) {
    localStorage.setItem('notifications', JSON.stringify([]))
  }

  if (getAll<Schedule>('schedules').length === 0) {
    localStorage.setItem('schedules', JSON.stringify(seedSchedules))
  }

  localStorage.setItem('e_shalgalt_initialized', 'true')
}

export const initialSubjects = seedSubjects
export const initialUsers = seedUsers
export const initialClasses = seedClasses
export const initialCourses = seedCourses
export const initialSchedules = seedSchedules
export const initialQuestions = allSeedQuestions
export const initialExams = allSeedExams
export const initialExamAssignments = seedExamAssignments
export const initialAttempts = seedAttempts
export const initialSubmissions = seedSubmissions

export const CURRENT_TEACHER_ID = 'T003'
export const CURRENT_STUDENT_ID = 'S1011001'
export const CURRENT_ADMIN_ID = 'A001'

export function getCurrentTeacher(): User | undefined {
  return seedUsers.find(u => u.id === CURRENT_TEACHER_ID)
}

export function getCurrentStudent(): User | undefined {
  return seedUsers.find(u => u.id === CURRENT_STUDENT_ID)
}

export function getCurrentAdmin(): User | undefined {
  return seedUsers.find(u => u.id === CURRENT_ADMIN_ID)
}
