import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { UpsertAnswerDto } from './dto/upsert-answer.dto';
import { ClerkAuthGuard } from 'src/modules/auth/guards/clerk-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

@Controller('answers')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Get('session/:sessionId')
  @Roles('teacher', 'student')
  getAnswersBySession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.answerService.getAnswersBySession(sessionId, user);
  }

  @Post('autosave')
  @Roles('student')
  autosaveAnswer(
    @Body() body: UpsertAnswerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.answerService.autosaveAnswer(body, user);
  }

  @Patch('session/:sessionId/finalize')
  @Roles('student')
  finalizeAnswers(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.answerService.finalizeAnswers(sessionId, user);
  }
}
