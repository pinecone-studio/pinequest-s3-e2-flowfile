import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  enrollStudent(@Body() body: CreateEnrollmentDto) {
    return this.enrollmentService.enrollStudent(body.examId, body.studentId, {
      studentName: body.studentName,
    });
  }

  @Get('exam/:examId')
  getEnrollmentsByExam(@Param('examId') examId: string) {
    return this.enrollmentService.getEnrollmentsByExam(examId);
  }

  @Get('student/:studentId')
  getEnrollmentsByStudent(@Param('studentId') studentId: string) {
    return this.enrollmentService.getEnrollmentsByStudent(studentId);
  }

  @Delete(':examId/:studentId')
  removeEnrollment(
    @Param('examId') examId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.enrollmentService.removeEnrollment(examId, studentId);
  }
}
