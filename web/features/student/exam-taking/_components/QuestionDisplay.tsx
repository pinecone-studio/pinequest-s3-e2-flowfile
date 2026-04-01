import type { Question } from '@/lib/types'
import { QUESTION_TYPE_CONFIG } from '@/lib/constants'

interface SubjectColor {
  bg: string
}

interface QuestionDisplayProps {
  question: Question
  currentIndex: number
  subjectColor: SubjectColor
}

export function QuestionDisplay({ question, currentIndex, subjectColor }: QuestionDisplayProps) {
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: subjectColor.bg + '20', color: subjectColor.bg }}>
          Асуулт {currentIndex + 1}
        </span>
        <span className="px-2.5 py-1 bg-table-header text-text-secondary rounded-full text-[11px] font-medium">
          {QUESTION_TYPE_CONFIG[question.type]?.label || question.type}
        </span>
        <span className="px-2.5 py-1 bg-table-header text-text-secondary rounded-full text-[11px] font-medium">
          {question.points} оноо
        </span>
      </div>

      <div className="bg-white rounded-xl border border-card-border p-6 mb-6">
        <p className="text-[17px] text-foreground leading-relaxed">
          {question.text}
        </p>
      </div>
    </>
  )
}
