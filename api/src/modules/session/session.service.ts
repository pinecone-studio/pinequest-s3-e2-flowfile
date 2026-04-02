import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SessionRepository } from './session.repository';
import { ExamRepository } from '../exam/exam.repository';
import type {
  NewSession,
  Session,
  SessionAttempt,
  SessionStatus,
} from 'src/shared/types/session.types';
import type { Exam } from 'src/shared/types/exam.types';
import type {
  Question,
  StudentQuestion,
} from 'src/shared/types/question.types';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';
import { QuestionRepository } from '../question/question.repository';
import { AnswerRepository } from '../answer/answer.repository';
import { NotificationService } from '../notification/notification.service';
import {
  getSessionTiming,
  isAnswerProvided,
} from 'src/shared/utils/exam-session';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly examRepo: ExamRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly questionRepo: QuestionRepository,
    private readonly answerRepo: AnswerRepository,
    private readonly notificationService: NotificationService,
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

    if (user?.role === 'student') {
      const exam = await this.getExamOrThrow(examId);
      return this.syncExpiredSessionIfNeeded(session, exam);
    }

    return session;
  }

  async getSessionsByExam(examId: string, user?: AuthenticatedUser) {
    if (user) {
      await this.ensureTeacherOwnsExam(examId, user.id);
    }

    return this.sessionRepo.findSessionsByExam(examId);
  }

  async getAllSessions() {
    return this.sessionRepo.findAllSessions();
  }

  async getExamAnalytics(examId: string, user: AuthenticatedUser) {
    await this.ensureTeacherOwnsExam(examId, user.id);
    const [sessions, questions, allAnswers] = await Promise.all([
      this.sessionRepo.findSessionsByExam(examId),
      this.questionRepo.findQuestionsByExam(examId),
      this.answerRepo.findAnswersByExam(examId),
    ]);
    const submitted = sessions.filter(
      (s) => s.status === 'submitted' || s.status === 'force_submitted',
    );
    const submittedIds = new Set(submitted.map((s) => s.id));
    return questions.map((q) => {
      const qAnswers = allAnswers.filter(
        (a) => a.questionId === q.id && submittedIds.has(a.sessionId),
      );
      const correctCount = qAnswers.filter(
        (a) => a.textAnswer === q.correctAnswer,
      ).length;
      return {
        questionId: q.id,
        content: q.content,
        inputType: q.inputType,
        points: q.points,
        totalAnswers: qAnswers.length,
        correctCount,
        incorrectCount: qAnswers.length - correctCount,
        errorRate:
          qAnswers.length > 0
            ? (qAnswers.length - correctCount) / qAnswers.length
            : 0,
      };
    });
  }

  async startSession(
    studentId: string,
    examId: string,
    user: AuthenticatedUser,
  ) {
    this.ensureStudentOwnsResource(user, studentId);

    const exam = await this.getExamOrThrow(examId);
    this.ensureExamCanBeStarted(exam);
    await this.ensureStudentIsEnrolled(studentId, examId);

    const existingSession = await this.sessionRepo.findSessionByStudentAndExam(
      studentId,
      examId,
    );

    if (
      existingSession?.status === 'submitted' ||
      existingSession?.status === 'force_submitted'
    ) {
      throw new BadRequestException('Session already submitted');
    }

    if (existingSession) {
      if (existingSession.status === 'in_progress') {
        const syncedSession = await this.syncExpiredSessionIfNeeded(
          existingSession,
          exam,
        );

        if (syncedSession.status !== 'in_progress') {
          throw new BadRequestException('Session time has expired');
        }

        return syncedSession;
      }

      const resumedSession = await this.sessionRepo.updateSessionStatus(
        existingSession.id,
        'in_progress',
      );

      await this.notifyExamStarted(exam, resumedSession);

      return resumedSession;
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

    const session = await this.sessionRepo.createSession(data);

    await this.notifyExamStarted(exam, session);

    return session;
  }

  async getAttempt(
    id: string,
    user: AuthenticatedUser,
  ): Promise<SessionAttempt> {
    const session = await this.getSessionOrThrow(id);

    this.ensureStudentOwnsResource(user, session.studentId);

    const exam = await this.getExamOrThrow(session.examId);
    const syncedSession = await this.syncExpiredSessionIfNeeded(session, exam);

    const [questions, answers] = await Promise.all([
      this.questionRepo.findQuestionsByExam(session.examId),
      this.answerRepo.findAnswersBySession(id),
    ]);

    return {
      exam,
      session: syncedSession,
      questions: questions.map((question) =>
        this.sanitizeQuestionForStudent(question),
      ),
      answers,
      timing: getSessionTiming(exam, syncedSession),
    };
  }

  async submitSession(
    id: string,
    user: AuthenticatedUser,
    status: Extract<
      SessionStatus,
      'submitted' | 'force_submitted'
    > = 'submitted',
  ) {
    const session = await this.getSessionOrThrow(id);

    this.ensureStudentOwnsResource(user, session.studentId);

    if (
      session.status === 'submitted' ||
      session.status === 'force_submitted'
    ) {
      return session;
    }

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Only active sessions can be submitted');
    }

    const exam = await this.getExamOrThrow(session.examId);
    const timing = getSessionTiming(exam, session);
    const resolvedStatus = timing.isExpired ? 'force_submitted' : status;

    if (resolvedStatus === 'submitted') {
      await this.ensureRequiredAnswersCompleted(session.id, session.examId);
    }

    await this.answerRepo.finalizeAnswers(id);

    const score = await this.calculateScore(id, session.examId);
    const submittedSession = await this.sessionRepo.submitSessionWithScore(
      id,
      resolvedStatus,
      score,
    );

    await this.notifyExamSubmitted(exam, submittedSession, resolvedStatus);

    return submittedSession;
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

  async forceSubmitSession(
    id: string,
    reason: 'time_expired' | 'tab_limit_exceeded',
  ) {
    const session = await this.getSessionOrThrow(id);

    if (
      session.status === 'submitted' ||
      session.status === 'force_submitted'
    ) {
      return session;
    }

    const exam = await this.getExamOrThrow(session.examId);

    await this.answerRepo.finalizeAnswers(id);

    const submittedSession = await this.sessionRepo.submitSession(
      id,
      'force_submitted',
    );

    await this.notifyExamSubmitted(
      exam,
      submittedSession,
      'force_submitted',
      reason,
    );

    return submittedSession;
  }

  private async calculateScore(sessionId: string, examId: string): Promise<number> {
    const [answers, questions] = await Promise.all([
      this.answerRepo.findAnswersBySession(sessionId),
      this.questionRepo.findQuestionsByExam(examId),
    ]);
    const qMap = new Map(questions.map((q) => [q.id, q]));
    return answers.reduce((total, a) => {
      const q = qMap.get(a.questionId);
      if (!q?.correctAnswer || q.inputType !== 'mcq') return total;
      return a.textAnswer === q.correctAnswer ? total + q.points : total;
    }, 0);
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

  private async getExamOrThrow(examId: string) {
    const exam = await this.examRepo.findExamById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    return exam;
  }

  private async getSessionOrThrow(id: string) {
    const session = await this.sessionRepo.findSessionById(id);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  private ensureExamCanBeStarted(exam: {
    status: string;
    startsAt: string | null;
    endsAt: string | null;
  }) {
    if (exam.status !== 'scheduled' && exam.status !== 'published') {
      throw new BadRequestException('This exam is not available to start');
    }

    const now = new Date();

    if (exam.startsAt && now < new Date(exam.startsAt)) {
      throw new BadRequestException('This exam has not started yet');
    }

    if (exam.endsAt && now > new Date(exam.endsAt)) {
      throw new BadRequestException('This exam is already closed');
    }
  }

  private async ensureStudentIsEnrolled(studentId: string, examId: string) {
    const enrollments =
      await this.enrollmentRepo.findEnrollmentsByStudent(studentId);
    const isEnrolled = enrollments.some(
      (enrollment) => enrollment.examId === examId,
    );

    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this exam');
    }
  }

  private async ensureRequiredAnswersCompleted(
    sessionId: string,
    examId: string,
  ) {
    const [questions, answers] = await Promise.all([
      this.questionRepo.findQuestionsByExam(examId),
      this.answerRepo.findAnswersBySession(sessionId),
    ]);
    const answersByQuestionId = new Map(
      answers.map((answer) => [answer.questionId, answer]),
    );
    const missingQuestionIds = questions
      .filter(
        (question) =>
          question.isRequired &&
          !isAnswerProvided(answersByQuestionId.get(question.id)),
      )
      .map((question) => question.id);

    if (missingQuestionIds.length > 0) {
      throw new BadRequestException({
        message: 'Please answer every required question before submitting',
        missingQuestionIds,
      });
    }
  }

  private async syncExpiredSessionIfNeeded(
    session: Session,
    exam: Exam,
  ): Promise<Session> {
    if (session.status !== 'in_progress') {
      return session;
    }

    const timing = getSessionTiming(exam, session);

    if (!timing.isExpired) {
      return session;
    }

    return this.forceSubmitSession(session.id, 'time_expired');
  }

  private async notifyExamStarted(exam: Exam, session: Session) {
    await this.notificationService.createNotification({
      recipientId: exam.teacherId,
      examId: exam.id,
      sessionId: session.id,
      title: 'Exam started',
      body: `Student ${session.studentId} started "${exam.title}".`,
      type: 'exam_started',
    });
  }

  private async notifyExamSubmitted(
    exam: Exam,
    session: Session,
    status: Extract<SessionStatus, 'submitted' | 'force_submitted'>,
    reason?: 'time_expired' | 'tab_limit_exceeded',
  ) {
    const title =
      status === 'force_submitted' ? 'Exam auto-submitted' : 'Exam submitted';
    const body =
      status === 'force_submitted'
        ? `Student ${session.studentId} was auto-submitted for "${exam.title}"${reason ? ` because ${reason.replaceAll('_', ' ')}` : ''}.`
        : `Student ${session.studentId} submitted "${exam.title}".`;

    await this.notificationService.createNotification({
      recipientId: exam.teacherId,
      examId: exam.id,
      sessionId: session.id,
      title,
      body,
      type: 'exam_submitted',
    });
  }

  private sanitizeQuestionForStudent(question: Question): StudentQuestion {
    return {
      ...question,
      correctAnswer: null,
    };
  }

  private ensureStudentOwnsResource(
    user: AuthenticatedUser,
    studentId: string,
  ) {
    if (user.role !== 'student' || user.id !== studentId) {
      throw new ForbiddenException('You cannot access this student session');
    }
  }
}
