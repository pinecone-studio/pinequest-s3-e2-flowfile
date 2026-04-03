interface DonutProps { pct: number; color: string }
function DonutChart({ pct, color }: DonutProps) {
  const r = 16; const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={42} height={42} viewBox="0 0 40 40">
      <circle cx={20} cy={20} r={r} fill="none" stroke="#F0F2F5" strokeWidth={5} />
      <circle cx={20} cy={20} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 20 20)" />
    </svg>
  )
}

interface StatCardProps { label: string; value: string; desc: string; pct: number; color: string }
function StatCard({ label, value, desc, pct, color }: StatCardProps) {
  return (
    <div className="bg-white border rounded-[10px] p-4 flex items-center gap-3" style={{ borderColor: '#DDE1E7', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="flex-1 min-w-0">
        <div className="text-[12px]" style={{ color: '#5A6474' }}>{label}</div>
        <div className="text-[20px] font-bold mt-0.5" style={{ color }}>{value}</div>
        <div className="text-[11px]" style={{ color: '#5A6474' }}>{desc}</div>
      </div>
      <DonutChart pct={pct} color={color} />
    </div>
  )
}

interface Props { closed: number; total: number; participationPct: number; avgScore: number; released: number }
export function DashboardStatCards({ closed, total, participationPct, avgScore, released }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Ажлын явц" value={`${closed}/${total}`} desc="шалгалт дууссан" pct={total > 0 ? Math.round(closed/total*100) : 0} color="#0066FF" />
      <StatCard label="Хамрагдалт" value={`${participationPct}%`} desc="оролцогчид" pct={participationPct} color="#1A7A4A" />
      <StatCard label="Үнэлгээ" value={`${avgScore}%`} desc="дундаж оноо" pct={avgScore} color="#B45309" />
      <StatCard label="Тайлан" value={`${released}/${total}`} desc="нийтлэгдсэн" pct={total > 0 ? Math.round(released/total*100) : 0} color="#7C3AED" />
    </div>
  )
}
