import { QuestionDetailClient } from './QuestionDetailClient'

export function QuestionDetail({ params }: { params: Promise<{ id: string }> }) {
  return <QuestionDetailClient params={params} />
}
