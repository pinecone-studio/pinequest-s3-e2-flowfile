import { cn } from '@/lib/utils'

export function ExamTabFilter({
  activeTab,
  onTabChange,
  availableCount,
}: {
  activeTab: 'available' | 'completed'
  onTabChange: (tab: 'available' | 'completed') => void
  availableCount: number
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg w-fit mb-6" style={{ backgroundColor: '#F5F7FA' }}>
      <button
        onClick={() => onTabChange('available')}
        className={cn('px-4 py-2 rounded-md text-[13px] font-medium transition-colors', activeTab === 'available' ? 'bg-white shadow-sm' : 'hover:bg-white/50')}
        style={{ color: activeTab === 'available' ? '#1A1A2E' : '#5A6474' }}
      >
        Боломжтой
        {availableCount > 0 && (
          <span className="ml-2 px-1.5 py-0.5 text-white text-[11px] rounded-full" style={{ backgroundColor: '#0066FF' }}>
            {availableCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange('completed')}
        className={cn('px-4 py-2 rounded-md text-[13px] font-medium transition-colors', activeTab === 'completed' ? 'bg-white shadow-sm' : 'hover:bg-white/50')}
        style={{ color: activeTab === 'completed' ? '#1A1A2E' : '#5A6474' }}
      >
        Дууссан
      </button>
    </div>
  )
}
