interface AnswerTextProps {
  value: string
  onChange: (value: string) => void
  rows: number
}

export function AnswerText({ value, onChange, rows }: AnswerTextProps) {
  return (
    <div className="bg-white rounded-xl border border-card-border p-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder="Хариултаа бичнэ үү..."
        className="w-full px-4 py-3 border border-input-border rounded-lg text-[15px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none resize-none transition-colors"
      />
    </div>
  )
}
