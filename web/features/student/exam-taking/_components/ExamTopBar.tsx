import { Clock, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubjectColor {
  bg: string
}

interface ExamTopBarProps {
  examTitle: string
  subjectColor: SubjectColor
  subjectName: string
  subjectInitial: string
  timeRemaining: number
  formattedTime: string
  currentIndex: number
  totalQuestions: number
  onSubmitClick: () => void
}

export function ExamTopBar({
  examTitle,
  subjectColor,
  subjectName,
  subjectInitial,
  timeRemaining,
  formattedTime,
  currentIndex,
  totalQuestions,
  onSubmitClick,
}: ExamTopBarProps) {
  return (
    <div className="shrink-0 border-b border-card-border bg-white px-4 py-3 shadow-sm md:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold text-white"
            style={{ backgroundColor: subjectColor.bg }}
          >
            {subjectInitial}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[14px] font-semibold text-foreground">
              {examTitle}
            </div>
            <div className="text-[11px] text-text-secondary">{subjectName}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-6">
          <div className="text-[13px] text-text-secondary">
            Асуулт <span className="font-semibold text-foreground">{currentIndex + 1}</span> / {totalQuestions}
          </div>

          <div className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2",
            timeRemaining <= 300 ? "bg-red-50" : "bg-table-header"
          )}>
            <Clock size={16} className={timeRemaining <= 300 ? "text-red-500" : "text-text-secondary"} strokeWidth={1.5} />
            <span className={cn(
              "text-[16px] font-mono font-bold tabular-nums",
              timeRemaining <= 300 ? "text-red-500" : "text-foreground"
            )}>
              {formattedTime}
            </span>
          </div>

          <button
            onClick={onSubmitClick}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary/90"
          >
            <Send size={14} strokeWidth={1.5} />
            Дуусгах
          </button>
        </div>
      </div>
    </div>
  )
}
