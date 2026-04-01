import { Module } from '@nestjs/common';
import { ParseExamController } from './parse-exam.controller';
import { ParseExamRepository } from './parse-exam.repository';
import { ParseExamService } from './parse-exam.service';

@Module({
  controllers: [ParseExamController],
  providers: [ParseExamRepository, ParseExamService],
  exports: [ParseExamService, ParseExamRepository],
})
export class ParseExamModule {}
