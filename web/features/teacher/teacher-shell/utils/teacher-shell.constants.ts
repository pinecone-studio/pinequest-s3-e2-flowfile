import { LayoutDashboard, PenLine, ClipboardList, CalendarDays } from 'lucide-react'
import type { TeacherNavItem } from '@/features/teacher/teacher-shell/types/teacher-shell.types'

export const teacherNavItems: TeacherNavItem[] = [
  { icon: LayoutDashboard, label: 'Нэгдсэн хяналт', href: '/teacher', matchPaths: ['/teacher'] },
  { icon: PenLine, label: 'Шалгалт үүсгэх', href: '/teacher/exams/create', matchPaths: ['/teacher/exams/create'] },
  { icon: ClipboardList, label: 'Шалгалтууд', href: '/teacher/exams', matchPaths: ['/teacher/exams'] },
  { icon: CalendarDays, label: 'Хуваарь', href: '/teacher/schedule', matchPaths: ['/teacher/schedule'] },
]
