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
    <div className="h-14 border-b border-card-border bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[12px] font-bold"
            style={{ backgroundColor: subjectColor.bg }}
          >
            {subjectInitial}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-foreground">{examTitle}</div>
            <div className="text-[11px] text-text-secondary">{subjectName}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-[13px] text-text-secondary">
          Асуулт <span className="font-semibold text-foreground">{currentIndex + 1}</span> / {totalQuestions}
        </div>

        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg",
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
          className="px-5 py-2 bg-primary text-white text-[13px] font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Send size={14} strokeWidth={1.5} />
          Дуусгах
        </button>
      </div>
    </div>
  )
}
