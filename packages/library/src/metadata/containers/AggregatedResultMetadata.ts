import { JestMetadataError } from '../../errors';

import * as symbols from '../symbols';

import { BaseMetadata } from './BaseMetadata';
import type { RunMetadata } from './RunMetadata';

const $byTestFilePath = Symbol('byTestFilePath');

export class AggregatedResultMetadata extends BaseMetadata {
  public readonly [$byTestFilePath]: Map<string, RunMetadata> = new Map();
  public readonly testResults: RunMetadata[] = [];

  public get currentMetadata(): BaseMetadata {
    const run = this.lastTestResult;
    if (!run) {
      return this;
    }

    // TODO: maybe run.current.value() should not return undefined?
    const current = run.current.value();
    if (current) {
      return current;
    }

    return run;
  }

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
    const existingRunMetadata = this[$byTestFilePath].get(testFilePath);
    if (existingRunMetadata) {
      return existingRunMetadata;
    }

    const runMetadata = this[symbols.context].factory.createRunMetadata(testFilePath);

    this.testResults.push(runMetadata);
    this[$byTestFilePath].set(testFilePath, runMetadata);

    return runMetadata;
  }
}
