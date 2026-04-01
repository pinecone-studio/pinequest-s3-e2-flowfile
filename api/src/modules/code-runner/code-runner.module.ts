import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CodeChallengeController } from './code-challange.controller';
import { CodeChallengeRepository } from './code-challange.repository';
import { CodeChallengeService } from './code-challange.service';
import { CodeRunController } from './code-run.controller';
import { CodeRunService } from './code-run.service';
import { JavaScriptRunnerService } from './javascript-runner.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CodeChallengeController, CodeRunController],
  providers: [
    CodeChallengeRepository,
    CodeChallengeService,
    CodeRunService,
    JavaScriptRunnerService,
  ],
  exports: [CodeChallengeRepository, CodeChallengeService, CodeRunService],
})
export class CodeRunnerModule {}
