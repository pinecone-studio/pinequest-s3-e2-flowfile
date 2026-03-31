import { CourseDetail } from '@/features/teacher/course-detail/CourseDetail'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <CourseDetail params={params} />
}
