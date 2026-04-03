import { Textarea } from '@/components/ui/textarea'

interface AnswerTextProps {
  value: string
  onChange: (value: string) => void
  rows: number
}

export function AnswerText({ value, onChange, rows }: AnswerTextProps) {
  return (
    <div className="bg-white rounded-xl border border-card-border p-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder="Хариултаа бичнэ үү..."
        className="min-h-[120px] resize-none border-input-border bg-white px-4 py-3 text-[15px]"
      />
    </div>
  )
}
