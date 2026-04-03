import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../database/repositories/user.repository';
import { MonitoringRepository } from '../monitoring/monitoring.repository';
import { NotificationService } from '../notification/notification.service';
import { ExamRepository } from '../exam/exam.repository';
import { SessionRepository } from '../session/session.repository';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ProctoringRepository } from './proctoring.repository';
import { CreateProctoringViolationDto } from './dto/create-proctoring-violation.dto';
import { ListProctoringViolationsDto } from './dto/list-proctoring-violations.dto';
import { ProctoringGateway } from './proctoring.gateway';
import type { MonitoringEventType } from 'src/shared/types';
import type {
  NewProctoringViolation,
  ProctoringSeverity,
  ProctoringViolation,
  ProctoringViolationType,
} from 'src/shared/types/proctoring.types';

const PROCTORING_DEFAULT_SEVERITY: Record<
  ProctoringViolationType,
  ProctoringSeverity
> = {
  face_not_detected: 'medium',
  multiple_faces_detected: 'high',
  tab_switch: 'medium',
  window_blur: 'medium',
  audio_detected: 'low',
  device_changed: 'high',
  looking_left: 'medium',
  looking_right: 'medium',
  looking_up: 'medium',
  looking_down: 'medium',
};

const PROCTORING_NOTIFICATION_COOLDOWN_MS = 15_000;

const PROCTORING_NOTIFICATION_MESSAGE: Record<
  ProctoringViolationType,
  string
> = {
  face_not_detected: 'left the camera frame',
  multiple_faces_detected: 'triggered a multiple-face alert',
  tab_switch: 'switched away from the exam tab',
  window_blur: 'left the exam window',
  audio_detected: 'triggered an audio alert',
  device_changed: 'changed device or camera context',
  looking_left: 'looked away to the left',
  looking_right: 'looked away to the right',
  looking_up: 'looked upward',
  looking_down: 'looked downward',
};

type ProctoringContext = {
  assignmentId: string;
  createdAt: Date;
  examId: string;
  examTitle: string;
  metadata: Record<string, string | number | boolean | null>;
  sessionId: string | null;
  sessionIsFlagged: boolean;
  severity: ProctoringSeverity;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string | null;
  type: ProctoringViolationType;
  details: string | null;
  classId: string | null;
  className: string | null;
};

