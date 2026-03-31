import Link from 'next/link'
import { Users, ClipboardList, Clock } from 'lucide-react'
import type { SchoolClass } from '@/lib/types'

export function CourseClassCard({
  cls,
  subjectColor,
  subjectPattern,
  upcomingExamCount,
}: {
  cls: SchoolClass
  subjectColor: string
  subjectPattern: string
  upcomingExamCount: number
}) {
  return (
    <Link
      href={`/teacher/classes/${cls.id}`}
      className="block rounded-[10px] overflow-hidden border bg-white transition-all duration-150 hover:-translate-y-0.5"
      style={{ borderColor: '#DDE1E7', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div className="h-[100px] relative overflow-hidden" style={{ backgroundColor: subjectColor, backgroundImage: subjectPattern }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-[24px] font-semibold" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
            {cls.name}
          </div>
        </div>
        <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
          <Clock size={12} className="text-white/70" />
          <span className="text-white/80 text-[11px]">{cls.name}</span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-[12px]" style={{ color: '#5A6474' }}>
            <div className="flex items-center gap-1.5"><Users size={14} strokeWidth={1.5} /><span>{(cls?.studentIds ?? []).length} сурагч</span></div>
            <div className="flex items-center gap-1.5"><ClipboardList size={14} strokeWidth={1.5} /><span>{upcomingExamCount} шалгалт</span></div>
          </div>
          {upcomingExamCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}>удахгүй</span>
          )}
        </div>
      </div>
    </Link>
  )
}
