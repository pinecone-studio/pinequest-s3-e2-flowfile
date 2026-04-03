import { pgTable, text } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { exams } from './exams.schema';
import { examSessions } from './sessions.schema';

export const suspiciousEvents = pgTable('suspicious_events', {
  id: text('id').primaryKey(),
  sessionId: text('session_id')
    .notNull()
    .references(() => examSessions.id, { onDelete: 'cascade' }),
  studentId: text('student_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id, { onDelete: 'cascade' }),
  eventType: text('event_type', {
    enum: [
      'tab_switch',
      'fullscreen_exit',
      'copy_attempt',
      'paste_attempt',
      'return_to_exam',
      'window_blur',
      'devtools_open',
      'face_not_detected',
      'multiple_faces_detected',
      'audio_detected',
      'device_changed',
      'looking_left',
      'looking_right',
      'looking_up',
      'looking_down',
    ],
  }).notNull(),
  metadataJson: text('metadata_json'),
  occurredAt: text('occurred_at').notNull(),
  createdAt: text('created_at').notNull(),
});
