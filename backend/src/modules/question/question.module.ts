import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { QuestionResolver } from './question.resolver';

@Module({
  imports: [DatabaseModule],
  providers: [QuestionService, QuestionResolver],
  controllers: [QuestionController],
})
export class QuestionModule {}
