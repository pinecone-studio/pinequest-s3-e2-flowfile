import Link from 'next/link'
import { getES, getExamUrgency, STEPS, ESTEP, UC } from './_pipeline-helpers'
import type { ExamPipelineProps, Urgency, ES } from './_pipeline-helpers'
import type { Exam, ExamAssignment } from '@/lib/types'

export { getExamUrgency } from './_pipeline-helpers'
export type { ExamPipelineProps }

function UBadge({ u, es, hasManual }: { u: Urgency; es: ES; hasManual: boolean }) {
  if (u === 'neutral') return null
  const msg = es === 'active' ? '● Явагдаж байна'
    : u === 'critical' ? '⚠ Яаралтай үнэлгээ хийнэ үү'
    : u === 'high' && es === 'submitted' ? 'Үнэлгээ хийх шаардлагатай'
    : u === 'ready' && hasManual ? 'Үнэлгээ дууссан — нийтлэх ✓'
    : u === 'ready' ? 'Үр дүн нийтлэх боломжтой ✓'
    : u === 'upcoming' ? 'Маргааш эхэлнэ' : u === 'medium' ? 'Үнэлгээ хийж байна...' : ''
  return (
    <span className={u === 'critical' || es === 'active' ? 'animate-pulse' : ''}
      style={{ background: UC[u] + '22', color: UC[u], fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {msg}
    </span>
  )
}

function ABtn({ u, es, exam, a, gc, sc }: { u: Urgency; es: ES; exam: Exam; a?: ExamAssignment; gc: number; sc: number }) {
  const s: React.CSSProperties = { fontSize: 12, padding: '3px 10px', borderRadius: 6, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }
  const cid = a?.classId ?? ''
  if (es === 'draft') return <Link href="/teacher/exams/create" style={{ ...s, border: '1px solid #0066FF', color: '#0066FF' }}>Нийтлэх</Link>
  if (es === 'active') return <Link href={`/teacher/live/${exam.id}`} style={{ ...s, background: '#0066FF', color: 'white' }}>Хянах</Link>
  if (es === 'submitted' && (u === 'critical' || u === 'high')) return <Link href={`/teacher/grading/${exam.id}/${cid}`} style={{ ...s, background: '#E8112D', color: 'white', fontWeight: 700 }}>Үнэлгээ хийх</Link>
  if (es === 'submitted') return <button style={{ ...s, background: '#1A7A4A', color: 'white', border: 'none' }}>Үр дүн нийтлэх</button>
  if (es === 'grading') return <Link href={`/teacher/grading/${exam.id}/${cid}`} style={{ ...s, background: '#B45309', color: 'white' }}>Үргэлжлүүлэх {gc}/{sc}</Link>
  if (u === 'ready') return <button className="animate-pulse" style={{ ...s, background: '#1A7A4A', color: 'white', border: 'none' }}>Үр дүн нийтлэх</button>
  if (es === 'released' || es === 'closed') return <Link href={`/teacher/exams/${a?.id ?? exam.id}`} style={{ ...s, border: '1px solid #DDE1E7', color: '#5A6474' }}>Дэлгэрэнгүй</Link>
  return null
}

export default function ExamPipeline(p: ExamPipelineProps) {
  const { exam, assignment: a, attempts: at, results: rs, questions: qs, variant = 'compact' } = p
  const es = getES(exam, a, at, rs)
  const u = getExamUrgency(p)
  const activeStep = ESTEP[es]
  const sub = (at ?? []).filter(x => x.status === 'submitted').length
  const pub = (rs ?? []).filter(r => r.isPublished).length
  const hasManual = (qs ?? []).some(q => q.isManualGrade)
  const fmt = (d: string) => new Date(d).toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' })

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 py-1 flex-wrap">
        <div className="flex items-center">
          {STEPS.map((_, i) => {
            const n = i + 1; const done = n < activeStep; const cur = n === activeStep
            const sz = cur ? 12 : 8; const bg = done ? '#0066FF' : cur ? UC[u] : '#DDE1E7'
            return (
              <div key={n} className="flex items-center">
                {i > 0 && <div style={{ width: 10, height: 1, background: done ? '#0066FF' : '#DDE1E7' }} />}
                <div style={{ width: sz, height: sz, borderRadius: '50%', background: bg, outline: cur ? `2px solid ${UC[u]}55` : 'none', outlineOffset: 1, flexShrink: 0 }} />
              </div>
            )
          })}
        </div>
        <UBadge u={u} es={es} hasManual={hasManual} />
        <div className="ml-auto shrink-0"><ABtn u={u} es={es} exam={exam} a={a} gc={pub} sc={sub} /></div>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-[12px] p-5" style={{ borderColor: '#DDE1E7' }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-[15px] truncate" style={{ color: '#1A1A2E' }}>{exam.title}</h3>
        <UBadge u={u} es={es} hasManual={hasManual} />
      </div>
      <div className="flex items-start mb-5 overflow-x-auto pb-1">
        {STEPS.map(({ l, I }, i) => {
          const n = i + 1; const done = n < activeStep; const cur = n === activeStep
          const col = done ? '#0066FF' : cur ? UC[u] : '#DDE1E7'
          return (
            <div key={n} className="flex items-start flex-1" style={{ minWidth: 0 }}>
              {i > 0 && <div style={{ flex: 1, height: 2, marginTop: 14, background: done ? '#0066FF' : '#DDE1E7' }} />}
              <div className="flex flex-col items-center" style={{ minWidth: 44 }}>
                <div className="flex items-center justify-center rounded-full border-2" style={{ width: 28, height: 28, background: done || cur ? col : 'white', borderColor: col, outline: cur ? `3px solid ${col}33` : 'none' }}>
                  <I size={13} color={done || cur ? 'white' : col} strokeWidth={1.5} />
                </div>
                <div style={{ fontSize: 9, color: cur ? col : '#5A6474', fontWeight: cur ? 700 : 400, textAlign: 'center', marginTop: 4, lineHeight: 1.2 }}>{l}</div>
              </div>
            </div>
          )
        })}
      </div>
      {(u === 'critical' || u === 'high') && sub > 0 && (
        <div className="rounded-[8px] p-3 mb-4" style={{ background: UC[u] + '11', border: `1px solid ${UC[u]}44` }}>
          <div className="font-semibold text-[16px] mb-2" style={{ color: UC[u] }}>{sub} сурагч үнэлгээ хүлээж байна</div>
          <div className="h-2 rounded-full mb-2" style={{ background: '#F0F2F5' }}><div className="h-full rounded-full" style={{ width: `${sub > 0 ? Math.round(pub / sub * 100) : 0}%`, background: '#B45309' }} /></div>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 12, color: '#5A6474' }}>{pub}/{sub} үнэлэгдсэн</span>
            <Link href={`/teacher/grading/${exam.id}/${a?.classId ?? ''}`} style={{ fontSize: 13, color: UC[u], fontWeight: 600 }}>Үнэлгээ хийх →</Link>
          </div>
        </div>
      )}
      {u === 'ready' && !hasManual && sub > 0 && (
        <div className="rounded-[8px] p-3 mb-4" style={{ background: '#DCFCE7', border: '1px solid #86EFAC' }}>
          <div className="font-semibold mb-2" style={{ color: '#1A7A4A' }}>✓ MCQ автоматаар үнэлэгдлээ — нийтлэхэд бэлэн</div>
          <button className="px-4 py-1.5 rounded text-white text-[13px] font-medium w-full" style={{ background: '#1A7A4A', border: 'none', cursor: 'pointer' }}>Үр дүн нийтлэх →</button>
        </div>
      )}
      {es === 'active' && (
        <div className="rounded-[8px] p-3 mb-4" style={{ background: '#EBF2FF', border: '1px solid #93C5FD' }}>
          <div className="font-semibold mb-2" style={{ color: '#0066FF' }}>{sub} сурагч шалгалт өгч байна</div>
          <Link href={`/teacher/live/${exam.id}`} className="block text-center px-4 py-1.5 rounded text-white text-[13px]" style={{ background: '#0066FF' }}>Дэлгэрэнгүй хянах →</Link>
        </div>
      )}
      {(es === 'released' || es === 'closed') && (
        <div className="rounded-[8px] p-3 mb-4" style={{ background: '#DCFCE7', border: '1px solid #86EFAC' }}>
          <div style={{ color: '#1A7A4A' }}>Сурагчид үр дүнгээ харж байна</div>
        </div>
      )}
      <div className="flex justify-between text-[12px] pt-3" style={{ color: '#5A6474', borderTop: '1px solid #F0F2F5' }}>
        <span>{sub} сурагч дууссан</span>
        <span>Эхэлсэн: {a ? fmt(a.scheduledStart) : '—'} · Дуусах: {a ? fmt(a.scheduledEnd) : '—'}</span>
      </div>
    </div>
  )
}
