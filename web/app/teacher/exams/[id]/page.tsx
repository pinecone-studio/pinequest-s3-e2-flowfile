import { QuestionDetail } from '@/features/teacher/question-detail/QuestionDetail'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <QuestionDetail params={params} />
}
