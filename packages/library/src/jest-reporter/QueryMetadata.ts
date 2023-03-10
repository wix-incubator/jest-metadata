// eslint-disable-next-line node/no-unpublished-import
import type { Test, TestResult, TestCaseResult } from '@jest/reporters';

import { AggregatedResultMetadata, RunMetadata, TestEntryMetadata, internal } from '../metadata';

import { AssociateMetadata } from './AssociateMetadata';

const _associate = Symbol('associate');

export class QueryMetadata {
  private readonly [_associate]: AssociateMetadata;

  constructor(associate: AssociateMetadata) {
    this[_associate] = associate;
  }

  filePath(filePath: string): RunMetadata {
    return this[_associate].get(filePath)[internal.as](RunMetadata);
  }

  test(test: Test): RunMetadata {
    return this[_associate].get(test)[internal.as](RunMetadata);
  }

  testCaseResult(testCaseResult: TestCaseResult): TestEntryMetadata {
    return this[_associate].get(testCaseResult)[internal.as](TestEntryMetadata);
  }

  testResult(testResult: TestResult): RunMetadata {
    return this[_associate].get(testResult)[internal.as](RunMetadata);
  }

  aggregatedResult(): AggregatedResultMetadata {
    return this[_associate].get()[internal.as](AggregatedResultMetadata);
  }
}
