interface MatchingPair {
  left: string
  right: string
}

interface AnswerMatchingProps {
  pairs: MatchingPair[]
  selected: string[]
  onChange: (value: string[]) => void
}

export function AnswerMatching({ pairs, selected, onChange }: AnswerMatchingProps) {
  return (
    <div className="bg-white rounded-xl border border-card-border p-4 space-y-3">
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="flex-1 p-3 bg-table-header rounded-lg border border-card-border text-[14px] text-foreground">
            {pair.left}
          </div>
          <div className="text-text-secondary">→</div>
          <select
            value={selected[index] || ''}
            onChange={(e) => {
              const current = selected.length ? [...selected] : new Array(pairs.length).fill('')
              current[index] = e.target.value
              onChange(current)
            }}
            className="flex-1 p-3 border border-input-border rounded-lg bg-white text-[14px] focus:border-primary focus:outline-none"
          >
            <option value="">Сонгох...</option>
            {pairs.map((p, i) => (
              <option key={i} value={p.right}>{p.right}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}
