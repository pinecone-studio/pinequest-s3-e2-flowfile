'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const BUCKET_COLORS = ['#E8112D', '#F97316', '#B45309', '#0066FF', '#1A7A4A']

interface QRow { name: string; rate: number; fill: string; text: string; wrong: number; correct: number }
interface BucketRow { label: string; count: number; color: string }

export function ScoreDistributionChart({ buckets, bigBucket }: { buckets: BucketRow[]; bigBucket: BucketRow }) {
  return (
    <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
      <h3 className="font-semibold text-[14px] mb-3" style={{ color: '#1A1A2E' }}>Оноогийн тархалт</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={buckets} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5A6474' }} />
          <YAxis tick={{ fontSize: 11, fill: '#5A6474' }} allowDecimals={false} />
          <Tooltip formatter={(v) => [`${v} сурагч`, 'Тоо']} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11 }}>
            {buckets.map((b, i) => <Cell key={i} fill={BUCKET_COLORS[i % BUCKET_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[12px] mt-1" style={{ color: '#5A6474' }}>
        Хамгийн олон сурагч ({bigBucket.count}) {bigBucket.label}-д байна.
      </p>
    </div>
  )
}

export function QuestionErrorChart({ qData }: { qData: QRow[] }) {
  const hardest = qData.length ? qData.reduce((a, b) => b.rate > a.rate ? b : a, qData[0]) : null
  return (
    <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
      <h3 className="font-semibold text-[14px] mb-3" style={{ color: '#1A1A2E' }}>Асуулт тус бүрийн гүйцэтгэл</h3>
      <ResponsiveContainer width="100%" height={Math.max(260, qData.length * 52)}>
        <BarChart layout="vertical" data={qData} margin={{ left: 60, right: 70, top: 4, bottom: 4 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#5A6474' }} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5A6474' }} width={60} />
          <Tooltip formatter={(_, __, p) => [`${(p.payload as QRow).wrong} буруу / ${(p.payload as QRow).correct} зөв`]} />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, formatter: (v: unknown) => `${Number(v)}% буруу` }}>
            {qData.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {hardest && (
        <div className="mt-3 p-3 rounded-[8px] border-l-4" style={{ borderLeftColor: '#E8112D', background: '#FFF5F5' }}>
          <div className="text-[11px] font-medium mb-1" style={{ color: '#E8112D' }}>Хамгийн хэцүү асуулт</div>
          <div className="text-[13px] truncate mb-1" style={{ color: '#1A1A2E' }}>{hardest.text}</div>
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: '#FFE5E8', color: '#E8112D' }}>{hardest.rate}% буруу</span>
        </div>
      )}
    </div>
  )
}

export function BenchmarkChart({ avg }: { avg: number }) {
  const school = 74; const national = 65
  const diff = avg - national
  const data = [{ name: 'Харьцуулалт', class: avg, school, national }]
  return (
    <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
      <h3 className="font-semibold text-[14px] mb-3" style={{ color: '#1A1A2E' }}>Харьцуулалт</h3>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" hide />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#5A6474' }} />
          <Tooltip />
          <Bar dataKey="class" name="Манай анги" fill="#0066FF" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11 }} />
          <Bar dataKey="school" name="Сургууль" fill="#B45309" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11 }} />
          <Bar dataKey="national" name="Улс" fill="#5A6474" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 11 }} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[13px] font-semibold mt-2" style={{ color: diff >= 0 ? '#1A7A4A' : '#E8112D' }}>
        Улсын дундажаас {Math.abs(diff)}%-иар {diff >= 0 ? 'өндөр ↑' : 'доогуур ↓'}
      </p>
    </div>
  )
}
