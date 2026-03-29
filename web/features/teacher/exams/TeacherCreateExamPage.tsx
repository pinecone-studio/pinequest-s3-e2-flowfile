'use client'

import { useCreateExam } from "@/hooks/useCreateExam"
import CreateSidebar from "./components/CreateSidebar"
import CreateSteps from "./components/CreateSteps"

export default function TeacherCreateExamPage() {
  const data = useCreateExam()

  return (
    <div className="flex">
      <CreateSidebar {...data} />
      <CreateSteps {...data} />
    </div>
  )
}