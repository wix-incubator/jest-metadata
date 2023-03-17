import path from 'path';

// eslint-disable-next-line node/no-unpublished-import
import type { Test, TestCaseResult, TestResult } from '@jest/reporters';

import { JestMetadataError } from '../errors';
import type {
  AggregatedResultMetadata,
  Metadata,
  RunMetadata,
  TestEntryMetadata,
} from '../metadata';

export class AssociateMetadata {
  private readonly _map = new Map<unknown, Metadata>();

  filePath(value: string, metadata: RunMetadata): void {
    this._map.set(value, metadata);

    if (path.isAbsolute(value)) {
      this._map.set(path.relative(process.cwd(), value), metadata);
    } else {
      this._map.set(path.resolve(value), metadata);
    }
  }

  test(item: Test, metadata: RunMetadata): void {
    this.filePath(item.path, metadata);
  }

  testCaseResult(testCaseResult: TestCaseResult, metadata: TestEntryMetadata): void {
    this._map.set(testCaseResult, metadata);
  }

  testResult(item: TestResult, metadata: RunMetadata): void {
    this._map.set(item, metadata);
  }

  aggregatedResult(metadata: AggregatedResultMetadata): void {
    this._map.set(undefined, metadata);
  }

  get(key?: unknown): Metadata {
    const metadata = this._map.get(key);
    if (!metadata) {
      throw new JestMetadataError(`Metadata not found for ${key}`);
    }

    return metadata;
  }
}
