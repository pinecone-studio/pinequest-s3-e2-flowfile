import Link from "next/link"

export default function ExamsTab({ upcomingExams, pastExams, getExam }: any) {
  return (
    <div className="space-y-6">
      {upcomingExams.map((a: any) => {
        const exam = getExam(a.examId)
        if (!exam) return null

        return (
          <Link key={a.id} href={`/teacher/exams/${a.id}`} className="block border p-4 rounded">
            {exam.title}
          </Link>
        )
      })}

      {pastExams.map((a: any) => {
        const exam = getExam(a.examId)
        if (!exam) return null

        return (
          <Link key={a.id} href={`/teacher/exams/${a.id}`} className="block border p-4 rounded">
            {exam.title} (дууссан)
          </Link>
        )
      })}
    </div>
  )
}