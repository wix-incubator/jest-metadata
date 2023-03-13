import { JestMetadataError } from '../../errors';

import * as symbols from '../symbols';

import { Metadata } from './Metadata';
import type { RunMetadata } from './RunMetadata';

const $byTestFilePath = Symbol('byTestFilePath');

export class AggregatedResultMetadata extends Metadata {
  public readonly [$byTestFilePath]: Map<string, RunMetadata> = new Map();
  public readonly testResults: RunMetadata[] = [];

  public get lastTestResult(): RunMetadata | undefined {
    return this.testResults[this.testResults.length - 1];
  }

  public getRunMetadata(testFilePath: string): RunMetadata {
    const runMetadata = this[$byTestFilePath].get(testFilePath);
    if (!runMetadata) {
      throw new JestMetadataError(`No run metadata found for: ${testFilePath}`);
    }

    return runMetadata;
  }

  public registerTestFile(testFilePath: string): RunMetadata {
    const runMetadata = this[symbols.context].factory.createRunMetadata(testFilePath);

    this.testResults.push(runMetadata);
    this[$byTestFilePath].set(testFilePath, runMetadata);

    return runMetadata;
  }
}
