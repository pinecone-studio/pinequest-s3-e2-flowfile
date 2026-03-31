import { usePathname } from 'next/navigation'

import { getCurrentStudent } from '@/lib/data'

export function useStudentShell(): {
  pathname: string
  isExamPage: boolean
  studentDisplayName: string
} {
  const pathname = usePathname()
  const isExamPage = Boolean(pathname.match(/\/student\/exams\/[^/]+$/))
  const studentDisplayName = getCurrentStudent()?.name ?? 'Сурагч'

  return { pathname, isExamPage, studentDisplayName }
}
