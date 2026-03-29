// 'use client'


// import { CURRENT_TEACHER_ID } from "@/lib/data"
// import DetailHeader from "../components/DetailHeader"
// import DetailStats from "../components/DetailStats"
// import QuestionList from "../components/QuestionList"
// import { useExamBank } from "@/hooks/use-examBank"

// export default function TeacherBankDetailPage({ id }: { id: string }) {
//   const { exams, users, questions } = useExamBank()

//   const exam = exams.find(e => e.id === id)

//   if (!exam) {
//     return <div className="p-6">Шалгалт олдсонгүй</div>
//   }

//   const owner = users.find(u => u.id === exam.ownerId)
//   const examQuestions = questions.filter(q => exam.questionIds.includes(q.id))
//   const isOwner = exam.ownerId === CURRENT_TEACHER_ID

//   return (
//     <div className="p-6 max-w-4xl">
//       <DetailHeader exam={exam} owner={owner} />
//       <DetailStats exam={exam} questions={examQuestions} />
//       <QuestionList questions={examQuestions} />

//       {isOwner && (
//         <button className="mt-6 text-red-500">
//           Устгах
//         </button>
//       )}
//     </div>
//   )
// }