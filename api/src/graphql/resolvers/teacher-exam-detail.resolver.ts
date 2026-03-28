import { NotFoundException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { ExamService } from 'src/modules/exam/exam.service';
import { QuestionService } from 'src/modules/question/question.service';
import { SessionService } from 'src/modules/session/session.service';
import { MonitoringService } from 'src/modules/monitoring/monitoring.service';
import { NotificationService } from 'src/modules/notification/notification.service';

@Resolver()
export class TeacherExamDetailResolver {
  constructor(
    private readonly examService: ExamService,
    private readonly questionService: QuestionService,
    private readonly sessionService: SessionService,
    private readonly monitoringService: MonitoringService,
    private readonly notificationService: NotificationService,
  ) {}

  @Query('teacherExamDetail')
  async getTeacherExamDetail(@Args('examId') examId: string) {
    const exam = await this.examService.getExamById(examId);

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const [questions, sessions, suspiciousEvents, teacherNotifications] =
      await Promise.all([
        this.questionService.getQuestionsByExam(examId),
        this.sessionService.getSessionsByExam(examId),
        this.monitoringService.getEventsByExam(examId),
        this.notificationService.getNotificationsByUser(exam.teacherId),
      ]);

    const notifications = teacherNotifications.filter(
      (notification) => notification.examId === examId,
    );

    return {
      exam,
      questions,
      sessions,
      suspiciousEvents,
      notifications,
      totalQuestions: questions.length,
      totalSessions: sessions.length,
      submittedSessions: sessions.filter(
        (session) =>
          session.status === 'submitted' ||
          session.status === 'force_submitted',
      ).length,
      flaggedSessions: sessions.filter((session) => session.isFlagged).length,
    };
  }
}
