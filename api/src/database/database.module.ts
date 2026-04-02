import { Module } from '@nestjs/common';
import { UserRepository } from './repositories';

import { QuestionRepository } from 'src/modules/question/question.repository';
import { EnrollmentRepository } from 'src/modules/enrollment/enrollment.repository';
import { ExamRepository } from 'src/modules/exam/exam.repository';
import { SessionRepository } from 'src/modules/session/session.repository';
import { AnswerRepository } from 'src/modules/answer/answer.repository';
import { MonitoringRepository } from 'src/modules/monitoring/monitoring.repository';
import { NotificationRepository } from 'src/modules/notification/notification.repository';
import { QuizGeneratorRepository } from 'src/modules/quiz/quiz-generator.repository';

@Module({
  providers: [
    UserRepository,
    ExamRepository,
    QuestionRepository,
    EnrollmentRepository,
    SessionRepository,
    AnswerRepository,
    MonitoringRepository,
    NotificationRepository,
    QuizGeneratorRepository,
  ],
  exports: [
    UserRepository,
    ExamRepository,
    QuestionRepository,
    EnrollmentRepository,
    SessionRepository,
    AnswerRepository,
    MonitoringRepository,
    NotificationRepository,
  ],
})
export class DatabaseModule {}
