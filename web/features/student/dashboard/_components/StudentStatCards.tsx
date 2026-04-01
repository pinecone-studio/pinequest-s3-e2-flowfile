import { Timer, CheckCircle, FileText } from 'lucide-react'

export function StudentStatCards({
  availableCount,
  completedCount,
  totalCount,
}: {
  availableCount: number
  completedCount: number
  totalCount: number
}) {
  const cards = [
    { icon: <Timer size={20} style={{ color: '#B45309' }} strokeWidth={1.5} />, iconBg: 'rgba(245, 158, 11, 0.12)', label: 'Боломжтой', value: availableCount },
    { icon: <CheckCircle size={20} style={{ color: '#1A7A4A' }} strokeWidth={1.5} />, iconBg: 'rgba(26, 122, 74, 0.12)', label: 'Дууссан', value: completedCount },
    { icon: <FileText size={20} style={{ color: '#0066FF' }} strokeWidth={1.5} />, iconBg: 'rgba(0, 102, 255, 0.12)', label: 'Нийт', value: totalCount },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {cards.map(({ icon, iconBg, label, value }) => (
        <div key={label} className="bg-white rounded-xl border p-5" style={{ borderColor: '#DDE1E7' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconBg }}>
              {icon}
            </div>
            <div className="text-[13px]" style={{ color: '#5A6474' }}>{label}</div>
          </div>
          <div className="text-[28px] font-bold" style={{ color: '#1A1A2E' }}>{value}</div>
        </div>
      ))}
    </div>
  )
}
