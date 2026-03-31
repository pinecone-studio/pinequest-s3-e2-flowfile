import Link from 'next/link'
import { Users, ClipboardList } from 'lucide-react'
import type { Course } from '@/lib/types'

export function CourseCard({
  course,
  subjectColor,
  subjectPattern,
  subjectName,
  classCount,
  examCount,
}: {
  course: Course
  subjectColor: string
  subjectPattern: string
  subjectName: string
  classCount: number
  examCount: number
}) {
  return (
    <Link
      href={`/teacher/courses/${course.id}`}
      className="block rounded-[10px] overflow-hidden border bg-white transition-all duration-150 hover:-translate-y-0.5"
      style={{ borderColor: '#DDE1E7', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.09)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <div className="h-[130px] relative overflow-hidden" style={{ backgroundColor: subjectColor, backgroundImage: subjectPattern }}>
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] text-white" style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}>
          {course.year}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[16px] font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
            {course.subjectId}
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-white text-[13px] font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>{subjectName}</div>
          <div className="text-white/80 text-[12px]" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>{course.grade}-р анги</div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: '#F0F2F5', color: '#5A6474' }}>{course.grade}-р анги</span>
          <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: '#EBF2FF', color: '#0066FF' }}>I улирал</span>
        </div>
        <div className="flex items-center gap-4 text-[12px]" style={{ color: '#5A6474' }}>
          <div className="flex items-center gap-1.5"><Users size={14} strokeWidth={1.5} /><span>{classCount} анги</span></div>
          <div className="flex items-center gap-1.5"><ClipboardList size={14} strokeWidth={1.5} /><span>{examCount} шалгалт</span></div>
        </div>
      </div>
    </Link>
  )
}
