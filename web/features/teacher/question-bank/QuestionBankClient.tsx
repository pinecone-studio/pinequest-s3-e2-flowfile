'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CURRENT_TEACHER_ID, getAll, initialExams, initialQuestions, initialSubjects, initialUsers } from '@/lib/data'
import type { Exam, Question, Subject, User } from '@/lib/types'
import { ExamBankCard, getSubjectColor } from '@/components/cards'
import { QuestionBankFilters } from './_components/QuestionBankFilters'
import { QuestionBankSlideOver } from './_components/QuestionBankItem'
import { isApiConfigured } from '@/lib/api/teacher-exams'
import {
  fetchTeacherExamBankRecords,
  getTeacherExamMaxScore,
  mapLocalExamToTeacherExamBankRecord,
  type TeacherExamBankRecord,
} from '@/lib/teacher-exam-bank'

type LegacyExam = Exam & { courseId?: string }

export function QuestionBankClient() {
  const router = useRouter()
  const [exams, setExams] = useState<TeacherExamBankRecord[]>([])
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine'>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExam, setSelectedExam] = useState<TeacherExamBankRecord | null>(null)
  const [printExam, setPrintExam] = useState<TeacherExamBankRecord | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const loadLocalExams = () => {
      const loadedExams = getAll<LegacyExam>('exams')
      const loadedQuestions = getAll<Question>('questions')
      const loadedUsers = getAll<User>('users')
      const loadedSubjects = getAll<Subject>('subjects')
      const examPool = loadedExams.length ? loadedExams : initialExams
      const questionPool = loadedQuestions.length ? loadedQuestions : initialQuestions
      const userPool = loadedUsers.length ? loadedUsers : initialUsers
      const subjectPool = loadedSubjects.length ? loadedSubjects : initialSubjects

      if (loadedSubjects.length) setSubjects(loadedSubjects)

      if (!isCancelled) {
        setExams(
          examPool.map((exam) =>
            mapLocalExamToTeacherExamBankRecord(
              exam,
              questionPool,
              userPool,
              subjectPool,
            ),
          ),
        )
        setIsLoaded(true)
      }
    }

    const loadApiExams = async () => {
      try {
        const loadedSubjects = getAll<Subject>('subjects')
        const nextSubjects = loadedSubjects.length ? loadedSubjects : initialSubjects

        if (!isCancelled) {
          setSubjects(nextSubjects)
        }

        const records = await fetchTeacherExamBankRecords()

        if (!isCancelled) {
          setExams(records)
          setIsLoaded(true)
        }
      } catch {
        loadLocalExams()
      }
    }

    setIsLoaded(false)

    if (isApiConfigured()) {
      void loadApiExams()
    } else {
      loadLocalExams()
    }

    return () => {
      isCancelled = true
    }
  }, [])

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric' })

  useEffect(() => {
    if (!printExam) {
      return
    }

    const timeout = window.setTimeout(() => {
      window.print()
      setPrintExam(null)
    }, 150)

    return () => window.clearTimeout(timeout)
  }, [printExam])

  const yearOptions = Array.from(new Set(exams.map(exam => exam.createdAt.slice(0, 4)))).sort((a, b) => Number(b) - Number(a))
  const availableSubjects = subjects.filter(subject => exams.some(exam => exam.subjectId === subject.id))

  const filteredExams = exams.filter(exam => {
    const matchesSearch = searchQuery === '' || exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || exam.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedSubject !== 'all' && exam.subjectId !== selectedSubject) return false
    if (ownerFilter === 'mine' && exam.ownerId !== CURRENT_TEACHER_ID && exam.ownerId !== 'teacher-1') return false
    if (yearFilter !== 'all' && !exam.createdAt.startsWith(yearFilter)) return false
    if (!matchesSearch) return false
    return true
  })

  return (
    <div className="p-4 md:p-6">
      <div className="pb-4">
        <h1 className="mb-6 text-[22px] font-semibold text-foreground">Шалгалтын сан</h1>
        <QuestionBankFilters
          selectedSubject={selectedSubject}
          onSubjectChange={setSelectedSubject}
          ownerFilter={ownerFilter}
          onOwnerChange={setOwnerFilter}
          yearFilter={yearFilter}
          onYearChange={setYearFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          availableSubjects={availableSubjects}
          yearOptions={yearOptions}
        />
      </div>
      <div className="bg-white border border-card-border rounded-md overflow-hidden">
        {!isLoaded && (
          <div className="py-12 text-center text-text-secondary">Ачааллаж байна...</div>
        )}
        {filteredExams.map(exam => {
          const colors = getSubjectColor(exam.subjectName)
          return (
            <ExamBankCard
              key={exam.id}
              id={exam.id}
              title={exam.title}
              subjectName={exam.subjectName}
              subjectColor={colors.bg}
              subjectPattern={colors.pattern}
              chapter={exam.chapter}
              topic={exam.topic}
              ownerName={exam.ownerName}
              createdAt={formatDate(exam.createdAt)}
              questionCount={exam.questions.length}
              totalPoints={getTeacherExamMaxScore(exam)}
              visibility={exam.visibility}
              onView={() => setSelectedExam(exam)}
              onAssign={() => router.push(`/teacher/schedule?examId=${exam.id}`)}
              onPrint={() => {
                setSelectedExam(exam)
                setPrintExam(exam)
              }}
            />
          )
        })}
        {isLoaded && filteredExams.length === 0 && (
          <div className="text-center py-12 text-text-secondary">Шалгалт олдсонгүй.</div>
        )}
      </div>
      {selectedExam && (
        <QuestionBankSlideOver
          selectedExam={selectedExam}
          onClose={() => setSelectedExam(null)}
          formatDate={formatDate}
        />
      )}
      {printExam && (
        <div className="hidden print:block p-8">
          <h1 className="mb-2 text-2xl font-bold">{printExam.title}</h1>
          <div className="mb-4 text-sm text-slate-600">
            {printExam.subjectName} • {formatDate(printExam.createdAt)} • {getTeacherExamMaxScore(printExam)} оноо
          </div>
          <div className="space-y-4">
            {printExam.questions.map((question, index) => (
              <div key={question.id} className="break-inside-avoid rounded-lg border border-slate-300 p-4">
                <div className="mb-2 text-sm font-semibold">Асуулт {index + 1}</div>
                <div className="text-sm">{question.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
