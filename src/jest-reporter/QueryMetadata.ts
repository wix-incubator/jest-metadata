import type { Test, TestCaseResult, TestResult } from '@jest/reporters';

import { JestMetadataError } from '../errors';
import type {
  GlobalMetadata,
  MetadataChecker,
  TestFileMetadata,
  TestEntryMetadata,
} from '../metadata';

import type { AssociateMetadata } from './AssociateMetadata';

const _associate = Symbol('associate');
const _checker = Symbol('checker');

export class QueryMetadata {
  private readonly [_associate]: AssociateMetadata;
  private readonly [_checker]: MetadataChecker;

  constructor(associate: AssociateMetadata, checker: MetadataChecker) {
    this[_associate] = associate;
    this[_checker] = checker;
  }

  filePath(filePath: string): TestFileMetadata {
    if (!filePath) {
      throw new JestMetadataError('Cannot query metadata for an empty file path');
    }

    const metadata = this[_associate].get(filePath);
    return this[_checker].asTestFileMetadata(metadata)!;
  }

  test(test: Test): TestFileMetadata {
    if (!test) {
      throw new JestMetadataError('Cannot query metadata for an undefined test');
    }

    const metadata = this[_associate].get(test.path);
    return this[_checker].asTestFileMetadata(metadata)!;
  }

  testCaseResult(testCaseResult: TestCaseResult): TestEntryMetadata {
    if (!testCaseResult) {
      throw new JestMetadataError('Cannot query metadata for an undefined test case result');
    }

    const metadata = this[_associate].get(testCaseResult);
    return this[_checker].asTestEntryMetadata(metadata)!;
  }

  testResult(testResult: TestResult): TestFileMetadata {
    if (!testResult) {
      throw new JestMetadataError('Cannot query metadata for an undefined test result');
    }

    const metadata = this[_associate].get(testResult.testFilePath);
    return this[_checker].asTestFileMetadata(metadata)!;
  }

  globalMetadata(): GlobalMetadata {
    const metadata = this[_associate].get();
    return this[_checker].asGlobalMetadata(metadata)!;
  }
}
