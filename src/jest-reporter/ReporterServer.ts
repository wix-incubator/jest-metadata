/* eslint-disable @typescript-eslint/no-empty-function,unicorn/no-for-loop */
import type { Test, TestCaseResult, TestResult } from '@jest/reporters';
import memoize from 'lodash.memoize';
import type { IPCServer } from '../ipc';
import { logger } from '../utils';
import type { AssociateMetadata } from './AssociateMetadata';
import type { FallbackAPI } from './FallbackAPI';

export type ReporterServerConfig = {
  ipc: IPCServer;
  fallbackAPI: FallbackAPI;
  associate: AssociateMetadata;
};

/**
 * @implements {import('@jest/reporters').Reporter}
 */
export class ReporterServer {
  #log = logger.child({ cat: 'reporter', tid: 'reporter' });
  #associate: AssociateMetadata;
  #fallbackAPI: FallbackAPI;
  #ipc: IPCServer;

  constructor(config: ReporterServerConfig) {
    this.#associate = config.associate;
    this.#fallbackAPI = config.fallbackAPI;
    this.#ipc = config.ipc;

    // We are memoizing all methods because there might be
    // multiple reporters based on jest-metadata, so we need to
    // make sure that we are calling every method only once per
    // a given test case result.
    //
    // Unfortunately, we can't use a quicker `memoizeLast` because
    // of obscure race conditions in Jest's ReporterDispatcher.
    // This might be a good candidate for a future optimization.

    this.onRunStart = memoize(this.onRunStart.bind(this));
    this.onTestFileStart = memoize(this.onTestFileStart.bind(this));
    this.onTestCaseStart = memoize(this.onTestCaseStart.bind(this));
    this.onTestCaseResult = memoize(this.onTestCaseResult.bind(this));
    this.onTestFileResult = memoize(this.onTestFileResult.bind(this));
    this.onRunComplete = memoize(this.onRunComplete.bind(this));
  }

  async onRunStart(): Promise<void> {
    await this.#ipc.start();
  }

  onTestFileStart(testPath: string): void {
    this.#log.debug.begin({ tid: ['reporter', testPath] }, testPath);
    const testFileMetadata = this.#fallbackAPI.reportTestFile(testPath);
    this.#associate.filePath(testPath, testFileMetadata);
  }

  onTestCaseStart(test: Test): void {
    this.#log.debug({ tid: ['reporter', test.path] }, 'onTestCaseStart');
    // We cannot use the fallback API here because `testCaseStartInfo`
    // does not contain information, whether this is a retry or not.
    // That's why we might end up with multiple test entries for the same test,
    // so better to ignore this event, rather than distort the data.
  }

  onTestCaseResult(test: Test, testCaseResult: TestCaseResult): void {
    this.#log.debug({ tid: ['reporter', test.path] }, 'onTestCaseResult');

    const lastTestEntry = this.#fallbackAPI.reportTestCase(test.path, testCaseResult);
    this.#associate.testCaseResult(testCaseResult, lastTestEntry);
  }

  onTestFileResult(test: Test, testResult: TestResult): void {
    const allTestEntries = this.#fallbackAPI.reportTestFileResult(testResult);
    const testResults = testResult.testResults;
    for (let i = 0; i < testResults.length; i++) {
      this.#associate.testCaseResult(testResults[i], allTestEntries[i]);
    }

    this.#log.debug.end({ tid: ['reporter', test.path] });
  }

  async onRunComplete(): Promise<void> {
    await this.#ipc.stop();
  }
}
