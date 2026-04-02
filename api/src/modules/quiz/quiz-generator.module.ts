import { Module } from '@nestjs/common';
import { QuizGeneratorResolver } from './quiz-generator.controller';
import { QuizGeneratorService } from './quiz-generator.service';
import { QuizGeneratorRepository } from './quiz-generator.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    QuizGeneratorResolver,
    QuizGeneratorService,
    QuizGeneratorRepository,
  ],
  exports: [QuizGeneratorService],
})
export class QuizGeneratorModule {}