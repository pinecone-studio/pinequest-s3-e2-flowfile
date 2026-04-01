'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const SUBJECTS = [
  { name: 'МАТ', school: 71, district: 66, national: 63 },
  { name: 'МОН', school: 78, district: 72, national: 68 },
  { name: 'ФИЗ', school: 69, district: 64, national: 62 },
  { name: 'АНГ', school: 73, district: 68, national: 65 },
  { name: 'ХИМ', school: 66, district: 61, national: 58 },
]

export function AdminBenchmarkChart({ schoolAvg }: { schoolAvg: number }) {
  const national = 65; const district = 68
  const diff = schoolAvg - national
  return (
    <div className="bg-white border rounded-[12px] p-5" style={{ borderColor: '#DDE1E7', borderLeft: '8px solid #0066FF' }}>
      <h2 className="font-semibold text-[16px] mb-4" style={{ color: '#1A1A2E' }}>Улсын дундажтай харьцуулалт</h2>
      <div className="grid grid-cols-3 gap-6 mb-5">
        <div className="text-center">
          <div className="text-[11px] mb-1 font-medium" style={{ color: '#5A6474' }}>Манай сургууль</div>
          <div className="text-[40px] font-bold" style={{ color: schoolAvg >= national ? '#0066FF' : '#E8112D' }}>{schoolAvg}%</div>
          <div className="space-y-1 mt-2">
            {SUBJECTS.map(s => (
              <div key={s.name} className="flex justify-between text-[12px]">
                <span style={{ color: '#5A6474' }}>{s.name}</span>
                <span className="font-medium" style={{ color: '#1A1A2E' }}>{s.school}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-x text-center px-4" style={{ borderColor: '#DDE1E7' }}>
          <div className="text-[11px] mb-1 font-medium" style={{ color: '#5A6474' }}>Аймгийн дундаж</div>
          <div className="text-[32px] font-bold" style={{ color: '#B45309' }}>{district}%</div>
          <div className="space-y-1 mt-2">
            {SUBJECTS.map(s => (
              <div key={s.name} className="flex justify-between text-[12px]">
                <span style={{ color: '#5A6474' }}>{s.name}</span>
                <span style={{ color: '#B45309' }}>{s.district}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[11px] mb-1 font-medium" style={{ color: '#5A6474' }}>Улсын дундаж</div>
          <div className="text-[32px] font-bold" style={{ color: '#5A6474' }}>{national}%</div>
          <div className="space-y-1 mt-2">
            {SUBJECTS.map(s => (
              <div key={s.name} className="flex justify-between text-[12px]">
                <span style={{ color: '#5A6474' }}>{s.name}</span>
                <span style={{ color: '#5A6474' }}>{s.national}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={SUBJECTS} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5A6474' }} />
          <YAxis domain={[50, 85]} tick={{ fontSize: 11, fill: '#5A6474' }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="school" name="Сургууль" fill="#0066FF" radius={[3, 3, 0, 0]} />
          <Bar dataKey="district" name="Аймаг" fill="#B45309" radius={[3, 3, 0, 0]} />
          <Bar dataKey="national" name="Улс" fill="#5A6474" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[14px] font-bold mt-3" style={{ color: diff >= 0 ? '#1A7A4A' : '#E8112D' }}>
        Манай сургууль улсын дундажаас {Math.abs(diff)}%-иар {diff >= 0 ? 'өндөр байна ↑' : 'доогуур байна ↓'}
      </p>
    </div>
  )
}
