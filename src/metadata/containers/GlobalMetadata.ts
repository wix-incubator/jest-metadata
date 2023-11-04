import { JestMetadataError } from '../../errors';

import * as symbols from '../symbols';

import { BaseMetadata } from './BaseMetadata';
import type { TestFileMetadata } from './TestFileMetadata';

const $byTestFilePath = Symbol('byTestFilePath');

export class GlobalMetadata extends BaseMetadata {
  public readonly [$byTestFilePath]: Map<string, TestFileMetadata> = new Map();
  public readonly testFiles: TestFileMetadata[] = [];

  public get currentMetadata(): BaseMetadata {
    const file = this.lastTestFile;
    if (!file) {
      return this;
    }

    // TODO: maybe file.current.value() should not return undefined?
    const current = file.current.value();
    if (current) {
      return current;
    }

    return file;
  }

  public get lastTestFile(): TestFileMetadata | undefined {
    return this.testFiles[this.testFiles.length - 1];
  }

  public getTestFileMetadata(testFilePath: string): TestFileMetadata {
    if (!this.hasTestFileMetadata(testFilePath)) {
      throw new JestMetadataError(`No file metadata found for: ${testFilePath}`);
    }

    return this[$byTestFilePath].get(testFilePath)!;
  }

  public hasTestFileMetadata(testFilePath: string): boolean {
    return this[$byTestFilePath].has(testFilePath);
  }

  public registerTestFile(testFilePath: string): TestFileMetadata {
    const existingTestFileMetadata = this[$byTestFilePath].get(testFilePath);
    if (existingTestFileMetadata) {
      return existingTestFileMetadata;
    }

    const testFileMetadata = this[symbols.context].factory.createTestFileMetadata(
      testFilePath,
      this,
    );

    this.testFiles.push(testFileMetadata);
    this[$byTestFilePath].set(testFilePath, testFileMetadata);

    return testFileMetadata;
  }
}
