'use client'
import { useRouter } from 'next/navigation'
import { COURSE_COLORS, SUBJECT_NAMES } from '@/lib/constants'
import type { Exam, ExamAssignment, SchoolClass, Result } from '@/lib/types'

interface RecentItem { exam: Exam; assignment: ExamAssignment; cls: SchoolClass; results: Result[] }

function fmtDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}.${dt.getMonth()+1}.${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
}

export function DashboardRecent({ items }: { items: RecentItem[] }) {
  const router = useRouter()
  return (
    <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
      <h2 className="font-semibold text-[15px] mb-3" style={{ color: '#1A1A2E' }}>Сүүлийн шалгалтуудын үр дүн</h2>
      {items.length === 0 && <div className="text-[13px]" style={{ color: '#5A6474' }}>Дууссан шалгалт байхгүй</div>}
      {items.map(({ exam, assignment, cls, results }) => {
        const pcts = results.map(r => r.percentage ?? 0)
        const avg = pcts.length ? Math.round(pcts.reduce((x, y) => x + y, 0) / pcts.length) : 0
        const col = avg >= 70 ? '#1A7A4A' : avg >= 50 ? '#B45309' : '#E8112D'
        const subCol = COURSE_COLORS[exam.subjectId] || COURSE_COLORS.default
        return (
          <div key={assignment.id}
            onClick={() => router.push(`/teacher/exams/${assignment.id}`)}
            className="flex items-center gap-3 p-3 rounded-[8px] border-l-4 mb-2 cursor-pointer hover:bg-[#F5F7FA] transition-colors"
            style={{ borderLeftColor: subCol, background: '#FAFAFA' }}>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[14px] truncate" style={{ color: '#1A1A2E' }}>{exam.title}</div>
              <div className="text-[12px]" style={{ color: '#5A6474' }}>
                {SUBJECT_NAMES[exam.subjectId] || exam.subjectId} · {cls.name} · {fmtDate(assignment.scheduledStart)}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[20px] font-bold" style={{ color: col }}>{avg}%</div>
              <div className="text-[11px]" style={{ color: '#5A6474' }}>{results.length}/{cls.studentIds.length} оролцсон</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
