'use client'

import { ChevronDown } from 'lucide-react'
import { initialCourses, initialExamAssignments, CURRENT_TEACHER_ID } from '@/lib/data'
import { COURSE_COLORS, PATTERNS, SUBJECT_NAMES } from '@/lib/constants'
import { CourseCard } from './_components/CourseCard'

export function TeacherDashboardClient() {
  const teacherCourses = initialCourses.filter(c => c.teacherId === CURRENT_TEACHER_ID)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>Хичээлүүд</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[13px] bg-white" style={{ borderColor: '#DDE1E7', color: '#5A6474' }}>
            <span>2024–2025</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teacherCourses.map(course => {
          const subjectColor = COURSE_COLORS[course.subjectId] || COURSE_COLORS.default
          const subjectPattern = PATTERNS[course.subjectId] || PATTERNS.default
          const subjectName = SUBJECT_NAMES[course.subjectId] || course.subjectId
          const classCount = course.classIds.length
          const examCount = initialExamAssignments.filter(ea =>
            course.classIds.includes(ea.classId) && ea.assignedBy === CURRENT_TEACHER_ID
          ).length
          return (
            <CourseCard
              key={course.id}
              course={course}
              subjectColor={subjectColor}
              subjectPattern={subjectPattern}
              subjectName={subjectName}
              classCount={classCount}
              examCount={examCount}
            />
          )
        })}
      </div>

      {teacherCourses.length === 0 && (
        <div className="text-center py-12" style={{ color: '#5A6474' }}>Энэ хичээлийн жилд хичээл бүртгэгдээгүй байна.</div>
      )}
    </div>
  )
}
