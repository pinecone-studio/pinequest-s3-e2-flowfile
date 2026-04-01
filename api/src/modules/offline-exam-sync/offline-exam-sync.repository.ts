import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from 'src/database/client';
import {
  offlineExamDrafts,
  offlineExamSubmissions,
} from '../../database/schema/offline-exam-sync.schema';

@Injectable()
export class OfflineExamSyncRepository {
  async findDraft(assignmentId: string, studentId: string) {
    const [draft] = await db
      .select()
      .from(offlineExamDrafts)
      .where(
        and(
          eq(offlineExamDrafts.assignmentId, assignmentId),
          eq(offlineExamDrafts.studentId, studentId),
        ),
      )
      .limit(1);

    return draft ?? null;
  }

  async upsertDraft(payload: {
    draftKey: string;
    assignmentId: string;
    examId: string;
    studentId: string;
    answersJson: string;
    markedForReviewJson: string;
    currentIndex: number;
    startedAt: Date;
    clientUpdatedAt: Date;
  }) {
    const [draft] = await db
      .insert(offlineExamDrafts)
      .values({
        id: randomUUID(),
        draftKey: payload.draftKey,
        assignmentId: payload.assignmentId,
        examId: payload.examId,
        studentId: payload.studentId,
        answersJson: payload.answersJson,
        markedForReviewJson: payload.markedForReviewJson,
        currentIndex: payload.currentIndex,
        startedAt: payload.startedAt,
        clientUpdatedAt: payload.clientUpdatedAt,
        syncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [offlineExamDrafts.assignmentId, offlineExamDrafts.studentId],
        set: {
          draftKey: payload.draftKey,
          examId: payload.examId,
          answersJson: payload.answersJson,
          markedForReviewJson: payload.markedForReviewJson,
          currentIndex: payload.currentIndex,
          startedAt: payload.startedAt,
          clientUpdatedAt: payload.clientUpdatedAt,
          syncedAt: new Date(),
        },
      })
      .returning();

    return draft;
  }

  async deleteDraft(assignmentId: string, studentId: string) {
    await db
      .delete(offlineExamDrafts)
      .where(
        and(
          eq(offlineExamDrafts.assignmentId, assignmentId),
          eq(offlineExamDrafts.studentId, studentId),
        ),
      );
  }

  async listSubmissions(params: {
    studentId?: string;
    assignmentId?: string;
    limit: number;
  }) {
    const query = db
      .select()
      .from(offlineExamSubmissions)
      .orderBy(desc(offlineExamSubmissions.submittedAt))
      .limit(params.limit);

    if (params.studentId && params.assignmentId) {
      return query.where(
        and(
          eq(offlineExamSubmissions.studentId, params.studentId),
          eq(offlineExamSubmissions.assignmentId, params.assignmentId),
        ),
      );
    }

    if (params.studentId) {
      return query.where(
        eq(offlineExamSubmissions.studentId, params.studentId),
      );
    }

    if (params.assignmentId) {
      return query.where(
        eq(offlineExamSubmissions.assignmentId, params.assignmentId),
      );
    }

    return query;
  }

  async upsertSubmission(payload: {
    assignmentId: string;
    examId: string;
    studentId: string;
    attemptId: string;
    resultId: string;
    attemptJson: string;
    resultJson: string;
    submittedAt: Date;
  }) {
    const [submission] = await db
      .insert(offlineExamSubmissions)
      .values({
        id: randomUUID(),
        assignmentId: payload.assignmentId,
        examId: payload.examId,
        studentId: payload.studentId,
        attemptId: payload.attemptId,
        resultId: payload.resultId,
        attemptJson: payload.attemptJson,
        resultJson: payload.resultJson,
        submittedAt: payload.submittedAt,
        syncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [
          offlineExamSubmissions.assignmentId,
          offlineExamSubmissions.studentId,
        ],
        set: {
          examId: payload.examId,
          attemptId: payload.attemptId,
          resultId: payload.resultId,
          attemptJson: payload.attemptJson,
          resultJson: payload.resultJson,
          submittedAt: payload.submittedAt,
          syncedAt: new Date(),
        },
      })
      .returning();

    return submission;
  }
}
