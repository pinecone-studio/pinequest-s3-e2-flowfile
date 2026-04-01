import { Module } from '@nestjs/common';
import { ParseExamModule } from '../parse-exam/parse-exam.module';
import { ParseExamPictureController } from './parse-exam-picture.controller';
import { ParseExamPictureService } from './parse-exam-picture.service';

@Module({
  imports: [ParseExamModule],
  controllers: [ParseExamPictureController],
  providers: [ParseExamPictureService],
})
export class ParseExamPictureModule {}
