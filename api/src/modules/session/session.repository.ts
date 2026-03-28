import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from 'src/database/client';
import { examSessions } from 'src/database/schema';
import type { NewSession, SessionStatus } from 'src/shared/types';

@Injectable()
export class SessionRepository {
  async findSessionByStudentAndExam(studentId: string, examId: string) {
    return db.query.examSessions.findFirst({
      where: and(
        eq(examSessions.studentId, studentId),
        eq(examSessions.examId, examId),
      ),
    });
  }

  async findSessionById(id: string) {
    return db.query.examSessions.findFirst({
      where: eq(examSessions.id, id),
    });
  }

  async findSessionsByExam(examId: string) {
    return db.query.examSessions.findMany({
      where: eq(examSessions.examId, examId),
      orderBy: desc(examSessions.createdAt),
    });
  }

  async createSession(data: NewSession) {
    const [session] = await db.insert(examSessions).values(data).returning();
    return session;
  }

  async updateSessionStatus(id: string, status: SessionStatus) {
    const now = new Date().toISOString();
    const [session] = await db
      .update(examSessions)
      .set({
        status,
        updatedAt: now,
        ...(status === 'in_progress' ? { startedAt: now } : {}),
      })
      .where(eq(examSessions.id, id))
      .returning();

    return session;
  }

  async flagSession(id: string) {
    const [session] = await db
      .update(examSessions)
      .set({
        isFlagged: true,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(examSessions.id, id))
      .returning();

    return session;
  }

  async submitSession(id: string, status: Extract<SessionStatus, 'submitted' | 'force_submitted'> = 'submitted') {
    const now = new Date().toISOString();
    const [session] = await db
      .update(examSessions)
      .set({
        status,
        submittedAt: now,
        updatedAt: now,
      })
      .where(eq(examSessions.id, id))
      .returning();

    return session;
  }
}
