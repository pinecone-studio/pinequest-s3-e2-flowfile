import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CodeChallengeService } from './code-challange.service';
import { SaveCodeChallengesDto } from './dto/save-code-challanges.dto';

@Controller('code-challanges')
export class CodeChallengeController {
  constructor(private readonly codeChallengeService: CodeChallengeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  saveChallenges(@Body() body: SaveCodeChallengesDto) {
    return this.codeChallengeService.saveChallenges(body);
  }
}
