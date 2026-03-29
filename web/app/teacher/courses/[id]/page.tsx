import TeacherCourseDetailPage from "@/features/teacher/courses/TeacherCourseDetailPage";


export default function Page({ params }: { params: { id: string } }) {
  return <TeacherCourseDetailPage id={params.id} />;
}