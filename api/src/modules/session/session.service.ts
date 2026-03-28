import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { ExamRepository } from '../exam/exam.repository';
import type { NewSession, SessionStatus } from 'src/shared/types';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly examRepo: ExamRepository,
  ) {}

  async getSessionByStudentAndExam(studentId: string, examId: string) {
    const session = await this.sessionRepo.findSessionByStudentAndExam(
      studentId,
      examId,
    );

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async getSessionsByExam(examId: string) {
    return this.sessionRepo.findSessionsByExam(examId);
  }

  async startSession(studentId: string, examId: string) {
    const exam = await this.examRepo.findExamById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const existingSession = await this.sessionRepo.findSessionByStudentAndExam(
      studentId,
      examId,
    );

    if (existingSession?.status === 'submitted' || existingSession?.status === 'force_submitted') {
      throw new BadRequestException('Session already submitted');
    }

    if (existingSession) {
      if (existingSession.status === 'in_progress') {
        return existingSession;
      }

      return this.sessionRepo.updateSessionStatus(existingSession.id, 'in_progress');
    }

    const now = new Date().toISOString();
    const data: NewSession = {
      id: crypto.randomUUID(),
      examId,
      studentId,
      status: 'in_progress',
      startedAt: now,
      submittedAt: null,
      score: null,
      isFlagged: false,
      createdAt: now,
      updatedAt: now,
    };

    return this.sessionRepo.createSession(data);
  }

  async submitSession(id: string, status: Extract<SessionStatus, 'submitted' | 'force_submitted'> = 'submitted') {
    const session = await this.sessionRepo.findSessionById(id);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status === 'submitted' || session.status === 'force_submitted') {
      return session;
    }

    return this.sessionRepo.submitSession(id, status);
  }

  async flagSession(id: string) {
    const session = await this.sessionRepo.findSessionById(id);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.isFlagged) {
      return session;
    }

    return this.sessionRepo.flagSession(id);
  }
}
