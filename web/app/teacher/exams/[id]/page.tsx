import { ExamDetail } from '@/features/teacher/exam-detail/ExamDetail'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ExamDetail params={params} />
}
