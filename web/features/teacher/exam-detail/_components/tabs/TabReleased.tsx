import type { TabProps } from '../ExamStatusTabContent'

function grade(pct: number) {
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}

const GRADE_COLORS: Record<string, { color: string; bg: string }> = {
  A: { color: '#1A7A4A', bg: '#ECFDF5' },
  B: { color: '#2563EB', bg: '#EFF6FF' },
  C: { color: '#0891B2', bg: '#ECFEFF' },
  D: { color: '#D97706', bg: '#FFFBEB' },
  F: { color: '#E8112D', bg: '#FEF2F2' },
}

export function TabReleased({ results, classStudents }: TabProps) {
  const pcts = results.map(r => r.percentage ?? 0)
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 }
  pcts.forEach(p => { gradeCounts[grade(p) as keyof typeof gradeCounts]++ })

  return (
    <div className="max-w-xl space-y-4">
      <div className="p-4 rounded-[10px] text-[13px] font-medium" style={{ backgroundColor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
        ✓ Дүн нийтлэгдсэн — сурагчид үр дүнгээ харж байна
      </div>
      <div className="bg-white border rounded-[10px] p-5" style={{ borderColor: '#DDE1E7' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-[11px]" style={{ color: '#5A6474' }}>Дундаж оноо</div>
            <div className="text-[36px] font-bold" style={{ color: '#16A34A' }}>{avg}%</div>
            <div className="text-[12px]" style={{ color: '#5A6474' }}>{results.length}/{classStudents.length} оролцсон</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['A','B','C','D','F'] as const).map(g => (
              <div key={g} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold"
                style={{ backgroundColor: GRADE_COLORS[g].bg, color: GRADE_COLORS[g].color }}>
                {g} <span className="font-normal">{gradeCounts[g]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
