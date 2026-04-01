import { Plus, Database, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StepSource({
  source,
  onChange,
}: {
  source: 'new' | 'bank'
  onChange: (value: 'new' | 'bank') => void
}) {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-[20px] font-semibold text-foreground">Эх сурвалж сонгох</h2>
        <p className="text-[14px] text-text-secondary mt-1">Шалгалтаа хэрхэн үүсгэхээ сонгоно уу</p>
      </div>
      <button onClick={() => onChange('new')} className={cn('w-full p-5 rounded-lg border-2 text-left transition-all', source === 'new' ? 'bg-active-nav border-primary shadow-sm' : 'bg-white border-card-border hover:border-input-border hover:shadow-sm')}>
        <div className="flex items-start gap-4">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', source === 'new' ? 'bg-primary text-white' : 'bg-table-header text-text-secondary')}><Plus size={20} strokeWidth={1.5} /></div>
          <div className="flex-1"><div className="text-[15px] font-semibold text-foreground">Шинэ шалгалт үүсгэх</div><div className="text-[13px] text-text-secondary mt-0.5">Шинэ асуулт нэмж шалгалт бэлтгэх</div></div>
          {source === 'new' && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={2} /></div>}
        </div>
      </button>
      <button onClick={() => onChange('bank')} className={cn('w-full p-5 rounded-lg border-2 text-left transition-all', source === 'bank' ? 'bg-active-nav border-primary shadow-sm' : 'bg-white border-card-border hover:border-input-border hover:shadow-sm')}>
        <div className="flex items-start gap-4">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', source === 'bank' ? 'bg-primary text-white' : 'bg-table-header text-text-secondary')}><Database size={20} strokeWidth={1.5} /></div>
          <div className="flex-1"><div className="text-[15px] font-semibold text-foreground">Шалгалтын сангаас</div><div className="text-[13px] text-text-secondary mt-0.5">Өмнө үүсгэсэн шалгалтыг хуулж засварлах</div></div>
          {source === 'bank' && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={2} /></div>}
        </div>
      </button>
    </div>
  )
}
