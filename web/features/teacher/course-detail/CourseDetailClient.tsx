'use client'

import { use } from 'react'
import Link from 'next/link'
import { initialCourses, initialClasses, initialExamAssignments, CURRENT_TEACHER_ID } from '@/lib/data'
import { COURSE_COLORS, PATTERNS, SUBJECT_NAMES } from '@/lib/constants'
import { CourseClassCard } from './_components/CourseClassCard'

export function CourseDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const course = initialCourses.find(c => c.id === id)

  if (!course) {
    return <div className="p-6" style={{ color: '#5A6474' }}>Хичээл олдсонгүй...</div>
  }

  const courseClasses = (initialClasses ?? []).filter(c => (course?.classIds ?? []).includes(c.id))
  const subjectColor = COURSE_COLORS[course.subjectId] || COURSE_COLORS.default
  const subjectPattern = PATTERNS[course.subjectId] || PATTERNS.default
  const subjectName = SUBJECT_NAMES[course.subjectId] || course.subjectId

  return (
    <div className="p-6">
      <nav className="flex items-center gap-2 text-[14px] mb-4" style={{ color: '#5A6474' }}>
        <Link href="/teacher" className="hover:underline" style={{ color: '#0066FF' }}>Хичээлүүд</Link>
        <span>/</span>
        <span style={{ color: '#1A1A2E' }}>{subjectName}</span>
      </nav>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>{subjectName}</h1>
        <span className="px-3 py-1 text-[13px] rounded-full" style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}>
          {courseClasses.length} анги
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courseClasses.map(cls => {
          const upcomingExamCount = (initialExamAssignments ?? []).filter(ea =>
            ea.classId === cls.id && ea.assignedBy === CURRENT_TEACHER_ID && (ea.status === 'scheduled' || ea.status === 'active')
          ).length
          return (
            <CourseClassCard
              key={cls.id}
              cls={cls}
              subjectColor={subjectColor}
              subjectPattern={subjectPattern}
              upcomingExamCount={upcomingExamCount}
            />
          )
        })}
      </div>
      {courseClasses.length === 0 && (
        <div className="text-center py-12 text-[14px]" style={{ color: '#5A6474' }}>Анги бүртгэгдээгүй байна.</div>
      )}
    </div>
  )
}
