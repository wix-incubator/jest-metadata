// eslint-disable-next-line node/no-unpublished-import
import type { Test, TestCaseResult, TestResult } from '@jest/reporters';

import type {
  AggregatedResultMetadata,
  MetadataChecker,
  InstanceOfMetadataChecker,
  RunMetadata,
  TestEntryMetadata,
} from '../metadata';

import type { AssociateMetadata } from './AssociateMetadata';

const _associate = Symbol('associate');
const _checker = Symbol('checker');

export class QueryMetadata {
  private readonly [_associate]: AssociateMetadata;
  private readonly [_checker]: MetadataChecker;

  constructor(associate: AssociateMetadata, checker: InstanceOfMetadataChecker) {
    this[_associate] = associate;
    this[_checker] = checker;
  }

  filePath(filePath: string): RunMetadata {
    const metadata = this[_associate].get(filePath);
    return this[_checker].asRunMetadata(metadata);
  }

  test(test: Test): RunMetadata {
    const metadata = this[_associate].get(test.path);
    return this[_checker].asRunMetadata(metadata);
  }

  testCaseResult(testCaseResult: TestCaseResult): TestEntryMetadata {
    const metadata = this[_associate].get(testCaseResult);
    return this[_checker].asTestEntryMetadata(metadata);
  }

  testResult(testResult: TestResult): RunMetadata {
    const metadata = this[_associate].get(testResult);
    return this[_checker].asRunMetadata(metadata);
  }

  aggregatedResult(): AggregatedResultMetadata {
    const metadata = this[_associate].get();
    return this[_checker].asAggregatedResultMetadata(metadata);
  }
}
