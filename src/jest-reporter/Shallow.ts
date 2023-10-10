import path from 'node:path';
import type { AggregatedResult, TestCaseResult, TestResult } from '@jest/reporters';
import type { AggregatedResultArg, TestCaseResultArg, TestFileResultArg } from './FallbackAPI';

export const Shallow = {
  testCaseResult(testCaseResult: TestCaseResult): TestCaseResultArg {
    return {
      status: testCaseResult.status,
      title: testCaseResult.title,
      ancestorTitles: testCaseResult.ancestorTitles,
      invocations: testCaseResult.invocations,
    };
  },

  testResult(testResult: TestResult): TestFileResultArg {
    return {
      testFilePath: path
        .relative(process.cwd(), testResult.testFilePath)
        .replaceAll(path.win32.sep, path.posix.sep),
      testResults: testResult.testResults.map(Shallow.testCaseResult),
    };
  },

  aggregatedResult(aggregatedResult: AggregatedResult): AggregatedResultArg {
    return {
      testResults: aggregatedResult.testResults.map(Shallow.testResult).sort((a, b) => {
        return a.testFilePath.localeCompare(b.testFilePath);
      }),
    };
  },
};
