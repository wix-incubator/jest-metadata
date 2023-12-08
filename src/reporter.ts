/* eslint-disable @typescript-eslint/no-empty-function,unicorn/no-for-loop */
import type {
  AggregatedResult,
  Config,
  Reporter,
  ReporterOnStartOptions,
  Test,
  TestCaseResult,
  TestContext,
  TestResult,
} from '@jest/reporters';
import { JestMetadataError } from './errors';
import { detectDuplicateRealms, realm as unknownRealm } from './realms';
import type { ParentProcessRealm } from './realms';
import { logger } from './utils';

const realm = unknownRealm as ParentProcessRealm;

detectDuplicateRealms(true);

export const query = realm.query;

/**
 * @implements {import('@jest/reporters').Reporter}
 */
export class JestMetadataReporter implements Reporter {
  static readonly query = realm.query;

  constructor(_globalConfig: Config.GlobalConfig) {
    if (realm.type !== 'parent_process') {
      throw new JestMetadataError(`JestMetadataReporter can be used only in the parent process`);
    }
  }

  static get JestMetadataReporter() {
    logger.warn(
      `Don't use named export 'JestMetadataReporter' from 'jest-metadata/reporter'. Use default export instead.`,
    );
    return JestMetadataReporter;
  }

  getLastError(): Error | void {
    return undefined;
  }

  onRunStart(_results: AggregatedResult, _options: ReporterOnStartOptions): Promise<void> {
    detectDuplicateRealms(false);
    return realm.reporterServer.onRunStart();
  }

  /**
   * @deprecated
   */
  onTestStart(_test: Test): void {
    // Jest's ReporterDispatcher won't call this method due to existence of `onTestFileStart`.
  }

  onTestFileStart(test: Test): void {
    return realm.reporterServer.onTestFileStart(test.path);
  }

  /**
   * NEW! Supported only since Jest 29.6.0
   * @see {import('@jest/types').Circus.TestCaseStartInfo}
   */
  onTestCaseStart(test: Test, testCaseStartInfo: /* for type safety */ unknown): void {
    return realm.reporterServer.onTestCaseStart(test.path, testCaseStartInfo);
  }

  onTestCaseResult(test: Test, testCaseResult: TestCaseResult): void {
    return realm.reporterServer.onTestCaseResult(test.path, testCaseResult);
  }

  /**
   * @deprecated
   */
  onTestResult(_test: Test, _testResult: TestResult, _aggregatedResult: AggregatedResult): void {
    // Jest's ReporterDispatcher won't call this method due to existence of `onTestFileResult`.
  }

  onTestFileResult(test: Test, testResult: TestResult, _aggregatedResult: AggregatedResult): void {
    return realm.reporterServer.onTestFileResult(test.path, testResult);
  }

  onRunComplete(
    _testContexts: Set<TestContext>,
    _aggregatedResult: AggregatedResult,
  ): Promise<void> {
    return realm.reporterServer.onRunComplete();
  }
}

export default JestMetadataReporter;
