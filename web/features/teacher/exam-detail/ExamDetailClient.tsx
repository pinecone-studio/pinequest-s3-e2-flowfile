'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Calendar, Clock, FileText, Users, ArrowLeft, Download, Eye } from 'lucide-react'
import {
  initialExamAssignments,
  initialExams,
  initialClasses,
  initialCourses,
  initialUsers,
  initialResults,
} from '@/lib/data'
import { SUBJECT_NAMES, STATUS_CONFIG } from '@/lib/constants'
import { ExamStatusBadge } from './_components/ExamStatusBadge'
import { ExamOverviewTab } from './_components/ExamOverviewTab'
import { ExamResultsTab } from './_components/ExamResultsTab'
import { ExamAnalyticsTab } from './_components/ExamAnalyticsTab'

type TabType = 'overview' | 'results' | 'analytics'

export function ExamDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const assignment = initialExamAssignments.find(ea => ea.id === id)
  if (!assignment) return <div className="p-6"><div style={{ color: '#5A6474' }}>Шалгалт олдсонгүй...</div></div>

  const exam = initialExams.find(e => e.id === assignment.examId)
  const cls = initialClasses.find(c => c.id === assignment.classId)
  const course = initialCourses.find(c => cls && c.classIds.includes(cls.id))
  const subjectName = course ? (SUBJECT_NAMES[course.subjectId] || course.subjectId) : ''
  const statusConfig = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.scheduled

  const classStudents = cls ? initialUsers.filter(u => u.role === 'student' && cls.studentIds.includes(u.id)) : []
  const examResults = initialResults.filter(r => r.examAssignmentId === assignment.id)

  const avgScore = examResults.length > 0
    ? Math.round(examResults.reduce((sum, r) => sum + (r.percentage ?? 0), 0) / examResults.length)
    : null
  const completedCount = examResults.length
  const totalCount = classStudents.length
  const passedCount = examResults.filter(r => (r.percentage ?? 0) >= 60).length
  const maxScore = examResults.length > 0 ? Math.max(...examResults.map(r => r.percentage ?? 0)) : 0
  const minScore = examResults.length > 0 ? Math.min(...examResults.map(r => r.percentage ?? 0)) : 0

  const getScoreColor = (score: number) => score >= 80 ? '#1A7A4A' : score >= 60 ? '#B45309' : '#C4272F'
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })

  if (!exam || !cls) return <div className="p-6"><div style={{ color: '#5A6474' }}>Шалгалт олдсонгүй...</div></div>

  return (
    <div className="p-6">
      <Link href="/teacher/exams" className="inline-flex items-center gap-2 text-[14px] mb-4 transition-colors" style={{ color: '#5A6474' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#0066FF')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#5A6474')}
      >
        <ArrowLeft size={16} />Буцах
      </Link>

      <div className="bg-white rounded-[10px] border p-6 mb-6" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[22px] font-semibold" style={{ color: '#1A1A2E' }}>{exam.title}</h1>
              <ExamStatusBadge statusConfig={statusConfig} />
            </div>
            <div className="text-[14px]" style={{ color: '#5A6474' }}>{subjectName} • {cls.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] transition-colors" style={{ borderColor: '#DDE1E7', color: '#5A6474' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F7FA' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Download size={14} />Татах
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-white transition-colors" style={{ backgroundColor: '#0066FF' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0052CC')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0066FF')}
            >
              <Eye size={14} />Урьдчилан харах
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6 text-[13px]" style={{ color: '#5A6474' }}>
          <div className="flex items-center gap-2"><Calendar size={16} strokeWidth={1.5} /><span>{formatDate(assignment.scheduledStart)}</span></div>
          <div className="flex items-center gap-2"><Clock size={16} strokeWidth={1.5} /><span>{formatTime(assignment.scheduledStart)} - {formatTime(assignment.scheduledEnd)}</span></div>
          <div className="flex items-center gap-2"><FileText size={16} strokeWidth={1.5} /><span>{(exam?.questionIds ?? []).length} асуулт</span></div>
          <div className="flex items-center gap-2"><Users size={16} strokeWidth={1.5} /><span>{totalCount} сурагч</span></div>
        </div>
      </div>

      {assignment.status === 'closed' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-[10px] border p-4" style={{ borderColor: '#DDE1E7' }}>
            <div className="text-[12px] mb-1" style={{ color: '#8A94A0' }}>Дундаж оноо</div>
            <div className="text-[28px] font-bold" style={{ color: avgScore !== null ? getScoreColor(avgScore) : '#1A1A2E' }}>{avgScore !== null ? `${avgScore}%` : '-'}</div>
          </div>
          <div className="bg-white rounded-[10px] border p-4" style={{ borderColor: '#DDE1E7' }}>
            <div className="text-[12px] mb-1" style={{ color: '#8A94A0' }}>Оролцоо</div>
            <div className="text-[28px] font-bold" style={{ color: '#1A1A2E' }}>{completedCount}/{totalCount}</div>
            <div className="w-full h-2 rounded-full mt-2" style={{ backgroundColor: '#F0F2F5' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`, backgroundColor: '#0066FF' }} />
            </div>
          </div>
          <div className="bg-white rounded-[10px] border p-4" style={{ borderColor: '#DDE1E7' }}>
            <div className="text-[12px] mb-1" style={{ color: '#8A94A0' }}>Тэнцсэн</div>
            <div className="text-[28px] font-bold" style={{ color: '#1A7A4A' }}>{passedCount}/{completedCount}</div>
          </div>
          <div className="bg-white rounded-[10px] border p-4" style={{ borderColor: '#DDE1E7' }}>
            <div className="text-[12px] mb-1" style={{ color: '#8A94A0' }}>Хамгийн өндөр/бага</div>
            <div className="text-[28px] font-bold" style={{ color: '#1A1A2E' }}>{maxScore}% / {minScore}%</div>
          </div>
        </div>
      )}

      <div className="border-b mb-6" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex gap-6">
          {(['overview', 'results'] as TabType[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('pb-3 text-[14px] border-b-2 transition-colors', activeTab === tab ? 'font-medium' : '')}
              style={activeTab === tab ? { color: '#0066FF', borderColor: '#0066FF' } : { color: '#5A6474', borderColor: 'transparent' }}
            >
              {tab === 'overview' ? 'Ерөнхий' : `Дүнгүүд (${completedCount})`}
            </button>
          ))}
          {assignment.status === 'closed' && (
            <button onClick={() => setActiveTab('analytics')}
              className={cn('pb-3 text-[14px] border-b-2 transition-colors', activeTab === 'analytics' ? 'font-medium' : '')}
              style={activeTab === 'analytics' ? { color: '#0066FF', borderColor: '#0066FF' } : { color: '#5A6474', borderColor: 'transparent' }}
            >
              Аналитик
            </button>
          )}
        </div>
      </div>

      {activeTab === 'overview' && <ExamOverviewTab exam={exam} />}
      {activeTab === 'results' && <ExamResultsTab classStudents={classStudents} examResults={examResults} />}
      {activeTab === 'analytics' && <ExamAnalyticsTab exam={exam} examResults={examResults} />}
    </div>
  )
}
