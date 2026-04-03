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
    const [exams, allSessions, allEvents] = await Promise.all([
      this.examService.getAllExams(),
      this.sessionService.getAllSessions(),
      this.monitoringService.getAllEvents(),
    ]);

    const sessionsByExamId = new Map<string, typeof allSessions>();
    for (const s of allSessions) {
      const arr = sessionsByExamId.get(s.examId) ?? [];
      arr.push(s);
      sessionsByExamId.set(s.examId, arr);
    }

    const eventsByExamId = new Map<string, typeof allEvents>();
    for (const e of allEvents) {
      const arr = eventsByExamId.get(e.examId) ?? [];
      arr.push(e);
      eventsByExamId.set(e.examId, arr);
    }

    const subjectMap = new Map<
      string,
      {
        subject: string;
        examCount: number;
        sessionCount: number;
        suspiciousEventCount: number;
      }
    >();

    exams.forEach((exam) => {
      const current = subjectMap.get(exam.subject) ?? {
        subject: exam.subject,
        examCount: 0,
        sessionCount: 0,
        suspiciousEventCount: 0,
      };

      current.examCount += 1;
      current.sessionCount += (sessionsByExamId.get(exam.id) ?? []).length;
      current.suspiciousEventCount += (eventsByExamId.get(exam.id) ?? []).length;
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
