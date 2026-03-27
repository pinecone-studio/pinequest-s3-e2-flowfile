import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { ExamRepository } from './exam.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [ExamService, ExamRepository],
  controllers: [ExamController],
  exports: [ExamService],
})
export class ExamModule {}
