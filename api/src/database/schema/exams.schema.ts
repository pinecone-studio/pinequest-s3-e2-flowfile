import {
  boolean,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const exams = pgTable('exams', {
  id: text('id').primaryKey(),
  teacherId: text('teacher_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  description: text('description'),
  status: text('status', {
    enum: ['draft', 'scheduled', 'published', 'closed'],
  })
    .notNull()
    .default('draft'),
  durationMinutes: integer('duration_minutes').notNull(),
  shuffleQuestions: boolean('shuffle_questions').notNull().default(false),
  allowCopyPaste: boolean('allow_copy_paste').notNull().default(false),
  requireFullscreen: boolean('require_fullscreen').notNull().default(true),
  maxTabSwitches: integer('max_tab_switches').notNull().default(3),
  startsAt: text('starts_at'),
  endsAt: text('ends_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const examEnrollments = pgTable(
  'exam_enrollments',
  {
    id: text('id').primaryKey(),
    examId: text('exam_id')
      .notNull()
      .references(() => exams.id, { onDelete: 'cascade' }),
    studentId: text('student_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assignedAt: text('assigned_at').notNull(),
  },
  (table) => [
    uniqueIndex('exam_enrollments_exam_student_unique').on(
      table.examId,
      table.studentId,
    ),
  ],
);
