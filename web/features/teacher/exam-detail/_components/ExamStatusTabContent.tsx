import type { Exam, ExamAssignment, SchoolClass, Attempt, Result, Question, User } from '@/lib/types'
import type { VisualStage } from '../examStageUtils'
import type { ExamDetailResponse } from '@/lib/api/teacher-exams'
import { TabDraft } from './tabs/TabDraft'
import { TabScheduled } from './tabs/TabScheduled'
import { TabActive } from './tabs/TabActive'
import { TabSubmitted } from './tabs/TabSubmitted'
import { TabGrading } from './tabs/TabGrading'
import { TabReported } from './tabs/TabReported'
import { TabReleasing } from './tabs/TabReleasing'
import { TabReleased } from './tabs/TabReleased'

export interface TabProps {
  stage: VisualStage; currentStage: VisualStage; assignment: ExamAssignment; exam: Exam
  cls: SchoolClass; classStudents: User[]; attempts: Attempt[]; results: Result[]
  questions: Question[]; apiData: ExamDetailResponse | null; onRefresh: () => void
}

export function ExamStatusTabContent(props: TabProps) {
  switch (props.stage) {
    case 'draft':     return <TabDraft {...props} />
    case 'scheduled': return <TabScheduled {...props} />
    case 'active':    return <TabActive {...props} />
    case 'submitted': return <TabSubmitted {...props} />
    case 'grading':   return <TabGrading {...props} />
    case 'reported':  return <TabReported {...props} />
    case 'releasing': return <TabReleasing {...props} />
    case 'released':  return <TabReleased {...props} />
    default:          return <TabScheduled {...props} />
  }
}
