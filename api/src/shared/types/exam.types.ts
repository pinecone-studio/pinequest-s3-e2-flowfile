import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { exams } from 'src/database/schema/exams.schema';

export type Exam = InferSelectModel<typeof exams>;
export type NewExam = InferInsertModel<typeof exams>;
export type ExamStatus = Exam['status'];
