'use client'
import { useEffect, useState } from 'react'
import { fetchExamAnalytics, isApiConfigured, type QuestionAnalytics } from '@/lib/api/teacher-exams'
import type { TabProps } from '../ExamStatusTabContent'

export function TabSubmitted({ exam, classStudents, attempts, questions, results }: TabProps) {
  const [analytics, setAnalytics] = useState<QuestionAnalytics[] | null>(null)

  useEffect(() => {
    if (!isApiConfigured()) return
    fetchExamAnalytics(exam.id).then(setAnalytics).catch(() => null)
  }, [exam.id])

  const submitted = attempts.filter(a => a.status === 'submitted' || a.status === 'graded')
  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + (r.percentage ?? 0), 0) / results.length) : 0
  const passedCount = results.filter(r => (r.percentage ?? 0) >= 60).length

  const displayData: QuestionAnalytics[] = analytics ?? questions.map(q => ({
    questionId: q.id, content: q.text, inputType: q.type, points: q.points,
    totalAnswers: 0, correctCount: 0, incorrectCount: 0, errorRate: 0,
  }))

  const hardest = displayData.length > 0 ? displayData.reduce((a, b) => a.errorRate > b.errorRate ? a : b) : null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Ирц', value: `${submitted.length}/${classStudents.length}`, color: '#0066FF' },
          { label: 'Дундаж оноо', value: `${avgScore}%`, color: '#D97706' },
          { label: 'Тэнцсэн', value: passedCount, color: '#059669' },
          { label: 'Хамгийн хэцүү', value: hardest ? `${hardest.content.slice(0,20)}…` : '—', color: '#E8112D' },
        ].map(c => (
          <div key={c.label} className="bg-white border rounded-[10px] p-3" style={{ borderColor: '#DDE1E7' }}>
            <div className="text-[11px] mb-1" style={{ color: '#5A6474' }}>{c.label}</div>
            <div className="text-[15px] font-bold truncate" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
        <div className="p-3 border-b" style={{ borderColor: '#DDE1E7' }}>
          <div className="text-[14px] font-medium" style={{ color: '#1A1A2E' }}>Асуултын аналитик</div>
        </div>
        <table className="w-full">
          <thead><tr style={{ backgroundColor: '#F5F7FA' }}>
            {['№','Асуулт','Зөв','Алдааны %','Оноо'].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[12px] font-medium" style={{ color: '#5A6474' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {displayData.map((q, i) => {
              const errorPct = Math.round(q.errorRate * 100)
              const barColor = errorPct > 50 ? '#E8112D' : errorPct > 30 ? '#D97706' : '#059669'
              return (
                <tr key={q.questionId} className="border-t" style={{ borderColor: '#F0F2F5' }}>
                  <td className="px-3 py-2 text-[12px]" style={{ color: '#5A6474' }}>{i+1}</td>
                  <td className="px-3 py-2 text-[13px] max-w-[200px] truncate" style={{ color: '#1A1A2E' }}>{q.content}</td>
                  <td className="px-3 py-2 text-[13px]" style={{ color: '#059669' }}>{q.correctCount}/{q.totalAnswers}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: '#F0F2F5' }}>
                        <div className="h-full rounded-full" style={{ width: `${errorPct}%`, backgroundColor: barColor }} />
                      </div>
                      <span className="text-[12px]" style={{ color: barColor }}>{errorPct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[12px]" style={{ color: '#5A6474' }}>{q.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button className="px-4 py-2 rounded-[8px] text-[13px] font-medium text-white" style={{ backgroundColor: '#7C3AED' }}>
        Үнэлгээ хийх →
      </button>
    </div>
  )
}
