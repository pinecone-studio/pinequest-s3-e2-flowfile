'use client'

import { useExamDetail } from "../hooks/useExamDetail"
import ExamDetailHeader from "../components/ExamDetailHeader"

export default function TeacherExamDetailPage({ id }: { id: string }) {
  const { exam } = useExamDetail(id)

  if (!exam) return <div className="p-6">Not found</div>

  return (
    <div className="p-6">
      <ExamDetailHeader exam={exam} />
    </div>
  )
}