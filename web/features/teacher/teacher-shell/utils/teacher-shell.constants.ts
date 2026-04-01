import {
  Archive,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  PenLine,
} from 'lucide-react'

import type { TeacherNavItem } from '@/features/teacher/teacher-shell/types/teacher-shell.types'

export const teacherNavItems: TeacherNavItem[] = [
  { icon: BookOpen, label: 'Хичээлүүд', href: '/teacher', matchPaths: ['/teacher', '/teacher/courses', '/teacher/classes'] },
  { icon: ClipboardCheck, label: 'Авсан шалгалтууд', href: '/teacher/exams', matchPaths: ['/teacher/exams'] },
  { icon: PenLine, label: 'Шалгалт үүсгэх', href: '/teacher/exams/create', matchPaths: ['/teacher/exams/create'] },
  { icon: Archive, label: 'Шалгалтын сан', href: '/teacher/bank', matchPaths: ['/teacher/bank'] },
  { icon: CheckSquare, label: 'Үнэлгээ', href: '/teacher/grading', matchPaths: ['/teacher/grading'] },
  { icon: CalendarDays, label: 'Хуваарь', href: '/teacher/schedule', matchPaths: ['/teacher/schedule'] },
]
