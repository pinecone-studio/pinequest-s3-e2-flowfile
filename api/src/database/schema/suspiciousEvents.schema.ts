import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users.schema';
import { exams } from './exams.schema';
import { examSessions } from './sessions.schema';

export const suspiciousEvents = sqliteTable('suspicious_events', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => examSessions.id),
  studentId: text('student_id')
    .notNull()
    .references(() => users.id),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id),
  eventType: text('event_type', {
    enum: [
      'tab_switch',
      'fullscreen_exit',
      'copy_attempt',
      'paste_attempt',
      'return_to_exam',
      'window_blur',
      'devtools_open',
    ],
  }).notNull(),
  metadataJson: text('metadata_json'),
  occurredAt: text('occurred_at').notNull(),
  createdAt: text('created_at').notNull(),
});
