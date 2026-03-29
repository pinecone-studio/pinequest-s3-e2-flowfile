import { useExamTaking } from "@/hooks/useExamTaking"


export default function StudentExamTakingPage({ id }: { id: string }) {
  const data = useExamTaking()

  return (
    <div>
      <h1>Exam {id}</h1>
      <button onClick={() => data.setIndex(data.index + 1)}>Next</button>
    </div>
  )
}