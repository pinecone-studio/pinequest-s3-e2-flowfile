'use client'

const QUICK_SYMBOLS = [
  'H2O',
  'CO2',
  'NaCl',
  'CH4',
  'C6H12O6',
  '->',
  '<=>',
]

export function ChemistryEditorClient({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const appendSymbol = (symbol: string) => {
    const nextValue = value ? `${value} ${symbol}` : symbol
    onChange(nextValue)
  }

  return (
    <div className="space-y-3 rounded-xl border border-card-border bg-white p-4">
      <div className="rounded-2xl bg-[#EEF7F1] px-4 py-3">
        <div className="text-[13px] font-semibold text-foreground">
          Chemistry answer editor
        </div>
        <div className="text-[12px] text-text-secondary">
          Deploy-д найдвартай байлгахын тулд энэ хувилбар molfile editor биш, харин
          химийн томьёо ба урвалын тэмдэглэгээ бичих хөнгөн input ашиглаж байна.
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_SYMBOLS.map((symbol) => (
          <button
            key={symbol}
            type="button"
            onClick={() => appendSymbol(symbol)}
            className="rounded-lg border border-card-border bg-[#F7F9FC] px-3 py-1.5 text-[12px] font-medium text-foreground"
          >
            {symbol}
          </button>
        ))}
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={10}
        placeholder="Жишээ: 2H2 + O2 -> 2H2O"
        className="w-full rounded-xl border border-input-border px-4 py-3 text-[14px] focus:outline-none"
      />
    </div>
  )
}
