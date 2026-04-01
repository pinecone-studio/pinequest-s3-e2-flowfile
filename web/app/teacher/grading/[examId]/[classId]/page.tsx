import { GradingWorkspace } from '@/features/teacher/grading-workspace/GradingWorkspace'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <GradingWorkspace params={params} />
}
