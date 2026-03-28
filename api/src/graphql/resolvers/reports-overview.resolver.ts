import { Query, Resolver } from '@nestjs/graphql';
import { ExamService } from 'src/modules/exam/exam.service';
import { SessionService } from 'src/modules/session/session.service';
import { MonitoringService } from 'src/modules/monitoring/monitoring.service';

@Resolver()
export class ReportsOverviewResolver {
  constructor(
    private readonly examService: ExamService,
    private readonly sessionService: SessionService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Query('reportsOverview')
  async getReportsOverview() {
    const exams = await this.examService.getAllExams();

    const [sessionsByExam, eventsByExam] = await Promise.all([
      Promise.all(
        exams.map((exam) => this.sessionService.getSessionsByExam(exam.id)),
      ),
      Promise.all(
        exams.map((exam) => this.monitoringService.getEventsByExam(exam.id)),
      ),
    ]);

    const allSessions = sessionsByExam.flat();
    const allEvents = eventsByExam.flat();

    const subjectMap = new Map<
      string,
      {
        subject: string;
        examCount: number;
        sessionCount: number;
        suspiciousEventCount: number;
      }
    >();

    exams.forEach((exam, index) => {
      const current = subjectMap.get(exam.subject) ?? {
        subject: exam.subject,
        examCount: 0,
        sessionCount: 0,
        suspiciousEventCount: 0,
      };

      current.examCount += 1;
      current.sessionCount += sessionsByExam[index].length;
      current.suspiciousEventCount += eventsByExam[index].length;
      subjectMap.set(exam.subject, current);
    });

    const teacherMap = new Map<
      string,
      {
        teacherId: string;
        examCount: number;
        publishedExamCount: number;
        scheduledExamCount: number;
      }
    >();

    exams.forEach((exam) => {
      const current = teacherMap.get(exam.teacherId) ?? {
        teacherId: exam.teacherId,
        examCount: 0,
        publishedExamCount: 0,
        scheduledExamCount: 0,
      };

      current.examCount += 1;
      current.publishedExamCount += exam.status === 'published' ? 1 : 0;
      current.scheduledExamCount += exam.status === 'scheduled' ? 1 : 0;
      teacherMap.set(exam.teacherId, current);
    });

    return {
      totalExams: exams.length,
      totalSessions: allSessions.length,
      totalSubmittedSessions: allSessions.filter(
        (session) =>
          session.status === 'submitted' ||
          session.status === 'force_submitted',
      ).length,
      totalSuspiciousEvents: allEvents.length,
      subjectBreakdown: Array.from(subjectMap.values()),
      teacherBreakdown: Array.from(teacherMap.values()),
    };
  }
}
