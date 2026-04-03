import { GradingWorkspaceClient } from './GradingWorkspaceClient'

export function GradingWorkspace({
  params,
}: {
  params: Promise<{ examId: string; classId: string }>
}) {
  return <GradingWorkspaceClient params={params} />
}
