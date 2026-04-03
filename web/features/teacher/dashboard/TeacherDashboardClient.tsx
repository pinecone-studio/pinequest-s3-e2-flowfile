'use client'
import { useState } from 'react'
import { initialExamAssignments, initialExams, initialClasses, initialAttempts, initialResults, CURRENT_TEACHER_ID } from '@/lib/data'
import { getMuchlugs, MuchlugSelector } from '@/components/muchlug-selector'
import { DashboardStatCards } from './_components/DashboardStatCards'
import { DashboardUrgentNew } from './_components/DashboardUrgentNew'
import { DashboardRecent } from './_components/DashboardRecent'

export function TeacherDashboardClient() {
  const [muchlugId, setMuchlugId] = useState(() => getMuchlugs().find(p => p.isCurrent)?.id ?? '2026-1-1')

  const myAssignments = initialExamAssignments.filter(ea => ea.assignedBy === CURRENT_TEACHER_ID)
  const closedAssignments = myAssignments.filter(ea => ea.status === 'closed')
  const pendingGrading = myAssignments.filter(ea => ea.status === 'active')

  const total = myAssignments.length
  const closed = closedAssignments.length

  const submittedAttempts = initialAttempts.filter(a => {
    const ea = myAssignments.find(x => x.id === (a.examAssignmentId ?? a.assignmentId))
    return ea && (a.status === 'submitted' || a.isComplete)
  })

  const pctValues = initialResults
    .filter(r => myAssignments.some(ea => ea.id === r.examAssignmentId))
    .map(r => r.percentage ?? 0)
  const avgScore = pctValues.length > 0 ? Math.round(pctValues.reduce((a, b) => a + b, 0) / pctValues.length) : 0

  const totalEnrolled = myAssignments.reduce((sum, ea) => {
    const cls = initialClasses.find(c => c.id === ea.classId)
    return sum + (cls?.studentIds.length ?? 0)
  }, 0)
  const participationPct = totalEnrolled > 0 ? Math.round(submittedAttempts.length / totalEnrolled * 100) : 0

  const urgentItems = pendingGrading.slice(0, 5).map(ea => ({
    assignment: ea,
    exam: initialExams.find(e => e.id === ea.examId)!,
    cls: initialClasses.find(c => c.id === ea.classId)!,
  })).filter(x => x.exam && x.cls)

  const recentItems = closedAssignments.slice(-3).reverse().map(ea => ({
    assignment: ea,
    exam: initialExams.find(e => e.id === ea.examId)!,
    cls: initialClasses.find(c => c.id === ea.classId)!,
    results: initialResults.filter(r => r.examAssignmentId === ea.id),
  })).filter(x => x.exam && x.cls)

  const statusCounts = {
    scheduled: myAssignments.filter(ea => ea.status === 'scheduled').length,
    active: myAssignments.filter(ea => ea.status === 'active').length,
    closed: closed,
  }

  return (
    <div className="p-6" style={{ backgroundColor: '#F5F7FA', minHeight: '100%' }}>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[20px] font-semibold" style={{ color: '#1A1A2E' }}>Нэгдсэн хяналт</h1>
        <MuchlugSelector value={muchlugId} onChange={setMuchlugId} />
      </div>
      <div className="mb-5">
        <DashboardStatCards closed={closed} total={total} participationPct={participationPct} avgScore={avgScore} released={0} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <DashboardUrgentNew items={urgentItems} />
          <DashboardRecent items={recentItems} />
        </div>
        <div>
          <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
            <h2 className="font-semibold text-[15px] mb-3" style={{ color: '#1A1A2E' }}>Статус товч</h2>
            {[
              { label: 'Товлогдсон', count: statusCounts.scheduled, color: '#2563EB', bg: '#EFF6FF' },
              { label: 'Явагдаж байна', count: statusCounts.active, color: '#059669', bg: '#ECFDF5' },
              { label: 'Хаагдсан', count: statusCounts.closed, color: '#D97706', bg: '#FFFBEB' },
              { label: 'Нийт', count: total, color: '#1A1A2E', bg: '#F5F7FA' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#F0F2F5' }}>
                <div className="flex items-center gap-2 text-[13px]" style={{ color: '#5A6474' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                  {row.label}
                </div>
                <span className="text-[13px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: row.bg, color: row.color }}>{row.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
