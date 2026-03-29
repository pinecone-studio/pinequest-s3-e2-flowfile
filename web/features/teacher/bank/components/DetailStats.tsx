import type { Exam, Question } from "@/lib/types"

export default function DetailStats({
  exam,
  questions
}: {
  exam: Exam
  questions: Question[]
}) {
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="border p-3 rounded">
        Хугацаа: {exam.duration} мин
      </div>
      <div className="border p-3 rounded">
        Асуулт: {questions.length}
      </div>
      <div className="border p-3 rounded">
        Оноо: {totalPoints}
      </div>
    </div>
  )
}