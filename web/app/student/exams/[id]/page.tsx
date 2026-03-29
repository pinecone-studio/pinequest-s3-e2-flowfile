import StudentExamTakingPage from "@/features/students/StudentExamTakingPage";


export default function Page({ params }: { params: { id: string } }) {
  return <StudentExamTakingPage id={params.id} />;
}