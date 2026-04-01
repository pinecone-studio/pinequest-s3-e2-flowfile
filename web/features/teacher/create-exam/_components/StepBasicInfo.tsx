import { Lock, Users, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Course } from '@/lib/types'
import { SUBJECT_NAMES } from '@/lib/constants'

function getCourseLabel(course: Course) {
  const subjectName = SUBJECT_NAMES[course.subjectId] ?? course.subjectId
  return `${subjectName} • ${course.grade}-р анги`
}

export function StepBasicInfo({
  title, courseId, chapter, topic, description, duration, visibility, courses,
  onTitle, onCourseId, onChapter, onTopic, onDescription, onDuration, onVisibility, onDemo,
}: {
  title: string; courseId: string; chapter: string; topic: string; description: string
  duration: number; visibility: 'private' | 'school'; courses: Course[]
  onTitle: (v: string) => void; onCourseId: (v: string) => void; onChapter: (v: string) => void
  onTopic: (v: string) => void; onDescription: (v: string) => void; onDuration: (v: number) => void
  onVisibility: (v: 'private' | 'school') => void; onDemo: () => void
}) {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="text-center flex-1">
          <h2 className="text-[20px] font-semibold text-foreground">Ерөнхий мэдээлэл</h2>
          <p className="text-[14px] text-text-secondary mt-1">Шалгалтын үндсэн мэдээллийг оруулна уу</p>
        </div>
        <button type="button" onClick={onDemo} className="shrink-0 px-3 py-2 border border-card-border rounded-lg text-[13px] font-medium text-foreground bg-white hover:bg-table-header transition-colors flex items-center gap-1.5"><Copy size={14} strokeWidth={1.5} />Demo</button>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">Гарчиг *</label>
        <input type="text" value={title} onChange={(e) => onTitle(e.target.value)} placeholder="Жишээ: 1-р улирлын шалгалт" className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">Хичээл *</label>
        <select value={courseId} onChange={(e) => onCourseId(e.target.value)} className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none bg-white transition-colors">
          <option value="">Сонгох...</option>
          {courses.map(course => (<option key={course.id} value={course.id}>{getCourseLabel(course)}</option>))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">Бүлэг</label>
          <input type="text" value={chapter} onChange={(e) => onChapter(e.target.value)} placeholder="Жишээ: 1-3 бүлэг" className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">Сэдэв</label>
          <input type="text" value={topic} onChange={(e) => onTopic(e.target.value)} placeholder="Жишээ: Квадрат тэгшитгэл" className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">Тайлбар</label>
        <textarea value={description} onChange={(e) => onDescription(e.target.value)} rows={3} placeholder="Шалгалтын тухай товч тайлбар..." className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none resize-none transition-colors" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">Хугацаа</label>
        <div className="flex items-center gap-3">
          <input type="number" value={duration} onChange={(e) => onDuration(Number(e.target.value))} min={1} className="w-24 px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
          <span className="text-[14px] text-text-secondary">минут</span>
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-2">Харагдах байдал</label>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onVisibility('private')} className={cn('p-4 rounded-lg border-2 text-left transition-all', visibility === 'private' ? 'bg-active-nav border-primary' : 'bg-white border-card-border hover:border-input-border')}>
            <div className="flex items-center gap-2.5 mb-1"><Lock size={16} className={visibility === 'private' ? 'text-primary' : 'text-text-secondary'} strokeWidth={1.5} /><span className="text-[14px] font-medium text-foreground">Хувийн</span></div>
            <p className="text-[12px] text-text-secondary">Зөвхөн та харна</p>
          </button>
          <button onClick={() => onVisibility('school')} className={cn('p-4 rounded-lg border-2 text-left transition-all', visibility === 'school' ? 'bg-active-nav border-primary' : 'bg-white border-card-border hover:border-input-border')}>
            <div className="flex items-center gap-2.5 mb-1"><Users size={16} className={visibility === 'school' ? 'text-primary' : 'text-text-secondary'} strokeWidth={1.5} /><span className="text-[14px] font-medium text-foreground">Сургуулийн</span></div>
            <p className="text-[12px] text-text-secondary">Бүх багш нар харна</p>
          </button>
        </div>
      </div>
    </div>
  )
}
