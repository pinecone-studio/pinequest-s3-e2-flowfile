import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Stat = {
  title: string
  value: number
  change: string
  trend: string
  icon: React.ElementType
  color: string
  bgColor: string
}

export function AdminMetricCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => (
        <div key={stat.title} className="bg-white rounded-xl border border-card-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.bgColor)}>
              <stat.icon size={20} className={stat.color} strokeWidth={1.5} />
            </div>
            {stat.trend === 'up' && (
              <div className="flex items-center gap-1 text-[12px] text-green-600 font-medium">
                <TrendingUp size={14} strokeWidth={1.5} />
                {stat.change}
              </div>
            )}
          </div>
          <div className="text-[28px] font-bold text-foreground mb-0.5">{stat.value}</div>
          <div className="text-[13px] text-text-secondary">{stat.title}</div>
        </div>
      ))}
    </div>
  )
}
