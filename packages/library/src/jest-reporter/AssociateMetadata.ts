// eslint-disable-next-line node/no-unpublished-import
import type { Test, TestResult, TestCaseResult } from '@jest/reporters';

import { AggregatedResultMetadata, Metadata, RunMetadata, TestEntryMetadata } from '../metadata';
import { JestMetadataError } from '../errors';

export class AssociateMetadata {
  private readonly _map = new Map<unknown, Metadata>();

  filePath(value: string, metadata: RunMetadata): void {
    this._map.set(value, metadata);
  }

  test(item: Test, metadata: RunMetadata): void {
    this._map.set(item, metadata);
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
