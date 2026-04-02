'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  initialClasses, initialCourses, initialExamAssignments, initialExams,
  initialUsers, initialAttempts, CURRENT_TEACHER_ID
} from '@/lib/data'
import { SUBJECT_NAMES } from '@/lib/constants'
import { StudentRow } from './_components/StudentRow'
import { ClassExamRow } from './_components/ClassExamRow'

export function ClassDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<'exams' | 'students'>('exams')

  const cls = initialClasses.find(c => c.id === id)
  if (!cls) return <div className="p-6"><div style={{ color: '#5A6474' }}>Анги олдсонгүй...</div></div>

  const course = (initialCourses ?? []).find(c => (c.classIds ?? []).includes(cls.id))
  const subjectName = course ? (SUBJECT_NAMES[course.subjectId] || course.subjectId) : 'Хичээл'

  const classAssignments = (initialExamAssignments ?? []).filter(ea => ea.classId === cls.id && ea.assignedBy === CURRENT_TEACHER_ID)
  const classStudents = (initialUsers ?? []).filter(u => u.role === 'student' && (cls.studentIds ?? []).includes(u.id))
  const upcomingExams = classAssignments.filter(ea => ea.status === 'scheduled' || ea.status === 'active')
  const pastExams = classAssignments.filter(ea => ea.status === 'closed')
  const getExam = (examId: string) => (initialExams ?? []).find(e => e.id === examId)

  const getExamStats = (assignmentId: string) => {
    const examResults = (initialAttempts ?? []).filter(a => a.examAssignmentId === assignmentId && a.status === 'graded')
    if (examResults.length === 0) return null
    const scores = examResults.map(a => a.totalPoints && a.earnedPoints ? Math.round((a.earnedPoints / a.totalPoints) * 100) : 0)
    return { avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length), completed: examResults.length, total: (cls?.studentIds ?? []).length }
  }

  const getStudentStats = (studentId: string) => {
    const studentResults = (initialAttempts ?? []).filter(a => a.studentId === studentId && a.status === 'graded' && classAssignments.some(ea => ea.id === a.examAssignmentId))
    if (studentResults.length === 0) return { avgScore: null, attendance: 0, trend: 'neutral' as const }
    const getPercentage = (a: typeof studentResults[0]) => a.totalPoints && a.earnedPoints ? Math.round((a.earnedPoints / a.totalPoints) * 100) : 0
    const avgScore = Math.round(studentResults.reduce((sum, a) => sum + getPercentage(a), 0) / studentResults.length)
    const attendance = pastExams.length > 0 ? Math.round((studentResults.length / pastExams.length) * 100) : 0
    let trend: 'up' | 'down' | 'neutral' = 'neutral'
    if (studentResults.length >= 2) {
      const sorted = [...studentResults].sort((a, b) => new Date(b.endedAt || b.startedAt).getTime() - new Date(a.endedAt || a.startedAt).getTime())
      const p0 = getPercentage(sorted[0]); const p1 = getPercentage(sorted[1])
      if (p0 > p1 + 5) trend = 'up'; else if (p0 < p1 - 5) trend = 'down'
    }
    return { avgScore, attendance, trend }
  }

  return (
    <div className="p-6">
      <nav className="flex items-center gap-2 text-[14px] mb-4" style={{ color: '#5A6474' }}>
        <Link href="/teacher" className="hover:underline" style={{ color: '#0066FF' }}>Хичээлүүд</Link>
        <span>/</span>
        {course && (<><Link href={`/teacher/courses/${course.id}`} className="hover:underline" style={{ color: '#0066FF' }}>{subjectName}</Link><span>/</span></>)}
        <span style={{ color: '#1A1A2E' }}>{cls.name}</span>
      </nav>
      <h1 className="text-[22px] font-semibold mb-6" style={{ color: '#1A1A2E' }}>{cls.name}</h1>
      <div className="border-b mb-6" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex gap-6">
          {(['exams', 'students'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('pb-3 text-[14px] border-b-2 transition-colors', activeTab === tab ? 'font-medium' : '')}
              style={activeTab === tab ? { color: '#0066FF', borderColor: '#0066FF' } : { color: '#5A6474', borderColor: 'transparent' }}
            >
              {tab === 'exams' ? 'Шалгалтууд' : `Сурагчид (${classStudents.length})`}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'exams' && (
        <div className="space-y-8">
          {upcomingExams.length > 0 && (
            <section>
              <h2 className="text-[15px] font-medium mb-4" style={{ color: '#1A1A2E' }}>Удахгүй болох шалгалтууд</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingExams.map(assignment => {
                  const exam = getExam(assignment.examId); if (!exam) return null
                  return <ClassExamRow key={assignment.id} assignment={assignment} exam={exam} stats={null} subjectName={subjectName} />
                })}
              </div>
            </section>
          )}
          {pastExams.length > 0 && (
            <section>
              <h2 className="text-[15px] font-medium mb-4" style={{ color: '#1A1A2E' }}>Өнгөрсөн шалгалтууд</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastExams.map(assignment => {
                  const exam = getExam(assignment.examId); if (!exam) return null
                  return <ClassExamRow key={assignment.id} assignment={assignment} exam={exam} stats={getExamStats(assignment.id)} subjectName={subjectName} />
                })}
              </div>
            </section>
          )}
          {upcomingExams.length === 0 && pastExams.length === 0 && (
            <div className="text-center py-12" style={{ color: '#5A6474' }}>Шалгалт бүртгэгдээгүй байна.</div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: '#F5F7FA' }}>
                {['№', 'Нэр', 'Оролцоо', 'Дундаж', 'Хандлага'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[13px] font-medium" style={{ color: '#5A6474' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, index) => (
                <StudentRow key={student.id} student={student} stats={getStudentStats(student.id)} index={index} />
              ))}
            </tbody>
          </table>
          {classStudents.length === 0 && <div className="text-center py-8 text-[14px]" style={{ color: '#5A6474' }}>Сурагч бүртгэгдээгүй байна.</div>}
        </div>
      )}
    </div>
  )
}
