'use client'

import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { getAll, CURRENT_STUDENT_ID } from '@/lib/data'
import type { Exam, ExamAssignment, Attempt, User as UserType, SchoolClass } from '@/lib/types'
import { initialExams, initialExamAssignments, initialAttempts, initialUsers, initialClasses, initialSubjects } from '@/lib/data'
import { StudentStatCards } from './_components/StudentStatCards'
import { ExamTabFilter } from './_components/ExamTabFilter'
import { ExamAssignmentCard } from './_components/ExamAssignmentCard'

export function StudentDashboardClient() {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [assignments, setAssignments] = useState<ExamAssignment[]>(initialExamAssignments)
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts)
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses)
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available')

  useEffect(() => {
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
  }, [])

  const getSubject = (subjectId: string) => (initialSubjects ?? []).find(s => s.id === subjectId)
  const getTeacherName = (ownerId: string) => (users ?? []).find(u => u.id === ownerId)?.name || '-'
  const studentClass = (classes ?? []).find(c => (c.studentIds ?? []).includes(CURRENT_STUDENT_ID))
  const studentAssignments = (assignments ?? []).filter(a => a.classId === studentClass?.id)

  const hasAttempted = (assignmentId: string) =>
    (attempts ?? []).some(a => a.examAssignmentId === assignmentId && a.studentId === CURRENT_STUDENT_ID && a.status === 'graded')

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }) + ', ' +
      date.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })
  }

  const getExamStatus = (assignment: ExamAssignment): string => {
    if (hasAttempted(assignment.id)) return 'completed'
    return assignment.status
  }

  const availableAssignments = (studentAssignments ?? []).filter(a =>
    !hasAttempted(a.id) && (a.status === 'scheduled' || a.status === 'active')
  )
  const completedAssignments = (studentAssignments ?? []).filter(a =>
    hasAttempted(a.id) || a.status === 'completed' || a.status === 'closed'
  )
  const displayedAssignments = activeTab === 'available' ? availableAssignments : completedAssignments

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold mb-1" style={{ color: '#1A1A2E' }}>Миний шалгалтууд</h1>
        <p className="text-[14px]" style={{ color: '#5A6474' }}>
          {studentClass?.name || 'Анги'} • Танд хуваарилагдсан шалгалтууд
        </p>
      </div>

      <StudentStatCards
        availableCount={availableAssignments.length}
        completedCount={completedAssignments.length}
        totalCount={studentAssignments.length}
      />

      <ExamTabFilter activeTab={activeTab} onTabChange={setActiveTab} availableCount={availableAssignments.length} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedAssignments.map(assignment => {
          const exam = exams.find(e => e.id === assignment.examId)
          if (!exam) return null
          const subject = getSubject(exam.subjectId)
          const assignmentStatus = getExamStatus(assignment)
          return (
            <ExamAssignmentCard
              key={assignment.id}
              assignment={assignment}
              exam={exam}
              subject={subject}
              assignmentStatus={assignmentStatus}
              getTeacherName={getTeacherName}
              formatDateTime={formatDateTime}
            />
          )
        })}
      </div>

      {displayedAssignments.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border" style={{ borderColor: '#DDE1E7' }}>
          <FileText size={48} className="mx-auto mb-3" style={{ color: '#DDE1E7' }} strokeWidth={1} />
          <p className="text-[15px]" style={{ color: '#5A6474' }}>
            {activeTab === 'available' ? 'Одоогоор боломжтой шалгалт байхгүй байна.' : 'Дууссан шалгалт байхгүй байна.'}
          </p>
        </div>
      )}
    </div>
  )
}
