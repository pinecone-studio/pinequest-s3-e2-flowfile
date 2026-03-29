import Link from "next/link"

export default function GradingCard({ assignment, exam, cls }: any) {
  if (!exam || !cls) return null

  return (
    <div className="border p-4 rounded flex justify-between">
      <div>
        <div className="font-medium">{exam.title}</div>
        <div className="text-sm text-gray-500">{cls.name}</div>
      </div>

      <Link href={`/teacher/grading/${exam.id}/${cls.id}`}>
        Үнэлэх
      </Link>
    </div>
  )
}