import { CheckCircle2 } from 'lucide-react'
import { initialQuestions } from '@/lib/data'
import type { Exam } from '@/lib/types'

export function ExamOverviewTab({ exam }: { exam: Exam }) {
  return (
    <div className="bg-white rounded-[10px] border" style={{ borderColor: '#DDE1E7' }}>
      <div className="p-4 border-b" style={{ borderColor: '#DDE1E7' }}>
        <h2 className="text-[15px] font-medium" style={{ color: '#1A1A2E' }}>Асуултууд</h2>
      </div>
      <div className="divide-y" style={{ borderColor: '#F0F2F5' }}>
        {(exam.questionIds ?? []).map((qId, index) => {
          const q = initialQuestions.find(question => question.id === qId)
          if (!q) return null
          return (
            <div key={q.id} className="p-4">
              <div className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] shrink-0"
                  style={{ backgroundColor: '#F0F2F5', color: '#5A6474' }}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="text-[14px] mb-2" style={{ color: '#1A1A2E' }}>{q.text}</div>
                  {q.type === 'single' && q.options && (
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className="flex items-center gap-2 text-[13px]"
                          style={{ color: opt === q.correctAnswer ? '#1A7A4A' : '#5A6474' }}
                        >
                          {opt === q.correctAnswer ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: '#DDE1E7' }} />
                          )}
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: '#8A94A0' }}>
                    <span>{q.type === 'single' ? 'Сонгох' : q.type === 'short' ? 'Бичих' : 'Олон сонголт'}</span>
                    <span>{q.points} оноо</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
