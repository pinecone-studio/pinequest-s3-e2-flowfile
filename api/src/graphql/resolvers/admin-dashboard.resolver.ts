import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { ExamService } from 'src/modules/exam/exam.service';
import { SessionService } from 'src/modules/session/session.service';
import { MonitoringService } from 'src/modules/monitoring/monitoring.service';

@Resolver()
export class AdminDashboardResolver {
  constructor(
    private readonly examService: ExamService,
    private readonly sessionService: SessionService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Query('adminDashboard')
  async getAdminDashboard(
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    const [exams, allSessions, dashboardStats] = await Promise.all([
      this.examService.getAllExams(),
      this.sessionService.getAllSessions(),
      this.monitoringService.getDashboardStats(limit),
    ]);

    const totalSessions = allSessions.length;

    return {
      totalExams: exams.length,
      totalScheduledExams: exams.filter((exam) => exam.status === 'scheduled')
        .length,
      totalPublishedExams: exams.filter((exam) => exam.status === 'published')
        .length,
      totalSessions,
      totalSuspiciousEvents: dashboardStats.totalEvents,
      recentEvents: dashboardStats.recentEvents,
    };
  }
}
