import type { Course, SchoolClass } from '@/lib/types'
import { SUBJECT_NAMES } from '@/lib/constants'

function getCourseLabel(course: Course) {
  const subjectName = SUBJECT_NAMES[course.subjectId] ?? course.subjectId
  return `${subjectName} • ${course.grade}-р анги`
}

export function StepBasicInfo({
  title, courseId, duration, courses, availableClasses,
  onTitle, onCourseId, onDuration, onClassIds,
}: {
  title: string; courseId: string; duration: number
  courses: Course[]; availableClasses: SchoolClass[]
  onTitle: (v: string) => void; onCourseId: (v: string) => void
  onDuration: (v: number) => void; onClassIds: (ids: string[]) => void
}) {
  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="text-center mb-8">
        <h2 className="text-[20px] font-semibold text-foreground">Ерөнхий мэдээлэл</h2>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">Гарчиг *</label>
        <input type="text" value={title} onChange={(e) => onTitle(e.target.value)}
          placeholder="Жишээ: 1-р улирлын шалгалт"
          className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
      </div>
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">Хичээл *</label>
        <select value={courseId} onChange={(e) => onCourseId(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none bg-white transition-colors">
          <option value="">Сонгох...</option>
          {courses.map(course => (<option key={course.id} value={course.id}>{getCourseLabel(course)}</option>))}
        </select>
      </div>
      {availableClasses.length > 0 && (
        <div>
          <label className="block text-[13px] font-medium text-foreground mb-1.5">Бүлэг</label>
          <select onChange={(e) => onClassIds(e.target.value ? [e.target.value] : [])}
            className="w-full px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none bg-white transition-colors">
            <option value="">Сонгох...</option>
            {availableClasses.map(cls => (<option key={cls.id} value={cls.id}>{cls.name}</option>))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-[13px] font-medium text-foreground mb-1.5">Хугацаа</label>
        <div className="flex items-center gap-3">
          <input type="number" value={duration} onChange={(e) => onDuration(Number(e.target.value))} min={1}
            className="w-24 px-3.5 py-2.5 border border-input-border rounded-lg text-[14px] focus:border-primary focus:ring-1 focus:ring-primary/20 focus:outline-none transition-colors" />
          <span className="text-[14px] text-text-secondary">минут</span>
        </div>
      </div>
    </div>
  )
}
