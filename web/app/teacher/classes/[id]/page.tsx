import TeacherClassDetailPage from "@/features/teacher/classes/TeacherClassDetailPage";


export default function Page({ params }: { params: { id: string } }) {
  return <TeacherClassDetailPage id={params.id} />;
}