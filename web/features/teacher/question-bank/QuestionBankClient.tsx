'use client'

import { useState, useEffect } from 'react'
import { CURRENT_TEACHER_ID, getAll } from '@/lib/data'
import type { Course, Exam, Question, Subject, User } from '@/lib/types'
import { initialCourses, initialExams, initialQuestions, initialSubjects, initialUsers } from '@/lib/data'
import { ExamBankCard, getSubjectColor } from '@/components/cards'
import { SUBJECT_NAMES } from '@/lib/constants'
import { QuestionBankFilters } from './_components/QuestionBankFilters'
import { QuestionBankSlideOver } from './_components/QuestionBankItem'

type LegacyExam = Exam & { courseId?: string }

export function QuestionBankClient() {
  const [exams, setExams] = useState<LegacyExam[]>(initialExams)
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine'>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExam, setSelectedExam] = useState<LegacyExam | null>(null)

  useEffect(() => {
    const loadedExams = getAll<LegacyExam>('exams')
    const loadedCourses = getAll<Course>('courses')
    const loadedQuestions = getAll<Question>('questions')
    const loadedUsers = getAll<User>('users')
    const loadedSubjects = getAll<Subject>('subjects')
    if (loadedExams.length) setExams(loadedExams)
    if (loadedCourses.length) setCourses(loadedCourses)
    if (loadedQuestions.length) setQuestions(loadedQuestions)
    if (loadedUsers.length) setUsers(loadedUsers)
    if (loadedSubjects.length) setSubjects(loadedSubjects)
  }, [])

  const getExamSubjectId = (exam: LegacyExam) =>
    exam.subjectId || courses.find(course => course.id === exam.courseId)?.subjectId || 'МАТ'

  const getSubjectName = (subjectId: string) =>
    subjects.find(s => s.id === subjectId)?.name || SUBJECT_NAMES[subjectId] || subjectId

  const getExamSubjectName = (exam: LegacyExam) => getSubjectName(getExamSubjectId(exam))
  const getOwnerName = (ownerId: string) => users.find(u => u.id === ownerId)?.name || '-'
  const getExamQuestions = (exam: Exam) => questions.filter(q => exam.questionIds.includes(q.id))
  const getTotalPoints = (exam: Exam) => getExamQuestions(exam).reduce((sum, q) => sum + q.points, 0)
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric' })

  const yearOptions = Array.from(new Set(exams.map(exam => exam.createdAt.slice(0, 4)))).sort((a, b) => Number(b) - Number(a))
  const availableSubjects = subjects.filter(subject => exams.some(exam => getExamSubjectId(exam) === subject.id))

  const filteredExams = exams.filter(exam => {
    const subjectName = getExamSubjectName(exam)
    const matchesSearch = searchQuery === '' || exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedSubject !== 'all' && getExamSubjectId(exam) !== selectedSubject) return false
    if (ownerFilter === 'mine' && exam.ownerId !== CURRENT_TEACHER_ID && exam.ownerId !== 'teacher-1') return false
    if (yearFilter !== 'all' && !exam.createdAt.startsWith(yearFilter)) return false
    if (!matchesSearch) return false
    return true
  })

  return (
    <div className="p-6">
      <h1 className="text-[22px] font-semibold text-foreground mb-6">Шалгалтын сан</h1>
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
      <div className="bg-white border border-card-border rounded-md overflow-hidden">
        {filteredExams.map(exam => {
          const subjectName = getExamSubjectName(exam)
          const colors = getSubjectColor(subjectName)
          const examQuestions = getExamQuestions(exam)
          return (
            <ExamBankCard
              key={exam.id}
              id={exam.id}
              title={exam.title}
              subjectName={subjectName}
              subjectColor={colors.bg}
              subjectPattern={colors.pattern}
              chapter={exam.chapter}
              topic={exam.topic}
              ownerName={getOwnerName(exam.ownerId)}
              createdAt={formatDate(exam.createdAt)}
              questionCount={examQuestions.length}
              totalPoints={getTotalPoints(exam)}
              visibility={exam.visibility as 'private' | 'school'}
              onView={() => setSelectedExam(exam)}
              onAssign={() => {}}
              onPrint={() => {}}
            />
          )
        })}
        {filteredExams.length === 0 && (
          <div className="text-center py-12 text-text-secondary">Шалгалт олдсонгүй.</div>
        )}
      </div>
      {selectedExam && (
        <QuestionBankSlideOver
          selectedExam={selectedExam}
          onClose={() => setSelectedExam(null)}
          getExamSubjectName={getExamSubjectName}
          getExamQuestions={getExamQuestions}
          formatDate={formatDate}
        />
      )}
    </div>
  )
}
