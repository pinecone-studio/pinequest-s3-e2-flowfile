'use client'
import { useState } from 'react'
import { isApiConfigured, updateExamStatus } from '@/lib/api/teacher-exams'
import type { TabProps } from '../ExamStatusTabContent'

function grade(pct: number) {
  if (pct >= 90) return { label: 'A', color: '#1A7A4A', bg: '#ECFDF5' }
  if (pct >= 80) return { label: 'B', color: '#2563EB', bg: '#EFF6FF' }
  if (pct >= 70) return { label: 'C', color: '#0891B2', bg: '#ECFEFF' }
  if (pct >= 60) return { label: 'D', color: '#D97706', bg: '#FFFBEB' }
  return { label: 'F', color: '#E8112D', bg: '#FEF2F2' }
}

export function TabReported({ exam, classStudents, results }: TabProps) {
  const [released, setReleased] = useState(false)
  const [loading, setLoading] = useState(false)

  const pcts = results.map(r => r.percentage ?? 0)
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0
  const maxScore = pcts.length ? Math.max(...pcts) : 0
  const minScore = pcts.length ? Math.min(...pcts) : 0
  const passedCount = pcts.filter(p => p >= 60).length

  const studentMap = new Map(classStudents.map(s => [s.id, s]))
  const sortedResults = [...results].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))

  const handleRelease = async () => {
    if (!isApiConfigured()) { setReleased(true); return }
    setLoading(true)
    try { await updateExamStatus(exam.id, 'closed'); setReleased(true) } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {released && (
        <div className="p-3 rounded-[10px] text-[13px] font-medium" style={{ backgroundColor: '#ECFEFF', color: '#0891B2' }}>
          ✓ Тайлан амжилттай илгээгдлээ
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Нийт', value: results.length, color: '#1A1A2E' },
          { label: 'Дундаж', value: `${avg}%`, color: '#0891B2' },
          { label: 'Хамгийн өндөр', value: `${maxScore}%`, color: '#1A7A4A' },
          { label: 'Хамгийн бага', value: `${minScore}%`, color: '#E8112D' },
          { label: 'Тэнцсэн', value: passedCount, color: '#059669' },
        ].map(c => (
          <div key={c.label} className="bg-white border rounded-[10px] p-3" style={{ borderColor: '#DDE1E7' }}>
            <div className="text-[11px] mb-1" style={{ color: '#5A6474' }}>{c.label}</div>
            <div className="text-[18px] font-bold" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
        <table className="w-full">
          <thead><tr style={{ backgroundColor: '#F5F7FA' }}>
            {['№','Нэр','Зэрэглэл','Гүйцэтгэл','Оноо'].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[12px] font-medium" style={{ color: '#5A6474' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {sortedResults.map((r, i) => {
              const pct = r.percentage ?? 0
              const g = grade(pct)
              const student = studentMap.get(r.studentId)
              return (
                <tr key={r.id} className="border-t" style={{ borderColor: '#F0F2F5' }}>
                  <td className="px-3 py-2 text-[12px]" style={{ color: '#5A6474' }}>{i+1}</td>
                  <td className="px-3 py-2 text-[13px]" style={{ color: '#1A1A2E' }}>{student?.name ?? r.studentId}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: g.bg, color: g.color }}>{g.label}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full" style={{ backgroundColor: '#F0F2F5' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                      </div>
                      <span className="text-[12px]" style={{ color: '#5A6474' }}>{pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[12px]" style={{ color: '#5A6474' }}>{r.totalScore}/{r.maxScore}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {sortedResults.length === 0 && (
          <div className="text-center py-6 text-[13px]" style={{ color: '#5A6474' }}>Үр дүн байхгүй байна</div>
        )}
      </div>
      <button onClick={handleRelease} disabled={loading || released}
        className="px-4 py-2 rounded-[8px] text-[13px] font-medium text-white disabled:opacity-50"
        style={{ backgroundColor: '#0891B2' }}>
        {released ? '✓ Илгээгдсэн' : loading ? 'Илгээж байна...' : 'Тайлан илгээх →'}
      </button>
    </div>
  )
}
