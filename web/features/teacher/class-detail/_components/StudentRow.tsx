import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { User } from '@/lib/types'

type StudentStats = { avgScore: number | null; attendance: number; trend: 'up' | 'down' | 'neutral' }

export function StudentRow({
  student,
  stats,
  index,
}: {
  student: User
  stats: StudentStats
  index: number
}) {
  return (
    <tr
      className="border-t transition-colors"
      style={{ borderColor: '#DDE1E7' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F7FA')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <td className="px-4 py-3 text-[13px]" style={{ color: '#5A6474' }}>{index + 1}</td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#1A1A2E' }}>{student.name}</td>
      <td className="px-4 py-3">
        <span
          className="px-2 py-0.5 text-[12px] rounded-full font-medium"
          style={
            stats.attendance >= 80
              ? { backgroundColor: 'rgba(26, 122, 74, 0.12)', color: '#1A7A4A' }
              : stats.attendance >= 50
              ? { backgroundColor: 'rgba(180, 83, 9, 0.12)', color: '#B45309' }
              : { backgroundColor: 'rgba(196, 39, 47, 0.12)', color: '#C4272F' }
          }
        >
          {stats.attendance}%
        </span>
      </td>
      <td className="px-4 py-3 text-[13px]" style={{ color: '#1A1A2E' }}>
        {stats.avgScore !== null ? `${stats.avgScore}%` : '-'}
      </td>
      <td className="px-4 py-3">
        {stats.trend === 'up' && <TrendingUp size={16} style={{ color: '#1A7A4A' }} />}
        {stats.trend === 'down' && <TrendingDown size={16} style={{ color: '#C4272F' }} />}
        {stats.trend === 'neutral' && <Minus size={16} style={{ color: '#8A94A0' }} />}
      </td>
    </tr>
  )
}
