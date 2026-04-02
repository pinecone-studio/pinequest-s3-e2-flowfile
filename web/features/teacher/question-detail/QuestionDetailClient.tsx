'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Clock, FileText, Users, Calendar, Trash2 } from 'lucide-react'
import { getAll, CURRENT_TEACHER_ID } from '@/lib/data'
import type { Exam, User, Question } from '@/lib/types'
import { initialExams, initialUsers, initialQuestions, initialSubjects } from '@/lib/data'
import { COURSE_COLORS } from '@/lib/constants'
import { QUESTION_TYPE_LABELS } from '@/lib/types'
import { QuestionOptionList } from './_components/QuestionOptionList'
import { ExamBanner } from './_components/ExamBanner'

export function QuestionDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)

  useEffect(() => {
    const loadedExams = getAll<Exam>('exams'); const loadedUsers = getAll<User>('users'); const loadedQuestions = getAll<Question>('questions')
    if (loadedExams.length) setExams(loadedExams)
    if (loadedUsers.length) setUsers(loadedUsers)
    if (loadedQuestions.length) setQuestions(loadedQuestions)
  }, [])

  const exam = exams.find(e => e.id === id)
  const owner = exam ? users.find(u => u.id === exam.ownerId) || null : null
  const subject = exam ? initialSubjects.find(s => s.id === exam.subjectId) || null : null
  const subjectColor = exam ? (COURSE_COLORS[exam.subjectId] || COURSE_COLORS.default) : COURSE_COLORS.default
  const examQuestions = exam ? questions.filter(q => exam.questionIds.includes(q.id)) : []
  const isOwner = exam?.ownerId === CURRENT_TEACHER_ID

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })
  const getTotalPoints = () => examQuestions.reduce((sum, q) => sum + q.points, 0)
  const getQuestionTypeCounts = () => { const counts: Record<string, number> = {}; examQuestions.forEach(q => { counts[q.type] = (counts[q.type] || 0) + 1 }); return counts }

  if (!exam) return <div className="p-6"><div style={{ color: '#5A6474' }}>Шалгалт олдсонгүй...</div></div>

  const typeCounts = getQuestionTypeCounts()

  return (
    <div className="p-6 max-w-4xl">
      <Link href="/teacher/bank" className="inline-flex items-center gap-1 text-[13px] mb-4" style={{ color: '#0066FF' }}>
        <ChevronLeft size={16} strokeWidth={1.5} />Шалгалтын сан руу буцах
      </Link>

      <ExamBanner exam={exam} subject={subject} subjectColor={subjectColor} isOwner={isOwner} />

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: <Clock size={16} style={{ color: '#5A6474' }} strokeWidth={1.5} />, label: 'Хугацаа', value: `${exam.duration} мин` },
          { icon: <FileText size={16} style={{ color: '#5A6474' }} strokeWidth={1.5} />, label: 'Асуултын тоо', value: examQuestions.length },
          { icon: <Users size={16} style={{ color: '#5A6474' }} strokeWidth={1.5} />, label: 'Нийт оноо', value: getTotalPoints() },
          { icon: <Calendar size={16} style={{ color: '#5A6474' }} strokeWidth={1.5} />, label: 'Үүсгэсэн', value: formatDate(exam.createdAt) },
        ].map(({ icon, label, value }) => (
          <div key={label} className="bg-white border rounded-[10px] p-4" style={{ borderColor: '#DDE1E7' }}>
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[12px]" style={{ color: '#5A6474' }}>{label}</span></div>
            <div className="text-[20px] font-semibold" style={{ color: '#1A1A2E', fontSize: typeof value === 'string' && value.length > 8 ? '14px' : undefined }}>{value}</div>
          </div>
        ))}
      </div>

      {Object.keys(typeCounts).length > 0 && (
        <div className="bg-white border rounded-[10px] p-4 mb-6" style={{ borderColor: '#DDE1E7' }}>
          <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A2E' }}>Асуултын төрлөөр</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {Object.entries(typeCounts).map(([type, count]) => (
              <span key={type} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ backgroundColor: '#F5F7FA', color: '#5A6474' }}>
                {QUESTION_TYPE_LABELS[type as keyof typeof QUESTION_TYPE_LABELS] || type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-[10px] p-4 mb-6" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-medium" style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}>{owner?.name?.charAt(0) || '?'}</div>
          <div>
            <div className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>{owner?.name || 'Тодорхойгүй'}</div>
            <div className="text-[12px]" style={{ color: '#5A6474' }}>Зохиогч</div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
        <div className="p-4 border-b" style={{ borderColor: '#DDE1E7', backgroundColor: '#F5F7FA' }}>
          <h3 className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>Асуултууд ({examQuestions.length})</h3>
        </div>
        <div className="divide-y" style={{ borderColor: '#DDE1E7' }}>
          {examQuestions.map((question, index) => (
            <div key={question.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0" style={{ backgroundColor: '#0066FF', color: 'white' }}>{index + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}>{QUESTION_TYPE_LABELS[question.type] || question.type}</span>
                    <span className="text-[11px]" style={{ color: '#8A94A0' }}>{question.points} оноо</span>
                  </div>
                  <p className="text-[14px] mb-3" style={{ color: '#1A1A2E' }}>{question.text}</p>
                  <QuestionOptionList question={question} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {examQuestions.length === 0 && <div className="text-center py-12 text-[14px]" style={{ color: '#5A6474' }}>Асуулт нэмэгдээгүй байна</div>}
      </div>

      {isOwner && (
        <div className="mt-6 pt-6 border-t" style={{ borderColor: '#DDE1E7' }}>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] transition-colors hover:bg-red-50" style={{ color: '#C4272F' }}>
            <Trash2 size={14} strokeWidth={1.5} />Шалгалт устгах
          </button>
        </div>
      )}
    </div>
  )
}
