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
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamStatusDto } from './dto/update-exam.dto';
import { ClerkAuthGuard } from 'src/modules/auth/guards/clerk-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/modules/auth/interfaces/authenticated-user.interface';

@Controller('exams')
@UseGuards(ClerkAuthGuard, RolesGuard)
@Roles('teacher')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('assigned/me')
  @Roles('student')
  getAssignedExams(@CurrentUser() user: AuthenticatedUser) {
    return this.examService.getAssignedExams(user.id);
  }

  @Get()
  getMyExams(@CurrentUser() user: AuthenticatedUser) {
    return this.examService.getMyExams(user.id);
  }

  @Get(':id/detail')
  getExamDetail(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.examService.getExamDetail(id, user.id);
  }

  @Get(':id')
  getExamById(@Param('id') id: string) {
    return this.examService.getExamById(id);
  }

  @Post()
  createExam(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateExamDto,
  ) {
    return this.examService.createExam(user.id, body);
  }

  @Patch(':id/status')
  updateExamStatus(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateExamStatusDto,
  ) {
    return this.examService.updateExamStatus(id, user.id, body.status);
  }

  @Delete(':id')
  deleteExam(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.examService.deleteExam(id, user.id);
  }
}
