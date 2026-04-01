import { ExamGrade } from '@/features/teacher/exam-detail/ExamGrade'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ExamGrade params={params} />
}
