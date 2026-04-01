import { ExamTakingClient } from './ExamTakingClient'

export function ExamTaking({ params }: { params: Promise<{ id: string }> }) {
  return <ExamTakingClient params={params} />
}
