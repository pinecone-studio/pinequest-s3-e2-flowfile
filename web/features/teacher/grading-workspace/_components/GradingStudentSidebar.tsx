import Link from 'next/link'
import { ArrowLeft, Check, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Exam, User, Submission } from '@/lib/types'

type LegacySub = Submission & { status?: string; studentId: string }
type LegacyUser = User & { studentId?: string }

export function GradingStudentSidebar({ exam, students, submissions, selectedStudentId, gradedCount, needsGradingCount, onSelect }: {
  exam: Exam; students: User[]; submissions: Submission[]
  selectedStudentId: string | null; gradedCount: number; needsGradingCount: number
  onSelect: (id: string) => void
}) {
  const subs = submissions as LegacySub[]
  return (
    <div className="w-[280px] border-r border-card-border bg-white flex flex-col">
      <div className="p-4 border-b border-card-border">
        <Link href={`/teacher/exams/${exam.id}`} className="inline-flex items-center gap-1.5 text-text-secondary hover:text-foreground text-[13px] mb-2">
          <ArrowLeft size={14} strokeWidth={1.5} />Буцах
        </Link>
        <h1 className="text-[16px] font-semibold text-foreground truncate">{exam.title}</h1>
        <p className="text-[12px] text-text-secondary mt-0.5">Дүн оруулах</p>
      </div>
      <div className="p-4 border-b border-card-border bg-table-header">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><div className="text-[18px] font-bold text-foreground">{submissions.length}</div><div className="text-[10px] text-text-secondary">Нийт</div></div>
          <div><div className="text-[18px] font-bold text-green-600">{gradedCount}</div><div className="text-[10px] text-text-secondary">Дүгнэсэн</div></div>
          <div><div className="text-[18px] font-bold text-amber-600">{needsGradingCount}</div><div className="text-[10px] text-text-secondary">Хүлээгдэж буй</div></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {(students as LegacyUser[]).map(student => {
            const submission = subs.find(s => s.studentId === student.id)
            const isGraded = submission?.status === 'graded'
            return (
              <button key={student.id} onClick={() => onSelect(student.id)}
                className={cn('w-full p-3 rounded-lg text-left transition-colors mb-1', selectedStudentId === student.id ? 'bg-active-nav border border-primary' : 'hover:bg-table-header')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-table-header flex items-center justify-center text-[12px] font-medium text-foreground">{student.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate">{student.name}</div>
                    <div className="text-[11px] text-text-secondary">{(student as LegacyUser).studentId}</div>
                  </div>
                  {isGraded ? (
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><Check size={12} className="text-green-600" strokeWidth={2} /></div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center"><Clock size={12} className="text-amber-600" strokeWidth={2} /></div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
