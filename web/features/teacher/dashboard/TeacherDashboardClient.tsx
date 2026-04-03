'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { getAll, initialExamAssignments } from '@/lib/data'
import { COURSE_COLORS, PATTERNS, SUBJECT_NAMES } from '@/lib/constants'
import {
  fetchEnrollmentsByExam,
  fetchMyExams,
  isApiConfigured,
  type TeacherExam,
} from '@/lib/api/teacher-exams'
import type { Course, ExamAssignment } from '@/lib/types'
import {
  getAcademicYearOptions,
  inferClassIdsFromEnrollments,
  intersects,
  loadTeacherCatalog,
} from '@/lib/teacher-course-data'
import { CourseCard } from './_components/CourseCard'

function TeacherDashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[10px] border bg-white"
          style={{ borderColor: '#DDE1E7' }}
        >
          <Skeleton className="h-[130px] w-full rounded-none" />
          <div className="space-y-3 p-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TeacherDashboardClient() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedYear, setSelectedYear] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiExams, setApiExams] = useState<TeacherExam[]>([])
  const [apiExamClassIds, setApiExamClassIds] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const { courses: availableCourses, classes } = loadTeacherCatalog()
    const fallbackAssignments =
      getAll<ExamAssignment>('examAssignments').length > 0
        ? getAll<ExamAssignment>('examAssignments')
        : initialExamAssignments

    setCourses(availableCourses)

    const yearOptions = getAcademicYearOptions(availableCourses)
    setSelectedYear((previous) =>
      previous !== 'all' ? previous : (yearOptions[0] ?? 'all'),
    )

    if (!isApiConfigured()) {
      setApiExamClassIds(
        fallbackAssignments.reduce<Record<string, string[]>>((result, assignment) => {
          const existing = result[assignment.examId] ?? []
          if (!existing.includes(assignment.classId)) {
            result[assignment.examId] = [...existing, assignment.classId]
          }
          return result
        }, {}),
      )
      setIsLoading(false)
      return
    }

    let isCancelled = false

    const loadApiState = async () => {
      setIsRefreshing(true)

      try {
        const exams = await fetchMyExams()
        const enrollments = await Promise.all(
          exams.map(async (exam) => ({
            examId: exam.id,
            enrollments: await fetchEnrollmentsByExam(exam.id),
          })),
        )

        if (isCancelled) {
          return
        }

        setApiExams(exams)
        setApiExamClassIds(
          enrollments.reduce<Record<string, string[]>>((result, item) => {
            result[item.examId] = inferClassIdsFromEnrollments(item.enrollments, classes)
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
  }, [])

  const yearOptions = useMemo(() => getAcademicYearOptions(courses), [courses])
  const filteredCourses = useMemo(
    () =>
      selectedYear === 'all'
        ? courses
        : courses.filter((course) => course.year === selectedYear),
    [courses, selectedYear],
  )

  const localAssignments =
    getAll<ExamAssignment>('examAssignments').length > 0
      ? getAll<ExamAssignment>('examAssignments')
      : initialExamAssignments

  const getExamCount = (course: Course) => {
    if (isApiConfigured() && apiExams.length > 0) {
      return apiExams.filter(
        (exam) =>
          exam.subject === course.subjectId &&
          intersects(apiExamClassIds[exam.id] ?? [], course.classIds),
      ).length
    }

    return localAssignments.filter((assignment) => course.classIds.includes(assignment.classId))
      .length
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className="text-[22px] font-semibold"
            style={{ color: '#1A1A2E' }}
          >
            Хичээлүүд
          </h1>
          <p className="text-[13px]" style={{ color: '#5A6474' }}>
            Багшийн хичээлүүд болон түүнд холбогдсон шалгалтууд
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Хичээлийн жил" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх жил</SelectItem>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isRefreshing && <Spinner className="size-4 text-[#0066FF]" />}
        </div>
      </div>

      {isLoading ? (
        <TeacherDashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const subjectColor = COURSE_COLORS[course.subjectId] || COURSE_COLORS.default
            const subjectPattern = PATTERNS[course.subjectId] || PATTERNS.default
            const subjectName = SUBJECT_NAMES[course.subjectId] || course.subjectId

            return (
              <CourseCard
                key={course.id}
                course={course}
                subjectColor={subjectColor}
                subjectPattern={subjectPattern}
                subjectName={subjectName}
                classCount={course.classIds.length}
                examCount={getExamCount(course)}
              />
            )
          })}
        </div>
      )}

      {!isLoading && filteredCourses.length === 0 && (
        <div className="py-12 text-center" style={{ color: '#5A6474' }}>
          {selectedYear === 'all'
            ? 'Энэ багшид холбогдсон хичээл олдсонгүй.'
            : `${selectedYear} хичээлийн жилд хичээл бүртгэгдээгүй байна.`}
        </div>
      )}
    </div>
  )
}
