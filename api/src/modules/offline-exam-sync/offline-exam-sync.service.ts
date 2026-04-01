import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import type { InferSelectModel } from 'drizzle-orm';
import {
  offlineExamDrafts,
  offlineExamSubmissions,
} from 'src/database/schema/offline-exam-sync.schema';
import { OfflineExamSyncRepository } from './offline-exam-sync.repository';
import { UpsertOfflineDraftDto } from './dto/upsert-offline-draft.dto';
import { UpsertOfflineSubmissionDto } from './dto/upsert-offline-submission.dto';
import { SessionRepository } from '../session/session.repository';
import { AnswerRepository } from '../answer/answer.repository';
import { ExamRepository } from '../exam/exam.repository';
import { QuestionRepository } from '../question/question.repository';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';
import { getSessionTiming } from 'src/shared/utils/exam-session';

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
  reconciledSessionId?: string | null;
};
type OfflineSubmissionResponse = OfflineExamSubmissionRecord & {
  attempt: OfflineSubmissionPayload;
  result: OfflineSubmissionPayload;
  reconciledSessionId?: string | null;
  reconciledAt?: string | null;
};

@Injectable()
export class OfflineExamSyncService {
  constructor(
    private readonly repository: OfflineExamSyncRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly answerRepo: AnswerRepository,
    private readonly examRepo: ExamRepository,
    private readonly questionRepo: QuestionRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

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
    const { questions } = await this.ensureOfflineExamAccess(
      dto.examId,
      dto.studentId,
    );

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

    const startedAt =
      this.normalizeIsoDate(dto.startedAt) ?? new Date().toISOString();
    const updatedAt =
      this.normalizeIsoDate(dto.updatedAt) ?? new Date().toISOString();
    const session = await this.sessionRepo.saveOfflineSession({
      id: `${dto.assignmentId}:${dto.studentId}`,
      examId: dto.examId,
      studentId: dto.studentId,
      status: 'in_progress',
      startedAt,
      submittedAt: null,
      createdAt: startedAt,
      updatedAt,
    });

    await this.persistOfflineAnswers(
      session.id,
      questions,
      dto.answers,
      false,
      updatedAt,
    );

    return this.mapDraft(draft, session.id);
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
    const { exam, questions } = await this.ensureOfflineExamAccess(
      dto.examId,
      dto.studentId,
    );

    this.ensureSubmissionConsistency(dto, attempt, result);

    const startedAt =
      this.getOptionalString(dto.attempt, 'startedAt', 'attempt') ??
      new Date().toISOString();
    const submittedAt = this.resolveSubmittedAt(result, attempt, dto.queuedAt);
    const session = await this.sessionRepo.saveOfflineSession({
      id: attempt.id,
      examId: dto.examId,
      studentId: dto.studentId,
      status: 'in_progress',
      startedAt,
      submittedAt: null,
      createdAt: startedAt,
      updatedAt: submittedAt.toISOString(),
    });

    await this.persistOfflineAnswers(
      session.id,
      questions,
      this.extractAttemptAnswers(dto.attempt),
      true,
      submittedAt.toISOString(),
    );

    const timing = getSessionTiming(
      exam,
      { startedAt: session.startedAt },
      submittedAt,
    );
    const submittedSession = await this.sessionRepo.submitSessionAt(
      session.id,
      submittedAt.toISOString(),
      timing.isExpired ? 'force_submitted' : 'submitted',
    );

    const submission = (await this.repository.upsertSubmission({
      assignmentId: dto.assignmentId,
      examId: dto.examId,
      studentId: dto.studentId,
      attemptId: attempt.id,
      resultId: result.id,
      attemptJson: JSON.stringify(dto.attempt),
      resultJson: JSON.stringify(dto.result),
      submittedAt,
    })) as OfflineExamSubmissionRecord;

    await this.repository.deleteDraft(dto.assignmentId, dto.studentId);

    return this.mapSubmission(
      submission,
      submittedSession.id,
      submittedSession.updatedAt,
    );
  }

