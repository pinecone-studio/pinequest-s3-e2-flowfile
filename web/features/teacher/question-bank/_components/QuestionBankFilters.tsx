import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Subject } from '@/lib/types'

export function QuestionBankFilters({
  selectedSubject,
  onSubjectChange,
  ownerFilter,
  onOwnerChange,
  yearFilter,
  onYearChange,
  searchQuery,
  onSearchChange,
  availableSubjects,
  yearOptions,
}: {
  selectedSubject: string
  onSubjectChange: (v: string) => void
  ownerFilter: 'all' | 'mine'
  onOwnerChange: (v: 'all' | 'mine') => void
  yearFilter: string
  onYearChange: (v: string) => void
  searchQuery: string
  onSearchChange: (v: string) => void
  availableSubjects: Subject[]
  yearOptions: string[]
}) {
  return (
    <div className="bg-white border border-card-border rounded-md p-4 mb-6 flex items-center gap-4 flex-wrap">
      <select
        value={selectedSubject}
        onChange={e => onSubjectChange(e.target.value)}
        className="px-3 py-1.5 border border-input-border rounded text-[14px] bg-white focus:border-navy focus:outline-none"
      >
        <option value="all">Бүх хичээл</option>
        {availableSubjects.map(subject => (
          <option key={subject.id} value={subject.id}>{subject.name}</option>
        ))}
      </select>

      <div className="flex border border-input-border rounded overflow-hidden">
        {(['all', 'mine'] as const).map(v => (
          <button
            key={v}
            onClick={() => onOwnerChange(v)}
            className={cn(
              'px-3 py-1.5 text-[14px] transition-colors',
              ownerFilter === v ? 'bg-navy text-white' : 'bg-white text-foreground hover:bg-table-header'
            )}
          >
            {v === 'all' ? 'Бүгд' : 'Миний'}
          </button>
        ))}
      </div>

      <select
        value={yearFilter}
        onChange={e => onYearChange(e.target.value)}
        className="px-3 py-1.5 border border-input-border rounded text-[14px] bg-white focus:border-navy focus:outline-none"
      >
        <option value="all">Бүх он</option>
        {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
      </select>

      <div className="flex-1 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Хайх..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 border border-input-border rounded text-[14px] focus:border-navy focus:outline-none"
        />
      </div>
    </div>
  )
}
