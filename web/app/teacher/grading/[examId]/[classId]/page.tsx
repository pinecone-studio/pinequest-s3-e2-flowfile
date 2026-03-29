import TeacherGradingDetailPage from "@/features/teacher/grading/TeacherGradingDetailPage";


export default function Page({
  params,
}: {
  params: { examId: string; classId: string };
}) {
  return <TeacherGradingDetailPage {...params} />;
}