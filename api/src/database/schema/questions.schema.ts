import { boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { exams } from './exams.schema';

export const questions = pgTable('questions', {
  id: text('id').primaryKey(),
  examId: text('exam_id')
    .notNull()
    .references(() => exams.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull(),
  content: text('content').notNull(),
  inputType: text('input_type', {
    enum: [
      'mcq',
      'short_text',
      'rich_text',
      'math_formula',
      'chem_formula',
      'handwritten',
      'voice_record',
    ],
  }).notNull(),
  subjectHint: text('subject_hint'),
  points: integer('points').notNull().default(1),
  isRequired: boolean('is_required').notNull().default(true),
  optionsJson: text('options_json'),
  correctAnswer: text('correct_answer'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
