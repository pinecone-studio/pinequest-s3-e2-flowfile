import { pgTable, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const quizzes = pgTable('quizzes', {
  id: text('id').primaryKey(),
  moduleName: text('module_name').notNull(),
  className: text('class_name').notNull(),
  subject: text('subject').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull(),
});

export const quizQuestions = pgTable('quiz_questions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  quizId: text('quiz_id').references(() => quizzes.id),
  index: integer('index').notNull(),
  question: text('question').notNull(),
  options: jsonb('options').notNull(), // [{ label, text }]
  correctIndex: integer('correct_index').notNull(),
  concept: text('concept').notNull(),
});
