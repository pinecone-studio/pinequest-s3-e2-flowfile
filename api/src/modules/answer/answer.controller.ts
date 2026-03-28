import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AnswerService } from './answer.service';
import { UpsertAnswerDto } from './dto/upsert-answer.dto';

@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Get('session/:sessionId')
  getAnswersBySession(@Param('sessionId') sessionId: string) {
    return this.answerService.getAnswersBySession(sessionId);
  }

  @Post('autosave')
  autosaveAnswer(@Body() body: UpsertAnswerDto) {
    return this.answerService.autosaveAnswer(body);
  }

  @Patch('session/:sessionId/finalize')
  finalizeAnswers(@Param('sessionId') sessionId: string) {
    return this.answerService.finalizeAnswers(sessionId);
  }
}
