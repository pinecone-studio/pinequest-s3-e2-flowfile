'use client'

import { useGradingHub } from "../hooks/useGradingHub"
import GradingHeader from "../components/GradingHeader"
import GradingList from "../components/GradingList"

export default function TeacherGradingPage() {
  const data = useGradingHub()

  return (
    <div className="p-6">
      <GradingHeader count={data.list.length} />
      <GradingList {...data} />
    </div>
  )
}