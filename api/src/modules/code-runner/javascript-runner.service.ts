import { Injectable } from '@nestjs/common';
import * as vm from 'node:vm';
import type { ParsedCodeRunnerTestCase } from 'src/shared/types/code-runner.types';

type PreviewResult = {
  ok: boolean;
  logs: string[];
  result: unknown;
  error: string | null;
};

type TestCaseRunResult = {
  id: string;
  description?: string;
  passed: boolean;
  input: unknown[];
  expected: unknown;
  actual: unknown;
  error?: string;
};

type TestRunResult = {
  ok: boolean;
  passed: number;
  failed: number;
  total: number;
  results: TestCaseRunResult[];
};

@Injectable()
export class JavaScriptRunnerService {
  async preview(code: string): Promise<PreviewResult> {
    const logs: string[] = [];
    const sandbox = this.createSandbox(logs);
    const context = vm.createContext(sandbox);

    try {
      const wrappedCode =
        '"use strict";\n' +
        'let __previewResult;\n' +
        code +
        '\n' +
        'if (typeof solution !== "undefined") {\n' +
        '  __previewResult = solution;\n' +
        '} else if (typeof main !== "undefined") {\n' +
        '  __previewResult = main;\n' +
        '} else {\n' +
        '  __previewResult = null;\n' +
        '}\n' +
        '__previewResult;';

      const script = new vm.Script(wrappedCode);

      const result = script.runInContext(context, {
        timeout: 1000,
      });

      return {
        ok: true,
        logs,
        result: this.serializeValue(result),
        error: null,
      };
    } catch (error) {
      return {
        ok: false,
        logs,
        result: null,
        error: error instanceof Error ? error.message : 'Execution failed.',
      };
    }
  }

  async runTests(params: {
    code: string;
    functionName: string;
    publicTests: ParsedCodeRunnerTestCase[];
    hiddenTests: ParsedCodeRunnerTestCase[];
  }): Promise<TestRunResult> {
    const allTests = [...params.publicTests, ...params.hiddenTests];
    const results: TestCaseRunResult[] = [];

    for (const testCase of allTests) {
      const logs: string[] = [];
      const sandbox = this.createSandbox(logs);
      const context = vm.createContext(sandbox);

      try {
        const script = new vm.Script('"use strict";\n' + params.code);
        script.runInContext(context, { timeout: 1000 });

        const fn = vm.runInContext(params.functionName, context, {
          timeout: 100,
        });

        if (typeof fn !== 'function') {
          throw new Error(
            'Function "' +
              params.functionName +
              '" was not found in the submitted code.',
          );
        }

        const actual = await Promise.resolve(
          (fn as (...args: unknown[]) => unknown)(...testCase.input),
        );

        const passed = this.deepEqual(actual, testCase.expected);

        results.push({
          id: testCase.id,
          description: testCase.description,
          passed,
          input: this.toArray(this.serializeValue(testCase.input)),
          expected: this.serializeValue(testCase.expected),
          actual: this.serializeValue(actual),
          error: passed
            ? undefined
            : 'Expected ' +
              this.stringifyValue(testCase.expected) +
              ' but received ' +
              this.stringifyValue(actual) +
              '.',
        });
      } catch (error) {
        results.push({
          id: testCase.id,
          description: testCase.description,
          passed: false,
          input: this.toArray(this.serializeValue(testCase.input)),
          expected: this.serializeValue(testCase.expected),
          actual: null,
          error:
            error instanceof Error ? error.message : 'Test execution failed.',
        });
      }
    }

    const passed = results.filter((item) => item.passed).length;
    const failed = results.length - passed;

    return {
      ok: failed === 0,
      passed,
      failed,
      total: results.length,
      results,
    };
  }

  private createSandbox(logs: string[]): Record<string, unknown> {
    return {
      console: {
        log: (...args: unknown[]) => {
          logs.push(args.map((arg) => this.stringifyValue(arg)).join(' '));
        },
        error: (...args: unknown[]) => {
          logs.push(args.map((arg) => this.stringifyValue(arg)).join(' '));
        },
        warn: (...args: unknown[]) => {
          logs.push(args.map((arg) => this.stringifyValue(arg)).join(' '));
        },
      },
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
    };
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    return (
      JSON.stringify(this.normalizeValue(a)) ===
      JSON.stringify(this.normalizeValue(b))
    );
  }

  private normalizeValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeValue(item));
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Set) {
      return Array.from(value).map((item) => this.normalizeValue(item));
    }

    if (value instanceof Map) {
      return Array.from(value.entries()).map(([key, val]) => [
        key,
        this.normalizeValue(val),
      ]);
    }

    if (value !== null && typeof value === 'object') {
      const input = value as Record<string, unknown>;
      const output: Record<string, unknown> = {};

      for (const key of Object.keys(input)) {
        output[key] = this.normalizeValue(input[key]);
      }

      return output;
    }

    return value;
  }

  private serializeValue(value: unknown): unknown {
    return this.normalizeValue(value);
  }

  private stringifyValue(value: unknown): string {
    try {
      if (typeof value === 'string') {
        return value;
      }

      return JSON.stringify(this.serializeValue(value));
    } catch {
      return String(value);
    }
  }

  private toArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }
}
