import {
  pgTable,
  text,
  integer,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';

export const offlineExamDrafts = pgTable(
  'offline_exam_drafts',
  {
    id: text('id').primaryKey(),
    draftKey: text('draft_key').notNull().unique(),
    assignmentId: text('assignment_id').notNull(),
    examId: text('exam_id').notNull(),
    studentId: text('student_id').notNull(),
    answersJson: text('answers_json').notNull(),
    markedForReviewJson: text('marked_for_review_json').notNull(),
    currentIndex: integer('current_index').notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    clientUpdatedAt: timestamp('client_updated_at', {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    syncedAt: timestamp('synced_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    assignmentStudentUnique: unique().on(table.assignmentId, table.studentId),
    studentSyncedIdx: index('offline_exam_drafts_student_synced_idx').on(
      table.studentId,
      table.syncedAt,
    ),
    assignmentSyncedIdx: index('offline_exam_drafts_assignment_synced_idx').on(
      table.assignmentId,
      table.syncedAt,
    ),
  }),
);

export const offlineExamSubmissions = pgTable(
  'offline_exam_submissions',
  {
    id: text('id').primaryKey(),
    assignmentId: text('assignment_id').notNull(),
    examId: text('exam_id').notNull(),
    studentId: text('student_id').notNull(),
    attemptId: text('attempt_id').notNull(),
    resultId: text('result_id').notNull(),
    attemptJson: text('attempt_json').notNull(),
    resultJson: text('result_json').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    syncedAt: timestamp('synced_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    assignmentStudentUnique: unique().on(table.assignmentId, table.studentId),
    studentSyncedIdx: index('offline_exam_submissions_student_synced_idx').on(
      table.studentId,
      table.syncedAt,
    ),
    assignmentSyncedIdx: index(
      'offline_exam_submissions_assignment_synced_idx',
    ).on(table.assignmentId, table.syncedAt),
    attemptIdx: index('offline_exam_submissions_attempt_idx').on(
      table.attemptId,
    ),
  }),
);
