import { Module } from '@nestjs/common';
import { UserRepository } from './repositories';

import { QuestionRepository } from 'src/modules/question/question.repository';
import { EnrollmentRepository } from 'src/modules/enrollment/enrollment.repository';
import { ExamRepository } from 'src/modules/exam/exam.repository';

@Module({
  providers: [
    UserRepository,
    ExamRepository,
    QuestionRepository,
    EnrollmentRepository,
  ],
  exports: [
    UserRepository,
    ExamRepository,
    QuestionRepository,
    EnrollmentRepository,
  ],
})
export class DatabaseModule {}
