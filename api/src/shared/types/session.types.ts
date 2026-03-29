import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { examSessions } from 'src/database/schema';

export type Session = InferSelectModel<typeof examSessions>;
export type NewSession = InferInsertModel<typeof examSessions>;
export type UpdateSession = Partial<
  Omit<NewSession, 'id' | 'examId' | 'studentId' | 'createdAt'>
>;
export type SessionStatus = Session['status'];
