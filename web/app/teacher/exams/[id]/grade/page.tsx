import TeacherGradingPage from "@/features/teacher/exams/TeacherGradingPage";

export default function Page({ params }: { params: { id: string } }) {
  return <TeacherGradingPage id={params.id} />;
}