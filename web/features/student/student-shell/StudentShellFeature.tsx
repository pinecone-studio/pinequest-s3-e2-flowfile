'use client'

import { StudentTopNav } from '@/features/student/student-shell/components/StudentTopNav'
import { useStudentShell } from '@/features/student/student-shell/hooks/useStudentShell'
import { studentNavLinks } from '@/features/student/student-shell/utils/student-shell.constants'

type StudentShellFeatureProps = {
  children: React.ReactNode
}

export function StudentShellFeature({ children }: StudentShellFeatureProps) {
  const { pathname, isExamPage, studentDisplayName } = useStudentShell()

  if (isExamPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 bg-page-bg">
        <StudentTopNav
          pathname={pathname}
          navLinks={studentNavLinks}
          studentDisplayName={studentDisplayName}
        />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
