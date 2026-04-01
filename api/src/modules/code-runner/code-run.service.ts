import { BadRequestException, Injectable } from '@nestjs/common';
import { CodeChallengeRepository } from './code-challange.repository';
import { JavaScriptRunnerService } from './javascript-runner.service';
import { RunCodeDto } from './dto/run-code.dto';
import type {
  CodeRunnerTestCase,
  ParsedCodeRunnerTestCase,
} from 'src/shared/types/code-runner.types';

@Injectable()
export class CodeRunService {
  constructor(
    private readonly codeChallengeRepository: CodeChallengeRepository,
    private readonly javaScriptRunnerService: JavaScriptRunnerService,
  ) {}

  async run(body: RunCodeDto) {
    try {
      const code = typeof body.code === 'string' ? body.code : '';
      const mode = body.mode === 'tests' ? 'tests' : 'preview';

      if (!code.trim()) {
        throw new BadRequestException('Code is required.');
      }

      if (code.length > 20000) {
        throw new BadRequestException('Code is too large to execute safely.');
      }

      if (mode === 'preview') {
        return this.javaScriptRunnerService.preview(code);
      }

      const functionName =
        typeof body.runner?.functionName === 'string'
          ? body.runner.functionName.trim()
          : '';

      if (!functionName) {
        throw new BadRequestException(
          'Function name is required for test runs.',
        );
      }

      const publicTestCases = this.parseTestCases(
        Array.isArray(body.runner?.publicTestCases)
          ? (body.runner.publicTestCases as CodeRunnerTestCase[])
          : [],
      );

      const challengeId =
        typeof body.runner?.challengeId === 'string'
          ? body.runner.challengeId.trim()
          : '';

      const storedChallenge = challengeId
        ? await this.codeChallengeRepository.findById(challengeId)
        : undefined;

      const hiddenTestCases = storedChallenge
        ? this.parseTestCases(storedChallenge.hiddenTestCases)
        : [];

      return this.javaScriptRunnerService.runTests({
        code,
        functionName,
        publicTests: publicTestCases,
        hiddenTests: hiddenTestCases,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Failed to execute the code.';

      throw new BadRequestException(message);
    }
  }

  private parseTestCases(
    testCases: CodeRunnerTestCase[],
  ): ParsedCodeRunnerTestCase[] {
    return testCases.reduce<ParsedCodeRunnerTestCase[]>((result, testCase) => {
      const input =
        typeof testCase.input === 'string' ? testCase.input.trim() : '';
      const expected =
        typeof testCase.expected === 'string' ? testCase.expected.trim() : '';

      if (!input || !expected) {
        return result;
      }

      const parsedInput = JSON.parse(input) as unknown;

      if (!Array.isArray(parsedInput)) {
        throw new BadRequestException(
          'Each test input must be a JSON array of function arguments.',
        );
      }

      result.push({
        id: testCase.id,
        description: testCase.description,
        input: parsedInput,
        expected: JSON.parse(expected) as unknown,
      });

      return result;
    }, []);
  }
}
