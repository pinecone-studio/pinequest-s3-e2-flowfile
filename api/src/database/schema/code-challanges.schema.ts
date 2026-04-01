import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { CodeRunnerTestCase } from 'src/shared/types/code-runner.types';

export const codeChallenges = pgTable(
  'code_challenges',
  {
    id: text('id').primaryKey(),
    questionId: text('question_id').notNull(),
    functionName: text('function_name').notNull(),
    hiddenTestCases: jsonb('hidden_test_cases')
      .$type<CodeRunnerTestCase[]>()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    questionIdIdx: index('code_challenges_question_id_idx').on(
      table.questionId,
    ),
  }),
);
