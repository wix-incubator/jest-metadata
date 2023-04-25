/* eslint-disable node/no-unpublished-import, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function */
import type { Test } from '@jest/reporters';
import * as server from './server';

export type JestMetadataServerReporterConfig = {
  // empty for now
};

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
   * @see {import('@jest/reporters').Test}
   */
  async onTestStart(_test: unknown): Promise<void> {
    return undefined;
  }

  /**
   * @see {import('@jest/reporters').Test}
   */
  async onTestFileStart(test: unknown): Promise<void> {
    await server.addTestFile((test as Test).path);
  }

  /**
   * @see {import('@jest/reporters').Test}
   * @see {import('@jest/reporters').TestCaseResult}
   */
  async onTestCaseResult(_test: unknown, _testCaseResult: unknown): Promise<void> {
    return undefined;
  }

  /**
   * @see {import('@jest/reporters').Test}
   * @see {import('@jest/reporters').TestResult}
   * @see {import('@jest/reporters').AggregatedResult}
   */
  async onTestFileResult(
    _test: unknown,
    _testResult: unknown,
    _aggregatedResult: unknown,
  ): Promise<void> {
    return undefined;
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
