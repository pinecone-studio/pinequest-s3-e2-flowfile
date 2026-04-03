'use client'
import { useRouter } from 'next/navigation'
import type { Exam, ExamAssignment, SchoolClass } from '@/lib/types'

interface Item { assignment: ExamAssignment; exam: Exam; cls: SchoolClass }
export function DashboardUrgentNew({ items }: { items: Item[] }) {
  const router = useRouter()
  return (
    <div className="bg-white border rounded-[12px] p-4" style={{ borderColor: '#DDE1E7' }}>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-semibold text-[15px]" style={{ color: '#1A1A2E' }}>Үнэлгээ хүлээгдэж буй</h2>
        {items.length > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[11px] text-white font-bold" style={{ background: '#E8112D' }}>{items.length}</span>
        )}
      </div>
      {items.length === 0 ? (
        <div className="rounded-[8px] p-3 text-[13px] font-medium" style={{ background: '#DCFCE7', color: '#1A7A4A' }}>
          ✓ Одоогоор үнэлэх шалгалт байхгүй байна
        </div>
      ) : items.map(({ assignment, exam, cls }) => (
        <div key={assignment.id}
          onClick={() => router.push(`/teacher/exams/${assignment.id}`)}
          className="mb-2 p-3 rounded-[8px] border-l-4 cursor-pointer"
          style={{ borderLeftColor: '#E8112D', backgroundColor: '#FFF8F8', border: '1px solid #FEE2E2', borderLeftWidth: 4 }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate" style={{ color: '#1A1A2E' }}>{exam.title}</div>
              <div className="text-[11px]" style={{ color: '#5A6474' }}>{cls.name}</div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); router.push(`/teacher/grading/${exam.id}/${cls.id}`) }}
              className="text-[12px] px-2 py-1 rounded-[6px] border font-medium shrink-0"
              style={{ borderColor: '#E8112D', color: '#E8112D' }}>
              Үнэлгээ хийх
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
