'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import {
  CURRENT_TEACHER_ID,
  initialAttempts,
  initialClasses,
  initialCourses,
  initialExamAssignments,
  initialExams,
  initialUsers,
} from '@/lib/data'
import { SUBJECT_NAMES } from '@/lib/constants'
import {
  fetchEnrollmentsByExam,
  fetchExamSessions,
  fetchMyExams,
  fetchQuestionsByExam,
  fetchUsersByRole,
  isApiConfigured,
  type ExamSession,
  type TeacherUser,
} from '@/lib/api/teacher-exams'
import type { Course, Exam, ExamAssignment, SchoolClass, User } from '@/lib/types'
import {
  buildSyntheticAssignment,
  buildSyntheticExam,
  inferClassIdsFromEnrollments,
  loadTeacherCatalog,
} from '@/lib/teacher-course-data'
import { StudentRow } from './_components/StudentRow'
import { ClassExamRow } from './_components/ClassExamRow'

function ClassDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[10px] border bg-white p-4"
            style={{ borderColor: '#DDE1E7' }}
          >
            <Skeleton className="mb-3 h-5 w-1/3" />
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
      <div
        className="overflow-hidden rounded-[10px] border bg-white"
        style={{ borderColor: '#DDE1E7' }}
      >
        <div className="space-y-4 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

type StudentStats = {
  avgScore: number | null
  attendance: number
  trend: 'up' | 'down' | 'neutral'
}

