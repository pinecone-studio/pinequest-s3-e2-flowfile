import type { TabProps } from '../ExamStatusTabContent'

export function TabReleasing({ results, classStudents }: TabProps) {
  const pcts = results.map(r => r.percentage ?? 0)
  const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0
  return (
    <div className="max-w-xl">
      <div className="bg-white border rounded-[10px] p-6 border-l-4" style={{ borderColor: '#DDE1E7', borderLeftColor: '#EA580C' }}>
        <div className="text-[22px] mb-2" style={{ color: '#EA580C' }}>✓</div>
        <div className="text-[16px] font-semibold mb-1" style={{ color: '#1A1A2E' }}>Тайлан илгээгдсэн</div>
        <div className="text-[13px] mb-4" style={{ color: '#5A6474' }}>
          Шалгалтын дүн боловсруулагдаж байна. Удахгүй сурагчдад нийтлэгдэнэ.
        </div>
        <div className="flex items-center gap-6 text-[13px]">
          <div>
            <div style={{ color: '#5A6474' }}>Дундаж оноо</div>
            <div className="text-[20px] font-bold" style={{ color: '#EA580C' }}>{avg}%</div>
          </div>
          <div>
            <div style={{ color: '#5A6474' }}>Оролцогчид</div>
            <div className="text-[20px] font-bold" style={{ color: '#1A1A2E' }}>{results.length}/{classStudents.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
