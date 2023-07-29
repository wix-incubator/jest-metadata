/* eslint-disable node/no-unpublished-import, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import type { Test, TestCaseResult, TestResult } from '@jest/reporters';
import { realm } from './realms';
import { logger } from './utils';

export type JestMetadataServerReporterConfig = {
  // empty for now
};

export const query = realm.query;

/**
 * @implements {import('@jest/reporters').Reporter}
 */
export class JestMetadataReporter {
  #log = logger.child({ cat: 'reporter', tid: 'reporter' });

  constructor(_globalConfig: unknown, _options: JestMetadataServerReporterConfig) {}

  getLastError(): Error | void {
    return undefined;
  }

  /**
   * @see {import('@jest/reporters').AggregatedResult}
   * @see {import('@jest/reporters').ReporterOnStartOptions}
   */
  async onRunStart(_results: unknown, _options: unknown): Promise<void> {
    await realm.ipc.start();
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
  onTestFileStart(_test: unknown): void {
    const test = _test as Test;
    this.#log.debug.begin({ tid: ['reporter', test.path] }, test.path);
    realm.fallbackAPI.reportTestFile(test.path);
    const runMetadata = realm.aggregatedResultMetadata.getRunMetadata(test.path);
    realm.associate.filePath(test.path, runMetadata);
  }

  /**
   * NEW! Supported only since Jest 29.6.0
   * @see {import('@jest/reporters').Test}
   * @see {import('@jest/types').Circus.TestCaseStartInfo}
   */
  onTestCaseStart(_test: unknown, _testCaseStartInfo: unknown): void {
    const test = _test as Test;

    this.#log.debug({ tid: ['reporter', test.path] }, 'onTestCaseStart');
    // We cannot use the fallback API here because `testCaseStartInfo`
    // does not contain information, whether this is a retry or not.
    // That's why we might end up with multiple test entries for the same test,
    // so better to ignore this event, rather than distort the data.
  }

  /**
   * @see {import('@jest/reporters').Test}
   * @see {import('@jest/reporters').TestCaseResult}
   */
  onTestCaseResult(_test: unknown, _testCaseResult: unknown): void {
    const test = _test as Test;
    const testCaseResult = _testCaseResult as TestCaseResult;

    this.#log.debug({ tid: ['reporter', test.path] }, 'onTestCaseResult');

    realm.fallbackAPI.reportTestCase(test.path, testCaseResult);
    const lastTestEntry = realm.query.test(test)!.lastTestEntry!;
    realm.associate.testCaseResult(_testCaseResult as TestCaseResult, lastTestEntry);
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
    const test = _test as Test;

    const runMetadata = realm.query.test(test as Test)!;
    const allTestEntries = [...runMetadata.allTestEntries()];
    const testResults = (_testResult as TestResult).testResults;

    for (const [index, testEntry] of allTestEntries.entries()) {
      realm.associate.testCaseResult(testResults[index], testEntry);
    }

    this.#log.debug.end({ tid: ['reporter', test.path] });
  }

  /**
   * @see {import('@jest/reporters').TestContext}
   * @see {import('@jest/reporters').AggregatedResult}
   */
  async onRunComplete(_testContexts: Set<unknown>, _results: unknown): Promise<void> {
    await realm.ipc.stop();
  }
}

export default JestMetadataReporter;
