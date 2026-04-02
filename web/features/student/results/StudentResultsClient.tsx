'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trophy, CheckCircle, Clock } from 'lucide-react'
import { getAll } from '@/lib/data'
import type { Exam, Result, Question, Attempt } from '@/lib/types'
import { initialExams, initialResults, initialQuestions, initialAttempts, CURRENT_STUDENT_ID } from '@/lib/data'
import { ResultExamList } from './_components/ResultExamList'
import { ResultDetail } from './_components/ResultDetail'

export function StudentResultsClient() {
  const searchParams = useSearchParams()
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [results, setResults] = useState<Result[]>(initialResults)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [attempts, setAttempts] = useState<Attempt[]>(initialAttempts)
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null)

  const currentStudentId = CURRENT_STUDENT_ID

  useEffect(() => {
    const loadedExams = getAll<Exam>('exams'); const loadedResults = getAll<Result>('results')
    const loadedQuestions = getAll<Question>('questions'); const loadedAttempts = getAll<Attempt>('attempts')
    if (loadedExams.length) setExams(loadedExams)
    if (loadedResults.length) setResults(loadedResults)
    if (loadedQuestions.length) setQuestions(loadedQuestions)
    if (loadedAttempts.length) setAttempts(loadedAttempts)
    const studentResults = (loadedResults.length ? loadedResults : initialResults).filter(r => r.studentId === currentStudentId)
    if (studentResults.length > 0 && !selectedResultId) setSelectedResultId(studentResults[0].id)
  }, [])

  const studentResults = results.filter(r => r.studentId === currentStudentId)
  const requestedExamId = searchParams.get('examId')
  const selectedResult =
    results.find(r => r.id === selectedResultId) ||
    (requestedExamId
      ? studentResults.find(r => r.examId === requestedExamId) || null
      : null)
  const selectedExam = selectedResult
    ? exams.find(e => e.id === selectedResult.examId) || null
    : requestedExamId
      ? exams.find(e => e.id === requestedExamId) || null
      : null
  const selectedAttempt = selectedResult
    ? attempts.find(a => a.id === selectedResult.attemptId) || null
    : requestedExamId
      ? attempts
          .filter(a => a.examId === requestedExamId && a.studentId === currentStudentId)
          .sort((a, b) => {
            const left = a.submittedAt || a.endedAt || a.startedAt
            const right = b.submittedAt || b.endedAt || b.startedAt
            return new Date(right).getTime() - new Date(left).getTime()
          })[0] || null
      : null
  const getExam = (examId: string) => exams.find(e => e.id === examId)
  const getExamQuestions = (exam: Exam) => questions.filter(q => exam.questionIds.includes(q.id))
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric' })
  const publishedResults = studentResults.filter(r => r.isPublished)
  const avgScore = publishedResults.length > 0 ? Math.round(publishedResults.reduce((sum, r) => sum + (r.totalScore / r.maxScore) * 100, 0) / publishedResults.length) : 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-foreground mb-1">Үр дүн</h1>
        <p className="text-[14px] text-text-secondary">Таны шалгалтын үр дүнгүүд</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: <Trophy size={20} className="text-blue-600" strokeWidth={1.5} />, iconBg: 'bg-blue-100', label: 'Дундаж оноо', value: `${avgScore}%` },
          { icon: <CheckCircle size={20} className="text-green-600" strokeWidth={1.5} />, iconBg: 'bg-green-100', label: 'Нийтлэгдсэн', value: publishedResults.length },
          { icon: <Clock size={20} className="text-amber-600" strokeWidth={1.5} />, iconBg: 'bg-amber-100', label: 'Хүлээгдэж буй', value: studentResults.length - publishedResults.length },
        ].map(({ icon, iconBg, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-card-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</div>
              <div className="text-[13px] text-text-secondary">{label}</div>
            </div>
            <div className="text-[28px] font-bold text-foreground">{value}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full shrink-0 lg:w-[300px]">
          <ResultExamList studentResults={studentResults} selectedResultId={selectedResultId} getExam={getExam} attempts={attempts} formatDate={formatDate} onSelect={setSelectedResultId} />
        </div>
        <div className="flex-1">
          <ResultDetail
            selectedResult={selectedResult}
            selectedExam={selectedExam}
            selectedAttempt={selectedAttempt}
            examQuestions={selectedExam ? getExamQuestions(selectedExam) : []}
          />
        </div>
      </div>
    </div>
  )
}
