import type {
  AggregatedResult,
  Config,
  Reporter,
  ReporterOnStartOptions,
  Test,
  TestCaseResult,
  TestResult,
  TestContext,
  // eslint-disable-next-line node/no-unpublished-import
} from '@jest/reporters';

import realm from '../realms/parent';
import { JestMetadataError } from '../errors';

export type JestMetadataServerReporterConfig = {
  // empty for now
};

export class JestMetadataServer implements Reporter {
  constructor(
    _globalConfig: Config.GlobalConfig,
    _reporterConfig: JestMetadataServerReporterConfig,
  ) {
    // no-op for now
  }

  getLastError(): Error | void {
    return undefined;
  }

  async onRunStart(_results: AggregatedResult, _options: ReporterOnStartOptions) {
    const { aggregatedResult } = realm.metadataRegistry;
    realm.associate.aggregatedResult(aggregatedResult);

    await realm.ipcServer.start();
  }

  onTestFileStart(test: Test): Promise<void> | void {
    realm.rootEmitter.emit({
      type: 'test_environment_created',
      testFilePath: test.path,
    });

    const { lastTestResult } = realm.metadataRegistry.aggregatedResult;
    if (!lastTestResult) {
      throw new JestMetadataError('Internal error: lastTestResult is not defined');
    }

    realm.associate.filePath(test.path, lastTestResult);
    realm.associate.test(test, lastTestResult);
  }

  onTestCaseResult(test: Test, testCaseResult: TestCaseResult): Promise<void> | void {
    const { lastTestEntry } = realm.query.test(test);
    if (!lastTestEntry) {
      throw new JestMetadataError('Internal error: lastTestEntry is not defined');
    }

    realm.associate.testCaseResult(testCaseResult, lastTestEntry);
  }

  onTestFileResult(
    test: Test,
    testResult: TestResult,
    _aggregatedResult: AggregatedResult,
  ): Promise<void> | void {
    const runMetadata = realm.query.test(test);
    realm.associate.testResult(testResult, runMetadata);
  }

  async onRunComplete(_testContexts: Set<TestContext>, _results: AggregatedResult): Promise<void> {
    await realm.ipcServer.stop();
  }
}
