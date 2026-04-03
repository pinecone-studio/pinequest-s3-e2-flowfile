'use client'

import { useEffect, useState } from 'react'
import { fetchExamAnalytics, isApiConfigured, type QuestionAnalytics } from '@/lib/api/teacher-exams'

interface TabSubmittedProps {
  exam: { id: string }
  initialResults?: Array<{ questionId?: string; content?: string; errorRate?: number }>
  initialQuestions?: Array<{ id: string; text?: string; content?: string; points?: number }>
}

export function TabSubmitted({ exam, initialQuestions = [] }: TabSubmittedProps) {
  const [analytics, setAnalytics] = useState<QuestionAnalytics[] | null>(null)

  useEffect(() => {
    if (!isApiConfigured() || !exam?.id) return
    fetchExamAnalytics(exam.id).then(setAnalytics).catch(() => null)
  }, [exam?.id])

  const displayData: QuestionAnalytics[] =
    analytics ??
    initialQuestions.map((q, i) => ({
      questionId: q.id,
      content: q.text ?? q.content ?? `Асуулт ${i + 1}`,
      inputType: 'mcq',
      points: q.points ?? 1,
      totalAnswers: 0,
      correctCount: 0,
      incorrectCount: 0,
      errorRate: 0,
    }))

  return (
    <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
      <div className="p-4 border-b" style={{ borderColor: '#DDE1E7' }}>
        <h2 className="text-[15px] font-medium" style={{ color: '#1A1A2E' }}>Асуултын аналитик</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: '#F5F7FA' }}>
            {['№', 'Асуулт', 'Оноо', 'Нийт хариулт', 'Зөв', 'Буруу', 'Алдааны хувь'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[13px] font-medium" style={{ color: '#5A6474' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((q, i) => {
            const errorPct = Math.round(q.errorRate * 100)
            const color = errorPct <= 30 ? '#1A7A4A' : errorPct <= 60 ? '#B45309' : '#C4272F'
            return (
              <tr key={q.questionId} className="border-t" style={{ borderColor: '#F0F2F5' }}>
                <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6474' }}>{i + 1}</td>
                <td className="px-4 py-3 text-[13px] max-w-xs truncate" style={{ color: '#1A1A2E' }}>{q.content}</td>
                <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6474' }}>{q.points}</td>
                <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6474' }}>{q.totalAnswers}</td>
                <td className="px-4 py-3 text-[13px]" style={{ color: '#1A7A4A' }}>{q.correctCount}</td>
                <td className="px-4 py-3 text-[13px]" style={{ color: '#C4272F' }}>{q.incorrectCount}</td>
                <td className="px-4 py-3 text-[13px] font-medium" style={{ color }}>{errorPct}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {displayData.length === 0 && (
        <div className="text-center py-8 text-[14px]" style={{ color: '#5A6474' }}>
          Дата байхгүй байна.
        </div>
      )}
    </div>
  )
}
