import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from 'src/database/schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'createdAt'>>;
