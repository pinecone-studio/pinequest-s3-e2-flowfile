import { ClassDetail } from '@/features/teacher/class-detail/ClassDetail'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ClassDetail params={params} />
}
