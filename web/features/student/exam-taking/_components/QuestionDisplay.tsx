import type { StudentExamQuestion } from '@/lib/api/student-exams'
import { QUESTION_TYPE_CONFIG } from '@/lib/constants'

interface SubjectColor {
  bg: string
}

interface QuestionDisplayProps {
  question: StudentExamQuestion
  currentIndex: number
  subjectColor: SubjectColor
}

export function QuestionDisplay({ question, currentIndex, subjectColor }: QuestionDisplayProps) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
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

      <div className="mb-6 rounded-xl border border-card-border bg-white p-4 md:p-6">
        <p className="text-[17px] text-foreground leading-relaxed">
          {question.text}
        </p>
      </div>
    </>
  )
}
