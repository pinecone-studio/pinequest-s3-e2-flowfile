import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type { InferSelectModel } from 'drizzle-orm';
import {
  offlineExamDrafts,
  offlineExamSubmissions,
} from 'src/database/schema/offline-exam-sync.schema';
import { OfflineExamSyncRepository } from './offline-exam-sync.repository';
import { UpsertOfflineDraftDto } from './dto/upsert-offline-draft.dto';
import { UpsertOfflineSubmissionDto } from './dto/upsert-offline-submission.dto';

type OfflineExamDraftRecord = InferSelectModel<typeof offlineExamDrafts>;
type OfflineExamSubmissionRecord = InferSelectModel<
  typeof offlineExamSubmissions
>;
type OfflineDraftAnswers = Record<string, string | string[]>;
type OfflineSubmissionPayload = Record<string, unknown>;
type AttemptPayload = OfflineSubmissionPayload & {
  id: string;
  examId: string;
  assignmentId: string;
  studentId: string;
  submittedAt?: string;
};
type ResultPayload = OfflineSubmissionPayload & {
  id: string;
  attemptId: string;
  studentId: string;
  examId: string;
  submittedAt?: string;
};
type OfflineDraftResponse = OfflineExamDraftRecord & {
  answers: OfflineDraftAnswers;
  markedForReview: string[];
};
type OfflineSubmissionResponse = OfflineExamSubmissionRecord & {
  attempt: OfflineSubmissionPayload;
  result: OfflineSubmissionPayload;
};

@Injectable()
export class OfflineExamSyncService {
  constructor(private readonly repository: OfflineExamSyncRepository) {}

  async getDraft(
    assignmentId: string,
    studentId: string,
  ): Promise<OfflineDraftResponse | null> {
    const draft = (await this.repository.findDraft(
      assignmentId,
      studentId,
    )) as OfflineExamDraftRecord | null;

    if (!draft) {
      return null;
    }

    return this.mapDraft(draft);
  }

  async saveDraft(dto: UpsertOfflineDraftDto): Promise<OfflineDraftResponse> {
    const draft = (await this.repository.upsertDraft({
      draftKey: dto.draftKey,
      assignmentId: dto.assignmentId,
      examId: dto.examId,
      studentId: dto.studentId,
      answersJson: JSON.stringify(dto.answers),
      markedForReviewJson: JSON.stringify(dto.markedForReview),
      currentIndex: dto.currentIndex,
      startedAt: new Date(dto.startedAt),
      clientUpdatedAt: new Date(dto.updatedAt),
    })) as OfflineExamDraftRecord;

    return this.mapDraft(draft);
  }

  async deleteDraft(assignmentId: string, studentId: string) {
    await this.repository.deleteDraft(assignmentId, studentId);
  }

  async listSubmissions(params: {
    studentId?: string;
    assignmentId?: string;
    limit: number;
  }): Promise<OfflineSubmissionResponse[]> {
    const submissions = (await this.repository.listSubmissions(
      params,
    )) as OfflineExamSubmissionRecord[];

    return submissions.map((submission) => this.mapSubmission(submission));
  }

  async saveSubmission(
    dto: UpsertOfflineSubmissionDto,
  ): Promise<OfflineSubmissionResponse> {
    const attempt = this.validateAttemptPayload(dto.attempt);
    const result = this.validateResultPayload(dto.result);

    this.ensureSubmissionConsistency(dto, attempt, result);

    const submission = (await this.repository.upsertSubmission({
      assignmentId: dto.assignmentId,
      examId: dto.examId,
      studentId: dto.studentId,
      attemptId: attempt.id,
      resultId: result.id,
      attemptJson: JSON.stringify(dto.attempt),
      resultJson: JSON.stringify(dto.result),
      submittedAt: this.resolveSubmittedAt(result, attempt, dto.queuedAt),
    })) as OfflineExamSubmissionRecord;

    return this.mapSubmission(submission);
  }

  private mapDraft(draft: OfflineExamDraftRecord): OfflineDraftResponse {
    return {
      ...draft,
      answers: this.parseAnswers(draft.answersJson),
      markedForReview: this.parseMarkedForReview(draft.markedForReviewJson),
    };
  }

  private mapSubmission(
    submission: OfflineExamSubmissionRecord,
  ): OfflineSubmissionResponse {
    return {
      ...submission,
      attempt: this.parseObjectPayload(submission.attemptJson, 'attempt'),
      result: this.parseObjectPayload(submission.resultJson, 'result'),
    };
  }

