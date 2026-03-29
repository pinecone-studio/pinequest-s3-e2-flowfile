import type { Question } from "@/lib/types"

export default function QuestionList({ questions }: { questions: Question[] }) {
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="border p-4 rounded">
          <div className="font-medium mb-2">
            {i + 1}. {q.text}
          </div>

          <div className="text-sm text-gray-500">
            {q.points} оноо
          </div>
        </div>
      ))}
    </div>
  )
}