/* eslint-disable @typescript-eslint/no-empty-function,unicorn/no-for-loop */
import type {
  AggregatedResult,
  Reporter,
  ReporterOnStartOptions,
  Test,
  TestCaseResult,
  TestContext,
  TestResult,
} from '@jest/reporters';
import { realm } from './realms';
import { logger } from './utils';

export type JestMetadataServerReporterConfig = {
  // empty for now
};

export const query = realm.query;

/**
 * @implements {import('@jest/reporters').Reporter}
 */
export class JestMetadataReporter implements Reporter {
  #log = logger.child({ cat: 'reporter', tid: 'reporter' });

  constructor(_globalConfig: unknown, _options: JestMetadataServerReporterConfig) {}

  getLastError(): Error | void {
    return undefined;
  }

  async onRunStart(_results: AggregatedResult, _options: ReporterOnStartOptions): Promise<void> {
    await realm.ipc.start();
  }

  /**
   * @deprecated
   */
  onTestStart(_test: Test): void {
    // Jest's ReporterDispatcher won't call this method due to existence of `onTestFileStart`.
  }

  onTestFileStart(test: Test): void {
    this.#log.debug.begin({ tid: ['reporter', test.path] }, test.path);
    realm.fallbackAPI.reportTestFile(test.path);
    const runMetadata = realm.aggregatedResultMetadata.getRunMetadata(test.path);
    realm.associate.filePath(test.path, runMetadata);
  }

  /**
   * NEW! Supported only since Jest 29.6.0
   * @see {import('@jest/types').Circus.TestCaseStartInfo}
   */
  onTestCaseStart(test: Test, _testCaseStartInfo: unknown): void {
    this.#log.debug({ tid: ['reporter', test.path] }, 'onTestCaseStart');
    // We cannot use the fallback API here because `testCaseStartInfo`
    // does not contain information, whether this is a retry or not.
    // That's why we might end up with multiple test entries for the same test,
    // so better to ignore this event, rather than distort the data.
  }

  onTestCaseResult(test: Test, testCaseResult: TestCaseResult): void {
    this.#log.debug({ tid: ['reporter', test.path] }, 'onTestCaseResult');

    realm.fallbackAPI.reportTestCase(test.path, testCaseResult);
    const lastTestEntry = realm.query.test(test)!.lastTestEntry!;
    realm.associate.testCaseResult(testCaseResult, lastTestEntry);
  }

  /**
   * @deprecated
   */
  onTestResult(_test: Test, _testResult: TestResult, _aggregatedResult: AggregatedResult): void {
    // Jest's ReporterDispatcher won't call this method due to existence of `onTestFileResult`.
  }

  onTestFileResult(test: Test, testResult: TestResult, _aggregatedResult: AggregatedResult): void {
    const allTestEntries = realm.fallbackAPI.reportTestFileResult(testResult);
    const testResults = testResult.testResults;
    for (let i = 0; i < testResults.length; i++) {
      realm.associate.testCaseResult(testResults[i], allTestEntries[i]);
    }

    this.#log.debug.end({ tid: ['reporter', test.path] });
  }

  async onRunComplete(_testContexts: Set<TestContext>, _results: AggregatedResult): Promise<void> {
    await realm.ipc.stop();
  }
}

export default JestMetadataReporter;
