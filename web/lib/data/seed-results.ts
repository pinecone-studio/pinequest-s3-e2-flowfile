import type { Result } from '@/lib/types'

export const seedResults: Result[] = [
  { id: 'R001', attemptId: 'ATT001', studentId: 'S1011001', examId: 'E25МАТ0003', examAssignmentId: 'EA001', scorePerQuestion: {}, totalScore: 48, maxScore: 50, percentage: 96, isPublished: true, submittedAt: '2025-03-10T08:45:00Z' },
  { id: 'R002', attemptId: 'ATT002', studentId: 'S1011002', examId: 'E25МАТ0003', examAssignmentId: 'EA001', scorePerQuestion: {}, totalScore: 43, maxScore: 50, percentage: 86, isPublished: true, submittedAt: '2025-03-10T08:50:00Z' },
  { id: 'R003', attemptId: 'ATT003', studentId: 'S1011003', examId: 'E25МАТ0003', examAssignmentId: 'EA001', scorePerQuestion: {}, totalScore: 34, maxScore: 50, percentage: 68, isPublished: true, submittedAt: '2025-03-10T08:55:00Z' },
]

export const initialResults: Result[] = seedResults
