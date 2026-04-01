import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamBottomBarProps {
  currentIndex: number
  total: number
  isMarked: boolean
  lastSaved: Date | null
  onPrev: () => void
  onNext: () => void
  onToggleMark: () => void
}

export function ExamBottomBar({
  currentIndex,
  total,
  isMarked,
  onPrev,
  onNext,
  onToggleMark,
}: ExamBottomBarProps) {
  return (
    <div className="h-16 border-t border-card-border bg-white flex items-center justify-between px-6 shrink-0">
      <button
        onClick={onToggleMark}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
          isMarked
            ? "text-amber-600 bg-amber-50"
            : "text-text-secondary hover:bg-table-header"
        )}
      >
        <Bookmark size={16} strokeWidth={1.5} fill={isMarked ? 'currentColor' : 'none'} />
        <span className="text-[13px] font-medium">Тэмдэглэх</span>
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 border border-card-border rounded-lg text-[13px] font-medium text-foreground hover:bg-table-header transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          Өмнөх
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === total - 1}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-[13px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Дараах
          <ChevronRight size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
