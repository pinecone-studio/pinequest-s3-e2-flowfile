import Link from "next/link"

export default function ExamCard({ assignment }: any) {
  return (
    <Link href={`/student/exams/${assignment.id}`}>
      {assignment.id}
    </Link>
  )
}