'use client'

import { useExams } from "../hooks/useExams"
import ExamsHeader from "../components/ExamsHeader"
import ExamsGrid from "../components/ExamsGrid"

export default function TeacherExamsPage() {
  const data = useExams()

  return (
    <div className="p-6">
      <ExamsHeader />
      <ExamsGrid {...data} />
    </div>
  )
}