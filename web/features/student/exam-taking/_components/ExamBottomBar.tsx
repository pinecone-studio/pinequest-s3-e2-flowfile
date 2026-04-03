import type React from 'react'
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamBottomBarProps {
  currentIndex: number
  total: number
  isMarked: boolean
  lastSaved: Date | null
  proctoringPreview?: React.ReactNode
  onPrev: () => void
  onNext: () => void
  onToggleMark: () => void
}

export function ExamBottomBar({
  currentIndex,
  total,
  isMarked,
  lastSaved,
  proctoringPreview,
  onPrev,
  onNext,
  onToggleMark,
}: ExamBottomBarProps) {
  return (
    <div className="sticky bottom-0 z-20 shrink-0 border-t border-card-border bg-white/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-sm md:px-6 md:py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
          <button
            onClick={onToggleMark}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors md:justify-start',
              isMarked
                ? 'bg-amber-50 text-amber-600'
                : 'text-text-secondary hover:bg-table-header',
            )}
          >
            <Bookmark
              size={16}
              strokeWidth={1.5}
              fill={isMarked ? 'currentColor' : 'none'}
            />
            <span className="text-[13px] font-medium">Тэмдэглэх</span>
          </button>

          <div className="text-[12px] text-text-secondary">
            Асуулт <span className="font-semibold text-foreground">{currentIndex + 1}</span> / {total}
          </div>

          {lastSaved && (
            <div className="text-[11px] text-text-secondary md:hidden">
              Хадгалсан{' '}
              {lastSaved.toLocaleTimeString('mn-MN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}

          {proctoringPreview}
        </div>

        <div className="grid grid-cols-2 gap-3 md:flex md:items-center md:justify-end">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-card-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-table-header disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
            Өмнөх
          </button>
          <button
            onClick={onNext}
            disabled={currentIndex === total - 1}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Дараах
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
