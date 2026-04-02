'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ClassRow { id: string; name: string; avg: number }

export function AdminClassChart({ classes, schoolAvg }: { classes: ClassRow[]; schoolAvg: number }) {
  const sorted = [...classes].sort((a, b) => b.avg - a.avg)
  const top3 = sorted.slice(0, 3)
  const bottom3 = sorted.slice(-3).reverse()

  return (
    <div className="bg-white border rounded-[12px] p-5" style={{ borderColor: '#DDE1E7' }}>
      <h2 className="font-semibold text-[15px] mb-4" style={{ color: '#1A1A2E' }}>Ангиудын гүйцэтгэл</h2>
      {classes.length > 0 ? (
        <ResponsiveContainer width="100%" height={Math.max(160, classes.length * 32)}>
          <BarChart layout="vertical" data={classes} margin={{ left: 48, right: 48, top: 4, bottom: 4 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#5A6474' }} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5A6474' }} width={48} />
            <Tooltip formatter={(v: unknown) => [`${Number(v)}%`]} />
            <Bar dataKey="avg" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, formatter: (v: unknown) => `${Number(v)}%` }}>
              {classes.map((c, i) => <Cell key={i} fill={c.avg >= 70 ? '#1A7A4A' : c.avg >= 50 ? '#B45309' : '#E8112D'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-[13px]" style={{ color: '#5A6474' }}>Үр дүн байхгүй</div>
      )}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <div className="text-[12px] font-medium mb-2" style={{ color: '#1A7A4A' }}>Шилдэг 3 анги</div>
          {top3.map(c => (
            <div key={c.id} className="flex justify-between text-[13px] mb-1">
              <span style={{ color: '#1A1A2E' }}>{c.name}</span>
              <span className="font-semibold" style={{ color: '#1A7A4A' }}>{c.avg > 0 ? `${c.avg}%` : '—'} <span style={{ color: '#5A6474', fontWeight: 400 }}>({c.avg > 0 ? `+${c.avg - schoolAvg}` : '—'})</span></span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-[12px] font-medium mb-2" style={{ color: '#E8112D' }}>Доод 3 анги</div>
          {bottom3.map(c => (
            <div key={c.id} className="flex justify-between text-[13px] mb-1">
              <span style={{ color: '#1A1A2E' }}>{c.name}</span>
              <span className="font-semibold" style={{ color: '#E8112D' }}>{c.avg > 0 ? `${c.avg}%` : '—'} <span style={{ color: '#5A6474', fontWeight: 400 }}>({c.avg > 0 ? `${c.avg - schoolAvg}` : '—'})</span></span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
