import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnswerTrueFalseProps {
  selected: string
  onChange: (value: string) => void
}

export function AnswerTrueFalse({ selected, onChange }: AnswerTrueFalseProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onChange('true')}
        className={cn(
          "p-6 rounded-xl border-2 text-center transition-all",
          selected === 'true'
            ? "bg-green-50 border-green-500"
            : "bg-white border-card-border hover:border-input-border"
        )}
      >
        <Check size={24} className={cn(
          "mx-auto mb-2",
          selected === 'true' ? "text-green-500" : "text-card-border"
        )} strokeWidth={2} />
        <span className={cn(
          "text-[16px] font-semibold",
          selected === 'true' ? "text-green-700" : "text-foreground"
        )}>Үнэн</span>
      </button>
      <button
        onClick={() => onChange('false')}
        className={cn(
          "p-6 rounded-xl border-2 text-center transition-all",
          selected === 'false'
            ? "bg-red-50 border-red-400"
            : "bg-white border-card-border hover:border-input-border"
        )}
      >
        <X size={24} className={cn(
          "mx-auto mb-2",
          selected === 'false' ? "text-red-500" : "text-card-border"
        )} strokeWidth={2} />
        <span className={cn(
          "text-[16px] font-semibold",
          selected === 'false' ? "text-red-700" : "text-foreground"
        )}>Худал</span>
      </button>
    </div>
  )
}
