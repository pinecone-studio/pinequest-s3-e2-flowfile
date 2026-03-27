import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { ExamResolver } from './exam.resolver';
import { ExamRepository } from './exam.repository';

@Module({
  imports: [DatabaseModule],
  providers: [ExamService, ExamResolver, ExamRepository],
  controllers: [ExamController],
  exports: [ExamService],
})
export class ExamModule {}
