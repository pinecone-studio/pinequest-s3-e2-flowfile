import { ExamDetailClient } from './ExamDetailClient'

export function ExamDetail({ params }: { params: Promise<{ id: string }> }) {
  return <ExamDetailClient params={params} />
}
