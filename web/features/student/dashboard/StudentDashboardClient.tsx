'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, FileText, Timer } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAssignedExams, type StudentExamSummary } from '@/lib/api/student-exams'
import { isApiConfigured } from '@/lib/api/client'
import { getAll, getCurrentStudentId } from '@/lib/data'
import type { Exam, ExamAssignment, Attempt, User as UserType, SchoolClass } from '@/lib/types'
import { SUBJECT_NAMES } from '@/lib/constants'
import { formatMongolianShortDateTime } from '@/lib/date-time'
import {
  initialExams,
  initialExamAssignments,
  initialAttempts,
  initialUsers,
  initialClasses,
} from '@/lib/data'
import { StudentStatCards } from './_components/StudentStatCards'
import { ExamTabFilter } from './_components/ExamTabFilter'
import { ExamAssignmentCard } from './_components/ExamAssignmentCard'

type FeaturedExam = {
  href: string
  title: string
  subjectId: string
  statusLabel: string
  actionLabel: string
  durationMinutes: number
  scheduledStart: string
}

function StudentDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-white p-5"
            style={{ borderColor: '#DDE1E7' }}
          >
            <Skeleton className="mb-3 h-10 w-10" />
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="mb-6 h-11 w-56" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border bg-white"
            style={{ borderColor: '#DDE1E7' }}
          >
            <Skeleton className="h-24 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getFeaturedApiExam(items: StudentExamSummary[]): FeaturedExam | null {
  const nextItem = items
    .slice()
    .sort((left, right) => {
      const leftPriority = left.attemptStatus === 'in_progress' ? 0 : left.attemptStatus === 'ready' ? 1 : 2
      const rightPriority = right.attemptStatus === 'in_progress' ? 0 : right.attemptStatus === 'ready' ? 1 : 2

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority
      }

      const leftTime = new Date(left.exam.startsAt ?? left.enrolledAt).getTime()
      const rightTime = new Date(right.exam.startsAt ?? right.enrolledAt).getTime()
      return leftTime - rightTime
    })[0]

  if (!nextItem) {
    return null
  }

  return {
    href: `/student/exams/${nextItem.exam.id}`,
    title: nextItem.exam.title,
    subjectId: nextItem.exam.subjectId,
    statusLabel:
      nextItem.attemptStatus === 'in_progress'
        ? 'Үргэлжилж байна'
        : nextItem.attemptStatus === 'upcoming'
          ? 'Тун удахгүй'
          : 'Ороход бэлэн',
    actionLabel: nextItem.attemptStatus === 'in_progress' ? 'Үргэлжлүүлэх' : 'Орох',
    durationMinutes: nextItem.exam.durationMinutes,
    scheduledStart: formatMongolianShortDateTime(
      nextItem.exam.startsAt ?? nextItem.enrolledAt,
    ),
  }
}

function getFeaturedLocalExam(
  assignments: ExamAssignment[],
  exams: Exam[],
): FeaturedExam | null {
  const nextAssignment = assignments
    .slice()
    .sort((left, right) => {
      const leftPriority = left.status === 'active' ? 0 : 1
      const rightPriority = right.status === 'active' ? 0 : 1

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority
      }

      return (
        new Date(left.scheduledStart).getTime() -
        new Date(right.scheduledStart).getTime()
      )
    })[0]

  if (!nextAssignment) {
    return null
  }

  const exam = exams.find((item) => item.id === nextAssignment.examId)

  if (!exam) {
    return null
  }

  return {
    href: `/student/exams/${nextAssignment.id}`,
    title: exam.title,
    subjectId: exam.subjectId,
    statusLabel: nextAssignment.status === 'active' ? 'Үргэлжилж байна' : 'Тун удахгүй',
    actionLabel: nextAssignment.status === 'active' ? 'Үргэлжлүүлэх' : 'Орох',
    durationMinutes: exam.duration,
    scheduledStart: formatMongolianShortDateTime(nextAssignment.scheduledStart),
  }
}