  private mapDraft(
    draft: OfflineExamDraftRecord,
    reconciledSessionId: string | null = null,
  ): OfflineDraftResponse {
    return {
      ...draft,
      answers: this.parseAnswers(draft.answersJson),
      markedForReview: this.parseMarkedForReview(draft.markedForReviewJson),
      reconciledSessionId,
    };
  }

  private mapSubmission(
    submission: OfflineExamSubmissionRecord,
    reconciledSessionId: string | null = null,
    reconciledAt: string | null = null,
  ): OfflineSubmissionResponse {
    return {
      ...submission,
      attempt: this.parseObjectPayload(submission.attemptJson, 'attempt'),
      result: this.parseObjectPayload(submission.resultJson, 'result'),
      reconciledSessionId,
      reconciledAt,
    };
  }

  private async ensureOfflineExamAccess(examId: string, studentId: string) {
    const [exam, enrollment, questions] = await Promise.all([
      this.examRepo.findExamById(examId),
      this.enrollmentRepo.findEnrollmentByExamAndStudent(examId, studentId),
      this.questionRepo.findQuestionsByExam(examId),
    ]);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (!enrollment) {
      throw new BadRequestException('Student is not enrolled for this exam');
    }

    return { exam, questions };
  }

  private async persistOfflineAnswers(
    sessionId: string,
    questions: Array<{ id: string; inputType: string }>,
    answerMap: Record<string, string | string[]>,
    isFinal: boolean,
    timestamp: string,
  ) {
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    await Promise.all(
      Object.entries(answerMap).map(async ([questionId, rawValue]) => {
        const question = questionMap.get(questionId);

        if (!question) {
          throw new BadRequestException(
            `Question ${questionId} does not belong to this exam`,
          );
        }

        const payload = this.mapAnswerPayload(rawValue, question.inputType);

        if (
          !payload.textAnswer &&
          !payload.formulaAnswerJson &&
          !payload.fileUrl
        ) {
          return;
        }

        await this.answerRepo.upsertAnswer({
          id: crypto.randomUUID(),
          sessionId,
          questionId,
          textAnswer: payload.textAnswer,
          formulaAnswerJson: payload.formulaAnswerJson,
          fileUrl: payload.fileUrl,
          lastSavedAt: timestamp,
          isFinal,
          createdAt: timestamp,
        });
      }),
    );

    if (isFinal) {
      await this.answerRepo.finalizeAnswers(sessionId);
    }
  }

  private extractAttemptAnswers(
    payload: Record<string, unknown>,
  ): Record<string, string | string[]> {
    const directAnswers = payload.answers;

    if (this.isRecord(directAnswers)) {
      return directAnswers as Record<string, string | string[]>;
    }

    const responses = payload.responses;

    if (Array.isArray(responses)) {
      return responses.reduce<Record<string, string>>((result, item) => {
        if (
          this.isRecord(item) &&
          typeof item.questionId === 'string' &&
          typeof item.answer === 'string'
        ) {
          result[item.questionId] = item.answer;
        }

        return result;
      }, {});
    }

    throw new BadRequestException('Attempt payload does not contain answers');
  }

  private mapAnswerPayload(
    rawValue: string | string[],
    inputType: string,
  ) {
    if (Array.isArray(rawValue)) {
      return {
        textAnswer: JSON.stringify(rawValue),
        formulaAnswerJson: null,
        fileUrl: null,
      };
    }

    const value = rawValue.trim();

    if (value.length === 0) {
      return {
        textAnswer: null,
        formulaAnswerJson: null,
        fileUrl: null,
      };
    }

    if (inputType === 'math_formula' || inputType === 'chem_formula') {
      return {
        textAnswer: null,
        formulaAnswerJson: JSON.stringify({
          type: inputType === 'chem_formula' ? 'chemistry' : 'formula',
          value,
        }),
        fileUrl: null,
      };
    }

    if (
      inputType === 'voice_record' ||
      inputType === 'handwritten' ||
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('data:')
    ) {
      return {
        textAnswer: null,
        formulaAnswerJson: null,
        fileUrl: value,
      };
    }

    return {
      textAnswer: value,
      formulaAnswerJson: null,
      fileUrl: null,
    };
  }

  private normalizeIsoDate(value?: string | null) {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
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
