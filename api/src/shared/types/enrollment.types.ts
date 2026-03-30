import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { examEnrollments } from 'src/database/schema/exams.schema';

export type Enrollment = InferSelectModel<typeof examEnrollments>;
export type NewEnrollment = InferInsertModel<typeof examEnrollments>;
