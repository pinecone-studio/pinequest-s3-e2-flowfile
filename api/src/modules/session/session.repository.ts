import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from 'src/database/client';
import { examSessions } from 'src/database/schema/sessions.schema';
import type {
  NewSession,
  Session,
  SessionStatus,
} from 'src/shared/types/session.types';


@Injectable()
export class SessionRepository {
  async findSessionByStudentAndExam(
    studentId: string,
    examId: string,
  ): Promise<Session | undefined> {
    return db.query.examSessions.findFirst({
      where: and(
        eq(examSessions.studentId, studentId),
        eq(examSessions.examId, examId),
      ),
    });
  }

  async findSessionById(id: string): Promise<Session | undefined> {
    return db.query.examSessions.findFirst({
      where: eq(examSessions.id, id),
    });
  }

  async findSessionsByExam(examId: string): Promise<Session[]> {
    return db.query.examSessions.findMany({
      where: eq(examSessions.examId, examId),
      orderBy: desc(examSessions.createdAt),
    });
  }

  async findSessionsByStudent(studentId: string): Promise<Session[]> {
    return db.query.examSessions.findMany({
      where: eq(examSessions.studentId, studentId),
      orderBy: desc(examSessions.createdAt),
    });
  }

  async createSession(data: NewSession) {
    const [session] = await db.insert(examSessions).values(data).returning();
    return session;
  }

  async saveOfflineSession(data: {
    id: string;
    examId: string;
    studentId: string;
    status: SessionStatus;
    startedAt: string | null;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }) {
    const existing = await this.findSessionByStudentAndExam(
      data.studentId,
      data.examId,
    );

    if (existing) {
      const [session] = await db
        .update(examSessions)
        .set({
          status: data.status,
          startedAt: data.startedAt,
          submittedAt: data.submittedAt,
          updatedAt: data.updatedAt,
        })
        .where(eq(examSessions.id, existing.id))
        .returning();

      return session;
    }

    const [session] = await db
      .insert(examSessions)
      .values({
        id: data.id,
        examId: data.examId,
        studentId: data.studentId,
        status: data.status,
        startedAt: data.startedAt,
        submittedAt: data.submittedAt,
        score: null,
        isFlagged: false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();

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

  async submitSession(
    id: string,
    status: Extract<
      SessionStatus,
      'submitted' | 'force_submitted'
    > = 'submitted',
  ) {
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

  async submitSessionWithScore(
    id: string,
    status: Extract<SessionStatus, 'submitted' | 'force_submitted'>,
    score: number,
  ) {
    const now = new Date().toISOString();
    const [session] = await db
      .update(examSessions)
      .set({ status, score, submittedAt: now, updatedAt: now })
      .where(eq(examSessions.id, id))
      .returning();
    return session;
  }

  async gradeSession(id: string, score: number) {
    const now = new Date().toISOString();
    const [session] = await db
      .update(examSessions)
      .set({
        status: 'graded',
        score,
        updatedAt: now,
      })
      .where(eq(examSessions.id, id))
      .returning();

    return session;
  }

  async submitSessionAt(
    id: string,
    submittedAt: string,
    status: Extract<SessionStatus, 'submitted' | 'force_submitted'>,
  ) {
    const [session] = await db
      .update(examSessions)
      .set({
        status,
        submittedAt,
        updatedAt: submittedAt,
      })
      .where(eq(examSessions.id, id))
      .returning();

    return session;
  }
}
