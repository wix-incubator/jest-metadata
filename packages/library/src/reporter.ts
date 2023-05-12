/* eslint-disable node/no-unpublished-import, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import type { Test, TestCaseResult, TestResult } from '@jest/reporters';
import { realm } from './realms';
import * as server from './server';

export type JestMetadataServerReporterConfig = {
  // empty for now
};

export const query = realm.query;

/**
 * @implements {import('@jest/reporters').Reporter}
 */
export class JestMetadataReporter {
  constructor(_globalConfig: unknown, _options: JestMetadataServerReporterConfig) {}

  getLastError(): Error | void {
    return undefined;
  }

  /**
   * @see {import('@jest/reporters').AggregatedResult}
   * @see {import('@jest/reporters').ReporterOnStartOptions}
   */
  async onRunStart(_results: unknown, _options: unknown): Promise<void> {
    await server.onRunStart();
  }

  /**
   * @deprecated
   * @see {import('@jest/reporters').Test}
   */
  onTestStart(_test: unknown): void {
    // Jest's ReporterDispatcher won't call this method due to existence of `onTestFileStart`.
  }

  /**
   * @see {import('@jest/reporters').Test}
   */
  onTestFileStart(test: unknown): void {
    const testPath = (test as Test).path;
    server.addTestFile(testPath);
    const runMetadata = realm.aggregatedResultMetadata.getRunMetadata(testPath);
    realm.associate.filePath(testPath, runMetadata);
  }

  /**
   * @see {import('@jest/reporters').Test}
   * @see {import('@jest/reporters').TestCaseResult}
   */
  onTestCaseResult(_test: unknown, _testCaseResult: unknown): void {
    const { lastTestEntry } = realm.query.test(_test as Test);
    if (lastTestEntry) {
      realm.associate.testCaseResult(_testCaseResult as TestCaseResult, lastTestEntry);
    }
  }

  /**
   * @deprecated
   * @see {import('@jest/reporters').Test}
   * @see {import('@jest/reporters').TestResult}
   * @see {import('@jest/reporters').AggregatedResult}
   */
  onTestResult(_test: unknown, _testResult: unknown, _aggregatedResult: unknown): void {
    // Jest's ReporterDispatcher won't call this method due to existence of `onTestFileResult`.
  }

  /**
   * @see {import('@jest/reporters').Test}
   * @see {import('@jest/reporters').TestResult}
   * @see {import('@jest/reporters').AggregatedResult}
   */
  onTestFileResult(_test: unknown, _testResult: unknown, _aggregatedResult: unknown): void {
    const runMetadata = realm.query.test(_test as Test);
    const allTestEntries = [...runMetadata.allTestEntries()];
    const testResults = (_testResult as TestResult).testResults;

    for (const [index, testEntry] of allTestEntries.entries()) {
      realm.associate.testCaseResult(testResults[index], testEntry);
    }
  }

  /**
   * @see {import('@jest/reporters').TestContext}
   * @see {import('@jest/reporters').AggregatedResult}
   */
  async onRunComplete(_testContexts: Set<unknown>, _results: unknown): Promise<void> {
    await server.onRunComplete();
  }
}

export default JestMetadataReporter;
