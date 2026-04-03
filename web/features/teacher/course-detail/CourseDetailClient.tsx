'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { getAll, initialExamAssignments } from '@/lib/data'
import { COURSE_COLORS, PATTERNS, SUBJECT_NAMES } from '@/lib/constants'
import {
  fetchEnrollmentsByExam,
  fetchMyExams,
  isApiConfigured,
} from '@/lib/api/teacher-exams'
import type { Course, ExamAssignment, SchoolClass } from '@/lib/types'
import {
  inferClassIdsFromEnrollments,
  loadTeacherCatalog,
  resolveTeacherExamAssignmentStatus,
} from '@/lib/teacher-course-data'
import { CourseClassCard } from './_components/CourseClassCard'

function CourseDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[10px] border bg-white"
          style={{ borderColor: '#DDE1E7' }}
        >
          <Skeleton className="h-[100px] w-full rounded-none" />
          <div className="space-y-3 p-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function CourseDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [course, setCourse] = useState<Course | null>(null)
  const [courseClasses, setCourseClasses] = useState<SchoolClass[]>([])
  const [upcomingCounts, setUpcomingCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const { courses, classes } = loadTeacherCatalog()
    const nextCourse = courses.find((item) => item.id === id) ?? null
    setCourse(nextCourse)

    if (!nextCourse) {
      setCourseClasses([])
      setIsLoading(false)
      return
    }

    const nextCourseClasses = classes.filter((item) => nextCourse.classIds.includes(item.id))
    setCourseClasses(nextCourseClasses)

    const fallbackAssignments =
      getAll<ExamAssignment>('examAssignments').length > 0
        ? getAll<ExamAssignment>('examAssignments')
        : initialExamAssignments

    setUpcomingCounts(
      nextCourseClasses.reduce<Record<string, number>>((result, schoolClass) => {
        result[schoolClass.id] = fallbackAssignments.filter(
          (assignment) =>
            assignment.classId === schoolClass.id &&
            (assignment.status === 'scheduled' || assignment.status === 'active'),
        ).length
        return result
      }, {}),
    )

    if (!isApiConfigured()) {
      setIsLoading(false)
      return
    }

    let isCancelled = false

    const loadApiState = async () => {
      setIsRefreshing(true)

      try {
        const exams = await fetchMyExams()
        const matchingExams = exams.filter((exam) => exam.subject === nextCourse.subjectId)
        const enrollments = await Promise.all(
          matchingExams.map(async (exam) => ({
            exam,
            enrollments: await fetchEnrollmentsByExam(exam.id),
          })),
        )

        if (isCancelled) {
          return
        }

        setUpcomingCounts(
          nextCourseClasses.reduce<Record<string, number>>((result, schoolClass) => {
            result[schoolClass.id] = enrollments.filter((item) => {
              const classIds = inferClassIdsFromEnrollments(item.enrollments, classes)

              return (
                classIds.includes(schoolClass.id) &&
                resolveTeacherExamAssignmentStatus(item.exam) !== 'closed'
              )
            }).length

            return result
          }, {}),
        )
      } catch {
        if (isCancelled) {
          return
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    void loadApiState()

    return () => {
      isCancelled = true
    }
  }, [id])

  if (!course && !isLoading) {
    return (
      <div className="p-6" style={{ color: '#5A6474' }}>
        Хичээл олдсонгүй...
      </div>
    )
  }

  const subjectColor = course ? COURSE_COLORS[course.subjectId] || COURSE_COLORS.default : COURSE_COLORS.default
  const subjectPattern = course ? PATTERNS[course.subjectId] || PATTERNS.default : PATTERNS.default
  const subjectName = course ? SUBJECT_NAMES[course.subjectId] || course.subjectId : 'Хичээл'

  return (
    <div className="p-6">
      <nav
        className="mb-4 flex items-center gap-2 text-[14px]"
        style={{ color: '#5A6474' }}
      >
        <Link href="/teacher" className="hover:underline" style={{ color: '#0066FF' }}>
          Хичээлүүд
        </Link>
        <span>/</span>
        <span style={{ color: '#1A1A2E' }}>{subjectName}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-[22px] font-semibold"
            style={{ color: '#1A1A2E' }}
          >
            {subjectName}
          </h1>
          {course && (
            <p className="text-[13px]" style={{ color: '#5A6474' }}>
              {course.year}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span
            className="rounded-full px-3 py-1 text-[13px]"
            style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}
          >
            {courseClasses.length} анги
          </span>
          {isRefreshing && <Spinner className="size-4 text-[#0066FF]" />}
        </div>
      </div>

      {isLoading ? (
        <CourseDetailSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courseClasses.map((schoolClass) => (
            <CourseClassCard
              key={schoolClass.id}
              cls={schoolClass}
              subjectColor={subjectColor}
              subjectPattern={subjectPattern}
              upcomingExamCount={upcomingCounts[schoolClass.id] ?? 0}
            />
          ))}
        </div>
      )}

      {!isLoading && courseClasses.length === 0 && (
        <div
          className="py-12 text-center text-[14px]"
          style={{ color: '#5A6474' }}
        >
          Анги бүртгэгдээгүй байна.
        </div>
      )}
    </div>
  )
}
