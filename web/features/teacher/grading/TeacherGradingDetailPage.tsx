'use client'

import { useGradingDetail } from "@/hooks/useGradingDetail"     
import DetailHeader from "./components/DetailHeader"
import StudentSidebar from "./components/StudentSidebar"
import QuestionPanel from "./components/QuestionPanel"

export default function TeacherGradingDetailPage({
  examId,
  classId
}: any) {
  const data = useGradingDetail(examId, classId)

  if (!data.exam) return <div className="p-6">Not found</div>

  return (
    <div className="p-6">
      <DetailHeader {...data} />

      <div className="grid grid-cols-[250px_1fr] gap-6">
        <StudentSidebar {...data} />
        <QuestionPanel {...data} />
      </div>
    </div>
  )
}