import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CodeRunService } from './code-run.service';
import { RunCodeDto } from './dto/run-code.dto';

@Controller('code')
export class CodeRunController {
  constructor(private readonly codeRunService: CodeRunService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  run(@Body() body: RunCodeDto) {
    return this.codeRunService.run(body);
  }
}
