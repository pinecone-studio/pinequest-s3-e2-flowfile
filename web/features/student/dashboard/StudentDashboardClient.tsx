'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { fetchAssignedExams, type StudentExamSummary } from '@/lib/api/student-exams'
import { isApiConfigured } from '@/lib/api/client'
import { getAll, CURRENT_STUDENT_ID } from '@/lib/data'
import type { Exam, ExamAssignment, Attempt, User as UserType, SchoolClass } from '@/lib/types'
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

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return (
    date.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }) +
    ', ' +
    date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
  )
}

export function StudentDashboardClient() {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [assignments, setAssignments] = useState<ExamAssignment[]>(initialExamAssignments)
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts)
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses)
  const [assignedExams, setAssignedExams] = useState<StudentExamSummary[] | null>(null)
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available')

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

    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[24px] font-bold mb-1" style={{ color: '#1A1A2E' }}>
            Миний шалгалтууд
          </h1>
        </div>
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
              scheduledStart={formatDateTime(item.exam.startsAt ?? item.enrolledAt)}
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
    (cls.studentIds ?? []).includes(CURRENT_STUDENT_ID),
  )
  const studentAssignments = (assignments ?? []).filter(
    (assignment) => assignment.classId === studentClass?.id,
  )

  const hasAttempted = (assignmentId: string) =>
    (attempts ?? []).some(
      (attempt) =>
        attempt.examAssignmentId === assignmentId &&
        attempt.studentId === CURRENT_STUDENT_ID &&
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
              scheduledStart={formatDateTime(assignment.scheduledStart)}
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
