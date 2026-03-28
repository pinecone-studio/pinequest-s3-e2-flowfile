import { Injectable, NotFoundException } from '@nestjs/common';
import { AnswerRepository } from './answer.repository';
import { SessionRepository } from '../session/session.repository';
import type { NewAnswer } from 'src/shared/types';

@Injectable()
export class AnswerService {
  constructor(
    private readonly answerRepo: AnswerRepository,
    private readonly sessionRepo: SessionRepository,
  ) {}

  async getAnswersBySession(sessionId: string) {
    await this.ensureSessionExists(sessionId);
    return this.answerRepo.findAnswersBySession(sessionId);
  }

  async autosaveAnswer(data: {
    sessionId: string;
    questionId: string;
    textAnswer?: string;
    formulaAnswerJson?: string;
    fileUrl?: string;
  }) {
    await this.ensureSessionExists(data.sessionId);

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

  async finalizeAnswers(sessionId: string) {
    await this.ensureSessionExists(sessionId);
    return this.answerRepo.finalizeAnswers(sessionId);
  }

  private async ensureSessionExists(sessionId: string) {
    const session = await this.sessionRepo.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }
}
