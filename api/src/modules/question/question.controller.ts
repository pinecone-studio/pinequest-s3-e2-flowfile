import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { ReorderOptionsDto } from './dto/reorder-options.dto';
import { ClerkAuthGuard } from 'src/modules/auth/guards/clerk-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

@Controller('questions')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('exam/:examId')
  @Roles('teacher', 'student')
  getQuestionsByExam(
    @Param('examId') examId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.questionService.getQuestionsByExam(examId, user);
  }

  @Get(':id')
  @Roles('teacher', 'student')
  getQuestionById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.questionService.getQuestionById(id, user);
  }

  @Post()
  @Roles('teacher')
  createQuestion(
    @Body() body: CreateQuestionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.questionService.createQuestion(
      {
        ...body,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      user.id,
    );
  }

  @Patch(':id')
  @Roles('teacher')
  updateQuestion(
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.questionService.updateQuestion(id, body, user.id);
  }

  @Delete(':id')
  @Roles('teacher')
  deleteQuestion(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.questionService.deleteQuestion(id, user.id);
  }

  @Patch('exam/:examId/reorder')
  @Roles('teacher')
  reorderQuestions(
    @Param('examId') examId: string,
    @Body() body: ReorderQuestionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.questionService.reorderQuestions(
      examId,
      body.orderedIds,
      user.id,
    );
  }

  @Patch(':id/options/reorder')
  @Roles('teacher')
  reorderOptions(
    @Param('id') id: string,
    @Body() body: ReorderOptionsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.questionService.reorderOptions(id, body.options, user.id);
  }
}
