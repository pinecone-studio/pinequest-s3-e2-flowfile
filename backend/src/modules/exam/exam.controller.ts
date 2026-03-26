import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamStatusDto } from './dto/update-exam.dto';


@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  getAllExams() {
    return this.examService.getAllExams();
  }

  @Get(':id')
  getExamById(@Param('id') id: string) {
    return this.examService.getExamById(id);
  }

  @Get('teacher/:teacherId')
  getExamsByTeacher(@Param('teacherId') teacherId: string) {
    return this.examService.getExamsByTeacher(teacherId);
  }

  @Post()
  createExam(@Body() body: CreateExamDto) {
    return this.examService.createExam({
      ...body,
      id: crypto.randomUUID(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  @Patch(':id/status')
  updateExamStatus(@Param('id') id: string, @Body() body: UpdateExamStatusDto) {
    return this.examService.updateExamStatus(id, body.status);
  }

  @Delete(':id')
  deleteExam(@Param('id') id: string) {
    return this.examService.deleteExam(id);
  }
}