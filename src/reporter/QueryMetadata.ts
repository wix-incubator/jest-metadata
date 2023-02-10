// eslint-disable-next-line node/no-unpublished-import
import type { Test, TestResult, TestCaseResult } from '@jest/reporters';

import {
  AggregatedResultMetadata,
  ReadonlyMetadata,
  RunMetadata,
  TestInvocationMetadata,
} from '../state';

export interface QueryMetadata {
  filePath(value: string): ReadonlyMetadata<RunMetadata> | undefined;
  test(item: Test): ReadonlyMetadata<RunMetadata> | undefined;
  testCaseResult(item: TestCaseResult): Readonly<TestInvocationMetadata> | undefined;
  testResult(item: TestResult): Readonly<RunMetadata> | undefined;
  aggregatedResult(): ReadonlyMetadata<AggregatedResultMetadata> | undefined;
}
