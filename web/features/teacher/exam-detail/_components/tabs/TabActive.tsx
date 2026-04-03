'use client'

import { useEffect, useState } from 'react'
import { fetchLiveSessions, isApiConfigured, type ExamSession } from '@/lib/api/teacher-exams'

interface TabActiveProps {
  exam: { id: string }
  initialAttempts?: Array<{ id: string; studentId: string; status: string; startedAt?: string | null }>
}

export function TabActive({ exam, initialAttempts = [] }: TabActiveProps) {
  const [sessions, setSessions] = useState<ExamSession[] | null>(null)

  useEffect(() => {
    if (!isApiConfigured() || !exam?.id) return
    const load = () => fetchLiveSessions(exam.id).then(setSessions).catch(() => null)
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [exam?.id])

  const displaySessions = sessions ?? initialAttempts.map((a) => ({
    id: a.id,
    examId: exam.id,
    studentId: a.studentId,
    status: a.status as ExamSession['status'],
    startedAt: a.startedAt ?? null,
    submittedAt: null,
    score: null,
    isFlagged: false,
    createdAt: '',
    updatedAt: '',
  }))

  const active = displaySessions.filter((s) => s.status === 'in_progress')

  return (
    <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#DDE1E7' }}>
        <h2 className="text-[15px] font-medium" style={{ color: '#1A1A2E' }}>
          Идэвхтэй оюутнууд
        </h2>
        <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}>
          {active.length} идэвхтэй
        </span>
      </div>
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: '#F5F7FA' }}>
            {['№', 'Сурагч ID', 'Төлөв', 'Эхэлсэн'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[13px] font-medium" style={{ color: '#5A6474' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {active.map((s, i) => (
            <tr key={s.id} className="border-t" style={{ borderColor: '#F0F2F5' }}>
              <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6474' }}>{i + 1}</td>
              <td className="px-4 py-3 text-[13px]" style={{ color: '#1A1A2E' }}>{s.studentId}</td>
              <td className="px-4 py-3">
                <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E6F4EA', color: '#1A7A4A' }}>
                  Нээлттэй
                </span>
              </td>
              <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6474' }}>
                {s.startedAt ? new Date(s.startedAt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' }) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {active.length === 0 && (
        <div className="text-center py-8 text-[14px]" style={{ color: '#5A6474' }}>
          Одоогоор идэвхтэй сурагч байхгүй байна.
        </div>
      )}
    </div>
  )
}
