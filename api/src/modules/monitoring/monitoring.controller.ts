import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post('events')
  logEvent(@Body() body: CreateEventDto) {
    return this.monitoringService.logEvent(body);
  }

  @Get('events/exam/:examId')
  getEventsByExam(@Param('examId') examId: string) {
    return this.monitoringService.getEventsByExam(examId);
  }

  @Get('events/session/:sessionId')
  getEventsBySession(@Param('sessionId') sessionId: string) {
    return this.monitoringService.getEventsBySession(sessionId);
  }

  @Get('events/exam/:examId/live')
  getLiveFeed(@Param('examId') examId: string) {
    return this.monitoringService.getLiveFeed(examId);
  }

  @Get('dashboard')
  getDashboardStats() {
    return this.monitoringService.getDashboardStats();
  }
}
