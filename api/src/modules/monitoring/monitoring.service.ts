import { Injectable, NotFoundException } from '@nestjs/common';
import { MonitoringRepository } from './monitoring.repository';
import { SessionRepository } from '../session/session.repository';
import { ExamRepository } from '../exam/exam.repository';
import { NotificationService } from '../notification/notification.service';
import type { NewMonitoringEvent } from 'src/shared/types';

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
  }) {
    const session = await this.sessionRepo.findSessionById(data.sessionId);

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const now = new Date().toISOString();
    const event = await this.monitoringRepo.createEvent({
      id: crypto.randomUUID(),
      sessionId: data.sessionId,
      studentId: data.studentId,
      examId: data.examId,
      eventType: data.eventType,
      metadataJson: data.metadataJson ?? null,
      occurredAt: now,
      createdAt: now,
    });

    await this.notificationTeacher(event.examId, event.sessionId, event.eventType);

    return event;
  }

  async getEventsByExam(examId: string) {
    return this.monitoringRepo.findEventsByExam(examId);
  }

  async getEventsBySession(sessionId: string) {
    return this.monitoringRepo.findEventsBySession(sessionId);
  }

  async getDashboardStats(limit = 20) {
    const recentEvents = await this.monitoringRepo.findRecentEvents(limit);
    const uniqueStudents = new Set(recentEvents.map((event) => event.studentId));

    return {
      totalEvents: recentEvents.length,
      uniqueStudents: uniqueStudents.size,
      recentEvents,
    };
  }

  async getLiveFeed(examId: string) {
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
}
