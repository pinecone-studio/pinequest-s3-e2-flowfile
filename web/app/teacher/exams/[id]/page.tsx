import TeacherExamDetailPage from "@/features/teacher/exams/TeacherExamDetailPage";


export default function Page({ params }: { params: { id: string } }) {
  return <TeacherExamDetailPage id={params.id} />;
}