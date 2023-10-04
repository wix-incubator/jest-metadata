import type { TestCaseResult, TestResult } from '@jest/reporters';
import { JestMetadataError } from '../errors';
import type {
  GlobalMetadata,
  MetadataEventEmitter,
  TestDoneEvent,
  TestEntryMetadata,
  TestSkipEvent,
} from '../metadata';
import { Rotator } from '../utils';

export class FallbackAPI {
  private _fallbackMode: boolean | undefined = undefined;
  private _cache = new Map<string, Rotator<TestEntryInfo>>();

  constructor(
    private readonly globalMetadata: GlobalMetadata,
    private readonly eventEmitter: MetadataEventEmitter,
  ) {}

  public get enabled() {
    return this._fallbackMode ?? true;
  }

  reportTestFile(testFilePath: string) {
    this.eventEmitter.emit({
      type: 'add_test_file',
      testFilePath,
    });

    return this.globalMetadata.getTestFileMetadata(testFilePath);
  }

  reportTestCase(testFilePath: string, testCaseResult: TestCaseResult): TestEntryMetadata {
    const file = this.globalMetadata.getTestFileMetadata(testFilePath);
    if (this._fallbackMode === undefined) {
      this._fallbackMode = !file.rootDescribeBlock;
    }

    if (!this._fallbackMode) {
      return file.lastTestEntry!;
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
        type: this._getCompletionEventType(testCaseResult),
        testFilePath: info.testFilePath,
        testId: info.testId,
      } as TestDoneEvent | TestSkipEvent | TestDoneEvent);

      return info.testEntryMetadata;
    }
  }

  reportTestFileResult(testFileResult: TestResult): TestEntryMetadata[] {
    const result: TestEntryMetadata[] = [];
    const { testFilePath, testResults } = testFileResult;
    const file = this.globalMetadata.getTestFileMetadata(testFilePath);
    const rootDescribeBlock = file.rootDescribeBlock;

    if (!rootDescribeBlock) {
      return result;
    }

    if (!this._fallbackMode) {
      return [...rootDescribeBlock.allTestEntries()];
    }

    for (const rotator of this._cache.values()) {
      rotator.reset();
    }

    for (const testCaseResult of testResults) {
      const nameId = this._getNameIdentifier(testFilePath, testCaseResult);
      const tests = this._cache.get(nameId);
      const info = tests?.find((t) => t.testCaseResult.status === testCaseResult.status);

      if (!info) {
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
      }

      result.push(info ? info.testEntryMetadata : file.lastTestEntry!);
    }

    return result;
  }

  private _getNameIdentifier(testFilePath: string, testCaseResult: TestCaseResult) {
    return [testFilePath, ...testCaseResult.ancestorTitles, testCaseResult.title].join('\u001F');
  }

  private _getCompletionEventType(
    testCaseResult: TestCaseResult,
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
}

type TestEntryInfo = {
  testId: string;
  testFilePath: string;
  testEntryMetadata: TestEntryMetadata;
  /** Only or the last invocation */
  testCaseResult: TestCaseResult;
};
