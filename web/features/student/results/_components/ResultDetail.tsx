import { LockKeyhole, CheckCircle, XCircle, MinusCircle, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Result, Exam, Attempt, Question } from '@/lib/types'
import { QuestionResultRow } from './QuestionResultRow'

function getGrade(percentage: number) {
  if (percentage >= 90) return { grade: 'A', label: 'Маш сайн', color: 'text-green-600', bg: 'bg-green-100' }
  if (percentage >= 80) return { grade: 'B', label: 'Сайн', color: 'text-blue-600', bg: 'bg-blue-100' }
  if (percentage >= 70) return { grade: 'C', label: 'Хангалттай', color: 'text-cyan-600', bg: 'bg-cyan-100' }
  if (percentage >= 60) return { grade: 'D', label: 'Дунд', color: 'text-amber-600', bg: 'bg-amber-100' }
  return { grade: 'F', label: 'Хангалтгүй', color: 'text-red-600', bg: 'bg-red-100' }
}

export function ResultDetail({
  selectedResult,
  selectedExam,
  selectedAttempt,
  examQuestions,
}: {
  selectedResult: Result | null
  selectedExam: Exam | null
  selectedAttempt: Attempt | null
  examQuestions: Question[]
}) {
  if (!selectedResult || !selectedExam) {
    if (selectedAttempt && selectedExam) {
      return (
        <div className="rounded-xl border border-card-border bg-white p-8 text-center md:p-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <TrendingUp size={32} className="text-blue-600" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-[18px] font-bold text-foreground">Шалгалт илгээгдсэн</h3>
          <p className="mb-1 text-[14px] text-text-secondary">Багш шалгаж дуусах хүртэл энэ хэсэгт хүлээгдэж буй төлөв харагдана.</p>
          <p className="text-[13px] text-text-secondary">Шалгалт: {selectedExam.title}</p>
        </div>
      )
    }

    return (
      <div className="bg-white border border-card-border rounded-xl p-16 text-center">
        <TrendingUp size={48} className="mx-auto text-card-border mb-3" strokeWidth={1} />
        <p className="text-[15px] text-text-secondary">Үр дүн сонгоно уу</p>
      </div>
    )
  }

  if (!selectedResult.isPublished) {
    return (
      <div className="bg-white border border-card-border rounded-xl p-8 text-center md:p-16">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <LockKeyhole size={32} className="text-amber-600" strokeWidth={1.5} />
        </div>
        <h3 className="text-[18px] font-bold text-foreground mb-2">Шалгаж байна</h3>
        <p className="text-[14px] text-text-secondary mb-1">Багш шалгалтыг засаж дуусмагц энд үр дүн харагдана.</p>
        <p className="text-[13px] text-text-secondary">Шалгалт: {selectedExam.title}</p>
      </div>
    )
  }

  const percentage = Math.round((selectedResult.totalScore / selectedResult.maxScore) * 100)
  const grade = getGrade(percentage)
  const strokeColor = percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#0066ff' : '#ef4444'
  const circumference = 402

  return (
    <div className="space-y-6">
      <div className="bg-white border border-card-border rounded-xl p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90">
              <circle cx="72" cy="72" r="64" fill="none" stroke="#E8EBF0" strokeWidth="10" />
              <circle cx="72" cy="72" r="64" fill="none" stroke={strokeColor} strokeWidth="10"
                strokeDasharray={`${(selectedResult.totalScore / selectedResult.maxScore) * circumference} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-[36px] font-bold text-foreground">{percentage}%</div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-[18px] font-bold text-foreground mb-1">{selectedExam.title}</h3>
            <p className="text-[13px] text-text-secondary mb-4">{selectedExam.subjectId}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-[12px] text-text-secondary mb-1">Нийт оноо</div>
                <div className="text-[16px] font-semibold text-foreground">{selectedResult.totalScore} / {selectedResult.maxScore}</div>
              </div>
              <div>
                <div className="text-[12px] text-text-secondary mb-1">Үнэлгээ</div>
                <div className="flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 rounded text-[12px] font-bold', grade.bg, grade.color)}>{grade.grade}</span>
                  <span className="text-[14px] font-medium text-foreground">{grade.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-divider flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-foreground">Асуулт бүрийн үр дүн</h3>
          <div className="flex items-center gap-4 text-[12px]">
            <div className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-500" strokeWidth={1.5} /><span className="text-text-secondary">Зөв</span></div>
            <div className="flex items-center gap-1.5"><XCircle size={14} className="text-red-500" strokeWidth={1.5} /><span className="text-text-secondary">Буруу</span></div>
            <div className="flex items-center gap-1.5"><MinusCircle size={14} className="text-gray-400" strokeWidth={1.5} /><span className="text-text-secondary">Хариулаагүй</span></div>
          </div>
        </div>
        <div className="divide-y divide-divider">
          {examQuestions.map((q, index) => (
            <QuestionResultRow
              key={q.id}
              question={q}
              index={index}
              score={selectedResult.scorePerQuestion[q.id] || 0}
              userAnswer={selectedAttempt?.answers[q.id] as string | string[] | undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
