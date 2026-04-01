import type { ExamAssignment, Attempt, Submission } from '@/lib/types'

export const seedExamAssignments: ExamAssignment[] = [
  // Completed
  { id: 'EA001', examId: 'E25МАТ0003', classId: 'C10-1', assignedBy: 'T003', scheduledStart: '2025-03-10T08:00:00Z', scheduledEnd: '2025-03-10T09:00:00Z', extendedMinutes: 0, isPaused: false, status: 'completed' },
  { id: 'EA002', examId: 'E25МАТ0003', classId: 'C10-2', assignedBy: 'T003', scheduledStart: '2025-03-10T10:00:00Z', scheduledEnd: '2025-03-10T11:00:00Z', extendedMinutes: 0, isPaused: false, status: 'completed' },
  { id: 'EA003', examId: 'E25ФИЗ0003', classId: 'C10-1', assignedBy: 'T004', scheduledStart: '2025-03-12T08:00:00Z', scheduledEnd: '2025-03-12T08:30:00Z', extendedMinutes: 0, isPaused: false, status: 'completed' },
  
  // Active
  { id: 'EA004', examId: 'E25МАТ0004', classId: 'C10-1', assignedBy: 'T003', scheduledStart: '2025-03-27T08:00:00Z', scheduledEnd: '2025-03-27T08:45:00Z', extendedMinutes: 0, isPaused: false, status: 'active' },
  { id: 'EA005', examId: 'E25ФИЗ0004', classId: 'C10-1', assignedBy: 'T004', scheduledStart: '2025-03-27T10:00:00Z', scheduledEnd: '2025-03-27T10:40:00Z', extendedMinutes: 0, isPaused: false, status: 'active' },
  
  // Scheduled
  { id: 'EA006', examId: 'E25МАТ0005', classId: 'C10-1', assignedBy: 'T003', scheduledStart: '2025-04-15T08:00:00Z', scheduledEnd: '2025-04-15T09:00:00Z', extendedMinutes: 0, isPaused: false, status: 'scheduled' },
  { id: 'EA007', examId: 'E25МАТ0005', classId: 'C10-2', assignedBy: 'T003', scheduledStart: '2025-04-15T10:00:00Z', scheduledEnd: '2025-04-15T11:00:00Z', extendedMinutes: 0, isPaused: false, status: 'scheduled' },
  { id: 'EA008', examId: 'E25ФИЗ0005', classId: 'C10-1', assignedBy: 'T004', scheduledStart: '2025-05-20T08:00:00Z', scheduledEnd: '2025-05-20T09:30:00Z', extendedMinutes: 0, isPaused: false, status: 'scheduled' },
  
  // Closed (needs manual grading)
  { id: 'EA009', examId: 'E25МАТ0001', classId: 'C10-1', assignedBy: 'T003', scheduledStart: '2025-03-25T08:00:00Z', scheduledEnd: '2025-03-25T08:45:00Z', extendedMinutes: 0, isPaused: false, status: 'closed' },
]

