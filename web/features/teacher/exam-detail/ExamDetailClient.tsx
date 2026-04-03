'use client'
import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  initialExamAssignments, initialExams, initialClasses, initialCourses,
  initialAttempts, initialResults, initialQuestions, initialUsers, CURRENT_TEACHER_ID,
} from '@/lib/data'
import { SUBJECT_NAMES } from '@/lib/constants'
import { fetchExamDetail, isApiConfigured, type ExamDetailResponse } from '@/lib/api/teacher-exams'
import { computeVisualStage, type VisualStage } from './examStageUtils'
import { ExamLifecycleBar } from './_components/ExamLifecycleBar'
import { ExamStatusTabContent } from './_components/ExamStatusTabContent'
import type { Attempt, Question } from '@/lib/types'

export function ExamDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const assignment = initialExamAssignments.find(ea => ea.id === id)
  const exam = assignment ? initialExams.find(e => e.id === assignment.examId) : undefined
  const cls = assignment ? initialClasses.find(c => c.id === assignment.classId) : undefined
  const course = cls ? initialCourses.find(c => (c.classIds ?? []).includes(cls.id)) : undefined
  const subjectName = course ? (SUBJECT_NAMES[course.subjectId] || course.subjectId) : ''
  const classStudents = cls ? initialUsers.filter(u => u.role === 'student' && (cls.studentIds ?? []).includes(u.id)) : []

  const localAttempts = initialAttempts.filter(a => a.examAssignmentId === id || a.assignmentId === id)
  const [apiData, setApiData] = useState<ExamDetailResponse | null>(null)
  const [activeStage, setActiveStage] = useState<VisualStage>(() =>
    computeVisualStage(
      assignment ?? { status: 'draft', scheduledStart: '', scheduledEnd: '' },
      localAttempts.map(a => ({ status: a.status ?? 'in_progress', score: a.earnedPoints ?? null })),
      classStudents.length,
    )
  )

  const loadApiData = useCallback(() => {
    if (!isApiConfigured()) return
    fetchExamDetail(id).then(data => {
      setApiData(data)
      setActiveStage(data.visualStage as VisualStage)
    }).catch(() => null)
  }, [id])

  useEffect(() => {
    loadApiData()
    const iv = setInterval(loadApiData, 15000)
    return () => clearInterval(iv)
  }, [loadApiData])

  if (!assignment || !exam || !cls) {
    return <div className="p-6 text-[14px]" style={{ color: '#5A6474' }}>Шалгалт олдсонгүй...</div>
  }

  const attempts: Attempt[] = apiData
    ? apiData.sessions.map(s => ({
        id: s.id, examId: exam.id, assignmentId: id, examAssignmentId: id,
        studentId: s.studentId, answers: {}, startedAt: s.startedAt ?? '',
        submittedAt: s.submittedAt ?? undefined, isComplete: s.status !== 'in_progress',
        timeSpentSeconds: 0, status: s.status === 'force_submitted' ? 'submitted' : s.status as 'in_progress'|'submitted'|'graded',
        earnedPoints: s.score ?? undefined,
      }))
    : localAttempts

  const results = initialResults.filter(r => r.examAssignmentId === id)

  const questions: Question[] = apiData
    ? apiData.questions.map(q => ({
        id: q.id, examId: exam.id, text: q.content,
        type: q.inputType === 'mcq' ? 'single' : 'short' as Question['type'],
        points: q.points, order: q.orderIndex, isManualGrade: q.inputType !== 'mcq',
        options: q.optionsJson ? JSON.parse(q.optionsJson) : undefined,
        correctAnswer: q.correctAnswer ?? undefined,
      }))
    : initialQuestions.filter(q => (exam.questionIds ?? []).includes(q.id))

  const currentStage = apiData
    ? (apiData.visualStage as VisualStage)
    : computeVisualStage(
        assignment,
        attempts.map(a => ({ status: a.status ?? 'in_progress', score: a.earnedPoints ?? null })),
        classStudents.length,
      )

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: '#F5F7FA' }}>
      <div className="px-6 pt-4 pb-3 bg-white border-b" style={{ borderColor: '#DDE1E7' }}>
        <div className="text-[12px] font-medium mb-1" style={{ color: '#0066FF' }}>2026 • 1-р улирал • Эхний хагас</div>
        <div className="flex items-center gap-1.5 text-[13px] mb-2" style={{ color: '#5A6474' }}>
          <button onClick={() => router.push('/teacher/exams')} className="hover:underline">Шалгалтууд</button>
          <span>›</span><span>{subjectName}</span><span>›</span>
          <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{cls.name}</span>
        </div>
        <div className="text-[18px] font-semibold" style={{ color: '#1A1A2E' }}>{exam.title}</div>
      </div>
      <div className="bg-white border-b px-6 py-5" style={{ borderColor: '#DDE1E7' }}>
        <ExamLifecycleBar currentStage={currentStage} activeStage={activeStage} onSelect={setActiveStage} />
      </div>
      <div className="flex-1 px-6 py-5 overflow-auto">
        <ExamStatusTabContent
          stage={activeStage} currentStage={currentStage} assignment={assignment}
          exam={exam} cls={cls} classStudents={classStudents} attempts={attempts}
          results={results} questions={questions} apiData={apiData} onRefresh={loadApiData}
        />
      </div>
    </div>
  )
}
