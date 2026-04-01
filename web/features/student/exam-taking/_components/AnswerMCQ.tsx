import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnswerMCQProps {
  options: string[]
  selected: string | string[]
  isMultiple: boolean
  onChange: (value: string | string[]) => void
}

export function AnswerMCQ({ options, selected, isMultiple, onChange }: AnswerMCQProps) {
  return (
    <>
      {options.map((option, index) => {
        const letter = String.fromCharCode(65 + index)
        const isSelected = isMultiple
          ? (selected as string[]).includes(option)
          : selected === option

        return (
          <button
            key={index}
            onClick={() => {
              if (!isMultiple) {
                onChange(option)
              } else {
                const current = (selected as string[]) || []
                if (current.includes(option)) {
                  onChange(current.filter(a => a !== option))
                } else {
                  onChange([...current, option])
                }
              }
            }}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4",
              isSelected
                ? "bg-primary/5 border-primary"
                : "bg-white border-card-border hover:border-input-border hover:bg-table-header"
            )}
          >
            <span className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0 transition-colors",
              isSelected ? "bg-primary text-white" : "bg-table-header text-text-secondary"
            )}>
              {letter}
            </span>
            <span className="text-[15px] text-foreground flex-1">{option}</span>
            {isSelected && (
              <Check size={18} className="text-primary" strokeWidth={2} />
            )}
          </button>
        )
      })}
    </>
  )
}
