import StudentExamTakingPage from "@/features/student/exams/pages/StudentExamTakingPage";

export default function Page({ params }: { params: { id: string } }) {
  return <StudentExamTakingPage id={params.id} />;
}