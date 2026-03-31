import { TeacherShellFeature } from '@/features/teacher/teacher-shell'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TeacherShellFeature>{children}</TeacherShellFeature>
}