export function ClassDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<'exams' | 'students'>('exams')
  const [apiClass, setApiClass] = useState<SchoolClass | null>(null)
  const [apiCourse, setApiCourse] = useState<Course | null>(null)
  const [apiStudents, setApiStudents] = useState<User[]>([])
  const [apiAssignments, setApiAssignments] = useState<ExamAssignment[]>([])
  const [apiExamsById, setApiExamsById] = useState<Record<string, Exam>>({})
  const [apiSessionsByExamId, setApiSessionsByExamId] = useState<Record<string, ExamSession[]>>({})
  const [apiMaxScoreByExamId, setApiMaxScoreByExamId] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(isApiConfigured())
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!isApiConfigured()) {
      return
    }

    const { classes, courses, users } = loadTeacherCatalog()
    const schoolClass = classes.find((item) => item.id === id) ?? null
    const course = courses.find((item) => item.classIds.includes(id)) ?? null

    setApiClass(schoolClass)
    setApiCourse(course)
    setApiStudents(users.filter((user) => user.role === 'student' && schoolClass?.studentIds.includes(user.id)))

    if (!schoolClass) {
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
            exam,
            enrollments: await fetchEnrollmentsByExam(exam.id),
          })),
        )

        const relevantExamEntries = enrollments.filter((item) =>
          inferClassIdsFromEnrollments(item.enrollments, classes).includes(id),
        )

        const [studentUsers, sessions, questions] = await Promise.all([
          fetchUsersByRole('student'),
          Promise.all(
            relevantExamEntries.map(async (item) => ({
              examId: item.exam.id,
              sessions: await fetchExamSessions(item.exam.id),
            })),
          ),
          Promise.all(
            relevantExamEntries.map(async (item) => ({
              examId: item.exam.id,
              questions: await fetchQuestionsByExam(item.exam.id),
            })),
          ),
        ])

        if (isCancelled) {
          return
        }

        const studentNameMap = new Map(
          studentUsers.map((user: TeacherUser) => [user.id, user.name] as const),
        )
        const mergedStudents = users
          .filter((user) => user.role === 'student' && schoolClass.studentIds.includes(user.id))
          .map((student) => ({
            ...student,
            name: studentNameMap.get(student.id) ?? student.name,
          }))

        setApiStudents(mergedStudents)
        setApiAssignments(
          relevantExamEntries.map((item) => buildSyntheticAssignment(item.exam, id)),
        )
        setApiExamsById(
          relevantExamEntries.reduce<Record<string, Exam>>((result, item) => {
            const questionList =
              questions.find((entry) => entry.examId === item.exam.id)?.questions ?? []

            result[item.exam.id] = buildSyntheticExam(
              item.exam,
              questionList.map((question) => question.id),
              questionList.reduce((sum, question) => sum + question.points, 0),
            )
            return result
          }, {}),
        )
        setApiSessionsByExamId(
          sessions.reduce<Record<string, ExamSession[]>>((result, item) => {
            result[item.examId] = item.sessions.filter((session) =>
              schoolClass.studentIds.includes(session.studentId),
            )
            return result
          }, {}),
        )
        setApiMaxScoreByExamId(
          questions.reduce<Record<string, number>>((result, item) => {
            result[item.examId] = item.questions.reduce(
              (sum, question) => sum + question.points,
              0,
            )
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

  if (isApiConfigured()) {
    const cls = apiClass

    if (!cls && !isLoading) {
      return (
        <div className="p-6">
          <div style={{ color: '#5A6474' }}>Анги олдсонгүй...</div>
        </div>
      )
    }

    const subjectName = apiCourse
      ? SUBJECT_NAMES[apiCourse.subjectId] || apiCourse.subjectId
      : 'Хичээл'
    const upcomingExams = apiAssignments.filter(
      (assignment) => assignment.status === 'scheduled' || assignment.status === 'active',
    )
    const pastExams = apiAssignments.filter((assignment) => assignment.status === 'closed')

    const getExam = (examId: string) => apiExamsById[examId]

    const getExamStats = (assignment: ExamAssignment) => {
      const sessions = apiSessionsByExamId[assignment.examId] ?? []
      const scoredSessions = sessions.filter((session) => session.score !== null)
      const maxScore = apiMaxScoreByExamId[assignment.examId] || 0

      if (scoredSessions.length === 0 || maxScore <= 0 || !cls) {
        return null
      }

      const percentages = scoredSessions.map((session) =>
        Math.round(((session.score ?? 0) / maxScore) * 100),
      )

      return {
        avg: Math.round(
          percentages.reduce((sum, percentage) => sum + percentage, 0) /
            percentages.length,
        ),
        completed: scoredSessions.length,
        total: cls.studentIds.length,
      }
    }

    const getStudentStats = (studentId: string): StudentStats => {
      const studentSessions = Object.entries(apiSessionsByExamId)
        .flatMap(([examId, sessions]) =>
          sessions
            .filter((session) => session.studentId === studentId && session.score !== null)
            .map((session) => ({
              examId,
              score: session.score ?? 0,
              updatedAt: session.updatedAt,
            })),
        )
        .filter((item) => (apiMaxScoreByExamId[item.examId] ?? 0) > 0)

      if (studentSessions.length === 0) {
        return { avgScore: null, attendance: 0, trend: 'neutral' }
      }

      const percentages = studentSessions.map((item) =>
        Math.round((item.score / (apiMaxScoreByExamId[item.examId] || 1)) * 100),
      )
      const avgScore = Math.round(
        percentages.reduce((sum, percentage) => sum + percentage, 0) /
          percentages.length,
      )
      const attendance =
        pastExams.length > 0
          ? Math.round((studentSessions.length / pastExams.length) * 100)
          : 0

      let trend: StudentStats['trend'] = 'neutral'
      if (studentSessions.length >= 2) {
        const sorted = [...studentSessions].sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        )
        const latest =
          Math.round(
            (sorted[0].score / (apiMaxScoreByExamId[sorted[0].examId] || 1)) * 100,
          ) ?? 0
        const previous =
          Math.round(
            (sorted[1].score / (apiMaxScoreByExamId[sorted[1].examId] || 1)) * 100,
          ) ?? 0

        if (latest > previous + 5) {
          trend = 'up'
        } else if (latest < previous - 5) {
          trend = 'down'
        }
      }

      return { avgScore, attendance, trend }
    }

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
          {apiCourse && (
            <>
              <Link
                href={`/teacher/courses/${apiCourse.id}`}
                className="hover:underline"
                style={{ color: '#0066FF' }}
              >
                {subjectName}
              </Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: '#1A1A2E' }}>{cls?.name}</span>
        </nav>

        <div className="mb-6 flex items-center justify-between">
          <h1
            className="text-[22px] font-semibold"
            style={{ color: '#1A1A2E' }}
          >
            {cls?.name}
          </h1>
          {isRefreshing && <Spinner className="size-4 text-[#0066FF]" />}
        </div>

        <div className="mb-6 border-b" style={{ borderColor: '#DDE1E7' }}>
          <div className="flex gap-6">
            {(['exams', 'students'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'border-b-2 pb-3 text-[14px] transition-colors',
                  activeTab === tab ? 'font-medium' : '',
                )}
                style={
                  activeTab === tab
                    ? { color: '#0066FF', borderColor: '#0066FF' }
                    : { color: '#5A6474', borderColor: 'transparent' }
                }
              >
                {tab === 'exams' ? 'Шалгалтууд' : `Сурагчид (${apiStudents.length})`}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <ClassDetailSkeleton />
        ) : activeTab === 'exams' ? (
          <div className="space-y-8">
            {upcomingExams.length > 0 && (
              <section>
                <h2
                  className="mb-4 text-[15px] font-medium"
                  style={{ color: '#1A1A2E' }}
                >
                  Удахгүй болох шалгалтууд
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {upcomingExams.map((assignment) => {
                    const exam = getExam(assignment.examId)
                    if (!exam) {
                      return null
                    }

                    return (
                      <ClassExamRow
                        key={assignment.id}
                        assignment={assignment}
                        exam={exam}
                        stats={null}
                        subjectName={subjectName}
                        href={`/teacher/bank/${assignment.examId}`}
                      />
                    )
                  })}
                </div>
              </section>
            )}

            {pastExams.length > 0 && (
              <section>
                <h2
                  className="mb-4 text-[15px] font-medium"
                  style={{ color: '#1A1A2E' }}
                >
                  Өнгөрсөн шалгалтууд
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {pastExams.map((assignment) => {
                    const exam = getExam(assignment.examId)
                    if (!exam) {
                      return null
                    }

                    return (
                      <ClassExamRow
                        key={assignment.id}
                        assignment={assignment}
                        exam={exam}
                        stats={getExamStats(assignment)}
                        subjectName={subjectName}
                        href={`/teacher/bank/${assignment.examId}`}
                      />
                    )
                  })}
                </div>
              </section>
            )}

            {upcomingExams.length === 0 && pastExams.length === 0 && (
              <div className="py-12 text-center" style={{ color: '#5A6474' }}>
                Шалгалт бүртгэгдээгүй байна.
              </div>
            )}
          </div>
        ) : (
          <div
            className="overflow-hidden rounded-[10px] border bg-white"
            style={{ borderColor: '#DDE1E7' }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#F5F7FA' }}>
                  {['№', 'Нэр', 'Оролцоо', 'Дундаж', 'Хандлага'].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-[13px] font-medium"
                      style={{ color: '#5A6474' }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apiStudents.map((student, index) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    stats={getStudentStats(student.id)}
                    index={index}
                  />
                ))}
              </tbody>
            </table>
            {apiStudents.length === 0 && (
              <div className="py-8 text-center text-[14px]" style={{ color: '#5A6474' }}>
                Сурагч бүртгэгдээгүй байна.
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const cls = initialClasses.find((item) => item.id === id)
  if (!cls) {
    return (
      <div className="p-6">
        <div style={{ color: '#5A6474' }}>Анги олдсонгүй...</div>
      </div>
    )
  }

  const course = initialCourses.find((item) => item.classIds.includes(cls.id))
  const subjectName = course ? SUBJECT_NAMES[course.subjectId] || course.subjectId : 'Хичээл'
  const classAssignments = initialExamAssignments.filter(
    (assignment) => assignment.classId === cls.id && assignment.assignedBy === CURRENT_TEACHER_ID,
  )
  const classStudents = initialUsers.filter(
    (user) => user.role === 'student' && cls.studentIds.includes(user.id),
  )
  const upcomingExams = classAssignments.filter(
    (assignment) => assignment.status === 'scheduled' || assignment.status === 'active',
  )
  const pastExams = classAssignments.filter((assignment) => assignment.status === 'closed')
  const getExam = (examId: string) => initialExams.find((exam) => exam.id === examId)

  const getExamStats = (assignmentId: string) => {
    const examResults = initialAttempts.filter(
      (attempt) => attempt.examAssignmentId === assignmentId && attempt.status === 'graded',
    )

    if (examResults.length === 0) {
      return null
    }

    const scores = examResults.map((attempt) =>
      attempt.totalPoints && attempt.earnedPoints
        ? Math.round((attempt.earnedPoints / attempt.totalPoints) * 100)
        : 0,
    )

    return {
      avg: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
      completed: examResults.length,
      total: cls.studentIds.length,
    }
  }

  const getStudentStats = (studentId: string): StudentStats => {
    const studentResults = initialAttempts.filter(
      (attempt) =>
        attempt.studentId === studentId &&
        attempt.status === 'graded' &&
        classAssignments.some((assignment) => assignment.id === attempt.examAssignmentId),
    )

    if (studentResults.length === 0) {
      return { avgScore: null, attendance: 0, trend: 'neutral' }
    }

    const getPercentage = (attempt: (typeof studentResults)[number]) =>
      attempt.totalPoints && attempt.earnedPoints
        ? Math.round((attempt.earnedPoints / attempt.totalPoints) * 100)
        : 0

    const avgScore = Math.round(
      studentResults.reduce((sum, attempt) => sum + getPercentage(attempt), 0) /
        studentResults.length,
    )
    const attendance =
      pastExams.length > 0
        ? Math.round((studentResults.length / pastExams.length) * 100)
        : 0

    let trend: StudentStats['trend'] = 'neutral'
    if (studentResults.length >= 2) {
      const sorted = [...studentResults].sort(
        (left, right) =>
          new Date(right.endedAt || right.startedAt).getTime() -
          new Date(left.endedAt || left.startedAt).getTime(),
      )
      const latest = getPercentage(sorted[0])
      const previous = getPercentage(sorted[1])

      if (latest > previous + 5) {
        trend = 'up'
      } else if (latest < previous - 5) {
        trend = 'down'
      }
    }

    return { avgScore, attendance, trend }
  }

  return (
    <div className="p-6">
      <nav className="mb-4 flex items-center gap-2 text-[14px]" style={{ color: '#5A6474' }}>
        <Link href="/teacher" className="hover:underline" style={{ color: '#0066FF' }}>
          Хичээлүүд
        </Link>
        <span>/</span>
        {course && (
          <>
            <Link
              href={`/teacher/courses/${course.id}`}
              className="hover:underline"
              style={{ color: '#0066FF' }}
            >
              {subjectName}
            </Link>
            <span>/</span>
          </>
        )}
        <span style={{ color: '#1A1A2E' }}>{cls.name}</span>
      </nav>

      <h1 className="mb-6 text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>
        {cls.name}
      </h1>

      <div className="mb-6 border-b" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex gap-6">
          {(['exams', 'students'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'border-b-2 pb-3 text-[14px] transition-colors',
                activeTab === tab ? 'font-medium' : '',
              )}
              style={
                activeTab === tab
                  ? { color: '#0066FF', borderColor: '#0066FF' }
                  : { color: '#5A6474', borderColor: 'transparent' }
              }
            >
              {tab === 'exams' ? 'Шалгалтууд' : `Сурагчид (${classStudents.length})`}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'exams' ? (
        <div className="space-y-8">
          {upcomingExams.length > 0 && (
            <section>
              <h2 className="mb-4 text-[15px] font-medium" style={{ color: '#1A1A2E' }}>
                Удахгүй болох шалгалтууд
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {upcomingExams.map((assignment) => {
                  const exam = getExam(assignment.examId)
                  if (!exam) {
                    return null
                  }

                  return (
                    <ClassExamRow
                      key={assignment.id}
                      assignment={assignment}
                      exam={exam}
                      stats={null}
                      subjectName={subjectName}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {pastExams.length > 0 && (
            <section>
              <h2 className="mb-4 text-[15px] font-medium" style={{ color: '#1A1A2E' }}>
                Өнгөрсөн шалгалтууд
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pastExams.map((assignment) => {
                  const exam = getExam(assignment.examId)
                  if (!exam) {
                    return null
                  }

                  return (
                    <ClassExamRow
                      key={assignment.id}
                      assignment={assignment}
                      exam={exam}
                      stats={getExamStats(assignment.id)}
                      subjectName={subjectName}
                    />
                  )
                })}
              </div>
            </section>
          )}

          {upcomingExams.length === 0 && pastExams.length === 0 && (
            <div className="py-12 text-center" style={{ color: '#5A6474' }}>
              Шалгалт бүртгэгдээгүй байна.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: '#DDE1E7' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F5F7FA' }}>
                {['№', 'Нэр', 'Оролцоо', 'Дундаж', 'Хандлага'].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-[13px] font-medium"
                    style={{ color: '#5A6474' }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, index) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  stats={getStudentStats(student.id)}
                  index={index}
                />
              ))}
            </tbody>
          </table>
          {classStudents.length === 0 && (
            <div className="py-8 text-center text-[14px]" style={{ color: '#5A6474' }}>
              Сурагч бүртгэгдээгүй байна.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
