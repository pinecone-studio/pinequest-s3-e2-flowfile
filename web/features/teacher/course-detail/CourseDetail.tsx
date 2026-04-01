import { CourseDetailClient } from './CourseDetailClient'

export function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
  return <CourseDetailClient params={params} />
}
