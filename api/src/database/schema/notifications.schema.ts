import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users.schema';
import { exams } from './exams.schema';
import { examSessions } from './sessions.schema';

export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  recipientId: text('recipient_id')
    .notNull()
    .references(() => users.id),
  examId: text('exam_id').references(() => exams.id),
  sessionId: text('session_id').references(() => examSessions.id),
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
  isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});
