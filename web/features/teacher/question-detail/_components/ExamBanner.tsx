import Link from 'next/link'
import { Edit, Copy, Printer, Calendar, Lock, Globe } from 'lucide-react'
import type { Exam } from '@/lib/types'

type Subject = { id: string; name: string }
export function ExamBanner({ exam, subject, subjectColor, isOwner }: {
  exam: Exam; subject: Subject | null; subjectColor: string; isOwner: boolean
}) {
  return (
    <div className="bg-white border rounded-[10px] overflow-hidden mb-6" style={{ borderColor: '#DDE1E7' }}>
      <div className="h-20 relative" style={{ backgroundColor: subjectColor }}>
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1v38h38V1H1z' fill='%23fff' fill-opacity='0.15'/%3E%3C/svg%3E")`, backgroundSize: '30px 30px' }} />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded text-[11px] bg-white/20 text-white">
          {exam.visibility === 'private' ? <Lock size={12} /> : <Globe size={12} />}
          {exam.visibility === 'private' ? 'Хувийн' : 'Нийтийн'}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-semibold mb-2" style={{ color: '#1A1A2E' }}>{exam.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ backgroundColor: `${subjectColor}20`, color: subjectColor }}>{subject?.name || exam.subjectId}</span>
              <span className="px-2 py-0.5 rounded text-[11px]" style={{ backgroundColor: '#F5F7FA', color: '#5A6474' }}>{exam.grade}-р анги</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={exam.status === 'published' ? { backgroundColor: 'rgba(26, 122, 74, 0.12)', color: '#1A7A4A' } : { backgroundColor: 'rgba(90, 100, 116, 0.12)', color: '#5A6474' }}>
                {exam.status === 'published' ? 'Нийтлэгдсэн' : 'Ноорог'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <Link href={`/teacher/exams/create?edit=${exam.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] border transition-colors hover:bg-[#F5F7FA]" style={{ borderColor: '#DDE1E7', color: '#5A6474' }}>
                <Edit size={14} strokeWidth={1.5} />Засах
              </Link>
            )}
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] border transition-colors hover:bg-[#F5F7FA]" style={{ borderColor: '#DDE1E7', color: '#5A6474' }}><Copy size={14} strokeWidth={1.5} />Хувилах</button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] border transition-colors hover:bg-[#F5F7FA]" style={{ borderColor: '#DDE1E7', color: '#5A6474' }}><Printer size={14} strokeWidth={1.5} />Хэвлэх</button>
            <Link href={`/teacher/exams/schedule?examId=${exam.id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium text-white" style={{ backgroundColor: '#0066FF' }}>
              <Calendar size={14} strokeWidth={1.5} />Товлох
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
