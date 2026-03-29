'use client'

import { useGrading } from "@/hooks/useGrading"
import GradingSidebar from "./components/GradingSidebar"
import GradingWorkspace from "./components/GradingWorkspace"

export default function TeacherGradingPage({ id }: { id: string }) {
  const data = useGrading(id)

  return (
    <div className="flex">
      <GradingSidebar />
      <GradingWorkspace />
    </div>
  )
}