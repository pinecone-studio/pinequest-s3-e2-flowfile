
import GradingCard from "./GradingCard"     

export default function GradingList({ list, getExam, getClass }: any) {
  return (
    <div className="space-y-3">
      {list.map((a: any) => (
        <GradingCard
          key={a.id}
          assignment={a}
          exam={getExam(a.examId)}
          cls={getClass(a.classId)}
        />
      ))}
    </div>
  )
}