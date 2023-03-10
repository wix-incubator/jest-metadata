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

export type JestMetadataServerReporterConfig = {
  // TODO: think about what config options we need
};

export class JestMetadataServer implements Reporter {
  constructor(
    _globalConfig: Config.GlobalConfig,
    _reporterConfig: JestMetadataServerReporterConfig,
  ) {
    // TODO: maybe start IPC server here
  }

  static onRequire(): void {
    // TODO: think what should happen on this module require
    // TODO: inject environment variables
    // TODO: inject into itself an instance of AssociateMetadata helper
    return undefined;
  }

  getLastError(): Error | void {
    return undefined;
  }

  onRunStart(_results: AggregatedResult, _options: ReporterOnStartOptions): Promise<void> | void {
    // TODO: await until IPC server starts
  }

  onTestFileStart(_test: Test): Promise<void> | void {
    // TODO: associate test with metadata
    // TODO: associate path.normalize(test.path) with metadata
  }

  onTestCaseResult(_test: Test, _testCaseResult: TestCaseResult): Promise<void> | void {
    // TODO: associate testCaseResult with metadata
  }

  onTestFileResult(
    _test: Test,
    _testResult: TestResult,
    _aggregatedResult: AggregatedResult,
  ): Promise<void> | void {
    // TODO: associate testResult with metadata
  }

  onRunComplete(_testContexts: Set<TestContext>, _results: AggregatedResult): Promise<void> | void {
    // TODO: await until IPC server stops
  }
}
