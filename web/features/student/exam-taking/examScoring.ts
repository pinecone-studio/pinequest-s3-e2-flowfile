import { save } from '@/lib/data'
import type { Attempt, Question, Result } from '@/lib/types'

export function scoreAndSave({
  exam,
  assignment,
  questions,
  answers,
  timeRemaining,
  currentStudentId,
}: {
  exam: { id: string; duration: number }
  assignment: { id: string } | null
  questions: Question[]
  answers: Record<string, string | string[]>
  timeRemaining: number
  currentStudentId: string
}) {
  const startedAt = new Date(Date.now() - (exam.duration * 60 - timeRemaining) * 1000).toISOString()
  const submittedAt = new Date().toISOString()
  const timeSpentSeconds = Math.max(0, exam.duration * 60 - timeRemaining)
  const assignmentId = assignment?.id ?? exam.id

  const attempt: Attempt = {
    id: `attempt-${Date.now()}`,
    examId: exam.id,
    assignmentId,
    examAssignmentId: assignmentId,
    studentId: currentStudentId,
    answers,
    startedAt,
    submittedAt,
    isComplete: true,
    timeSpentSeconds,
    status: 'submitted',
  }
  save('attempts', attempt)

  const scorePerQuestion: Record<string, number> = {}
  let totalScore = 0
  let maxScore = 0

  questions.forEach(q => {
    maxScore += q.points
    const answer = answers[q.id]
    if (q.type === 'single' || q.type === 'truefalse') {
      if (answer === q.correctAnswer) {
        scorePerQuestion[q.id] = q.points
        totalScore += q.points
      } else {
        scorePerQuestion[q.id] = 0
      }
    } else if (q.type === 'multiple') {
      const correct = q.correctAnswer as string[]
      const userAnswer = (answer as string[]) || []
      if (JSON.stringify([...userAnswer].sort()) === JSON.stringify([...correct].sort())) {
        scorePerQuestion[q.id] = q.points
        totalScore += q.points
      } else {
        scorePerQuestion[q.id] = 0
      }
    } else {
      scorePerQuestion[q.id] = 0
    }
  })

  const result: Result = {
    id: `result-${Date.now()}`,
    attemptId: attempt.id,
    studentId: currentStudentId,
    examId: exam.id,
    examAssignmentId: assignment?.id,
    scorePerQuestion,
    totalScore,
    maxScore,
    percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
    isPublished: false,
    submittedAt,
  }
  save('results', result)

  localStorage.removeItem(`attempt_${assignmentId}_${currentStudentId}`)
}
