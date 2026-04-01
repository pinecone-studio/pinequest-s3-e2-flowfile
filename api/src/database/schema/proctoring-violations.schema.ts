import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const proctoringViolations = pgTable(
  'proctoring_violations',
  {
    id: text('id').primaryKey(),
    teacherId: text('teacher_id').notNull(),
    teacherName: text('teacher_name'),
    studentId: text('student_id').notNull(),
    studentName: text('student_name').notNull(),
    examId: text('exam_id').notNull(),
    examTitle: text('exam_title').notNull(),
    assignmentId: text('assignment_id').notNull(),
    classId: text('class_id'),
    className: text('class_name'),
    type: text('type').notNull(),
    severity: text('severity').notNull(),
    details: text('details'),
    metadataJson: text('metadata_json'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    teacherCreatedAtIdx: index('proctoring_teacher_created_at_idx').on(
      table.teacherId,
      table.createdAt,
    ),
    assignmentCreatedAtIdx: index('proctoring_assignment_created_at_idx').on(
      table.assignmentId,
      table.createdAt,
    ),
  }),
);
