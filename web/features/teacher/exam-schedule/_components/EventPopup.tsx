import { Eye, Pause, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Exam, ExamAssignment } from '@/lib/types'

type ClassItem = { id: string; name: string }
const statusLabels: Record<string, string> = { scheduled: 'Товлогдсон', active: 'Идэвхтэй', completed: 'Дууссан' }
const statusStyles: Record<string, string> = { scheduled: 'bg-[#B45309]/12 text-[#B45309]', active: 'bg-[#1A7A4A]/12 text-[#1A7A4A]', completed: 'bg-[#5A6474]/12 text-[#5A6474]' }

export function EventPopup({ event, getClass, onClose }: {
  event: { assignment: ExamAssignment; exam: Exam; position: { x: number; y: number } }
  getClass: (classId: string) => ClassItem | undefined
  onClose: () => void
}) {
  return (
    <div className="fixed bg-white border rounded-[10px] shadow-lg w-[200px] z-50" style={{ left: event.position.x, top: event.position.y, borderColor: '#DDE1E7' }} onClick={(e) => e.stopPropagation()}>
      <div className="p-3">
        <h3 className="text-[14px] font-medium mb-1" style={{ color: '#1A1A2E' }}>{event.exam.title}</h3>
        <p className="text-[12px] mb-2" style={{ color: '#5A6474' }}>{getClass(event.assignment.classId)?.name}</p>
        <span className={cn('px-2 py-0.5 text-[11px] rounded-full font-medium', statusStyles[event.assignment.status])}>{statusLabels[event.assignment.status]}</span>
      </div>
      <div className="border-t px-3 py-2 flex flex-col gap-1" style={{ borderColor: '#DDE1E7' }}>
        <button className="flex items-center gap-2 text-[12px] hover:underline w-full" style={{ color: '#0066FF' }}><Eye size={12} strokeWidth={1.5} />Дэлгэрэнгүй харах</button>
        <button className="flex items-center gap-2 text-[12px] hover:underline w-full" style={{ color: '#0066FF' }}><Pause size={12} strokeWidth={1.5} />Түр зогсоох</button>
        <button className="flex items-center gap-2 text-[12px] hover:underline w-full" style={{ color: '#0066FF' }}><Clock size={12} strokeWidth={1.5} />Хугацаа сунгах</button>
      </div>
    </div>
  )
}
