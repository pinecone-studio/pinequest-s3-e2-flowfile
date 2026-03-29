export default function QuestionPanel({ questions }: any) {
  return (
    <div className="space-y-3">
      {questions.map((q: any) => (
        <div key={q.id} className="border p-3">
          {q.text}
        </div>
      ))}
    </div>
  )
}