export interface CodeRunnerTestCase {
  id: string;
  description?: string;
  input: string;
  expected: string;
}

export interface ParsedCodeRunnerTestCase {
  id: string;
  description?: string;
  input: unknown[];
  expected: unknown;
}

export interface CodeChallenge {
  id: string;
  questionId: string;
  functionName: string;
  hiddenTestCases: CodeRunnerTestCase[];
  createdAt: Date;
  updatedAt: Date;
}

export type NewCodeChallenge = Pick<
  CodeChallenge,
  'id' | 'questionId' | 'functionName' | 'hiddenTestCases'
>;
