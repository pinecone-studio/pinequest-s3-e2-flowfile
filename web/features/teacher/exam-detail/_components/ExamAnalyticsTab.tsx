import { BarChart3, TrendingUp } from 'lucide-react'
import { initialQuestions } from '@/lib/data'
import type { Exam, Result } from '@/lib/types'

export function ExamAnalyticsTab({ exam, examResults }: { exam: Exam; examResults: Result[] }) {
  const getScoreDistribution = () => {
    const ranges = [
      { label: '0-20%', min: 0, max: 20, count: 0 },
      { label: '21-40%', min: 21, max: 40, count: 0 },
      { label: '41-60%', min: 41, max: 60, count: 0 },
      { label: '61-80%', min: 61, max: 80, count: 0 },
      { label: '81-100%', min: 81, max: 100, count: 0 },
    ]
    examResults.forEach(r => {
      const range = ranges.find(range => (r.percentage ?? 0) >= range.min && (r.percentage ?? 0) <= range.max)
      if (range) range.count++
    })
    return ranges
  }

  const distribution = getScoreDistribution()
  const maxCount = Math.max(...distribution.map(r => r.count), 1)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] border p-4" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} style={{ color: '#0066FF' }} />
          <h3 className="text-[15px] font-medium" style={{ color: '#1A1A2E' }}>Оноогоор хуваарилалт</h3>
        </div>
        <div className="space-y-3">
          {distribution.map(range => {
            const width = (range.count / maxCount) * 100
            return (
              <div key={range.label} className="flex items-center gap-3">
                <span className="w-16 text-[13px]" style={{ color: '#5A6474' }}>{range.label}</span>
                <div className="flex-1 h-6 rounded" style={{ backgroundColor: '#F0F2F5' }}>
                  <div
                    className="h-full rounded transition-all flex items-center justify-end pr-2"
                    style={{ width: `${width}%`, backgroundColor: '#0066FF', minWidth: range.count > 0 ? '24px' : '0' }}
                  >
                    {range.count > 0 && <span className="text-white text-[11px] font-medium">{range.count}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-[10px] border p-4" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} style={{ color: '#0066FF' }} />
          <h3 className="text-[15px] font-medium" style={{ color: '#1A1A2E' }}>Асуултын хүндрэл</h3>
        </div>
        <div className="space-y-3">
          {(exam.questionIds ?? []).map((qId, index) => {
            const q = initialQuestions.find(question => question.id === qId)
            if (!q) return null
            const correctCount = examResults.filter(r => (r as Result & { answers?: Record<string, unknown> }).answers?.[q.id] === q.correctAnswer).length
            const correctPercent = examResults.length > 0 ? Math.round((correctCount / examResults.length) * 100) : 0
            const color = correctPercent >= 70 ? '#1A7A4A' : correctPercent >= 40 ? '#B45309' : '#C4272F'
            return (
              <div key={q.id} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0"
                  style={{ backgroundColor: '#F0F2F5', color: '#5A6474' }}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] truncate" style={{ color: '#1A1A2E', maxWidth: '300px' }}>
                      {q.text}
                    </span>
                    <span className="text-[12px] font-medium ml-2" style={{ color }}>
                      {correctPercent}% зөв
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#F0F2F5' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${correctPercent}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
