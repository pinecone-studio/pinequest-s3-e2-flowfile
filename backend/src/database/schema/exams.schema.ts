import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users.schema";

export const exams = sqliteTable('exams', {
  id: text('id').primaryKey(),
  teacherId: text('teacher_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['draft', 'scheduled', 'published', 'closed'],
  })
    .notNull()
    .default('draft'),
  durationMinutes: integer('duration_minutes').notNull(),
  shuffleQuestions: integer('shuffle_questions', { mode: 'boolean' })
    .notNull()
    .default(false),
  allowCopyPaste: integer('allow_copy_paste', { mode: 'boolean' })
    .notNull()
    .default(false),
  requireFullscreen: integer('require_fullscreen', { mode: 'boolean' })
    .notNull()
    .default(true),
  maxTabSwitches: integer('max_tab_switches').notNull().default(3),
  startsAt: text('starts_at'),
  endsAt: text('ends_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
 

export const examEnrollments = sqliteTable('exam_enrollments', {
  id: text('id').primaryKey(),
  examId: text('exam_id').notNull(),
  studentId: text('student_id').notNull(),
  assignedAt: text('assigned_at').notNull(),
});
 

