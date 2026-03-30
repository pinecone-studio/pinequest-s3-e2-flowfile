import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ClerkAuthGuard } from 'src/modules/auth/guards/clerk-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

@Controller('monitoring')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post('events')
  @Roles('student')
  logEvent(@Body() body: CreateEventDto, @CurrentUser() user: AuthenticatedUser) {
    return this.monitoringService.logEvent(body, user);
  }

  @Get('events/exam/:examId')
  @Roles('teacher')
  getEventsByExam(
    @Param('examId') examId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.monitoringService.getEventsByExam(examId, user);
  }

  @Get('events/session/:sessionId')
  @Roles('teacher')
  getEventsBySession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.monitoringService.getEventsBySession(sessionId, user);
  }

  @Get('events/exam/:examId/live')
  @Roles('teacher')
  getLiveFeed(
    @Param('examId') examId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.monitoringService.getLiveFeed(examId, user);
  }

  @Get('dashboard')
  @Roles('teacher')
  getDashboardStats(@CurrentUser() user: AuthenticatedUser) {
    return this.monitoringService.getDashboardStats(user);
  }
}