function FeaturedExamCard({ exam }: { exam: FeaturedExam }) {
  return (
    <div
      className="mb-6 overflow-hidden rounded-2xl border bg-white"
      style={{ borderColor: '#DDE1E7' }}
    >
      <div
        className="border-b px-5 py-4"
        style={{ borderColor: '#E6EAF0', backgroundColor: '#FAFBFD' }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 text-[12px] font-medium" style={{ color: '#5A6474' }}>
              Орох шалгалт
            </div>
            <h2 className="text-[20px] font-semibold" style={{ color: '#1A1A2E' }}>
              {exam.title}
            </h2>
            <p className="mt-1 text-[13px]" style={{ color: '#5A6474' }}>
              {SUBJECT_NAMES[exam.subjectId] ?? exam.subjectId}
            </p>
          </div>

          <Link
            href={exam.href}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary/90"
          >
            {exam.actionLabel}
            <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 px-5 py-4 md:grid-cols-3">
        <div className="rounded-xl border px-4 py-3" style={{ borderColor: '#E6EAF0' }}>
          <div className="mb-1 text-[12px]" style={{ color: '#8A94A0' }}>
            Төлөв
          </div>
          <div className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>
            {exam.statusLabel}
          </div>
        </div>

        <div className="rounded-xl border px-4 py-3" style={{ borderColor: '#E6EAF0' }}>
          <div className="mb-1 flex items-center gap-1 text-[12px]" style={{ color: '#8A94A0' }}>
            <Timer size={12} strokeWidth={1.8} />
            Хугацаа
          </div>
          <div className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>
            {exam.durationMinutes} минут
          </div>
        </div>

        <div className="rounded-xl border px-4 py-3" style={{ borderColor: '#E6EAF0' }}>
          <div className="mb-1 flex items-center gap-1 text-[12px]" style={{ color: '#8A94A0' }}>
            <Calendar size={12} strokeWidth={1.8} />
            Эхлэх хугацаа
          </div>
          <div className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>
            {exam.scheduledStart}
          </div>
        </div>
      </div>
    </div>
  )
}

export function StudentDashboardClient() {
  const currentStudentId = getCurrentStudentId()
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [assignments, setAssignments] = useState<ExamAssignment[]>(initialExamAssignments)
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts)
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses)
  const [assignedExams, setAssignedExams] = useState<StudentExamSummary[] | null>(null)
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available')
  const [isLoading, setIsLoading] = useState(isApiConfigured())

  useEffect(() => {
    let isMounted = true

    if (isApiConfigured()) {
      void fetchAssignedExams()
        .then((data) => {
          if (isMounted) {
            setAssignedExams(data)
          }
        })
        .catch(() => null)
        .finally(() => {
          if (isMounted) {
            setIsLoading(false)
          }
        })
    }

    const loadedExams = getAll<Exam>('exams')
    const loadedAssignments = getAll<ExamAssignment>('examAssignments')
    const loadedAttempts = getAll<Attempt>('attempts')
    const loadedUsers = getAll<UserType>('users')
    const loadedClasses = getAll<SchoolClass>('classes')

    if (loadedExams.length) setExams(loadedExams)
    if (loadedAssignments.length) setAssignments(loadedAssignments)
    if (loadedAttempts.length) setAttempts(loadedAttempts)
    if (loadedUsers.length) setUsers(loadedUsers)
    if (loadedClasses.length) setClasses(loadedClasses)

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <StudentDashboardSkeleton />
  }

  if (assignedExams) {
    const availableAssignments = assignedExams.filter(
      (item) =>
        item.attemptStatus === 'ready' ||
        item.attemptStatus === 'in_progress' ||
        item.attemptStatus === 'upcoming',
    )
    const completedAssignments = assignedExams.filter(
      (item) =>
        item.attemptStatus === 'submitted' ||
        item.attemptStatus === 'force_submitted' ||
        item.attemptStatus === 'closed',
    )
    const displayedAssignments =
      activeTab === 'available' ? availableAssignments : completedAssignments
    const featuredExam = getFeaturedApiExam(availableAssignments)

    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[24px] font-bold mb-1" style={{ color: '#1A1A2E' }}>
            Миний шалгалтууд
          </h1>
        </div>

        {featuredExam && <FeaturedExamCard exam={featuredExam} />}

        <StudentStatCards
          availableCount={availableAssignments.length}
          completedCount={completedAssignments.length}
          totalCount={assignedExams.length}
        />

        <ExamTabFilter
          activeTab={activeTab}
          onTabChange={setActiveTab}
          availableCount={availableAssignments.length}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedAssignments.map((item) => (
            <ExamAssignmentCard
              key={item.exam.id}
              href={`/student/exams/${item.exam.id}`}
              isDisabled={
                item.attemptStatus === 'submitted' ||
                item.attemptStatus === 'force_submitted' ||
                item.attemptStatus === 'closed' ||
                item.attemptStatus === 'upcoming'
              }
              title={item.exam.title}
              subjectId={item.exam.subjectId}
              status={item.attemptStatus}
              durationMinutes={item.exam.durationMinutes}
              questionCount={0}
              teacherName="Багш"
              scheduledStart={formatMongolianShortDateTime(item.exam.startsAt ?? item.enrolledAt)}
            />
          ))}
        </div>

        {displayedAssignments.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: '#DDE1E7' }}>
            <FileText size={48} className="mx-auto mb-3" style={{ color: '#DDE1E7' }} strokeWidth={1} />
            <p className="text-[15px]" style={{ color: '#5A6474' }}>
              {activeTab === 'available'
                ? 'Одоогоор боломжтой шалгалт байхгүй байна.'
                : 'Дууссан шалгалт байхгүй байна.'}
            </p>
          </div>
        )}
      </div>
    )
  }

  const getTeacherName = (ownerId: string) =>
    (users ?? []).find((user) => user.id === ownerId)?.name || '-'
  const studentClass = (classes ?? []).find((cls) =>
    (cls.studentIds ?? []).includes(currentStudentId),
  )
  const studentAssignments = (assignments ?? []).filter(
    (assignment) => assignment.classId === studentClass?.id,
  )

  const hasAttempted = (assignmentId: string) =>
    (attempts ?? []).some(
      (attempt) =>
        attempt.examAssignmentId === assignmentId &&
        attempt.studentId === currentStudentId &&
        attempt.status === 'graded',
    )

  const getExamStatus = (assignment: ExamAssignment) => {
    if (hasAttempted(assignment.id)) return 'completed'
    return assignment.status
  }

  const availableAssignments = (studentAssignments ?? []).filter(
    (assignment) =>
      !hasAttempted(assignment.id) &&
      (assignment.status === 'scheduled' || assignment.status === 'active'),
  )
  const completedAssignments = (studentAssignments ?? []).filter(
    (assignment) =>
      hasAttempted(assignment.id) ||
      assignment.status === 'completed' ||
      assignment.status === 'closed',
  )
  const displayedAssignments =
    activeTab === 'available' ? availableAssignments : completedAssignments
  const featuredExam = getFeaturedLocalExam(availableAssignments, exams)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold mb-1" style={{ color: '#1A1A2E' }}>
          Миний шалгалтууд
        </h1>
        <p className="text-[14px]" style={{ color: '#5A6474' }}>
          {studentClass?.name || 'Анги'} • Танд хуваарилагдсан шалгалтууд
        </p>
      </div>

      {featuredExam && <FeaturedExamCard exam={featuredExam} />}

      <StudentStatCards
        availableCount={availableAssignments.length}
        completedCount={completedAssignments.length}
        totalCount={studentAssignments.length}
      />

      <ExamTabFilter
        activeTab={activeTab}
        onTabChange={setActiveTab}
        availableCount={availableAssignments.length}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedAssignments.map((assignment) => {
          const exam = exams.find((item) => item.id === assignment.examId)
          if (!exam) return null

          return (
            <ExamAssignmentCard
              key={assignment.id}
              href={`/student/exams/${assignment.id}`}
              isDisabled={getExamStatus(assignment) === 'completed' || getExamStatus(assignment) === 'closed'}
              title={exam.title}
              subjectId={exam.subjectId}
              status={getExamStatus(assignment)}
              durationMinutes={exam.duration}
              questionCount={(exam.questionIds ?? []).length}
              teacherName={getTeacherName(exam.ownerId)}
              scheduledStart={formatMongolianShortDateTime(assignment.scheduledStart)}
            />
          )
        })}
      </div>

      {displayedAssignments.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: '#DDE1E7' }}>
          <FileText size={48} className="mx-auto mb-3" style={{ color: '#DDE1E7' }} strokeWidth={1} />
          <p className="text-[15px]" style={{ color: '#5A6474' }}>
            {activeTab === 'available'
              ? 'Одоогоор боломжтой шалгалт байхгүй байна.'
              : 'Дууссан шалгалт байхгүй байна.'}
          </p>
        </div>
      )}
    </div>
  )
}
