import { Injectable } from '@nestjs/common';
import { ParseExamRepository } from '../parse-exam/parse-exam.repository';
import { ParseExamPictureDto } from './dto/parse-exam-picture.dto';

@Injectable()
export class ParseExamPictureService {
  constructor(private readonly parseExamRepository: ParseExamRepository) {}

  parseExamPicture(body: ParseExamPictureDto) {
    return this.parseExamRepository.parseExamPicture(body);
  }
}
