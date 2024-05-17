import path from 'node:path';

/* eslint-disable @typescript-eslint/no-empty-function,unicorn/no-for-loop */
import type { TestCaseResult, TestResult } from '@jest/reporters';
// eslint-disable-next-line import/no-internal-modules
import { aggregateLogs } from 'jest-environment-emit/debug';
import type { IPCServer } from '../ipc';
import { diagnostics, memoizeArg1, memoizeLast, optimizeTracing } from '../utils';
import type { AssociateMetadata } from './AssociateMetadata';
import type { FallbackAPI } from './FallbackAPI';

export type ReporterServerConfig = {
  ipc: IPCServer;
  fallbackAPI: FallbackAPI;
  associate: AssociateMetadata;
  rootDir: string;
};

const __REPORTER = optimizeTracing((testFilePath: string, data?: unknown) => {
  return {
    tid: ['jest-metadata-reporter', testFilePath],
    data,
  };
});

const __FILE = optimizeTracing((cwd: string, testFilePath: string) => {
  return path.relative(cwd, testFilePath);
});

/**
 * @implements {import('@jest/reporters').Reporter}
 */
export class ReporterServer {
  #log = diagnostics.child({ cat: 'reporter', tid: 'jest-metadata-reporter' });
  #associate: AssociateMetadata;
  #fallbackAPI: FallbackAPI;
  #ipc: IPCServer;
  #rootDir: string;

  constructor(config: ReporterServerConfig) {
    this.#associate = config.associate;
    this.#fallbackAPI = config.fallbackAPI;
    this.#ipc = config.ipc;
    this.#rootDir = config.rootDir;

    // We are memoizing all methods because there might be
    // multiple reporters based on jest-metadata, so we need to
    // make sure that we are calling every method only once per
    // a given test case result.
    //
    // Unfortunately, we can't _simply_ use `memoizeLast` (last arguments call memoization)
    // due to possibility of concurrent reported events from different files interfering
    // with each other.

    const onRunStart = this.onRunStart.bind(this);
    this.onRunStart = memoizeLast(onRunStart);

    const onTestFileStart = this.onTestFileStart.bind(this);
    this.onTestFileStart = memoizeArg1(() => memoizeLast(onTestFileStart));

    const onTestCaseStart = this.onTestCaseStart.bind(this);
    this.onTestCaseStart = memoizeArg1(() => memoizeLast(onTestCaseStart));

    const onTestCaseResult = this.onTestCaseResult.bind(this);
    this.onTestCaseResult = memoizeArg1(() => memoizeLast(onTestCaseResult));

    const onTestFileResult = this.onTestFileResult.bind(this);
    this.onTestFileResult = memoizeArg1(() => memoizeLast(onTestFileResult));

    const onRunComplete = this.onRunComplete.bind(this);
    this.onRunComplete = memoizeLast(onRunComplete);
  }

  async onRunStart(): Promise<void> {
    this.#log.debug.begin(__REPORTER(''), 'test run');

    try {
      await this.#ipc.start();
    } catch (error) {
      this.#log.error(error, 'Caught unhandled error in onRunStart');
    }
  }

  onTestFileStart(testPath: string): void {
    this.#log.debug.begin(__REPORTER(testPath), __FILE(this.#rootDir, testPath));

    try {
      const testFileMetadata = this.#fallbackAPI.reportTestFile(testPath);
      this.#associate.filePath(testPath, testFileMetadata);
    } catch (error) {
      this.#log.error(error, 'Caught unhandled error in onTestFileStart');
    }
  }

  onTestCaseStart(testPath: string, testCaseStartInfo: unknown): void {
    this.#log.debug(__REPORTER(testPath, testCaseStartInfo), 'onTestCaseStart');
    // We cannot use the fallback API here because `testCaseStartInfo`
    // does not contain information, whether this is a retry or not.
    // That's why we might end up with multiple test entries for the same test,
    // so better to ignore this event, rather than distort the data.
  }

  onTestCaseResult(testPath: string, testCaseResult: TestCaseResult): void {
    this.#log.debug(__REPORTER(testPath), 'onTestCaseResult');

    try {
      const lastTestEntry = this.#fallbackAPI.reportTestCase(testPath, testCaseResult);
      this.#associate.testCaseResult(testCaseResult, lastTestEntry);
    } catch (error: unknown) {
      this.#log.error(error, 'Caught unhandled error in onTestCaseResult');
    }
  }

  onTestFileResult(testPath: string, testResult: TestResult): void {
    try {
      const allTestEntries = this.#fallbackAPI.reportTestFileResult(testResult);
      const testResults = testResult.testResults;
      for (let i = 0; i < testResults.length; i++) {
        this.#associate.testCaseResult(testResults[i], allTestEntries[i]);
      }
    } catch (error: unknown) {
      this.#log.error(error, 'Caught unhandled error in onTestFileResult');
    } finally {
      this.#log.debug.end(__REPORTER(testPath));
    }
  }

  async onRunComplete(): Promise<void> {
    try {
      await this.#ipc.stop();
    } catch (error: unknown) {
      this.#log.error(error, 'Caught unhandled error in onRunComplete');
    } finally {
      this.#log.debug.end(__REPORTER(''));

      if (process.env.JEST_BUNYAMIN_DIR) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await aggregateLogs();
      }
    }
  }
}
