// lib/types.ts

export type UserRole = 'commission' | 'admin' | 'section_lead' | 'teacher' | 'student'

export interface User {
  id: string           // code-based: T001, S1013001
  name: string         // Mongolian full name
  role: UserRole
  avatarInitials: string
  subjectIds?: string[]   // teacher: subjects they teach
  classIds?: string[]     // teacher: classes assigned to; student: [single classId]
}

export interface Subject {
  id: string           // МАТ, МОН, etc.
  name: string         // Математик, Монгол хэл, etc.
  colorKey: string     // maps to COURSE_COLORS
  patternKey: string   // maps to PATTERNS
  hoursPerWeek: number // 1 = 1 period/week, 2 = 2 periods/week
}

export interface Course {
  id: string
  subjectId: string
  grade: number         // 1–12
  year: string          // '2024–2025'
  teacherId: string
  classIds: string[]
}

export interface SchoolClass {
  id: string            // C10-1
  grade: number
  classNumber: number   // 1, 2, 3...
  name: string          // "10-1-р анги"
  studentIds: string[]  // 20–35 students
  homeroomTeacherId: string
}

export interface Schedule {
  classId: string
  subjectId: string
  teacherId: string
  periods: {
    day: 0|1|2|3|4    // Mon–Fri
    periodNumber: number  // 1–8
  }[]
}

export type ExamOwnerType = 'commission' | 'school' | 'section' | 'teacher'
export type ExamStatus = 'draft' | 'private' | 'published'
export type ExamAssignmentStatus = 'scheduled' | 'active' | 'completed' | 'closed'

export interface Exam {
  id: string            // E25МАТ0001
  title: string
  subjectId: string
  grade?: number        // target grade level
  chapter?: string
  topic?: string
  description?: string
  duration: number      // minutes
  totalPoints: number
  ownerType: ExamOwnerType
  ownerId: string       // userId or sectionId
  collaboratorIds: string[]
  status: ExamStatus    // draft | private | published
  visibility: 'private' | 'school' | 'national'
  questionIds: string[]
  isTemplate: boolean
  createdAt: string
  updatedAt: string
  tags: string[]
}

export interface Question {
  id: string
  examId: string
  text: string
  imageUrl?: string
  type: 'single' | 'multiple' | 'truefalse' | 'matching' | 'short' | 'long' | 'formula' | 'chemistry' | 'code' | 'voice' | 'video' | 'handwritten'
  options?: string[]
  matchingPairs?: { left: string; right: string }[]
  correctAnswer?: string | string[]
  points: number
  order: number
  isManualGrade: boolean
}

export interface ExamAssignment {
  id: string
  examId: string
  classId: string
  assignedBy: string     // teacherId
  scheduledStart: string // ISO
  scheduledEnd: string   // ISO
  extendedMinutes: number
  isPaused: boolean
  status: ExamAssignmentStatus
}

export interface GraderAssignment {
  id: string
  examId: string
  classId: string
  graderId: string
  studentIds: string[]
  gradingStatus: 'pending' | 'in_progress' | 'done'
}

export interface Attempt {
  id: string
  examId: string
  assignmentId: string
  examAssignmentId?: string  // alias for assignmentId
  studentId: string
  answers: Record<string, string | string[]>
  responses?: { questionId: string; answer: string }[]
  startedAt: string
  endedAt?: string
  submittedAt?: string
  isComplete: boolean
  timeSpentSeconds: number
  status?: 'in_progress' | 'submitted' | 'graded'
  totalPoints?: number
  earnedPoints?: number
}

export interface Submission {
  id: string
  attemptId: string
  examId: string
  studentId: string
  autoScore: number          // MCQ/T-F auto-graded
  manualScore: number        // manual questions graded
  finalScore: number         // combined after approval
  maxScore: number
  scorePerQuestion: Record<string, { auto?: number; manual?: number; feedback?: string }>
  gradingStatus: 'ungraded' | 'partial' | 'graded' | 'approved'
  isAnonymous: boolean       // default true for manual grading
  isPublished: boolean       // visible to student
  gradedBy?: string
  approvedBy?: string
}

// Result is a simplified view of a student's exam submission
export interface Result {
  id: string
  attemptId: string
  studentId: string
  examId: string
  examAssignmentId?: string
  scorePerQuestion: Record<string, number>
  totalScore: number
  maxScore: number
  percentage?: number
  isPublished: boolean
  submittedAt?: string
}

export type AppNotificationType = 'exam_assigned' | 'exam_started' | 'exam_submitted' | 'suspicious_event' | 'result_published'

export interface AppNotification {
  id: string
  recipientId: string
  title: string
  body: string
  type: AppNotificationType
  examId?: string
  classId?: string
  isRead: boolean
  createdAt: string
}

export type QuestionType = Question['type']

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single: 'Нэг сонголт',
  multiple: 'Олон сонголт',
  truefalse: 'Үнэн/Худал',
  matching: 'Тааруулах',
  short: 'Богино текст',
  long: 'Урт текст',
  formula: 'Томъёо',
  chemistry: 'Химийн томъёо',
  code: 'CodeMirror код',
  voice: 'Дуу бичлэг',
  video: 'Видео хариулт',
  handwritten: 'Гараар зурсан/медиа',
}

// Permission system
export type ExamAction = 'edit' | 'delete' | 'publish' | 'assign' | 'duplicate' | 'grade' | 'view'

export function canDo(action: ExamAction, exam: Exam, user: User): boolean {
  const isOwner = exam.ownerId === user.id
  const isCollaborator = exam.collaboratorIds.includes(user.id)
  const isAdmin = user.role === 'admin'
  const isCommission = user.role === 'commission'
  
  switch(action) {
    case 'view':      return exam.status === 'published' || isOwner || isCollaborator || isAdmin
    case 'edit':      return (isOwner || isCollaborator) && exam.status !== 'published' 
                             || isAdmin || isCommission
    case 'delete':    return isOwner || isAdmin
    case 'publish':   return isOwner || isAdmin || isCommission
    case 'assign':    return exam.status === 'published' && (user.role === 'teacher' || isAdmin)
    case 'duplicate': return exam.status === 'published'
    case 'grade':     return isOwner || isCollaborator || isAdmin
    default:          return false
  }
}
