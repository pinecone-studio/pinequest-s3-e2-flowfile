'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Muchlug { id: string; label: string; year: number; semester: number; half: 1|2; isCurrent: boolean }

export function getMuchlugs(): Muchlug[] {
  return [
    { id: '2025-2-2', label: '2025 • 2-р улирал • Сүүл', year: 2025, semester: 2, half: 2, isCurrent: false },
    { id: '2025-3-1', label: '2025 • 3-р улирал • Эхний хагас', year: 2025, semester: 3, half: 1, isCurrent: false },
    { id: '2025-3-2', label: '2025 • 3-р улирал • Сүүл', year: 2025, semester: 3, half: 2, isCurrent: false },
    { id: '2026-1-1', label: '2026 • 1-р улирал • Эхний хагас', year: 2026, semester: 1, half: 1, isCurrent: true },
    { id: '2026-1-2', label: '2026 • 1-р улирал • Сүүл', year: 2026, semester: 1, half: 2, isCurrent: false },
    { id: '2026-2-1', label: '2026 • 2-р улирал • Эхний хагас', year: 2026, semester: 2, half: 1, isCurrent: false },
  ]
}

export function MuchlugSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const periods = getMuchlugs()
  const current = periods.find(p => p.id === value) ?? periods[3]
  const idx = periods.findIndex(p => p.id === current.id)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      <button onClick={() => idx > 0 && onChange(periods[idx - 1].id)} disabled={idx === 0}
        className="p-1 rounded hover:bg-[#F5F7FA] disabled:opacity-30 transition-colors">
        <ChevronLeft size={14} style={{ color: '#5A6474' }} />
      </button>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] border bg-white text-[13px] hover:bg-[#F5F7FA] transition-colors"
        style={{ borderColor: '#DDE1E7', color: '#1A1A2E' }}>
        <span>{current.label}</span>
        {current.isCurrent && <span className="px-1.5 py-0.5 rounded-full text-[10px] text-white" style={{ backgroundColor: '#0066FF' }}>одоогийн</span>}
        <ChevronDown size={12} style={{ color: '#5A6474' }} />
      </button>
      <button onClick={() => idx < periods.length - 1 && onChange(periods[idx + 1].id)} disabled={idx === periods.length - 1}
        className="p-1 rounded hover:bg-[#F5F7FA] disabled:opacity-30 transition-colors">
        <ChevronRight size={14} style={{ color: '#5A6474' }} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 bg-white border rounded-[10px] py-1 min-w-[290px]"
          style={{ borderColor: '#DDE1E7', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          {periods.map(p => (
            <button key={p.id} onClick={() => { onChange(p.id); setOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-[13px] hover:bg-[#F5F7FA] transition-colors text-left"
              style={{ color: p.id === current.id ? '#0066FF' : '#1A1A2E', fontWeight: p.id === current.id ? 600 : 400 }}>
              <span>{p.label}</span>
              {p.isCurrent && <span className="px-1.5 py-0.5 rounded-full text-[10px] text-white" style={{ backgroundColor: '#0066FF' }}>одоогийн</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
