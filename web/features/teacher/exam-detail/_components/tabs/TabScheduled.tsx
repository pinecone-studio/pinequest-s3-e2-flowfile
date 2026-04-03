'use client'
import { useEffect, useState } from 'react'
import type { TabProps } from '../ExamStatusTabContent'

function fmtDate(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}.${dt.getMonth()+1}.${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
}

function getCountdown(target: string) {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return { days, hours, minutes }
}

export function TabScheduled({ assignment, exam, cls, classStudents, questions }: TabProps) {
  const [countdown, setCountdown] = useState<ReturnType<typeof getCountdown> | null>(null)
  useEffect(() => {
    const update = () => setCountdown(getCountdown(assignment.scheduledStart))
    update()
    const iv = setInterval(update, 60000)
    return () => clearInterval(iv)
  }, [assignment.scheduledStart])
  const { days, hours, minutes } = countdown ?? { days: 0, hours: 0, minutes: 0 }
  const dur = Math.round((new Date(assignment.scheduledEnd).getTime() - new Date(assignment.scheduledStart).getTime()) / 60000)
  return (
    <div className="max-w-xl space-y-4">
      <div className="p-4 rounded-[10px] border-l-4" style={{ backgroundColor: '#EFF6FF', borderLeftColor: '#2563EB', borderColor: '#BFDBFE' }}>
        <div className="text-[13px] font-medium" style={{ color: '#1D4ED8' }}>
          {countdown ? `Эхлэхэд ${days > 0 ? `${days} өдөр ` : ''}${hours > 0 ? `${hours} цаг ` : ''}${minutes} минут үлдлээ` : 'Хугацаа тооцоолж байна…'}
        </div>
      </div>
      <div className="bg-white border rounded-[10px] p-5" style={{ borderColor: '#DDE1E7' }}>
        <div className="text-[14px] font-semibold mb-3" style={{ color: '#1A1A2E' }}>Хуваарийн мэдээлэл</div>
        <div className="space-y-2 text-[13px]">
          <div className="flex justify-between"><span style={{ color: '#5A6474' }}>Анги</span><span style={{ color: '#1A1A2E' }}>{cls.name}</span></div>
          <div className="flex justify-between"><span style={{ color: '#5A6474' }}>Эхлэх</span><span style={{ color: '#1A1A2E' }}>{fmtDate(assignment.scheduledStart)}</span></div>
          <div className="flex justify-between"><span style={{ color: '#5A6474' }}>Дуусах</span><span style={{ color: '#1A1A2E' }}>{fmtDate(assignment.scheduledEnd)}</span></div>
          <div className="flex justify-between"><span style={{ color: '#5A6474' }}>Үргэлжлэх хугацаа</span><span style={{ color: '#1A1A2E' }}>{dur} минут</span></div>
          <div className="flex justify-between"><span style={{ color: '#5A6474' }}>Нийт асуулт</span><span style={{ color: '#1A1A2E' }}>{questions.length}</span></div>
          <div className="flex justify-between"><span style={{ color: '#5A6474' }}>Сурагчдын тоо</span><span style={{ color: '#1A1A2E' }}>{classStudents.length}</span></div>
        </div>
      </div>
    </div>
  )
}
