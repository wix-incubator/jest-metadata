import path from 'path';

import type { TestCaseResult } from '@jest/reporters';

import { JestMetadataError } from '../errors';
import type {
  AggregatedResultMetadata,
  Metadata,
  RunMetadata,
  TestEntryMetadata,
} from '../metadata';

export class AssociateMetadata {
  private readonly _map = new Map<unknown, Metadata>();

  constructor(private readonly _cwd: string) {}

  filePath(value: string, metadata: RunMetadata): void {
    if (!value) {
      throw new JestMetadataError('Cannot associate metadata with an empty file path');
    }

    this._map.set(value, metadata);

    if (path.isAbsolute(value)) {
      this._map.set(path.relative(this._cwd, value), metadata);
    } else {
      this._map.set(path.resolve(value), metadata);
    }
  }

  testCaseName(nameIdentifier: string[], metadata: TestEntryMetadata): void {
    this._map.set(nameIdentifier.join('\u001F'), metadata);
  }

  testCaseResult(testCaseResult: TestCaseResult, metadata: TestEntryMetadata): void {
    if (testCaseResult == undefined) {
      throw new JestMetadataError('Cannot associate metadata with an undefined test case result');
    }

    this._map.set(testCaseResult, metadata);
  }

  aggregatedResult(metadata: AggregatedResultMetadata): void {
    this._map.set(undefined, metadata);
  }

  get(key?: unknown): Metadata | undefined {
    return this._map.get(key);
  }
}
