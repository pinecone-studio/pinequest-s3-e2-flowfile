import { ExamGradeClient } from './ExamGradeClient'

export function ExamGrade({ params }: { params: Promise<{ id: string }> }) {
  return <ExamGradeClient params={params} />
}
