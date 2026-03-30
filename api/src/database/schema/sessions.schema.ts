import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { exams } from './exams.schema';
import { questions } from './questions.schema';

export const examSessions = pgTable('exam_sessions', {
  id: text('id').primaryKey(),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', {
    enum: ['not_started', 'in_progress', 'submitted', 'force_submitted'],
  })
    .notNull()
    .default('not_started'),
  startedAt: text('started_at'),
  submittedAt: text('submitted_at'),
  score: integer('score'),
  isFlagged: boolean('is_flagged').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const answers = pgTable('answers', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => examSessions.id, { onDelete: 'cascade' }),
  questionId: text('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  textAnswer: text('text_answer'),
  formulaAnswerJson: text('formula_answer_json'),
  fileUrl: text('file_url'),
  lastSavedAt: text('last_saved_at').notNull(),
  isFinal: boolean('is_final').notNull().default(false),
  createdAt: text('created_at').notNull(),
});
