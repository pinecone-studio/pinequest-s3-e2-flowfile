import {
  CURRENT_TEACHER_ID,
  getAll,
  initialClasses,
  initialCourses,
  initialUsers,
} from '@/lib/data'
import type { Course, Exam, ExamAssignment, SchoolClass, User } from '@/lib/types'
import type { TeacherEnrollment, TeacherExam } from '@/lib/api/teacher-exams'

function normalizeAcademicYear(year: string) {
  return year === '2024–2025' || year === '2024-2025' ? '2025–2026' : year
}

export function loadTeacherCatalog(teacherId = CURRENT_TEACHER_ID) {
  const storedCourses = getAll<Course>('courses')
  const storedClasses = getAll<SchoolClass>('classes')
  const storedUsers = getAll<User>('users')

  const courses = (storedCourses.length ? storedCourses : initialCourses)
    .map((course) => ({
      ...course,
      year: normalizeAcademicYear(course.year),
    }))
    .filter((course) => course.teacherId === teacherId)
  const classes = storedClasses.length ? storedClasses : initialClasses
  const users = storedUsers.length ? storedUsers : initialUsers

  return {
    courses,
    classes,
    users,
  }
}

export function getAcademicYearOptions(courses: Course[]) {
  return Array.from(new Set(courses.map((course) => course.year))).sort((left, right) =>
    right.localeCompare(left, 'mn'),
  )
}

export function intersects(left: string[], right: string[]) {
  const rightSet = new Set(right)
  return left.some((value) => rightSet.has(value))
}

export function inferClassIdsFromEnrollments(
  enrollments: TeacherEnrollment[],
  classes: SchoolClass[],
) {
  const enrolledStudentIds = new Set(enrollments.map((item) => item.studentId))

  return classes
    .filter((schoolClass) =>
      schoolClass.studentIds.some((studentId) => enrolledStudentIds.has(studentId)),
    )
    .map((schoolClass) => schoolClass.id)
}

export function resolveTeacherExamAssignmentStatus(
  exam: TeacherExam,
  now = new Date(),
): ExamAssignment['status'] {
  if (exam.status === 'closed') {
    return 'closed'
  }

  if (exam.endsAt && now > new Date(exam.endsAt)) {
    return 'closed'
  }

  if (exam.startsAt && now < new Date(exam.startsAt)) {
    return 'scheduled'
  }

  return 'active'
}

export function buildSyntheticAssignment(
  exam: TeacherExam,
  classId: string,
): ExamAssignment {
  const scheduledStart = exam.startsAt ?? exam.createdAt
  const scheduledEnd =
    exam.endsAt ??
    new Date(
      new Date(scheduledStart).getTime() + exam.durationMinutes * 60 * 1000,
    ).toISOString()

  return {
    id: `${exam.id}:${classId}`,
    examId: exam.id,
    classId,
    assignedBy: exam.teacherId,
    scheduledStart,
    scheduledEnd,
    extendedMinutes: 0,
    isPaused: false,
    status: resolveTeacherExamAssignmentStatus(exam),
  }
}

export function buildSyntheticExam(
  exam: TeacherExam,
  questionIds: string[] = [],
  totalPoints = 0,
): Exam {
  return {
    id: exam.id,
    title: exam.title,
    subjectId: exam.subject,
    description: exam.description ?? undefined,
    duration: exam.durationMinutes,
    totalPoints,
    ownerType: 'teacher',
    ownerId: exam.teacherId,
    collaboratorIds: [],
    status:
      exam.status === 'draft'
        ? 'draft'
        : exam.status === 'published'
          ? 'published'
          : 'private',
    visibility: 'private',
    questionIds,
    isTemplate: false,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
    tags: [exam.subject],
  }
}
