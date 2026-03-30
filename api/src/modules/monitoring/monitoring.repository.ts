import { Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { db } from 'src/database/client';
import { suspiciousEvents } from 'src/database/schema';
import type { NewMonitoringEvent } from 'src/shared/types';

@Injectable()
export class MonitoringRepository {
  async createEvent(data: NewMonitoringEvent) {
    const [event] = await db.insert(suspiciousEvents).values(data).returning();
    return event;
  }

  async findEventsBySession(sessionId: string) {
    return db.query.suspiciousEvents.findMany({
      where: eq(suspiciousEvents.sessionId, sessionId),
      orderBy: desc(suspiciousEvents.occurredAt),
    });
  }

  async findEventsByExam(examId: string) {
    return db.query.suspiciousEvents.findMany({
      where: eq(suspiciousEvents.examId, examId),
      orderBy: desc(suspiciousEvents.occurredAt),
    });
  }

  async countEventsByStudent(studentId: string, examId?: string) {
    const [result] = await db
      .select({ count: count() })
      .from(suspiciousEvents)
      .where(
        examId
          ? and(
              eq(suspiciousEvents.studentId, studentId),
              eq(suspiciousEvents.examId, examId),
            )
          : eq(suspiciousEvents.studentId, studentId),
      );

    return result?.count ?? 0;
  }

  async countEventsBySessionAndType(
    sessionId: string,
    eventType: NewMonitoringEvent['eventType'],
  ) {
    const [result] = await db
      .select({ count: count() })
      .from(suspiciousEvents)
      .where(
        and(
          eq(suspiciousEvents.sessionId, sessionId),
          eq(suspiciousEvents.eventType, eventType),
        ),
      );

    return result?.count ?? 0;
  }

  async findRecentEvents(limit = 10) {
    return db.query.suspiciousEvents.findMany({
      orderBy: desc(suspiciousEvents.occurredAt),
      limit,
    });
  }
}
