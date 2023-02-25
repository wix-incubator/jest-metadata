import { Metadata } from './Metadata';
import { MetadataContext } from './MetadataContext';
import { RunMetadata } from './RunMetadata';

export class AggregatedResultMetadata extends Metadata {
  public readonly testResults: Record<string, RunMetadata> = {};

  constructor(context: MetadataContext) {
    super(context, 'aggregatedResult');
  }

  public registerTestFile(testFilePath: string): RunMetadata {
    const runMetadata = new RunMetadata(this.context, testFilePath);
    this.testResults[testFilePath] = runMetadata;
    return runMetadata;
  }
}