@Injectable()
export class ProctoringService {
  constructor(
    private readonly proctoringRepo: ProctoringRepository,
    private readonly proctoringGateway: ProctoringGateway,
    private readonly examRepo: ExamRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly userRepo: UserRepository,
    private readonly monitoringRepo: MonitoringRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async listViolations(
    query: ListProctoringViolationsDto,
    user: AuthenticatedUser,
  ) {
    try {
      if (query.teacherId && query.teacherId !== user.id) {
        throw new ForbiddenException(
          'You cannot load proctoring alerts for another teacher',
        );
      }

      const violations = await this.proctoringRepo.findViolationsByTeacherId(
        user.id,
        query.limit ?? 12,
      );

      return { violations };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      console.error('[proctoring] failed to list violations', error);
      throw new InternalServerErrorException(
        'Failed to load proctoring alerts',
      );
    }
  }

  createTeacherStream(teacherId: string) {
    return this.proctoringGateway.createTeacherStream(teacherId);
  }

  async createViolation(
    body: CreateProctoringViolationDto,
    user: AuthenticatedUser,
  ) {
    try {
      const context = await this.resolveViolationContext(body, user);
      const recentViolation = await this.proctoringRepo.findRecentViolation({
        teacherId: context.teacherId,
        studentId: context.studentId,
        assignmentId: context.assignmentId,
        type: context.type,
        since: new Date(
          context.createdAt.getTime() - PROCTORING_NOTIFICATION_COOLDOWN_MS,
        ),
      });

      if (recentViolation) {
        return { violation: recentViolation };
      }

      const payload: NewProctoringViolation = {
        id: crypto.randomUUID(),
        teacherId: context.teacherId,
        teacherName: context.teacherName,
        studentId: context.studentId,
        studentName: context.studentName,
        examId: context.examId,
        examTitle: context.examTitle,
        assignmentId: context.assignmentId,
        classId: context.classId,
        className: context.className,
        type: context.type,
        severity: context.severity,
        details: context.details,
        metadataJson:
          Object.keys(context.metadata).length > 0
            ? JSON.stringify(context.metadata)
            : null,
        createdAt: context.createdAt,
      };

      const violation = await this.proctoringRepo.createViolation(payload);

      await Promise.all([
        this.mirrorViolationToMonitoring(violation, context.sessionId),
        this.notifyTeacher(violation, context.sessionId),
        this.flagSessionIfNeeded(context),
      ]);

      await this.proctoringGateway.emitViolationToTeacher(
        violation.teacherId,
        violation,
      );

      return { violation };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('[proctoring] failed to create violation', error);
      throw new InternalServerErrorException(
        'Failed to store proctoring alert',
      );
    }
  }

  private async resolveViolationContext(
    body: CreateProctoringViolationDto,
    user: AuthenticatedUser,
  ): Promise<ProctoringContext> {
    const exam = await this.examRepo.findExamById(body.examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (user.role === 'teacher' && exam.teacherId !== user.id) {
      throw new ForbiddenException(
        'You cannot report proctoring alerts for this exam',
      );
    }

    const sessionId = body.sessionId ?? this.extractSessionId(body.metadata);
    const requestedStudentId =
      user.role === 'student' ? user.id : body.studentId ?? undefined;
    const session = sessionId
      ? await this.resolveSessionById(sessionId, exam.id, requestedStudentId)
      : await this.resolveSessionForExam(exam.id, requestedStudentId);

    if (!session) {
      throw new BadRequestException(
        'Active session required to report proctoring alerts',
      );
    }

    if (session.status !== 'in_progress') {
      throw new BadRequestException(
        'Proctoring alerts can only be reported for active sessions',
      );
    }

    if (user.role === 'student' && session.studentId !== user.id) {
      throw new ForbiddenException(
        'You cannot report proctoring alerts for another student',
      );
    }

    const [student, teacher] = await Promise.all([
      this.userRepo.findById(session.studentId),
      this.userRepo.findById(exam.teacherId),
    ]);

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const metadata = {
      ...(body.metadata ?? {}),
      sessionId: session.id,
      source: 'proctoring',
    };

    return {
      assignmentId: body.assignmentId ?? exam.id,
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
      examId: exam.id,
      examTitle: exam.title,
      metadata,
      sessionId: session.id,
      sessionIsFlagged: session.isFlagged,
      severity: body.severity ?? PROCTORING_DEFAULT_SEVERITY[body.type],
      studentId: student.id,
      studentName: student.name,
      teacherId: exam.teacherId,
      teacherName: teacher.name,
      type: body.type,
      details: body.details ?? null,
      classId: body.classId ?? null,
      className: body.className ?? null,
    };
  }

  private async resolveSessionById(
    sessionId: string,
    examId: string,
    requestedStudentId?: string,
  ) {
    const session = await this.sessionRepo.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.examId !== examId) {
      throw new BadRequestException(
        'Session does not belong to the supplied exam',
      );
    }

    if (requestedStudentId && session.studentId !== requestedStudentId) {
      throw new BadRequestException(
        'Session does not belong to the supplied student',
      );
    }

    return session;
  }

  private async resolveSessionForExam(
    examId: string,
    studentId?: string,
  ) {
    if (!studentId) {
      return null;
    }

    return this.sessionRepo.findSessionByStudentAndExam(studentId, examId);
  }

  private extractSessionId(
    metadata?: Record<string, string | number | boolean | null>,
  ) {
    const value = metadata?.sessionId;
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
  }

  private async mirrorViolationToMonitoring(
    violation: ProctoringViolation,
    sessionId: string | null,
  ) {
    if (!sessionId) {
      return;
    }

    await this.monitoringRepo.createEvent({
      id: crypto.randomUUID(),
      sessionId,
      studentId: violation.studentId,
      examId: violation.examId,
      eventType: violation.type as MonitoringEventType,
      metadataJson: JSON.stringify({
        source: 'proctoring',
        severity: violation.severity,
        details: violation.details,
        violationId: violation.id,
      }),
      occurredAt: violation.createdAt.toISOString(),
      createdAt: violation.createdAt.toISOString(),
    });
  }

  private async notifyTeacher(
    violation: ProctoringViolation,
    sessionId: string | null,
  ) {
    const summary = PROCTORING_NOTIFICATION_MESSAGE[violation.type];
    const details = violation.details ? ` Details: ${violation.details}` : '';

    await this.notificationService.createNotification({
      recipientId: violation.teacherId,
      examId: violation.examId,
      sessionId,
      title: 'Proctoring alert',
      body: `${violation.studentName} ${summary} during "${violation.examTitle}".${details}`,
      type: 'suspicious_event',
    });
  }

  private async flagSessionIfNeeded(context: ProctoringContext) {
    if (
      !context.sessionId ||
      context.sessionIsFlagged ||
      context.severity === 'low'
    ) {
      return;
    }

    await this.sessionRepo.flagSession(context.sessionId);
  }
}
