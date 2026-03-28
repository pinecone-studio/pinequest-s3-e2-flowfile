import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SessionService } from './session.service';
import { StartSessionDto } from './dto/start-session.dto';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('exam/:examId')
  getSessionsByExam(@Param('examId') examId: string) {
    return this.sessionService.getSessionsByExam(examId);
  }

  @Get('student/:studentId/exam/:examId')
  getSessionByStudentAndExam(
    @Param('studentId') studentId: string,
    @Param('examId') examId: string,
  ) {
    return this.sessionService.getSessionByStudentAndExam(studentId, examId);
  }

  @Post('start')
  startSession(@Body() body: StartSessionDto) {
    return this.sessionService.startSession(body.studentId, body.examId);
  }

  @Patch(':id/submit')
  submitSession(@Param('id') id: string) {
    return this.sessionService.submitSession(id);
  }

  @Patch(':id/flag')
  flagSession(@Param('id') id: string) {
    return this.sessionService.flagSession(id);
  }
}
