'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getAll, CURRENT_TEACHER_ID, initialClasses, initialExamAssignments, initialExams, initialQuestions, initialAttempts } from '@/lib/data'
import type { Attempt, Exam, ExamAssignment, Question, SchoolClass } from '@/lib/types'
import {
  fetchEnrollmentsByExam,
  fetchExamSessions,
  fetchMyExams,
  fetchQuestionsByExam,
  isApiConfigured,
  mapTeacherApiQuestionToLocalQuestion,
} from '@/lib/api/teacher-exams'
import { GradingExamCard } from './_components/GradingExamCard'

type GradingCardData = {
  examId: string
  classId: string
  title: string
  className: string
  manualCount: number
  stats: { submitted: number; graded: number; total: number }
}

function resolveApiClass(
  classes: SchoolClass[],
  studentIds: string[],
) {
  const ranked = classes
    .map((schoolClass) => ({
      schoolClass,
      overlap: studentIds.filter((studentId) =>
        schoolClass.studentIds.includes(studentId),
      ).length,
    }))
    .sort((left, right) => right.overlap - left.overlap)

  if ((ranked[0]?.overlap ?? 0) === 0) {
    return {
      id: 'api',
      name: 'Онлайн урсгал',
    }
  }

  return {
    id: ranked[0].schoolClass.id,
    name: ranked[0].schoolClass.name,
  }
}

export function GradingHubClient() {
  const [cards, setCards] = useState<GradingCardData[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadLocalCards = () => {
      const exams = getAll<Exam>('exams').length ? getAll<Exam>('exams') : initialExams
      const assignments = getAll<ExamAssignment>('examAssignments').length
        ? getAll<ExamAssignment>('examAssignments')
        : initialExamAssignments
      const attempts = getAll<Attempt>('attempts').length
        ? getAll<Attempt>('attempts')
        : initialAttempts
      const classes = getAll<SchoolClass>('classes').length
        ? getAll<SchoolClass>('classes')
        : initialClasses
      const questions = getAll<Question>('questions').length
        ? getAll<Question>('questions')
        : initialQuestions

      const localCards = assignments
        .filter((assignment) => assignment.assignedBy === CURRENT_TEACHER_ID)
        .filter((assignment) => assignment.status === 'closed')
        .map<GradingCardData | null>((assignment) => {
          const exam = exams.find((item) => item.id === assignment.examId)
          const schoolClass = classes.find((item) => item.id === assignment.classId)

          if (!exam || !schoolClass) {
            return null
          }

          const examQuestions = questions.filter((question) =>
            exam.questionIds.includes(question.id),
          )
          const manualCount = examQuestions.filter(
            (question) => question.isManualGrade,
          ).length

          if (manualCount === 0) {
            return null
          }

          const examAttempts = attempts.filter(
            (attempt) => attempt.examAssignmentId === assignment.id,
          )
          const submitted = examAttempts.filter(
            (attempt) => attempt.status === 'submitted',
          ).length
          const graded = examAttempts.filter(
            (attempt) => attempt.status === 'graded',
          ).length

          if (submitted === 0) {
            return null
          }

          return {
            examId: exam.id,
            classId: schoolClass.id,
            title: exam.title,
            className: schoolClass.name,
            manualCount,
            stats: {
              submitted,
              graded,
              total: submitted + graded,
            },
          }
        })
        .filter((item): item is GradingCardData => item !== null)

      if (!isCancelled) {
        setCards(localCards)
        setIsLoaded(true)
      }
    }

    const loadApiCards = async () => {
      try {
        const classes = getAll<SchoolClass>('classes').length
          ? getAll<SchoolClass>('classes')
          : initialClasses
        const exams = await fetchMyExams()
        const cardPayloads = await Promise.all(
          exams.map(async (exam) => {
            const [questionRows, sessions, enrollments] = await Promise.all([
              fetchQuestionsByExam(exam.id),
              fetchExamSessions(exam.id),
              fetchEnrollmentsByExam(exam.id),
            ])

            const manualCount = questionRows
              .map(mapTeacherApiQuestionToLocalQuestion)
              .filter((question) => question.isManualGrade).length

            if (manualCount === 0) {
              return null
            }

            const relevantSessions = sessions.filter(
              (session) =>
                session.status === 'submitted' ||
                session.status === 'force_submitted' ||
                session.status === 'graded',
            )
            const submitted = relevantSessions.filter(
              (session) =>
                session.status === 'submitted' || session.status === 'force_submitted',
            ).length
            const graded = relevantSessions.filter(
              (session) => session.status === 'graded',
            ).length

            if (submitted === 0) {
              return null
            }

            const resolvedClass = resolveApiClass(
              classes,
              enrollments.map((enrollment) => enrollment.studentId),
            )

            return {
              examId: exam.id,
              classId: resolvedClass.id,
              title: exam.title,
              className: resolvedClass.name,
              manualCount,
              stats: {
                submitted,
                graded,
                total: submitted + graded,
              },
            } satisfies GradingCardData
          }),
        )

        if (!isCancelled) {
          setCards(cardPayloads.filter((item): item is GradingCardData => item !== null))
        }
      } catch {
        loadLocalCards()
        return
      }

      if (!isCancelled) {
        setIsLoaded(true)
      }
    }

    setIsLoaded(false)

    if (isApiConfigured()) {
      void loadApiCards()
    } else {
      loadLocalCards()
    }

    return () => {
      isCancelled = true
    }
  }, [])

  const pendingCount = cards.length

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>Үнэлгээ</h1>
        <p className="text-[13px]" style={{ color: '#5A6474' }}>Гараар үнэлэх шаардлагатай шалгалтууд</p>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg mb-6" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
          <AlertTriangle size={20} style={{ color: '#B45309' }} strokeWidth={1.5} />
          <p className="text-[14px]" style={{ color: '#B45309' }}>
            Үнэлгээ хүлээж буй <span className="font-semibold">{pendingCount}</span> шалгалт байна
          </p>
        </div>
      )}

      {!isLoaded ? (
        <div className="bg-white border rounded-[10px] py-16 text-center" style={{ borderColor: '#DDE1E7' }}>
          <p className="text-[13px]" style={{ color: '#5A6474' }}>Ачааллаж байна...</p>
        </div>
      ) : pendingCount > 0 ? (
        <div className="space-y-3">
          {cards.map((card) => (
            <GradingExamCard
              key={`${card.examId}:${card.classId}`}
              examId={card.examId}
              classId={card.classId}
              title={card.title}
              className={card.className}
              manualCount={card.manualCount}
              stats={card.stats}
            />
          ))}
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
