import { GradingWorkspace } from '@/features/teacher/grading-workspace/GradingWorkspace'

export default function Page({
  params,
}: {
  params: Promise<{ examId: string; classId: string }>
}) {
  return <GradingWorkspace params={params} />
}
