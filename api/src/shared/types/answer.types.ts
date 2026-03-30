import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { answers } from 'src/database/schema/sessions.schema';

export type Answer = InferSelectModel<typeof answers>;
export type NewAnswer = InferInsertModel<typeof answers>;
export type UpdateAnswer = Partial<Omit<NewAnswer, 'id' | 'createdAt'>>;
