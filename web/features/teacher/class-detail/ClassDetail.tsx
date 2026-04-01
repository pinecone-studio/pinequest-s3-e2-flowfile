import { ClassDetailClient } from './ClassDetailClient'

export function ClassDetail({ params }: { params: Promise<{ id: string }> }) {
  return <ClassDetailClient params={params} />
}
