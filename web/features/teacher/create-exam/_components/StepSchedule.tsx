import { cn } from '@/lib/utils'
import type { SchoolClass } from '@/lib/types'

export function StepSchedule({
  courseId,
  selectedClasses,
  startDate,
  startTime,
  endDate,
  endTime,
  availableClasses,
  onSelectedClasses,
  onStartDate,
  onStartTime,
  onEndDate,
  onEndTime,
}: {
  courseId: string
  selectedClasses: string[]
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  availableClasses: SchoolClass[]
  onSelectedClasses: (ids: string[]) => void
  onStartDate: (v: string) => void
  onStartTime: (v: string) => void
  onEndDate: (v: string) => void
  onEndTime: (v: string) => void
}) {
  const toggle = (classId: string, checked: boolean) => {
    onSelectedClasses(checked ? [...selectedClasses, classId] : selectedClasses.filter(id => id !== classId))
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-[20px] font-semibold text-foreground">Хуваарь тохируулах</h2>
        <p className="text-[14px] text-text-secondary mt-1">Шалгалтыг ангиудад хуваарилж, цаг товлоно уу</p>
      </div>
      <div className="bg-white rounded-lg border border-card-border p-6 space-y-5">
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-2">Ангиуд сонгох</label>
          {availableClasses.length > 0 ? (
            <div className="space-y-2">
              {availableClasses.map(cls => (
                <label key={cls.id} className={cn('flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors', selectedClasses.includes(cls.id) ? 'bg-active-nav border-primary' : 'bg-white border-card-border hover:border-input-border')}>
                  <input type="checkbox" checked={selectedClasses.includes(cls.id)} onChange={(e) => toggle(cls.id, e.target.checked)} />
                  <div>
                    <div className="text-[14px] font-medium text-foreground">{cls.name}</div>
                    <div className="text-[12px] text-text-secondary">{cls.studentIds.length} сурагч</div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-text-secondary text-[14px] bg-table-header rounded-lg">
              {courseId ? 'Энэ хичээлд анги байхгүй байна' : 'Эхлээд хичээл сонгоно уу'}
            </div>
          )}
        </div>
        {selectedClasses.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Эхлэх огноо</label>
                <input type="date" value={startDate} onChange={(e) => onStartDate(e.target.value)} className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Эхлэх цаг</label>
                <input type="time" value={startTime} onChange={(e) => onStartTime(e.target.value)} className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Дуусах огноо</label>
                <input type="date" value={endDate} onChange={(e) => onEndDate(e.target.value)} className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Дуусах цаг</label>
                <input type="time" value={endTime} onChange={(e) => onEndTime(e.target.value)} className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
              </div>
            </div>
          </>
        )}
        <div className="pt-4 border-t border-divider">
          <p className="text-[13px] text-text-secondary">Хуваарь оруулахгүй бол шалгалт ноорог болж хадгалагдана.</p>
        </div>
      </div>
    </div>
  )
}
