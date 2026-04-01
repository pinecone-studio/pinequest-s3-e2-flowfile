import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CodeChallengeRepository } from './code-challange.repository';
import { SaveCodeChallengesDto } from './dto/save-code-challanges.dto';
import type {
  CodeRunnerTestCase,
  NewCodeChallenge,
} from 'src/shared/types/code-runner.types';

@Injectable()
export class CodeChallengeService {
  constructor(
    private readonly codeChallengeRepository: CodeChallengeRepository,
  ) {}

  async saveChallenges(body: SaveCodeChallengesDto) {
    const incomingChallenges = Array.isArray(body?.challenges)
      ? body.challenges
      : [];

    const challenges = incomingChallenges.reduce<NewCodeChallenge[]>(
      (result, challenge) => {
        const id = this.toTrimmedString(challenge?.id);
        const questionId = this.toTrimmedString(challenge?.questionId);
        const functionName = this.toTrimmedString(challenge?.functionName);

        const hiddenTestCases = Array.isArray(challenge?.hiddenTestCases)
          ? challenge.hiddenTestCases.filter(
              (testCase): testCase is CodeRunnerTestCase =>
                this.isValidTestCase(testCase),
            )
          : [];

        if (!id || !questionId || !functionName) {
          return result;
        }

        result.push({
          id,
          questionId,
          functionName,
          hiddenTestCases,
        });

        return result;
      },
      [],
    );

    if (challenges.length === 0) {
      throw new BadRequestException('No valid code challenges were provided.');
    }

    try {
      await this.codeChallengeRepository.saveMany(challenges);

      return {
        saved: challenges.length,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save code challenges.';

      throw new InternalServerErrorException(message);
    }
  }

  async getChallengeById(id: string) {
    return this.codeChallengeRepository.findById(id);
  }

  private toTrimmedString(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
  }

  private isValidTestCase(testCase: unknown): testCase is CodeRunnerTestCase {
    if (!testCase || typeof testCase !== 'object') {
      return false;
    }

    const candidate = testCase as Record<string, unknown>;

    return (
      typeof candidate.id === 'string' &&
      candidate.id.trim().length > 0 &&
      typeof candidate.input === 'string' &&
      candidate.input.trim().length > 0 &&
      typeof candidate.expected === 'string' &&
      candidate.expected.trim().length > 0
    );
  }
}
