export type VisualStage = 'draft'|'scheduled'|'active'|'submitted'|'grading'|'reported'|'releasing'|'released'

export interface StageConfig {
  key: VisualStage; label: string; activeLabel: string; color: string; bgColor: string
}

export const STAGE_CONFIGS: StageConfig[] = [
  { key: 'draft',     label: 'Ноорог',                 activeLabel: 'Ноорог болж байна',           color: '#6366F1', bgColor: '#EEF2FF' },
  { key: 'scheduled', label: 'Товлогдсон',             activeLabel: 'Товлогдсон',                  color: '#2563EB', bgColor: '#EFF6FF' },
  { key: 'active',    label: 'Явагдаж байна',          activeLabel: 'Явагдаж байна',               color: '#059669', bgColor: '#ECFDF5' },
  { key: 'submitted', label: 'Хаагдсан',               activeLabel: 'Хаагдсан',                    color: '#D97706', bgColor: '#FFFBEB' },
  { key: 'grading',   label: 'Үнэлгээ хийгдэж байна', activeLabel: 'Үнэлгээ хийгдэж байна',      color: '#7C3AED', bgColor: '#F5F3FF' },
  { key: 'reported',  label: 'Тайлан бэлдэж байна',   activeLabel: 'Тайлан бэлдэж байна',        color: '#0891B2', bgColor: '#ECFEFF' },
  { key: 'releasing', label: 'Тайлан илгээсэн',        activeLabel: 'Тайлан илгээж байна',        color: '#EA580C', bgColor: '#FFF7ED' },
  { key: 'released',  label: 'Дүн нийтлэгдсэн',       activeLabel: 'Дүн нийтлэгдсэж байна',     color: '#16A34A', bgColor: '#F0FDF4' },
]

export function computeVisualStage(
  assignment: { status: string; scheduledStart: string; scheduledEnd: string },
  attempts: { status: string; score?: number | null }[],
  classSize: number,
): VisualStage {
  const now = Date.now()
  const start = assignment.scheduledStart ? new Date(assignment.scheduledStart).getTime() : 0
  const end = assignment.scheduledEnd ? new Date(assignment.scheduledEnd).getTime() : 0
  const { status } = assignment
  if (status === 'draft' || !assignment.scheduledStart) return 'draft'
  if ((status === 'scheduled' || status === 'published') && now < start) return 'scheduled'
  if (status === 'active' || (status === 'published' && now >= start && now <= end)) return 'active'
  const submitted = attempts.filter(a => a.status === 'submitted' || a.status === 'graded' || a.status === 'force_submitted')
  if (status === 'closed' || now > end) {
    if (submitted.length === 0 || submitted.length < classSize) return 'submitted'
    if (submitted.some(a => a.score == null)) return 'grading'
    return 'reported'
  }
  return 'scheduled'
}

export function getStageConfig(stage: VisualStage): StageConfig {
  return STAGE_CONFIGS.find(s => s.key === stage) ?? STAGE_CONFIGS[1]
}
