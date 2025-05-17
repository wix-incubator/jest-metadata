import type { TestCaseResult } from '@jest/reporters';
import { JestMetadataError } from '../errors';
import type {
  GlobalMetadata,
  MetadataEventEmitter,
  TestFileMetadata,
  TestDoneEvent,
  TestEntryMetadata,
  TestSkipEvent,
} from '../metadata';
import { diagnostics, Rotator } from '../utils';

export type TestCaseResultArg = Pick<
  TestCaseResult,
  'status' | 'title' | 'ancestorTitles' | 'invocations'
>;

export type TestFileResultArg = {
  testFilePath: string;
  testResults: TestCaseResultArg[];
};

export type AggregatedResultArg = {
  testResults: TestFileResultArg[];
};

export class FallbackAPI {
  private _fallbackModes = new Map<string, boolean>();
  private _cache = new Map<string, Rotator<TestEntryInfo>>();
  private _testEntryCounter = new Map<string, number>();
  private _log = diagnostics.child({ cat: 'fallback-api', tid: 'jest-metadata-reporter' });

  constructor(
    private readonly globalMetadata: GlobalMetadata,
    private readonly eventEmitter: MetadataEventEmitter,
  ) {}

  public get enabled() {
    return this._fallbackModes.size > 0 ? this._fallbackModes.values().next().value : true;
  }

  reportTestFile(testFilePath: string) {
    this.eventEmitter.emit({
      type: 'add_test_file',
      testFilePath,
    });

    return this.globalMetadata.getTestFileMetadata(testFilePath);
  }

  reportTestCase(testFilePath: string, testCaseResult: TestCaseResultArg): TestEntryMetadata {
    const file = this.globalMetadata.getTestFileMetadata(testFilePath);
    const fallbackMode = this._determineFallbackModeStatus(testFilePath, file);
    if (!fallbackMode) {
      const testEntryIndex = this._incrementTestEntryIndex(testFilePath);
      const testEntryMetadata = file._getReportedEntryByIndex(testEntryIndex);
      if (!testEntryMetadata) {
        this._log.error(
          'Failed to get test entry metadata for %j in file: %j',
          testCaseResult.title,
          testFilePath,
        );
      }

      return file._getReportedEntryByIndex(testEntryIndex)!;
    }

    if (!file.rootDescribeBlock) {
      this.eventEmitter.emit({
        type: 'start_describe_definition',
        testFilePath,
        describeId: 'describe_0',
      });
    }

    const rootDescribeBlock = file.rootDescribeBlock!;
    const invocations = testCaseResult.invocations ?? 0;
    const nameIdentifier = [
      testFilePath,
      ...testCaseResult.ancestorTitles,
      testCaseResult.title,
    ].join('\u001F');

    if (invocations <= 1) {
      const testId = `test_${rootDescribeBlock.children.length}`;

      this.eventEmitter.emit({
        type: 'add_test',
        testFilePath,
        testId,
      });

      const lastChild = file.lastTestEntry!;

      let rotator: Rotator<TestEntryInfo>;
      if (this._cache.has(nameIdentifier)) {
        rotator = this._cache.get(nameIdentifier)!;
      } else {
        rotator = new Rotator<TestEntryInfo>();
        this._cache.set(nameIdentifier, rotator);
      }

      rotator.add({
        testId,
        testFilePath,
        testEntryMetadata: lastChild,
        testCaseResult: { ...testCaseResult },
      });

      this.eventEmitter.emit({
        type: 'test_start',
        testFilePath,
        testId,
      });

      this.eventEmitter.emit({
        type: this._getCompletionEventType(testCaseResult),
        testFilePath,
        testId,
      } as TestDoneEvent | TestSkipEvent | TestDoneEvent);

      return lastChild;
    } else {
      const tests = this._cache.get(nameIdentifier)!;
      const info = tests.find((t) => t.testCaseResult.status === 'failed')!;
      info.testCaseResult = { ...testCaseResult };

      this.eventEmitter.emit({
        type: 'test_retry',
        testFilePath: info.testFilePath,
        testId: info.testId,
      });

      this.eventEmitter.emit({
        type: 'test_start',
        testFilePath: info.testFilePath,
        testId: info.testId,
      });

      this.eventEmitter.emit({
        type: this._getCompletionEventType(testCaseResult),
        testFilePath: info.testFilePath,
        testId: info.testId,
      } as TestDoneEvent | TestSkipEvent | TestDoneEvent);

      return info.testEntryMetadata;
    }
  }

  reportTestFileResult(testFileResult: TestFileResultArg): TestEntryMetadata[] {
    const { testFilePath, testResults } = testFileResult;
    const file = this.globalMetadata.getTestFileMetadata(testFilePath);
    const fallbackMode = this._determineFallbackModeStatus(testFilePath, file);

    if (!file.rootDescribeBlock) {
      this.eventEmitter.emit({
        type: 'start_describe_definition',
        testFilePath,
        describeId: 'describe_0',
      });
    }

    const rootDescribeBlock = file.rootDescribeBlock!;
    if (!fallbackMode) {
      return [...rootDescribeBlock.allTestEntries()];
    }

    for (const rotator of this._cache.values()) {
      rotator.reset();
    }

    const result: TestEntryMetadata[] = [];
    for (const testCaseResult of testResults) {
      const nameId = this._getNameIdentifier(testFilePath, testCaseResult);
      const tests = this._cache.get(nameId);
      const info = tests?.peek();

      if (info && info.testCaseResult.status === testCaseResult.status) {
        result.push(info.testEntryMetadata);
        tests!.next();
      } else {
        const testId = `test_${rootDescribeBlock.children.length}`;
        this.eventEmitter.emit({
          type: 'add_test',
          testFilePath,
          testId,
        });

        this.eventEmitter.emit({
          type: 'test_start',
          testFilePath,
          testId,
        });

        this.eventEmitter.emit({
          type: this._getCompletionEventType(testCaseResult),
          testFilePath,
          testId,
        } as TestDoneEvent | TestSkipEvent | TestDoneEvent);

        result.push(file.lastTestEntry!);
      }
    }

    return result;
  }

  private _getNameIdentifier(testFilePath: string, testCaseResult: TestCaseResultArg) {
    return [testFilePath, ...testCaseResult.ancestorTitles, testCaseResult.title].join('\u001F');
  }

  private _getCompletionEventType(
    testCaseResult: TestCaseResultArg,
  ): 'test_done' | 'test_skip' | 'test_todo' {
    switch (testCaseResult.status) {
      case 'passed':
      case 'failed': {
        return 'test_done';
      }
      case 'todo': {
        return 'test_todo';
      }
      case 'skipped':
      case 'pending':
      case 'disabled': {
        return 'test_skip';
      }
      default: {
        throw new JestMetadataError(`Unexpected test case result status: ${testCaseResult.status}`);
      }
    }
  }

  private _incrementTestEntryIndex(testFilePath: string) {
    const count = this._testEntryCounter.get(testFilePath) ?? 0;
    this._testEntryCounter.set(testFilePath, count + 1);
    return count;
  }

  private _determineFallbackModeStatus(testFilePath: string, file: TestFileMetadata): boolean {
    if (!this._fallbackModes.has(testFilePath)) {
      this._fallbackModes.set(testFilePath, !file.rootDescribeBlock);
    }

    return this._fallbackModes.get(testFilePath)!;
  }
}

type TestEntryInfo = {
  testId: string;
  testFilePath: string;
  testEntryMetadata: TestEntryMetadata;
  /** Only or the last invocation */
  testCaseResult: TestCaseResultArg;
};
