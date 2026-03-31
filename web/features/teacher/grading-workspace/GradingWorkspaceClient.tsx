'use client'

import { useState, useEffect, use } from 'react'
import { ChevronLeft, ChevronRight, FileText, Send } from 'lucide-react'
import { getAll } from '@/lib/data'
import type { Exam, User as UserType, Submission, Question } from '@/lib/types'
import { initialExams, initialUsers, initialSubmissions, initialQuestions } from '@/lib/data'
import { GradingNavBar } from './_components/GradingNavBar'
import { AnswerPanel } from './_components/AnswerPanel'
import { ScoringPanel } from './_components/ScoringPanel'
import { GradingStudentSidebar } from './_components/GradingStudentSidebar'

type LegacySubmission = Submission & { status?: string; submittedAt?: string; studentId: string }

export function GradingWorkspaceClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [exam, setExam] = useState<Exam | null>(null)
  const [students, setStudents] = useState<UserType[]>([])
  const [submissions, setSubmissions] = useState<LegacySubmission[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [feedback, setFeedback] = useState<Record<string, { score: number; comment: string }>>({})

  useEffect(() => {
    const loadedExams = getAll<Exam>('exams')
    const allExams = loadedExams.length ? loadedExams : initialExams
    const foundExam = allExams.find(e => e.id === id)
    if (foundExam) {
      setExam(foundExam)
      const loadedQuestions = getAll<Question>('questions')
      const allQuestions = loadedQuestions.length ? loadedQuestions : initialQuestions
      setQuestions(allQuestions.filter(q => foundExam.questionIds.includes(q.id)))
      const loadedSubmissions = getAll<LegacySubmission>('submissions')
      const allSubmissions = (loadedSubmissions.length ? loadedSubmissions : initialSubmissions) as LegacySubmission[]
      const examSubmissions = allSubmissions.filter(s => s.examId === id)
      setSubmissions(examSubmissions)
      const loadedStudents = getAll<UserType>('students')
      const allStudents = loadedStudents.length ? loadedStudents : initialUsers.filter(u => u.role === 'student')
      const studentIds = examSubmissions.map(s => s.studentId)
      const examStudents = allStudents.filter(s => studentIds.includes(s.id))
      setStudents(examStudents)
      if (examStudents.length > 0) setSelectedStudentId(examStudents[0].id)
    }
  }, [id])

  if (!exam) return <div className="flex items-center justify-center h-[calc(100vh-36px)]"><div className="text-text-secondary">Ачааллаж байна...</div></div>

  const selectedStudent = students.find(s => s.id === selectedStudentId)
  const selectedSubmission = submissions.find(s => s.studentId === selectedStudentId)
  const currentQuestion = questions[currentQuestionIndex]
  const getStudentAnswer = (questionId: string) => selectedSubmission ? (selectedSubmission as LegacySubmission & { answers?: { questionId: string; answer: string | string[] }[] }).answers?.find(a => a.questionId === questionId) || null : null
  const currentAnswer = currentQuestion ? getStudentAnswer(currentQuestion.id) : null
  const handleScoreChange = (questionId: string, score: number) => setFeedback(prev => ({ ...prev, [questionId]: { ...prev[questionId], score, comment: prev[questionId]?.comment || '' } }))
  const handleCommentChange = (questionId: string, comment: string) => setFeedback(prev => ({ ...prev, [questionId]: { score: prev[questionId]?.score || 0, comment } }))
  const totalScore = Object.values(feedback).reduce((sum, f) => sum + f.score, 0)
  const maxScore = questions.reduce((sum, q) => sum + (q.points || 0), 0)
  const gradedCount = submissions.filter(s => s.status === 'graded').length
  const needsGradingCount = submissions.filter(s => s.status === 'submitted').length

  return (
    <div className="flex h-[calc(100vh-36px)]">
      <GradingStudentSidebar exam={exam} students={students} submissions={submissions as Submission[]} selectedStudentId={selectedStudentId} gradedCount={gradedCount} needsGradingCount={needsGradingCount} onSelect={setSelectedStudentId} />
      <div className="flex-1 flex flex-col bg-page-bg">
        {selectedStudent && selectedSubmission ? (
          <>
            <div className="px-6 py-4 bg-white border-b border-card-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-[14px] font-semibold text-primary">{selectedStudent.name.charAt(0)}</div>
                <div>
                  <h2 className="text-[15px] font-semibold text-foreground">{selectedStudent.name}</h2>
                  <div className="flex items-center gap-3 text-[12px] text-text-secondary">
                    <span>{(selectedStudent as UserType & { studentId?: string }).studentId}</span><span>•</span>
                    <span>Өгсөн: {new Date(selectedSubmission.submittedAt || '').toLocaleString('mn-MN')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-text-secondary">Нийт оноо</div>
                  <div className="text-[18px] font-bold text-foreground">{totalScore} <span className="text-[14px] font-normal text-text-secondary">/ {maxScore}</span></div>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-[13px] font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5"><Send size={14} strokeWidth={1.5} />Дүн илгээх</button>
              </div>
            </div>
            <GradingNavBar questions={questions} feedback={feedback} currentQuestionIndex={currentQuestionIndex} onSelect={setCurrentQuestionIndex} />
            <div className="flex-1 overflow-y-auto p-6">
              {currentQuestion && (
                <div className="max-w-3xl mx-auto">
                  <AnswerPanel currentQuestion={currentQuestion} currentQuestionIndex={currentQuestionIndex} currentAnswer={currentAnswer} />
                  <ScoringPanel currentQuestion={currentQuestion} feedback={feedback} onScoreChange={handleScoreChange} onCommentChange={handleCommentChange} />
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-white border-t border-card-border flex items-center justify-between">
              <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} className="px-4 py-2 border border-card-border rounded-lg text-[13px] font-medium text-foreground hover:bg-table-header transition-colors disabled:opacity-50 flex items-center gap-1.5"><ChevronLeft size={14} strokeWidth={1.5} />Өмнөх</button>
              <span className="text-[13px] text-text-secondary">{currentQuestionIndex + 1} / {questions.length}</span>
              <button onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentQuestionIndex === questions.length - 1} className="px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5">Дараах<ChevronRight size={14} strokeWidth={1.5} /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><FileText size={48} className="mx-auto text-card-border mb-3" strokeWidth={1} /><p className="text-text-secondary">Сурагч сонгоно уу</p></div>
          </div>
        )}
      </div>
    </div>
  )
}
