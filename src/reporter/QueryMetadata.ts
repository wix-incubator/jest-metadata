// eslint-disable-next-line node/no-unpublished-import
import type { Test, TestResult, TestCaseResult } from '@jest/reporters';

import { AggregatedResultMetadata, RunMetadata, TestEntryMetadata } from '../metadata';

export interface QueryMetadata {
  filePath(value: string): RunMetadata | undefined;
  test(item: Test): RunMetadata | undefined;
  testCaseResult(item: TestCaseResult): TestEntryMetadata | undefined;
  testResult(item: TestResult): RunMetadata | undefined;
  aggregatedResult(): AggregatedResultMetadata | undefined;
}
