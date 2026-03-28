import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { suspiciousEvents } from 'src/database/schema';

export type MonitoringEvent = InferSelectModel<typeof suspiciousEvents>;
export type NewMonitoringEvent = InferInsertModel<typeof suspiciousEvents>;
export type MonitoringEventType = MonitoringEvent['eventType'];
