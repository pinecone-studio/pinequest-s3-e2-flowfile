import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MonitoringRepository } from './monitoring.repository';
import { SessionRepository } from '../session/session.repository';
import { ExamRepository } from '../exam/exam.repository';
import { NotificationService } from '../notification/notification.service';
import type { NewMonitoringEvent } from 'src/shared/types';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly monitoringRepo: MonitoringRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly examRepo: ExamRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async logEvent(data: {
    sessionId: string;
    studentId: string;
    examId: string;
    eventType: NewMonitoringEvent['eventType'];
    metadataJson?: string;
  }, user: AuthenticatedUser) {
    const session = await this.sessionRepo.findSessionById(data.sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.studentId !== user.id) {
      throw new ForbiddenException('You cannot log monitoring events for this session');
    }

    if (session.status !== 'in_progress') {
      throw new BadRequestException('Monitoring events can only be logged for active sessions');
    }

    const now = new Date().toISOString();
    const event = await this.monitoringRepo.createEvent({
      id: crypto.randomUUID(),
      sessionId: data.sessionId,
      studentId: session.studentId,
      examId: session.examId,
      eventType: data.eventType,
      metadataJson: data.metadataJson ?? null,
      occurredAt: now,
      createdAt: now,
    });

    await this.notificationTeacher(event.examId, event.sessionId, event.eventType);

    return event;
  }

  async getEventsByExam(examId: string, user?: AuthenticatedUser) {
    if (user) {
      await this.ensureTeacherOwnsExam(examId, user.id);
    }

    return this.monitoringRepo.findEventsByExam(examId);
  }

  async getEventsBySession(sessionId: string, user?: AuthenticatedUser) {
    const session = await this.sessionRepo.findSessionById(sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (user) {
      await this.ensureTeacherOwnsExam(session.examId, user.id);
    }

    return this.monitoringRepo.findEventsBySession(sessionId);
  }

  async getDashboardStats(userOrLimit?: AuthenticatedUser | number, limit = 20) {
    const recentEvents = await this.monitoringRepo.findRecentEvents(limit);
    const user =
      typeof userOrLimit === 'number' || !userOrLimit ? undefined : userOrLimit;
    const requestedLimit =
      typeof userOrLimit === 'number' ? userOrLimit : limit;

    const scopedRecentEvents =
      requestedLimit === limit
        ? recentEvents
        : await this.monitoringRepo.findRecentEvents(requestedLimit);

    let teacherEvents = scopedRecentEvents;

    if (user) {
      const exams = await this.examRepo.findExamsByTeacher(user.id);
      const teacherExamIds = new Set(exams.map((exam) => exam.id));

      teacherEvents = scopedRecentEvents.filter((event) =>
        teacherExamIds.has(event.examId),
      );
    }

    const uniqueStudents = new Set(teacherEvents.map((event) => event.studentId));

    return {
      totalEvents: teacherEvents.length,
      uniqueStudents: uniqueStudents.size,
      recentEvents: teacherEvents,
    };
  }

  async getLiveFeed(examId: string, user?: AuthenticatedUser) {
    if (user) {
      await this.ensureTeacherOwnsExam(examId, user.id);
    }

    return this.monitoringRepo.findEventsByExam(examId);
  }

  private async notificationTeacher(
    examId: string,
    sessionId: string,
    eventType: string,
  ) {
    const exam = await this.examRepo.findExamById(examId);

    if (!exam) {
      return;
    }

    await this.notificationService.createNotification({
      recipientId: exam.teacherId,
      examId,
      sessionId,
      title: 'Suspicious activity detected',
      body: `A ${eventType} event was reported during an active exam session.`,
      type: 'suspicious_event',
    });
  }

  private async ensureTeacherOwnsExam(examId: string, teacherId: string) {
    const exam = await this.examRepo.findExamById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException('You cannot access monitoring for this exam');
    }

    return exam;
  }
}
