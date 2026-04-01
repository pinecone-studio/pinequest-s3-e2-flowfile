import Link from 'next/link'
import { COURSE_COLORS, SUBJECT_NAMES } from '@/lib/constants'
import type { Exam, ExamAssignment, SchoolClass, Result } from '@/lib/types'

interface RecentItem {
  exam: Exam
  assignment: ExamAssignment
  cls: SchoolClass
  results: Result[]
}

const fmt = (d: string) => { const date = new Date(d); return `${date.getMonth() + 1}-р сарын ${date.getDate()}` }

export function DashboardRecent({ items }: { items: RecentItem[] }) {
  return (
    <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
      <h2 className="font-semibold text-[15px] mb-3" style={{ color: '#1A1A2E' }}>Сүүлийн шалгалтуудын үр дүн</h2>
      {items.length === 0 && <div className="text-[13px]" style={{ color: '#5A6474' }}>Дууссан шалгалт байхгүй</div>}
      {items.map(({ exam, assignment, cls, results }) => {
        const pcts = results.map(r => r.percentage ?? 0)
        const avg = pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : 0
        const col = avg >= 70 ? '#1A7A4A' : avg >= 50 ? '#B45309' : '#E8112D'
        const subCol = COURSE_COLORS[exam.subjectId] || COURSE_COLORS.default
        const buckets = [0, 20, 40, 60, 80].map(min => pcts.filter(p => p >= min && p < min + 20).length)
        const maxB = Math.max(...buckets, 1)
        return (
          <div key={assignment.id} className="flex items-center gap-3 p-3 rounded-[8px] border-l-4 mb-2" style={{ borderLeftColor: subCol, background: '#FAFAFA' }}>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[14px] truncate" style={{ color: '#1A1A2E' }}>{exam.title}</div>
              <div className="text-[12px]" style={{ color: '#5A6474' }}>{SUBJECT_NAMES[exam.subjectId] || exam.subjectId} · {cls.name} · {fmt(assignment.scheduledStart)}</div>
              <div className="flex gap-0.5 mt-1">
                {buckets.map((b, i) => (
                  <div key={i} style={{ flex: 1, height: 4, background: (['#E8112D','#F97316','#B45309','#0066FF','#1A7A4A'][i]) + (maxB > 0 ? Math.round(b / maxB * 200 + 55).toString(16).padStart(2, '0') : '44'), borderRadius: 2 }} />
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[20px] font-bold" style={{ color: col }}>{avg}%</div>
              <div className="text-[11px]" style={{ color: '#5A6474' }}>{results.length}/{cls.studentIds.length} оролцсон</div>
              <Link href={`/teacher/exams/${assignment.id}`} className="text-[11px]" style={{ color: '#0066FF' }}>Дэлгэрэнгүй →</Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
