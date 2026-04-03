import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { StartSessionDto } from './dto/start-session.dto';
import { ClerkAuthGuard } from 'src/modules/auth/guards/clerk-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

@Controller('sessions')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('exam/:examId')
  @Roles('teacher')
  getSessionsByExam(
    @Param('examId') examId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService.getSessionsByExam(examId, user);
  }

  @Get('exam/:examId/live')
  @Roles('teacher')
  getLiveSessions(
    @Param('examId') examId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService.getSessionsByExam(examId, user);
  }

  @Get('exam/:examId/analytics')
  @Roles('teacher')
  getExamAnalytics(
    @Param('examId') examId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService.getExamAnalytics(examId, user);
  }

  @Get('student/:studentId/exam/:examId')
  @Roles('teacher', 'student')
  getSessionByStudentAndExam(
    @Param('studentId') studentId: string,
    @Param('examId') examId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService.getSessionByStudentAndExam(
      studentId,
      examId,
      user,
    );
  }

  @Post('start')
  @Roles('student')
  startSession(
    @Body() body: StartSessionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService.startSession(body.studentId, body.examId, user);
  }

  @Post('exam/:examId/start')
  @Roles('student')
  startMySession(
    @Param('examId') examId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService.startSession(user.id, examId, user);
  }

  @Get(':id/attempt')
  @Roles('student')
  getMyAttempt(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService.getAttempt(id, user);
  }

  @Patch(':id/submit')
  @Roles('student')
  submitSession(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.sessionService.submitSession(id, user);
  }

  @Patch(':id/flag')
  @Roles('teacher')
  flagSession(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.sessionService.flagSession(id, user);
  }
}
