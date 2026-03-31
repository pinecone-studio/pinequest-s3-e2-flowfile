import { GradingWorkspaceClient } from './GradingWorkspaceClient'

export function GradingWorkspace({ params }: { params: Promise<{ id: string }> }) {
  return <GradingWorkspaceClient params={params} />
}
