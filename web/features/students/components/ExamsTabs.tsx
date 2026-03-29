'use client'
import ExamCard from "./ExamCard"

    

export default function ExamsTabs({ assignments }: any) {
  return (
    <div className="grid gap-3">
      {assignments.map((a: any) => (
        <ExamCard key={a.id} assignment={a} />
      ))}
    </div>
  )
}