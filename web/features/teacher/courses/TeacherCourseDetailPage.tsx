'use client'

import { useCourseDetail } from "@/hooks/useCourseDetail"
import CourseHeader from "./components/CourseHeader"
import ClassGrid from "./components/ClassGrid"



export default function TeacherCourseDetailPage({ id }: { id: string }) {
  const data = useCourseDetail(id)

  if (!data.course) {
    return <div className="p-6">Хичээл олдсонгүй</div>
  }

  return (
    <div className="p-6">
      <CourseHeader {...data} />
      <ClassGrid {...data} />
    </div>
  )
}