'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getAll, CURRENT_TEACHER_ID } from '@/lib/data'
import type { Exam, ExamAssignment, Attempt, SchoolClass, Question } from '@/lib/types'
import { initialExams, initialExamAssignments, initialAttempts, initialClasses, initialQuestions } from '@/lib/data'
import { GradingExamCard } from './_components/GradingExamCard'

export function GradingHubClient() {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [assignments, setAssignments] = useState<ExamAssignment[]>(initialExamAssignments)
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts)
  const [classes, setClasses] = useState<SchoolClass[]>(initialClasses)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)

  useEffect(() => {
    const loadedExams = getAll<Exam>('exams')
    const loadedAssignments = getAll<ExamAssignment>('examAssignments')
    const loadedAttempts = getAll<Attempt>('attempts')
    const loadedClasses = getAll<SchoolClass>('classes')
    const loadedQuestions = getAll<Question>('questions')
    if (loadedExams.length) setExams(loadedExams)
    if (loadedAssignments.length) setAssignments(loadedAssignments)
    if (loadedAttempts.length) setAttempts(loadedAttempts)
    if (loadedClasses.length) setClasses(loadedClasses)
    if (loadedQuestions.length) setQuestions(loadedQuestions)
  }, [])

  const getExam = (examId: string) => exams.find(e => e.id === examId)
  const getClass = (classId: string) => classes.find(c => c.id === classId)

  const getManualQuestionCount = (exam: Exam) => {
    const examQuestions = questions.filter(q => exam.questionIds.includes(q.id))
    return examQuestions.filter(q => q.isManualGrade).length
  }

  const assignmentsNeedingGrading = assignments.filter(assignment => {
    if (assignment.assignedBy !== CURRENT_TEACHER_ID) return false
    if (assignment.status !== 'closed') return false
    const exam = getExam(assignment.examId)
    if (!exam) return false
    if (getManualQuestionCount(exam) === 0) return false
    const assignmentAttempts = attempts.filter(a => a.examAssignmentId === assignment.id && a.status === 'submitted')
    return assignmentAttempts.length > 0
  })

  const getGradingStats = (assignmentId: string) => {
    const assignmentAttempts = attempts.filter(a => a.examAssignmentId === assignmentId)
    const submitted = assignmentAttempts.filter(a => a.status === 'submitted').length
    const graded = assignmentAttempts.filter(a => a.status === 'graded').length
    return { submitted, graded, total: submitted + graded }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>Үнэлгээ</h1>
        <p className="text-[13px]" style={{ color: '#5A6474' }}>Гараар үнэлэх шаардлагатай шалгалтууд</p>
      </div>

      {assignmentsNeedingGrading.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg mb-6" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
          <AlertTriangle size={20} style={{ color: '#B45309' }} strokeWidth={1.5} />
          <p className="text-[14px]" style={{ color: '#B45309' }}>
            Үнэлгээ хүлээж буй <span className="font-semibold">{assignmentsNeedingGrading.length}</span> шалгалт байна
          </p>
        </div>
      )}

      {assignmentsNeedingGrading.length > 0 ? (
        <div className="space-y-3">
          {assignmentsNeedingGrading.map(assignment => {
            const exam = getExam(assignment.examId)
            const cls = getClass(assignment.classId)
            const stats = getGradingStats(assignment.id)
            const manualCount = exam ? getManualQuestionCount(exam) : 0
            if (!exam || !cls) return null
            return (
              <GradingExamCard
                key={assignment.id}
                examId={exam.id}
                classId={cls.id}
                exam={exam}
                cls={cls}
                manualCount={manualCount}
                stats={stats}
              />
            )
          })}
        </div>
      ) : (
        <div className="bg-white border rounded-[10px] py-16 text-center" style={{ borderColor: '#DDE1E7' }}>
          <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: '#1A7A4A' }} strokeWidth={1} />
          <h3 className="text-[16px] font-medium mb-1" style={{ color: '#1A1A2E' }}>Бүх шалгалт үнэлэгдсэн байна</h3>
          <p className="text-[13px]" style={{ color: '#5A6474' }}>Одоогоор гараар үнэлэх шалгалт байхгүй байна.</p>
        </div>
      )}
    </div>
  )
}
