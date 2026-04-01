import type { Exam, ExamAssignment, Attempt, Result, Question } from '@/lib/types'
import { FileEdit, BookOpen, Calendar, Play, Send, ClipboardCheck, CheckCircle } from 'lucide-react'

export interface ExamPipelineProps {
  exam: Exam
  assignment?: ExamAssignment
  attempts?: Attempt[]
  results?: Result[]
  questions?: Question[]
  variant?: 'compact' | 'full'
}

export type Urgency = 'critical' | 'high' | 'medium' | 'ready' | 'upcoming' | 'neutral'
export type ES = 'draft' | 'no_assign' | 'scheduled' | 'active' | 'submitted' | 'grading' | 'released' | 'closed'

export function getES(e: Exam, a?: ExamAssignment, at?: Attempt[], rs?: Result[]): ES {
  if (e.status === 'draft') return 'draft'
  if (!a) return 'no_assign'
  if (a.status === 'scheduled') return 'scheduled'
  if (a.status === 'active') return 'active'
  const sub = (at ?? []).filter(x => x.status === 'submitted').length
  const pub = (rs ?? []).filter(r => r.isPublished).length
  if (pub > 0 && pub < sub) return 'grading'
  if (pub > 0) return 'released'
  if (sub > 0) return 'submitted'
  return a.status === 'closed' ? 'closed' : 'released'
}

export function getExamUrgency(p: ExamPipelineProps): Urgency {
  const { exam: e, assignment: a, attempts: at, results: rs, questions: qs } = p
  const es = getES(e, a, at, rs)
  const sub = (at ?? []).filter(x => x.status === 'submitted').length
  const pub = (rs ?? []).filter(r => r.isPublished).length
  const hasManual = (qs ?? []).some(q => q.isManualGrade)
  const hrs = (Date.now() - new Date(e.updatedAt).getTime()) / 3600000
  const sIn = a ? (new Date(a.scheduledStart).getTime() - Date.now()) / 3600000 : null
  if (es === 'submitted' && hasManual && hrs > 24) return 'critical'
  if (es === 'submitted' && hasManual) return 'high'
  if (es === 'active' && sIn !== null && sIn > -1 && sIn < 1) return 'high'
  if (es === 'grading') return 'medium'
  if (es === 'scheduled' && sIn !== null && sIn > 0 && sIn < 24) return 'upcoming'
  if (sub > 0 && (!hasManual || pub >= sub)) return 'ready'
  if (es === 'active') return 'ready'
  return 'neutral'
}

export const STEPS = [
  { l: 'Ноорог', I: FileEdit }, { l: 'Нийтлэгдсэн', I: BookOpen }, { l: 'Товлогдсон', I: Calendar },
  { l: 'Идэвхтэй', I: Play }, { l: 'Илгээгдсэн', I: Send }, { l: 'Үнэлгээ', I: ClipboardCheck },
  { l: 'Нийтлэгдлээ', I: CheckCircle },
]
export const ESTEP: Record<ES, number> = {
  draft: 1, no_assign: 2, scheduled: 3, active: 4, submitted: 5, grading: 6, released: 7, closed: 7,
}
export const UC: Record<Urgency, string> = {
  critical: '#E8112D', high: '#B45309', medium: '#0066FF', ready: '#1A7A4A', upcoming: '#0066FF', neutral: '#5A6474',
}
