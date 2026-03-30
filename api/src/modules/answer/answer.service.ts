import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnswerRepository } from './answer.repository';
import { SessionRepository } from '../session/session.repository';
import type { NewAnswer } from 'src/shared/types/answer.types';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';
import { QuestionRepository } from '../question/question.repository';
import { ExamRepository } from '../exam/exam.repository';
import { SessionService } from '../session/session.service';
import { getSessionTiming } from 'src/shared/utils/exam-session';

@Injectable()
export class AnswerService {
  constructor(
    private readonly answerRepo: AnswerRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly questionRepo: QuestionRepository,
    private readonly examRepo: ExamRepository,
    private readonly sessionService: SessionService,
  ) {}

  async getAnswersBySession(sessionId: string, user: AuthenticatedUser) {
    await this.ensureSessionAccess(sessionId, user);
    return this.answerRepo.findAnswersBySession(sessionId);
  }

  async autosaveAnswer(
    data: {
      sessionId: string;
      questionId: string;
      textAnswer?: string;
      formulaAnswerJson?: string;
      fileUrl?: string;
    },
    user: AuthenticatedUser,
  ) {
    const session = await this.ensureSessionAccess(data.sessionId, user, true);
    const question = await this.questionRepo.findQuestionById(data.questionId);

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.examId !== session.examId) {
      throw new BadRequestException(
        'Question does not belong to this session exam',
      );
    }

    const now = new Date().toISOString();
    const payload: NewAnswer = {
      id: crypto.randomUUID(),
      sessionId: data.sessionId,
      questionId: data.questionId,
      textAnswer: data.textAnswer ?? null,
      formulaAnswerJson: data.formulaAnswerJson ?? null,
      fileUrl: data.fileUrl ?? null,
      lastSavedAt: now,
      isFinal: false,
      createdAt: now,
    };

    return this.answerRepo.upsertAnswer(payload);
  }

  async finalizeAnswers(sessionId: string, user: AuthenticatedUser) {
    await this.ensureSessionAccess(sessionId, user, true);
    return this.answerRepo.finalizeAnswers(sessionId);
  }

  private async ensureSessionAccess(
    sessionId: string,
    user: AuthenticatedUser,
    requireWritable = false,
  ) {
    const session = await this.sessionRepo.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (user.role === 'teacher') {
      const exam = await this.examRepo.findExamById(session.examId);

      if (!exam || exam.teacherId !== user.id) {
        throw new ForbiddenException(
          'You cannot access answers for this session',
        );
      }

      if (requireWritable) {
        throw new ForbiddenException('Teachers cannot modify student answers');
      }

      return session;
    }

    if (session.studentId !== user.id) {
      throw new ForbiddenException('You cannot access this session');
    }

    if (requireWritable) {
      if (session.status !== 'in_progress') {
        throw new BadRequestException(
          'Answers can only be changed during an active session',
        );
      }

      if (session.submittedAt) {
        throw new BadRequestException('Submitted sessions cannot be changed');
      }

      const exam = await this.examRepo.findExamById(session.examId);

      if (!exam) {
        throw new NotFoundException('Exam not found');
      }

      const timing = getSessionTiming(exam, session);

      if (timing.isExpired) {
        await this.sessionService.forceSubmitSession(
          session.id,
          'time_expired',
        );
        throw new BadRequestException('Session time has expired');
      }
    }

    return session;
  }
}
