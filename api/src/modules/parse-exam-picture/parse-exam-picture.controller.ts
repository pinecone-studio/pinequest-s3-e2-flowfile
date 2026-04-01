import { Body, Controller, Post } from '@nestjs/common';
import { ParseExamPictureDto } from './dto/parse-exam-picture.dto';
import { ParseExamPictureService } from './parse-exam-picture.service';

@Controller('parse-exam-picture')
export class ParseExamPictureController {
  constructor(
    private readonly parseExamPictureService: ParseExamPictureService,
  ) {}

  @Post()
  parseExamPicture(@Body() body: ParseExamPictureDto) {
    return this.parseExamPictureService.parseExamPicture(body);
  }
}
