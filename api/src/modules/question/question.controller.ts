import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ReorderQuestionsDto } from './dto/reorder-questions.dto';
import { ReorderOptionsDto } from './dto/reorder-options.dto';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('exam/:examId')
  getQuestionsByExam(@Param('examId') examId: string) {
    return this.questionService.getQuestionsByExam(examId);
  }

  @Get(':id')
  getQuestionById(@Param('id') id: string) {
    return this.questionService.getQuestionById(id);
  }

  @Post()
  createQuestion(@Body() body: CreateQuestionDto) {
    return this.questionService.createQuestion({
      ...body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  @Patch(':id')
  updateQuestion(@Param('id') id: string, @Body() body: UpdateQuestionDto) {
    return this.questionService.updateQuestion(id, body);
  }

  @Delete(':id')
  deleteQuestion(@Param('id') id: string) {
    return this.questionService.deleteQuestion(id);
  }

  @Patch('exam/:examId/reorder')
  reorderQuestions(
    @Param('examId') examId: string,
    @Body() body: ReorderQuestionsDto,
  ) {
    return this.questionService.reorderQuestions(examId, body.orderedIds);
  }

  @Patch(':id/options/reorder')
  reorderOptions(@Param('id') id: string, @Body() body: ReorderOptionsDto) {
    return this.questionService.reorderOptions(id, body.options);
  }
}
