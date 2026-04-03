'use client'
import { useEffect, useState, useCallback } from 'react'
import { fetchLiveSessions, isApiConfigured, type ExamSession } from '@/lib/api/teacher-exams'
import type { TabProps } from '../ExamStatusTabContent'

function fmtTime(d: string) {
  const dt = new Date(d)
  return `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
}

function elapsed(startedAt: string | null) {
  if (!startedAt) return '—'
  const ms = Date.now() - new Date(startedAt).getTime()
  const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000)
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function countdown(end: string) {
  const ms = new Date(end).getTime() - Date.now()
  if (ms <= 0) return '00:00:00'
  const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000); const s = Math.floor((ms % 60000) / 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export function TabActive({ exam, assignment, classStudents, attempts, onRefresh }: TabProps) {
  const [sessions, setSessions] = useState<ExamSession[] | null>(null)
  const [lastRefresh, setLastRefresh] = useState('')
  const [, setTick] = useState(0)
  const [isClient, setIsClient] = useState(false)

  const load = useCallback(async () => {
    if (!isApiConfigured()) return
    try { const d = await fetchLiveSessions(exam.id); setSessions(d) } catch { /* ignore */ }
    const dt = new Date(); setLastRefresh(`${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`)
  }, [exam.id])

  useEffect(() => { setIsClient(true) }, [])
  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv) }, [load])
  useEffect(() => { const iv = setInterval(() => setTick(t => t + 1), 1000); return () => clearInterval(iv) }, [])

  const display = sessions ?? attempts.map(a => ({
    id: a.id, examId: exam.id, studentId: a.studentId,
    status: (a.status ?? 'in_progress') as ExamSession['status'],
    startedAt: a.startedAt ?? null, submittedAt: a.submittedAt ?? null,
    score: null, isFlagged: false, createdAt: '', updatedAt: '',
  }))

  const sessionMap = new Map(display.map(s => [s.studentId, s]))
  const doneCount = display.filter(s => s.status === 'submitted' || s.status === 'force_submitted').length
  const activeCount = display.filter(s => s.status === 'in_progress').length
  const allDone = classStudents.length > 0 && doneCount >= classStudents.length

  return (
    <div>
      {allDone && (
        <div className="mb-4 p-3 rounded-[10px] text-[13px] font-medium" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
          ✓ Бүх сурагч шалгалтаа дуусгалаа
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Оролцогч', value: `${activeCount + doneCount}/${classStudents.length}`, color: '#0066FF' },
          { label: 'Дуусгасан', value: doneCount, color: '#059669' },
          { label: 'Үлдсэн хугацаа', value: isClient ? countdown(assignment.scheduledEnd) : '—', color: '#D97706' },
        ].map(c => (
          <div key={c.label} className="bg-white border rounded-[10px] p-3" style={{ borderColor: '#DDE1E7' }}>
            <div className="text-[11px] mb-1" style={{ color: '#5A6474' }}>{c.label}</div>
            <div className="text-[18px] font-bold" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: '#DDE1E7' }}>
          <div className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>Сурагчдын явц</div>
          <button onClick={() => { load(); onRefresh() }} className="text-[12px] flex items-center gap-1" style={{ color: '#0066FF' }}>
            ↻ {lastRefresh || 'Шинэчлэх'}
          </button>
        </div>
        <table className="w-full">
          <thead><tr style={{ backgroundColor: '#F5F7FA' }}>
            {['№','Нэр','Явц','Хугацаа'].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[12px] font-medium" style={{ color: '#5A6474' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {classStudents.map((st, i) => {
              const s = sessionMap.get(st.id)
              const isDone = s?.status === 'submitted' || s?.status === 'force_submitted'
              const isActive = s?.status === 'in_progress'
              return (
                <tr key={st.id} className="border-t" style={{ borderColor: '#F0F2F5' }}>
                  <td className="px-3 py-2 text-[12px]" style={{ color: '#5A6474' }}>{i+1}</td>
                  <td className="px-3 py-2 text-[13px]" style={{ color: '#1A1A2E' }}>{st.name}</td>
                  <td className="px-3 py-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full" style={{
                      backgroundColor: isDone ? '#ECFDF5' : isActive ? '#EFF6FF' : '#F5F7FA',
                      color: isDone ? '#059669' : isActive ? '#2563EB' : '#5A6474',
                    }}>
                      {isDone ? 'Дуусгасан' : isActive ? 'Явагдаж байна' : 'Эхлээгүй'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[12px]" style={{ color: '#5A6474' }}>
                    {s?.startedAt ? (isDone ? fmtTime(s.startedAt) : isClient ? elapsed(s.startedAt) : '—') : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
