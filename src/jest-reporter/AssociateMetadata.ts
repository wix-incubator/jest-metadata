import type { TestCaseResult } from '@jest/reporters';

import { JestMetadataError } from '../errors';
import type { GlobalMetadata, Metadata, TestFileMetadata, TestEntryMetadata } from '../metadata';

export class AssociateMetadata {
  private readonly _map = new Map<unknown, Metadata>();

  filePath(value: string, metadata: TestFileMetadata): void {
    if (!value) {
      throw new JestMetadataError('Cannot associate metadata with an empty file path');
    }

    if (!metadata) {
      throw new JestMetadataError(`Cannot associate a non-existent metadata with a file: ${value}`);
    }

    this._map.set(value, metadata);
  }

  testCaseResult(testCaseResult: TestCaseResult, metadata: TestEntryMetadata): void {
    if (!testCaseResult) {
      throw new JestMetadataError('Cannot associate metadata with a non-existent test case');
    }

    if (!metadata) {
      throw new JestMetadataError(
        `Cannot associate a non-existent metadata with a test case: ${testCaseResult.fullName}`,
      );
    }

    this._map.set(testCaseResult, metadata);
  }

  globalMetadata(metadata: GlobalMetadata): void {
    this._map.set(undefined, metadata);
  }

  get(key?: unknown): Metadata | undefined {
    return this._map.get(key);
  }
}
