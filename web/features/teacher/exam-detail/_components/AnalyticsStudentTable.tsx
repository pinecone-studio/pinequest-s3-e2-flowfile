'use client'

import { useState } from 'react'
import type { User, Result } from '@/lib/types'

function grade(p: number | null) {
  if (p === null) return { g: '—', c: '#5A6474' }
  if (p >= 90) return { g: 'A', c: '#1A7A4A' }
  if (p >= 80) return { g: 'B', c: '#0066FF' }
  if (p >= 70) return { g: 'C', c: '#0891B2' }
  if (p >= 60) return { g: 'D', c: '#B45309' }
  return { g: 'F', c: '#E8112D' }
}

interface StudentRow { name: string; pct: number | null; flag: boolean }

function buildRows(classStudents: User[], results: Result[]): StudentRow[] {
  if (classStudents.length > 0) {
    return classStudents.map(s => {
      const r = results.find(res => res.studentId === s.id)
      const pct = r ? (r.percentage ?? Math.round(r.totalScore / r.maxScore * 100)) : null
      return { name: s.name, pct, flag: false }
    })
  }
  return results.map(r => ({ name: r.studentId, pct: r.percentage ?? Math.round(r.totalScore / r.maxScore * 100), flag: false }))
}

export function AnalyticsStudentTable({ classStudents, results }: { classStudents: User[]; results: Result[] }) {
  const [showAll, setShowAll] = useState(false)
  const students = buildRows(classStudents, results)
  const displayed = showAll ? students : students.slice(0, 10)

  return (
    <div className="bg-white border rounded-[12px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
      <div className="px-4 py-3 border-b font-semibold text-[14px]" style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}>
        Сурагч бүрийн үр дүн
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr style={{ background: '#F5F7FA', color: '#5A6474' }}>
            {['#', 'Нэр', 'Хувь', 'Зэрэглэл', 'Тэмдэглэл'].map(h => (
              <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayed.map((s, i) => {
            const { g, c } = grade(s.pct)
            return (
              <tr key={i} className="border-t hover:bg-[#F5F7FA] transition-colors" style={{ borderColor: '#F0F2F5' }}>
                <td className="px-4 py-2.5" style={{ color: '#5A6474' }}>{i + 1}</td>
                <td className="px-4 py-2.5 font-medium" style={{ color: '#1A1A2E' }}>{s.name}</td>
                <td className="px-4 py-2.5">{s.pct !== null ? `${s.pct}%` : '—'}</td>
                <td className="px-4 py-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: c + '22', color: c }}>{g}</span>
                </td>
                <td className="px-4 py-2.5" style={{ color: s.flag ? '#E8112D' : '#5A6474' }}>{s.flag ? '⚠' : '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {students.length > 10 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full py-2.5 text-[13px] border-t"
          style={{ borderColor: '#DDE1E7', color: '#0066FF', background: 'transparent', cursor: 'pointer' }}>
          {showAll ? 'Хураах' : `Бүгдийг харах (${students.length})`}
        </button>
      )}
    </div>
  )
}
