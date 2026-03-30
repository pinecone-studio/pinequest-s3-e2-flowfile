import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { questions } from 'src/database/schema/questions.schema';

export type Question = InferSelectModel<typeof questions>;
export type NewQuestion = InferInsertModel<typeof questions>;
export type StudentQuestion = Omit<Question, 'correctAnswer'> & {
  correctAnswer: null;
};
export type UpdateQuestion = Partial<
  Omit<NewQuestion, 'id' | 'examId' | 'createdAt'>
>;

export type QuestionInputType =
  | 'mcq'
  | 'short_text'
  | 'rich_text'
  | 'math_formula'
  | 'chem_formula'
  | 'handwritten'
  | 'voice_record';
