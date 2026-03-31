import { StudentShellFeature } from '@/features/student/student-shell'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StudentShellFeature>{children}</StudentShellFeature>
}
