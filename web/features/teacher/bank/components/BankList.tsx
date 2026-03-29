'use client'

import { useRouter } from "next/navigation"
import { useExamBank } from "@/hooks/use-examBank"
import type { Exam } from "@/lib/types"

export default function BankList({ exams }: { exams: Exam[] }) {
  const router = useRouter()

  return (
    <div className="bg-white border rounded-md overflow-hidden">
      {exams.map((exam) => (
        <ExamBankCard
          key={exam.id}
          {...exam}
          onView={() => router.push(`/teacher/bank/${exam.id}`)}
        />
      ))}

      {exams.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Шалгалт олдсонгүй
        </div>
      )}
    </div>
  )
}