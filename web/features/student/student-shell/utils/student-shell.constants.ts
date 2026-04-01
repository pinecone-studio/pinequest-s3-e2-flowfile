import { Award, FileText, type LucideIcon } from 'lucide-react'

export type StudentNavLink = {
  label: string
  href: string
  icon: LucideIcon
}

export const studentNavLinks: StudentNavLink[] = [
  { label: 'Шалгалтууд', href: '/student', icon: FileText },
  { label: 'Үр дүн', href: '/student/results', icon: Award },
]
