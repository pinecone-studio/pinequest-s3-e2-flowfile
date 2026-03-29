import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { notifications } from 'src/database/schema';

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
export type NotificationType = Notification['type'];
