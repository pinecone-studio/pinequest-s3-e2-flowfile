import {
  BarChart3,
  FileText,
  LayoutDashboard,
  School,
  Settings,
  Users,
} from 'lucide-react'

import type { AdminNavItem } from '@/features/admin/admin-shell/types/admin-shell.types'

export const adminNavItems: AdminNavItem[] = [
  { href: '/admin', label: 'Хянах самбар', icon: LayoutDashboard },
  { href: '/admin/teachers', label: 'Багш нар', icon: Users },
  { href: '/admin/exams', label: 'Шалгалтууд', icon: FileText },
  { href: '/admin/classes', label: 'Ангиуд', icon: School },
  { href: '/admin/reports', label: 'Тайлан', icon: BarChart3 },
  { href: '/admin/settings', label: 'Тохиргоо', icon: Settings },
]
