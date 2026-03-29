import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';

@Module({
  imports: [DatabaseModule],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
