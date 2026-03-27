import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { ExamResolver } from './exam.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [ExamService, ExamResolver],
  controllers: [ExamController],
})
export class ExamModule {}