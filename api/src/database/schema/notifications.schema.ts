import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { exams } from './exams.schema';
import { examSessions } from './sessions.schema';

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  recipientId: text('recipient_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  examId: text('exam_id').references(() => exams.id, { onDelete: 'set null' }),
  sessionId: text('session_id').references(() => examSessions.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  type: text('type', {
    enum: [
      'suspicious_event',
      'exam_started',
      'exam_submitted',
      'exam_published',
    ],
  }).notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: text('created_at').notNull(),
});