  private parseAnswers(value: string): OfflineDraftAnswers {
    const parsed = this.parseJson(value, 'draft answers');

    if (!this.isRecord(parsed)) {
      throw new InternalServerErrorException(
        'Stored draft answers payload must be an object',
      );
    }

    for (const answer of Object.values(parsed)) {
      if (typeof answer === 'string') {
        continue;
      }

      if (
        Array.isArray(answer) &&
        answer.every((item): item is string => typeof item === 'string')
      ) {
        continue;
      }

      throw new InternalServerErrorException(
        'Stored draft answers payload has an invalid shape',
      );
    }

    return parsed as OfflineDraftAnswers;
  }

  private parseMarkedForReview(value: string): string[] {
    const parsed = this.parseJson(value, 'draft markedForReview');

    if (
      !Array.isArray(parsed) ||
      !parsed.every((item): item is string => typeof item === 'string')
    ) {
      throw new InternalServerErrorException(
        'Stored markedForReview payload must be an array of strings',
      );
    }

    return parsed;
  }

  private parseObjectPayload(
    value: string,
    fieldName: 'attempt' | 'result',
  ): OfflineSubmissionPayload {
    const parsed = this.parseJson(value, fieldName);

    if (!this.isRecord(parsed)) {
      throw new InternalServerErrorException(
        `Stored ${fieldName} payload must be an object`,
      );
    }

    return parsed;
  }

  private parseJson(value: string, fieldName: string): unknown {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      throw new InternalServerErrorException(
        `Stored ${fieldName} payload is invalid JSON`,
      );
    }
  }

  private validateAttemptPayload(
    payload: Record<string, unknown>,
  ): AttemptPayload {
    const attempt: AttemptPayload = {
      ...payload,
      id: this.getRequiredString(payload, 'id', 'attempt'),
      examId: this.getRequiredString(payload, 'examId', 'attempt'),
      assignmentId: this.getRequiredString(payload, 'assignmentId', 'attempt'),
      studentId: this.getRequiredString(payload, 'studentId', 'attempt'),
    };

    const submittedAt = this.getOptionalString(
      payload,
      'submittedAt',
      'attempt',
    );

    if (submittedAt) {
      attempt.submittedAt = submittedAt;
    }

    return attempt;
  }

  private validateResultPayload(
    payload: Record<string, unknown>,
  ): ResultPayload {
    const result: ResultPayload = {
      ...payload,
      id: this.getRequiredString(payload, 'id', 'result'),
      attemptId: this.getRequiredString(payload, 'attemptId', 'result'),
      studentId: this.getRequiredString(payload, 'studentId', 'result'),
      examId: this.getRequiredString(payload, 'examId', 'result'),
    };

    const submittedAt = this.getOptionalString(
      payload,
      'submittedAt',
      'result',
    );

    if (submittedAt) {
      result.submittedAt = submittedAt;
    }

    return result;
  }

  private ensureSubmissionConsistency(
    dto: UpsertOfflineSubmissionDto,
    attempt: AttemptPayload,
    result: ResultPayload,
  ) {
    if (
      attempt.assignmentId !== dto.assignmentId ||
      attempt.examId !== dto.examId ||
      attempt.studentId !== dto.studentId
    ) {
      throw new BadRequestException(
        'Attempt payload does not match request identifiers',
      );
    }

    if (
      result.attemptId !== attempt.id ||
      result.examId !== dto.examId ||
      result.studentId !== dto.studentId
    ) {
      throw new BadRequestException(
        'Result payload does not match request identifiers',
      );
    }
  }

  private resolveSubmittedAt(
    result: ResultPayload,
    attempt: AttemptPayload,
    queuedAt?: string,
  ): Date {
    const submittedAt =
      result.submittedAt ??
      attempt.submittedAt ??
      queuedAt ??
      new Date().toISOString();
    const submittedAtDate = new Date(submittedAt);

    if (Number.isNaN(submittedAtDate.getTime())) {
      throw new BadRequestException('Invalid submission timestamp');
    }

    return submittedAtDate;
  }

  private getRequiredString(
    payload: Record<string, unknown>,
    key: string,
    fieldName: string,
  ): string {
    const value = payload[key];

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`Invalid ${fieldName}.${key} value`);
    }

    return value;
  }

  private getOptionalString(
    payload: Record<string, unknown>,
    key: string,
    fieldName: string,
  ): string | undefined {
    const value = payload[key];

    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`Invalid ${fieldName}.${key} value`);
    }

    return value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
