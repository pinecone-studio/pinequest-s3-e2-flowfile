import { ExamTaking } from '@/features/student/exam-taking/ExamTaking'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ExamTaking params={params} />
}
