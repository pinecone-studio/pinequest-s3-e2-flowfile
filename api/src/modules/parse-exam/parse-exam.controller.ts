import { Body, Controller, Post } from '@nestjs/common';
import { ParseExamDto } from './dto/parse-exam.dto';
import { ParseExamService } from './parse-exam.service';

@Controller('parse-exam')
export class ParseExamController {
  constructor(private readonly parseExamService: ParseExamService) {}

  @Post()
  parseExam(@Body() body: ParseExamDto) {
    return this.parseExamService.parseExam(body);
  }
}
