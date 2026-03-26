import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users.schema';
import { exams } from './exams.schema';
import { questions } from './questions.schema';

export const examSessions = sqliteTable('exam_sessions', {
  id: text('id').primaryKey(),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id),
  studentId: text('student_id')
    .notNull()
    .references(() => users.id),
  status: text('status', {
    enum: ['not_started', 'in_progress', 'submitted', 'force_submitted'],
  })
    .notNull()
    .default('not_started'),
  startedAt: text('started_at'),
  submittedAt: text('submitted_at'),
  score: integer('score'),
  isFlagged: integer('is_flagged', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const answers = sqliteTable('answers', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => examSessions.id),
  questionId: text('question_id')
    .notNull()
    .references(() => questions.id),
  textAnswer: text('text_answer'),
  formulaAnswerJson: text('formula_answer_json'),
  fileUrl: text('file_url'),
  lastSavedAt: text('last_saved_at').notNull(),
  isFinal: integer('is_final', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});
