import type { TabProps } from '../ExamStatusTabContent'

export function TabGrading({ attempts, questions, results }: TabProps) {
  const submitted = attempts.filter(a => a.status === 'submitted' || a.status === 'graded')
  const graded = results.length
  const total = submitted.length
  const pct = total > 0 ? Math.round(graded / total * 100) : 0
  const manualQuestions = questions.filter(q => q.isManualGrade)

  return (
    <div className="max-w-xl space-y-4">
      <div className="bg-white border rounded-[10px] p-5" style={{ borderColor: '#DDE1E7', borderLeftWidth: 4, borderLeftColor: '#7C3AED' }}>
        <div className="text-[14px] font-semibold mb-3" style={{ color: '#1A1A2E' }}>
          Үнэлгээний явц
        </div>
        <div className="text-[22px] font-bold mb-2" style={{ color: '#7C3AED' }}>{graded}/{total} үнэлэгдсэн</div>
        <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#F0F2F5' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: '#7C3AED' }} />
        </div>
        <div className="text-[12px] mt-1" style={{ color: '#5A6474' }}>{pct}% дууссан</div>
      </div>
      {manualQuestions.length > 0 && (
        <div className="bg-white border rounded-[10px] overflow-hidden" style={{ borderColor: '#DDE1E7' }}>
          <div className="p-3 border-b" style={{ borderColor: '#DDE1E7' }}>
            <div className="text-[13px] font-medium" style={{ color: '#1A1A2E' }}>Гараар үнэлэх асуултууд</div>
          </div>
          <table className="w-full">
            <thead><tr style={{ backgroundColor: '#F5F7FA' }}>
              {['Асуулт','Нийт','Үнэлэгдсэн','Үлдсэн'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[12px] font-medium" style={{ color: '#5A6474' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {manualQuestions.map(q => (
                <tr key={q.id} className="border-t" style={{ borderColor: '#F0F2F5' }}>
                  <td className="px-3 py-2 text-[13px] max-w-[200px] truncate" style={{ color: '#1A1A2E' }}>{q.text}</td>
                  <td className="px-3 py-2 text-[12px]" style={{ color: '#5A6474' }}>{total}</td>
                  <td className="px-3 py-2 text-[12px]" style={{ color: '#059669' }}>{graded}</td>
                  <td className="px-3 py-2 text-[12px]" style={{ color: '#E8112D' }}>{total - graded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button className="px-4 py-2 rounded-[8px] text-[13px] font-medium text-white" style={{ backgroundColor: '#7C3AED' }}>
        Үнэлгээ үргэлжлүүлэх →
      </button>
    </div>
  )
}
