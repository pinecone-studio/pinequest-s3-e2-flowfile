import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { ExamRepository } from '../exam/exam.repository';
import type { NewSession, SessionStatus } from 'src/shared/types';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly examRepo: ExamRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
  ) {}

  async getSessionByStudentAndExam(
    studentId: string,
    examId: string,
    user?: AuthenticatedUser,
  ) {
    if (user) {
      await this.ensureSessionAccessByExam(examId, studentId, user);
    }

    const session = await this.sessionRepo.findSessionByStudentAndExam(
      studentId,
      examId,
    );

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async getSessionsByExam(examId: string, user?: AuthenticatedUser) {
    if (user) {
      await this.ensureTeacherOwnsExam(examId, user.id);
    }

    return this.sessionRepo.findSessionsByExam(examId);
  }

  async startSession(
    studentId: string,
    examId: string,
    user: AuthenticatedUser,
  ) {
    this.ensureStudentOwnsResource(user, studentId);

    const exam = await this.examRepo.findExamById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.status !== 'scheduled' && exam.status !== 'published') {
      throw new BadRequestException('This exam is not available to start');
    }

    const nowDate = new Date();

    if (exam.startsAt && nowDate < new Date(exam.startsAt)) {
      throw new BadRequestException('This exam has not started yet');
    }

    if (exam.endsAt && nowDate > new Date(exam.endsAt)) {
      throw new BadRequestException('This exam is already closed');
    }

    const enrollments = await this.enrollmentRepo.findEnrollmentsByStudent(studentId);
    const isEnrolled = enrollments.some((enrollment) => enrollment.examId === examId);

    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this exam');
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

  async submitSession(
    id: string,
    user: AuthenticatedUser,
    status: Extract<SessionStatus, 'submitted' | 'force_submitted'> = 'submitted',
  ) {
    const session = await this.sessionRepo.findSessionById(id);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    this.ensureStudentOwnsResource(user, session.studentId);

    if (session.status === 'submitted' || session.status === 'force_submitted') {
      return session;
    }

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Only active sessions can be submitted');
    }

    return this.sessionRepo.submitSession(id, status);
  }

  async flagSession(id: string, user: AuthenticatedUser) {
    const session = await this.sessionRepo.findSessionById(id);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.ensureTeacherOwnsExam(session.examId, user.id);

    if (session.isFlagged) {
      return session;
    }

    return this.sessionRepo.flagSession(id);
  }

  private async ensureSessionAccessByExam(
    examId: string,
    studentId: string,
    user: AuthenticatedUser,
  ) {
    if (user.role === 'teacher') {
      await this.ensureTeacherOwnsExam(examId, user.id);
      return;
    }

    this.ensureStudentOwnsResource(user, studentId);
  }

  private async ensureTeacherOwnsExam(examId: string, teacherId: string) {
    const exam = await this.examRepo.findExamById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException('You cannot access sessions for this exam');
    }

    return exam;
  }

  private ensureStudentOwnsResource(user: AuthenticatedUser, studentId: string) {
    if (user.role !== 'student' || user.id !== studentId) {
      throw new ForbiddenException('You cannot access this student session');
    }
  }
}
