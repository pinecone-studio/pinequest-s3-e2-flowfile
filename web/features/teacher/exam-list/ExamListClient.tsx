'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Plus, Radio, Search } from 'lucide-react'
import { initialExamAssignments, initialExams, initialClasses, initialCourses, initialResults, CURRENT_TEACHER_ID } from '@/lib/data'
import { ExamCard } from './_components/ExamCard'
import { fetchMyExams, isApiConfigured, type TeacherExam } from '@/lib/api/teacher-exams'

type FilterTab = 'all' | 'scheduled' | 'active' | 'closed'

export function ExamListClient() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [apiExams, setApiExams] = useState<TeacherExam[] | null>(null)

  useEffect(() => {
    if (!isApiConfigured()) return
    fetchMyExams().then(setApiExams).catch(() => null)
  }, [])

  const teacherAssignments = (initialExamAssignments ?? []).filter(ea => ea.assignedBy === CURRENT_TEACHER_ID)

  const filteredAssignments = teacherAssignments.filter(ea => {
    if (activeTab !== 'all' && ea.status !== activeTab) return false
    if (!searchQuery) return true
    const exam = (initialExams ?? []).find(e => e.id === ea.examId)
    const cls = (initialClasses ?? []).find(c => c.id === ea.classId)
    const searchLower = searchQuery.toLowerCase()
    return exam?.title?.toLowerCase().includes(searchLower) || cls?.name?.toLowerCase().includes(searchLower)
  })

  const getExam = (examId: string) => (initialExams ?? []).find(e => e.id === examId)
  const getClass = (classId: string) => (initialClasses ?? []).find(c => c.id === classId)
  const getCourse = (classId: string) => {
    const cls = getClass(classId)
    if (!cls) return null
    return (initialCourses ?? []).find(c => (c.classIds ?? []).includes(cls.id)) || null
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })

  const getExamStats = (assignmentId: string) => {
    const cls = (initialClasses ?? []).find(c => {
      const assignment = (initialExamAssignments ?? []).find(ea => ea.id === assignmentId)
      return assignment && c.id === assignment?.classId
    })
    const examResults = (initialResults ?? []).filter(r => r.examAssignmentId === assignmentId)
    if (examResults.length === 0) return null
    const scores = examResults.map(r => r.percentage ?? 0)
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    return { avg, completed: examResults.length, total: (cls?.studentIds ?? []).length }
  }

  const counts = {
    all: teacherAssignments.length,
    scheduled: teacherAssignments.filter(ea => ea.status === 'scheduled').length,
    active: teacherAssignments.filter(ea => ea.status === 'active').length,
    closed: teacherAssignments.filter(ea => ea.status === 'closed').length,
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'Бүгд' },
    { key: 'scheduled', label: 'Төлөвлөсөн' },
    { key: 'active', label: 'Идэвхтэй' },
    { key: 'closed', label: 'Дууссан' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>Авсан шалгалтууд</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/quizzes"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium border transition-colors"
            style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}
          >
            <Radio size={16} strokeWidth={2} />Шуурхай quiz
          </Link>
          <Link
            href="/teacher/exams/create"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium text-white transition-colors"
            style={{ backgroundColor: '#0066FF' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0052CC' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0066FF' }}
          >
            <Plus size={16} strokeWidth={2} />Шалгалт үүсгэх
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#8A94A0' }} />
          <input
            type="text"
            placeholder="Шалгалт хайх..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border text-[14px] focus:outline-none focus:ring-2"
            style={{ borderColor: '#DDE1E7', backgroundColor: 'white' }}
          />
        </div>
      </div>

      <div className="border-b mb-6" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn('px-4 py-2.5 text-[14px] border-b-2 transition-colors', activeTab === tab.key ? 'font-medium' : '')}
              style={activeTab === tab.key ? { color: '#0066FF', borderColor: '#0066FF' } : { color: '#5A6474', borderColor: 'transparent' }}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: activeTab === tab.key ? '#EBF2FF' : '#F0F2F5', color: activeTab === tab.key ? '#0066FF' : '#5A6474' }}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {apiExams !== null ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiExams
              .filter(exam => {
                if (activeTab !== 'all' && exam.status !== activeTab) return false
                if (!searchQuery) return true
                return exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  exam.subject.toLowerCase().includes(searchQuery.toLowerCase())
              })
              .map(exam => (
                <div key={exam.id} className="bg-white border rounded-[10px] p-4" style={{ borderColor: '#DDE1E7' }}>
                  <div className="font-medium text-[15px] mb-1" style={{ color: '#1A1A2E' }}>{exam.title}</div>
                  <div className="text-[13px] mb-2" style={{ color: '#5A6474' }}>{exam.subject}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}>{exam.status}</span>
                    <span className="text-[12px]" style={{ color: '#8A94A0' }}>{exam.durationMinutes} мин</span>
                  </div>
                  {exam.startsAt && (
                    <div className="text-[12px] mt-2" style={{ color: '#8A94A0' }}>{formatDate(exam.startsAt)}</div>
                  )}
                </div>
              ))}
          </div>
          {apiExams.length === 0 && (
            <div className="text-center py-12" style={{ color: '#5A6474' }}>
              Шалгалт бүртгэгдээгүй байна.
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map(assignment => {
              const exam = getExam(assignment.examId)
              const cls = getClass(assignment.classId)
              const course = getCourse(assignment.classId)
              const stats = assignment.status === 'closed' ? getExamStats(assignment.id) : null
              if (!exam || !cls) return null
              return (
                <ExamCard
                  key={assignment.id}
                  assignment={assignment}
                  exam={exam}
                  cls={cls}
                  course={course}
                  stats={stats}
                  formatDate={formatDate}
                />
              )
            })}
          </div>
          {filteredAssignments.length === 0 && (
            <div className="text-center py-12" style={{ color: '#5A6474' }}>
              {searchQuery ? 'Хайлтанд тохирох шалгалт олдсонгүй.' : 'Шалгалт бүртгэгдээгүй байна.'}
            </div>
          )}
        </>
      )}
    </div>
  )
}
