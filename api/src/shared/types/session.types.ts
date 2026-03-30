import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { examSessions } from 'src/database/schema/sessions.schema';
import type { Answer } from './answer.types';
import type { Exam } from './exam.types';
import type { Question, StudentQuestion } from './question.types';

export type Session = InferSelectModel<typeof examSessions>;
export type NewSession = InferInsertModel<typeof examSessions>;
export type UpdateSession = Partial<
  Omit<NewSession, 'id' | 'examId' | 'studentId' | 'createdAt'>
>;
export type SessionStatus = Session['status'];

export interface SessionTiming {
  serverTime: string;
  startedAt: string | null;
  expiresAt: string | null;
  timeLimitMinutes: number;
  timeRemainingSeconds: number;
  isExpired: boolean;
}

export interface SessionAttempt {
  exam: Exam;
  session: Session;
  questions: StudentQuestion[];
  answers: Answer[];
  timing: SessionTiming;
}

export interface TeacherSessionAttempt {
  exam: Exam;
  session: Session;
  questions: Question[];
  answers: Answer[];
  timing: SessionTiming;
}

export interface AssignedExamSummary {
  exam: Exam;
  session: Session | null;
  enrolledAt: string;
  attemptStatus:
    | 'upcoming'
    | 'ready'
    | 'in_progress'
    | 'submitted'
    | 'force_submitted'
    | 'closed';
  timing: SessionTiming | null;
}