export const seedAttempts: Attempt[] = [
  { id: 'ATT001', examId: 'E25МАТ0003', assignmentId: 'EA001', examAssignmentId: 'EA001', studentId: 'S1011001', answers: { 'Q001': 'ax² + bx + c = 0', 'Q002': '6', 'Q003': 'true' }, startedAt: '2025-03-10T08:02:00Z', endedAt: '2025-03-10T08:45:00Z', submittedAt: '2025-03-10T08:45:00Z', isComplete: true, timeSpentSeconds: 2580, status: 'graded', totalPoints: 50, earnedPoints: 48 },
  { id: 'ATT002', examId: 'E25МАТ0003', assignmentId: 'EA001', examAssignmentId: 'EA001', studentId: 'S1011002', answers: { 'Q001': 'ax² + bx + c = 0', 'Q002': '8', 'Q003': 'true' }, startedAt: '2025-03-10T08:01:00Z', endedAt: '2025-03-10T08:50:00Z', submittedAt: '2025-03-10T08:50:00Z', isComplete: true, timeSpentSeconds: 2940, status: 'graded', totalPoints: 50, earnedPoints: 43 },
  { id: 'ATT003', examId: 'E25МАТ0003', assignmentId: 'EA001', examAssignmentId: 'EA001', studentId: 'S1011003', answers: { 'Q001': 'ax + b = 0', 'Q002': '6', 'Q003': 'false' }, startedAt: '2025-03-10T08:03:00Z', endedAt: '2025-03-10T08:55:00Z', submittedAt: '2025-03-10T08:55:00Z', isComplete: true, timeSpentSeconds: 3120, status: 'graded', totalPoints: 50, earnedPoints: 34 },
  // Additional attempts for grading demo - these are submitted but need manual grading
  { id: 'ATT004', examId: 'E25МАТ0004', assignmentId: 'EA004', examAssignmentId: 'EA004', studentId: 'S1011001', answers: { 'Q006': 'Квадрат функц нь y = ax² + bx + c хэлбэртэй функц юм...', 'Q007': '√b = b^(1/2)' }, responses: [{ questionId: 'Q006', answer: 'Квадрат функц нь y = ax² + bx + c хэлбэртэй функц юм...' }, { questionId: 'Q007', answer: '√b = b^(1/2)' }], startedAt: '2025-03-27T08:02:00Z', endedAt: '2025-03-27T08:40:00Z', submittedAt: '2025-03-27T08:40:00Z', isComplete: true, timeSpentSeconds: 2280, status: 'submitted' },
  { id: 'ATT005', examId: 'E25МАТ0004', assignmentId: 'EA004', examAssignmentId: 'EA004', studentId: 'S1011002', answers: { 'Q006': 'Квадрат функцийн график парабол хэлбэртэй байна...', 'Q007': '√a = a^0.5' }, responses: [{ questionId: 'Q006', answer: 'Квадрат функцийн график парабол хэлбэртэй байна...' }, { questionId: 'Q007', answer: '√a = a^0.5' }], startedAt: '2025-03-27T08:01:00Z', endedAt: '2025-03-27T08:42:00Z', submittedAt: '2025-03-27T08:42:00Z', isComplete: true, timeSpentSeconds: 2460, status: 'submitted' },
  // Attempts for closed exam that need grading (EA009)
  { id: 'ATT006', examId: 'E25МАТ0001', assignmentId: 'EA009', examAssignmentId: 'EA009', studentId: 'S1011001', answers: { 'Q006': 'Квадрат функцийн графикийг зурахдаа эхлээд оройн цэгийг олно...', 'Q007': 'x = (-b ± √(b²-4ac)) / 2a' }, responses: [{ questionId: 'Q006', answer: 'Квадрат функцийн графикийг зурахдаа эхлээд оройн цэгийг олно...' }, { questionId: 'Q007', answer: 'x = (-b ± √(b²-4ac)) / 2a' }], startedAt: '2025-03-25T08:02:00Z', endedAt: '2025-03-25T08:40:00Z', submittedAt: '2025-03-25T08:40:00Z', isComplete: true, timeSpentSeconds: 2280, status: 'submitted' },
  { id: 'ATT007', examId: 'E25МАТ0001', assignmentId: 'EA009', examAssignmentId: 'EA009', studentId: 'S1011002', answers: { 'Q006': 'Параболын график нь оройн цэг, тэгш хэмийн тэнхлэгтэй байна...', 'Q007': '√(b²-4ac)' }, responses: [{ questionId: 'Q006', answer: 'Параболын график нь оройн цэг, тэгш хэмийн тэнхлэгтэй байна...' }, { questionId: 'Q007', answer: '√(b²-4ac)' }], startedAt: '2025-03-25T08:01:00Z', endedAt: '2025-03-25T08:43:00Z', submittedAt: '2025-03-25T08:43:00Z', isComplete: true, timeSpentSeconds: 2520, status: 'submitted' },
]

export const seedSubmissions: Submission[] = [
  { id: 'SUB001', attemptId: 'ATT001', examId: 'E25МАТ0003', studentId: 'S1011001', autoScore: 42, manualScore: 6, finalScore: 48, maxScore: 50, scorePerQuestion: { 'Q001': { auto: 2 }, 'Q002': { auto: 1 }, 'Q003': { auto: 1 }, 'Q006': { manual: 4 }, 'Q007': { manual: 2 } }, gradingStatus: 'approved', isAnonymous: false, isPublished: true, gradedBy: 'T003', approvedBy: 'T003' },
  { id: 'SUB002', attemptId: 'ATT002', examId: 'E25МАТ0003', studentId: 'S1011002', autoScore: 38, manualScore: 5, finalScore: 43, maxScore: 50, scorePerQuestion: { 'Q001': { auto: 2 }, 'Q002': { auto: 0 }, 'Q003': { auto: 1 }, 'Q006': { manual: 3 }, 'Q007': { manual: 2 } }, gradingStatus: 'approved', isAnonymous: false, isPublished: true, gradedBy: 'T003', approvedBy: 'T003' },
  { id: 'SUB003', attemptId: 'ATT003', examId: 'E25МАТ0003', studentId: 'S1011003', autoScore: 30, manualScore: 4, finalScore: 34, maxScore: 50, scorePerQuestion: { 'Q001': { auto: 0 }, 'Q002': { auto: 1 }, 'Q003': { auto: 0 }, 'Q006': { manual: 2 }, 'Q007': { manual: 2 } }, gradingStatus: 'approved', isAnonymous: false, isPublished: true, gradedBy: 'T003', approvedBy: 'T003' },
]
