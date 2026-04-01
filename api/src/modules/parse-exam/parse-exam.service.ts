import { Injectable } from '@nestjs/common';
import { ParseExamDto } from './dto/parse-exam.dto';
import { ParseExamRepository } from './parse-exam.repository';

@Injectable()
export class ParseExamService {
  constructor(private readonly parseExamRepository: ParseExamRepository) {}

  parseExam(body: ParseExamDto) {
    return this.parseExamRepository.parseExam(body);
  }
}
