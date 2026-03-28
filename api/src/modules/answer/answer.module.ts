import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [DatabaseModule, SessionModule],
  controllers: [AnswerController],
  providers: [AnswerService],
  exports: [AnswerService],
})
export class AnswerModule {}
